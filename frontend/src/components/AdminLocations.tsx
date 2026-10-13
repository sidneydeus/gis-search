import { useState, useEffect } from "react";
import {
  getAllLocations,
  createLocation,
  updateLocation,
  deleteLocation,
  type Location,
} from "../services/api";

export default function AdminLocations() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [formData, setFormData] = useState({
    latitude: -26.304,
    longitude: -48.845,
    address: "",
    place_type: "",
  });

  useEffect(() => {
    loadLocations();
  }, []);

  const loadLocations = async () => {
    try {
      setLoading(true);
      const data = await getAllLocations();
      setLocations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar localizações");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingLocation) {
        await updateLocation(editingLocation.id, formData);
      } else {
        await createLocation(formData as Omit<Location, "id" | "distance_meters">);
      }
      setShowForm(false);
      setEditingLocation(null);
      resetForm();
      loadLocations();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar");
    }
  };

  const handleEdit = (location: Location) => {
    setEditingLocation(location);
    setFormData({
      latitude: location.latitude,
      longitude: location.longitude,
      address: location.address,
      place_type: location.place_type,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta localização?")) return;
    try {
      await deleteLocation(id);
      loadLocations();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao excluir");
    }
  };

  const resetForm = () => {
    setFormData({
      latitude: -26.304,
      longitude: -48.845,
      address: "",
      place_type: "",
    });
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingLocation(null);
    resetForm();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "latitude" || name === "longitude" ? parseFloat(value) : value,
    }));
  };

  if (loading) return <div className="admin-loading">Carregando...</div>;

  return (
    <div className="admin-container">
      <header className="admin-header">
        <h1>Administração de Localizações</h1>
        <button className="btn btn-primary" onClick={() => { resetForm(); setShowForm(true); }}>
          Nova Localização
        </button>
      </header>

      {error && (
        <div className="error-message" role="alert">
          {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      {showForm && (
        <div className="admin-modal-overlay" onClick={handleCancel}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editingLocation ? "Editar Localização" : "Nova Localização"}</h2>
            <form onSubmit={handleSubmit} className="admin-form">
              <div className="form-group">
                <label htmlFor="latitude">Latitude</label>
                <input
                  type="number"
                  step="any"
                  name="latitude"
                  id="latitude"
                  value={formData.latitude}
                  onChange={handleChange}
                  required
                  min="-90"
                  max="90"
                />
              </div>
              <div className="form-group">
                <label htmlFor="longitude">Longitude</label>
                <input
                  type="number"
                  step="any"
                  name="longitude"
                  id="longitude"
                  value={formData.longitude}
                  onChange={handleChange}
                  required
                  min="-180"
                  max="180"
                />
              </div>
              <div className="form-group">
                <label htmlFor="address">Endereço</label>
                <input
                  type="text"
                  name="address"
                  id="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  maxLength={255}
                />
              </div>
              <div className="form-group">
                <label htmlFor="place_type">Tipo de Local</label>
                <input
                  type="text"
                  name="place_type"
                  id="place_type"
                  value={formData.place_type}
                  onChange={handleChange}
                  required
                  maxLength={100}
                  placeholder="Ex: restaurante, parque, hospital"
                />
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={handleCancel}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingLocation ? "Atualizar" : "Criar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <table className="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Endereço</th>
            <th>Tipo</th>
            <th>Coordenadas</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {locations.length === 0 ? (
            <tr>
              <td colSpan={5} className="empty-state">
                Nenhuma localização cadastrada
              </td>
            </tr>
          ) : (
            locations.map((location) => (
              <tr key={location.id}>
                <td className="id-cell">{location.id.slice(0, 8)}...</td>
                <td>{location.address}</td>
                <td><span className="place-type-badge">{location.place_type}</span></td>
                <td className="coords-cell">
                  {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="btn btn-sm btn-edit"
                      onClick={() => handleEdit(location)}
                      aria-label="Editar"
                    >
                      ✏️
                    </button>
                    <button
                      className="btn btn-sm btn-delete"
                      onClick={() => handleDelete(location.id)}
                      aria-label="Excluir"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}