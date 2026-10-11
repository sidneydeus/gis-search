from contextlib import asynccontextmanager
from uuid import uuid4

from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel, Field
from sqlalchemy import Column, String, Float, Text, select
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import declarative_base
from typing import Optional

DATABASE_URL = "postgresql+asyncpg://gis_user:gis_password@localhost:5432/gis_search"

engine = create_async_engine(DATABASE_URL, echo=True)
async_session_maker = async_sessionmaker(engine, expire_on_commit=False)
Base = declarative_base()


class LocationModel(Base):
    __tablename__ = "locations"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid4()))
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    address = Column(Text, nullable=False)
    place_type = Column(String(100), nullable=False)


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


async def get_db() -> AsyncSession:
    async with async_session_maker() as session:
        yield session


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    await engine.dispose()


app = FastAPI(title="GIS Search API", lifespan=lifespan)


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


@app.post("/locations", response_model=Location, status_code=201)
async def create_location(location: LocationCreate, db: AsyncSession = Depends(get_db)):
    db_location = LocationModel(**location.model_dump())
    db.add(db_location)
    await db.commit()
    await db.refresh(db_location)
    return db_location


@app.get("/locations", response_model=list[Location])
async def list_locations(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(LocationModel))
    locations = result.scalars().all()
    return locations


@app.get("/locations/{location_id}", response_model=Location)
async def get_location(location_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(LocationModel).where(LocationModel.id == location_id))
    location = result.scalar_one_or_none()
    if not location:
        raise HTTPException(status_code=404, detail="Local não encontrado")
    return location


@app.put("/locations/{location_id}", response_model=Location)
async def update_location(location_id: str, location_update: LocationUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(LocationModel).where(LocationModel.id == location_id))
    location = result.scalar_one_or_none()
    if not location:
        raise HTTPException(status_code=404, detail="Local não encontrado")

    update_data = location_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(location, key, value)

    await db.commit()
    await db.refresh(location)
    return location


@app.delete("/locations/{location_id}", status_code=204)
async def delete_location(location_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(LocationModel).where(LocationModel.id == location_id))
    location = result.scalar_one_or_none()
    if not location:
        raise HTTPException(status_code=404, detail="Local não encontrado")
    await db.delete(location)
    await db.commit()