# GIS Search API

API FastAPI para busca geoespacial.

## Requisitos

- Python 3.10+
- Ambiente virtual (venv)

## Instalação

```bash
# Criar e ativar ambiente virtual
python -m venv venv
source venv/bin/activate  # Linux/macOS
# venv\Scripts\activate   # Windows

# Instalar dependências
pip install -r requirements.txt
```

## Execução

```bash
# Desenvolvimento (com hot reload)
uvicorn main:app --reload

# Produção
uvicorn main:app --host 0.0.0.0 --port 8000
```

A API estará disponível em `http://localhost:8000`.

## Endpoints

### Health Check
- `GET /health` - Health check

### Locais (CRUD)
- `POST /locations` - Criar novo local
- `GET /locations` - Listar todos os locais
- `GET /locations/{id}` - Buscar local por ID
- `PUT /locations/{id}` - Atualizar local (parcial)
- `DELETE /locations/{id}` - Deletar local

### Modelo de Local
```json
{
  "id": "uuid",
  "latitude": -23.5505,
  "longitude": -46.6333,
  "address": "Av. Paulista, 1000",
  "place_type": "restaurante"
}
```

**Validações:**
- `latitude`: -90 a 90
- `longitude`: -180 a 180
- `address`: 1-255 caracteres
- `place_type`: 1-100 caracteres