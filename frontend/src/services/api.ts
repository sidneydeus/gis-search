const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export interface Location {
  id: string;
  latitude: number;
  longitude: number;
  address: string;
  place_type: string;
  distance_meters?: number;
}

export interface SearchParams {
  latitude: number;
  longitude: number;
  radius_meters: number;
  place_type?: string;
}

export async function searchNearbyLocations(params: SearchParams): Promise<Location[]> {
  const queryParams = new URLSearchParams({
    latitude: params.latitude.toString(),
    longitude: params.longitude.toString(),
    radius_meters: params.radius_meters.toString(),
  });

  if (params.place_type) {
    queryParams.append("place_type", params.place_type);
  }

  const response = await fetch(`${API_BASE_URL}/locations/nearby?${queryParams.toString()}`);

  if (!response.ok) {
    throw new Error(`Erro ao buscar localizações: ${response.statusText}`);
  }

  return response.json();
}

export async function createLocation(location: Omit<Location, "id" | "distance_meters">): Promise<Location> {
  const response = await fetch(`${API_BASE_URL}/locations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(location),
  });

  if (!response.ok) {
    throw new Error(`Erro ao criar localização: ${response.statusText}`);
  }

  return response.json();
}

export async function getAllLocations(): Promise<Location[]> {
  const response = await fetch(`${API_BASE_URL}/locations`);

  if (!response.ok) {
    throw new Error(`Erro ao buscar localizações: ${response.statusText}`);
  }

  return response.json();
}

export async function updateLocation(id: string, location: Partial<Omit<Location, "id" | "distance_meters">>): Promise<Location> {
  const response = await fetch(`${API_BASE_URL}/locations/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(location),
  });

  if (!response.ok) {
    throw new Error(`Erro ao atualizar localização: ${response.statusText}`);
  }

  return response.json();
}

export async function deleteLocation(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/locations/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(`Erro ao excluir localização: ${response.statusText}`);
  }
}