from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import Optional
from uuid import uuid4

app = FastAPI(title="GIS Search API")

locations_db: dict[str, dict] = {}


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


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


@app.post("/locations", response_model=Location, status_code=201)
async def create_location(location: LocationCreate):
    location_id = str(uuid4())
    location_data = location.model_dump()
    location_data["id"] = location_id
    locations_db[location_id] = location_data
    return location_data


@app.get("/locations", response_model=list[Location])
async def list_locations():
    return list(locations_db.values())


@app.get("/locations/{location_id}", response_model=Location)
async def get_location(location_id: str):
    if location_id not in locations_db:
        raise HTTPException(status_code=404, detail="Local não encontrado")
    return locations_db[location_id]


@app.put("/locations/{location_id}", response_model=Location)
async def update_location(location_id: str, location_update: LocationUpdate):
    if location_id not in locations_db:
        raise HTTPException(status_code=404, detail="Local não encontrado")
    
    current = locations_db[location_id]
    update_data = location_update.model_dump(exclude_unset=True)
    current.update(update_data)
    locations_db[location_id] = current
    return current


@app.delete("/locations/{location_id}", status_code=204)
async def delete_location(location_id: str):
    if location_id not in locations_db:
        raise HTTPException(status_code=404, detail="Local não encontrado")
    del locations_db[location_id]