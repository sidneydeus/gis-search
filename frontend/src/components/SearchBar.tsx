import { useState, useCallback } from "react";

type RadiusOption = 5 | 10 | 20;

interface SearchBarProps {
  onSearch: (term: string, radius: number) => void;
}

const RADIUS_OPTIONS: { value: RadiusOption; label: string }[] = [
  { value: 5, label: "5 km" },
  { value: 10, label: "10 km" },
  { value: 20, label: "20 km" },
];

export default function SearchBar({ onSearch }: SearchBarProps) {
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
        >
          {RADIUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <button type="submit" className="search-button">
        Buscar
      </button>
    </form>
  );
}