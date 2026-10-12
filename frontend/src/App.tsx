
import { useState, useMemo } from "react";

import MapView from "./components/MapView";
import SearchBar from "./components/SearchBar";
import { mockLocations } from "./data/mockLocations";
import { filterLocationsByTypeAndRadius } from "./utils/geo";
import type { MockLocation } from "./types/location";
import "./index.css";
import "./App.css";

function App() {
  const [searchTerm, setSearchTerm] = useState("");
  const [radius, setRadius] = useState(10);
  const center: [number, number] = [-48.845, -26.304];

  const handleSearch = (term: string, r: number) => {
    setSearchTerm(term);
    setRadius(r);
  };

  const filteredLocations = useMemo((): MockLocation[] => {
    return filterLocationsByTypeAndRadius(
      mockLocations,
      searchTerm,
      center[1],
      center[0],
      radius
    ) as MockLocation[];
  }, [searchTerm, radius]);

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

          <SearchBar onSearch={handleSearch} />

          <div className="info-card">
            <span className="info-label">Localizações</span>
            <strong>{filteredLocations.length}</strong>
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
          <MapView locations={filteredLocations} center={center} />
        </section>
      </section>
    </main>
  );
}

export default App;
