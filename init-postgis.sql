-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;

-- Create spatial index for locations table (will be created by SQLAlchemy)
-- CREATE INDEX idx_locations_geom ON locations USING GIST (geom);