import { useState, useCallback } from "react";

type RadiusOption = 5 | 10 | 20 | 100;

interface SearchBarProps {
  onSearch: (term: string, radius: number) => void;
  disabled?: boolean;
}

const RADIUS_OPTIONS: { value: RadiusOption; label: string }[] = [
  { value: 5, label: "5 km" },
  { value: 10, label: "10 km" },
  { value: 20, label: "20 km" },
  { value: 100, label: "100 km" },
];

export default function SearchBar({ onSearch, disabled = false }: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [radius, setRadius] = useState<RadiusOption>(10);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      onSearch(searchTerm.trim().toLowerCase(), radius);
    },
    [searchTerm, radius, onSearch]
  );

  return (
    <form className="search-bar" onSubmit={handleSubmit}>
      <div className="search-input-group">
        <label htmlFor="search-term" className="visually-hidden">
          Buscar por tipo de local
        </label>
        <input
          type="text"
          id="search-term"
          placeholder="Tipo de local (ex: Campo de futebol)"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          disabled={disabled}
        />
      </div>

      <div className="search-radius-group">
        <label htmlFor="search-radius" className="visually-hidden">
          Raio de busca
        </label>
        <select
          id="search-radius"
          value={radius}
          onChange={(e) => setRadius(Number(e.target.value) as RadiusOption)}
          disabled={disabled}
        >
          {RADIUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <button type="submit" className="search-button" disabled={disabled}>
        {disabled ? "Buscando..." : "Buscar"}
      </button>
    </form>
  );
}