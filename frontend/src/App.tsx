
import MapView from "./components/MapView";
import "./index.css";

function App() {
  return (
    <main className="app">
      <header className="app-header">
        <div>
          <span className="eyebrow">GIS EXPLORER</span>
          <h1>Explorador geográfico</h1>
          <p>
            Visualização interativa de localizações geográficas.
          </p>
        </div>

        <span className="status">
          <span className="status-dot" />
          Ambiente de demonstração
        </span>
      </header>

      <section className="workspace">
        <aside className="sidebar">
          <h2>Mapa</h2>
          <p>
            Navegue pelo mapa, aproxime uma região e selecione
            os marcadores para consultar suas informações.
          </p>

          <div className="info-card">
            <span className="info-label">Localizações</span>
            <strong>03</strong>
            <span className="info-description">
              Pontos fictícios carregados
            </span>
          </div>

          <div className="info-card">
            <span className="info-label">Região inicial</span>
            <strong>Joinville/SC</strong>
            <span className="info-description">
              Coordenadas geográficas WGS 84
            </span>
          </div>

          <p className="sidebar-note">
            Os dados exibidos são ilustrativos e não representam
            propriedades reais.
          </p>
        </aside>

        <section className="map-panel" aria-label="Mapa interativo">
          <MapView />
        </section>
      </section>
    </main>
  );
}

export default App;
