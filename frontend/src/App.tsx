import { useState, useCallback } from "react";

import MapView from "./components/MapView";
import SearchBar from "./components/SearchBar";
import { searchNearbyLocations, type Location } from "./services/api";
import "./index.css";
import "./App.css";

function App() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const center: [number, number] = [-48.845, -26.304];

  const handleSearch = useCallback(async (term: string, radiusKm: number) => {
    setLoading(true);
    setError(null);

    try {
      const results = await searchNearbyLocations({
        latitude: center[1],
        longitude: center[0],
        radius_meters: radiusKm * 1000,
        place_type: term || undefined,
      });
      setLocations(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
      setLocations([]);
    } finally {
      setLoading(false);
    }
  }, [center]);

  return (
    <main className="app">
      <header className="app-header">
        <div>
          <h1>Buscador geográfico</h1>
          <p>
            Visualização interativa de localizações geográficas.
          </p>
        </div>
      </header>

      <section className="workspace">
        <aside className="sidebar">
          <h2>Busca</h2>

          <SearchBar onSearch={handleSearch} disabled={loading} />

          {error && (
            <div className="error-message" role="alert">
              {error}
            </div>
          )}

          <div className="info-card">
            <span className="info-label">Localizações</span>
            <strong>{locations.length}</strong>
            <span className="info-description">
              Pontos encontrados
            </span>
          </div>

          <div className="info-card">
            <span className="info-label">Região inicial</span>
            <strong>Joinville/SC</strong>
            <span className="info-description">
              Coordenadas geográficas WGS 84
            </span>
          </div>

        </aside>

        <section className="map-panel" aria-label="Mapa interativo">
          <MapView locations={locations} center={center} />
        </section>
      </section>
    </main>
  );
}

export default App;