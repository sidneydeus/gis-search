from contextlib import asynccontextmanager
from uuid import uuid4

from fastapi import FastAPI, HTTPException, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sqlalchemy import Column, String, Text, select, func, text
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import declarative_base
from geoalchemy2 import Geography, functions as geofunc
from geoalchemy2.shape import to_shape
from shapely.geometry import Point, mapping
from typing import Optional, List

import os

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://gis_user:gis_password@localhost:5432/gis_search")

engine = create_async_engine(DATABASE_URL, echo=True)
async_session_maker = async_sessionmaker(engine, expire_on_commit=False)
Base = declarative_base()


class LocationModel(Base):
    __tablename__ = "locations"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid4()))
    address = Column(Text, nullable=False)
    place_type = Column(String(100), nullable=False)
    geom = Column(Geography(geometry_type="POINT", srid=4326), nullable=False)


class LocationBase(BaseModel):
    latitude: float = Field(..., ge=-90, le=90, description="Latitude (-90 a 90)")
    longitude: float = Field(..., ge=-180, le=180, description="Longitude (-180 a 180)")
    address: str = Field(..., min_length=1, max_length=255, description="Endereço do local")
    place_type: str = Field(..., min_length=1, max_length=100, description="Tipo de local (ex: restaurante, parque, hospital)")


class LocationCreate(LocationBase):
    pass


class LocationUpdate(BaseModel):
    latitude: Optional[float] = Field(None, ge=-90, le=90)
    longitude: Optional[float] = Field(None, ge=-180, le=180)
    address: Optional[str] = Field(None, min_length=1, max_length=255)
    place_type: Optional[str] = Field(None, min_length=1, max_length=100)


class Location(LocationBase):
    id: str

    class Config:
        from_attributes = True


class LocationWithDistance(Location):
    distance_meters: Optional[float] = None


async def get_db() -> AsyncSession:
    async with async_session_maker() as session:
        yield session


def point_to_ewkt(lat: float, lon: float) -> str:
    return f"SRID=4326;POINT({lon} {lat})"


def ewkt_to_lat_lon(ewkt: str) -> tuple[float, float]:
    point = to_shape(ewkt)
    return point.y, point.x


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        # Create spatial index
        await conn.execute(
            text("CREATE INDEX IF NOT EXISTS idx_locations_geom ON locations USING GIST (geom)")
        )
        await conn.commit()
    yield
    await engine.dispose()


app = FastAPI(title="GIS Search API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:3000", "http://127.0.0.1:5173", "http://127.0.0.1:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


@app.post("/locations", response_model=Location, status_code=201)
async def create_location(location: LocationCreate, db: AsyncSession = Depends(get_db)):
    geom_ewkt = point_to_ewkt(location.latitude, location.longitude)
    db_location = LocationModel(
        address=location.address,
        place_type=location.place_type,
        geom=geom_ewkt,
    )
    db.add(db_location)
    await db.commit()
    await db.refresh(db_location)

    lat, lon = ewkt_to_lat_lon(db_location.geom)
    return Location(
        id=db_location.id,
        latitude=lat,
        longitude=lon,
        address=db_location.address,
        place_type=db_location.place_type,
    )


@app.get("/locations", response_model=list[Location])
async def list_locations(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(LocationModel))
    locations = result.scalars().all()
    return [
        Location(
            id=loc.id,
            latitude=ewkt_to_lat_lon(loc.geom)[0],
            longitude=ewkt_to_lat_lon(loc.geom)[1],
            address=loc.address,
            place_type=loc.place_type,
        )
        for loc in locations
    ]


from fastapi.middleware.cors import CORSMiddleware

@app.get("/locations/nearby", response_model=list[LocationWithDistance])
async def find_nearby(
    latitude: float = Query(..., ge=-90, le=90),
    longitude: float = Query(..., ge=-180, le=180),
    radius_meters: float = Query(1000, gt=0, le=100000),
    place_type: Optional[str] = Query(None, description="Filtrar por tipo de local"),
    db: AsyncSession = Depends(get_db),
):
    point_ewkt = point_to_ewkt(latitude, longitude)

    query = select(
        LocationModel,
        geofunc.ST_Distance(LocationModel.geom, func.ST_GeogFromText(point_ewkt)).label("distance"),
    ).where(geofunc.ST_DWithin(LocationModel.geom, func.ST_GeogFromText(point_ewkt), radius_meters))

    if place_type:
        query = query.where(LocationModel.place_type.ilike(f"%{place_type}%"))

    query = query.order_by(geofunc.ST_Distance(LocationModel.geom, func.ST_GeogFromText(point_ewkt)))

    result = await db.execute(query)

    locations = result.all()
    return [
        LocationWithDistance(
            id=loc.id,
            latitude=ewkt_to_lat_lon(loc.geom)[0],
            longitude=ewkt_to_lat_lon(loc.geom)[1],
            address=loc.address,
            place_type=loc.place_type,
            distance_meters=round(distance, 2),
        )
        for loc, distance in locations
    ]


@app.get("/locations/{location_id}", response_model=Location)
async def get_location(location_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(LocationModel).where(LocationModel.id == location_id))
    location = result.scalar_one_or_none()
    if not location:
        raise HTTPException(status_code=404, detail="Local não encontrado")

    lat, lon = ewkt_to_lat_lon(location.geom)
    return Location(
        id=location.id,
        latitude=lat,
        longitude=lon,
        address=location.address,
        place_type=location.place_type,
    )


@app.put("/locations/{location_id}", response_model=Location)
async def update_location(location_id: str, location_update: LocationUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(LocationModel).where(LocationModel.id == location_id))
    location = result.scalar_one_or_none()
    if not location:
        raise HTTPException(status_code=404, detail="Local não encontrado")

    update_data = location_update.model_dump(exclude_unset=True)

    if "latitude" in update_data or "longitude" in update_data:
        lat = update_data.get("latitude", ewkt_to_lat_lon(location.geom)[0])
        lon = update_data.get("longitude", ewkt_to_lat_lon(location.geom)[1])
        location.geom = point_to_ewkt(lat, lon)

    for key, value in update_data.items():
        if key not in ("latitude", "longitude"):
            setattr(location, key, value)

    await db.commit()
    await db.refresh(location)

    lat, lon = ewkt_to_lat_lon(location.geom)
    return Location(
        id=location.id,
        latitude=lat,
        longitude=lon,
        address=location.address,
        place_type=location.place_type,
    )


@app.delete("/locations/{location_id}", status_code=204)
async def delete_location(location_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(LocationModel).where(LocationModel.id == location_id))
    location = result.scalar_one_or_none()
    if not location:
        raise HTTPException(status_code=404, detail="Local não encontrado")
    await db.delete(location)
    await db.commit()