# GIS Search API

API FastAPI para busca geoespacial com PostgreSQL + PostGIS.

## Requisitos

- Python 3.10+
- Docker e Docker Compose
- Ambiente virtual (venv) - opcional para desenvolvimento local

## Instalação com Docker (Recomendado)

```bash
# Subir banco de dados PostgreSQL com PostGIS
docker-compose up -d

# Criar e ativar ambiente virtual
python -m venv venv
source venv/bin/activate  # Linux/macOS
# venv\Scripts\activate   # Windows

# Instalar dependências
pip install -r requirements.txt
```

## Execução

```bash
# Certifique-se que o PostgreSQL está rodando (docker-compose up -d)

# Desenvolvimento (com hot reload)
uvicorn main:app --reload

# Produção
uvicorn main:app --host 0.0.0.0 --port 8000
```

A API estará disponível em `http://localhost:8000`.

## Parar serviços

```bash
docker-compose down
```

## Parar e remover volumes (apaga dados do banco)

```bash
docker-compose down -v
```

## Endpoints

### Health Check
- `GET /health` - Health check

### Locais (CRUD)
- `POST /locations` - Criar novo local
- `GET /locations` - Listar todos os locais
- `GET /locations/{id}` - Buscar local por ID
- `PUT /locations/{id}` - Atualizar local (parcial)
- `DELETE /locations/{id}` - Deletar local

### Busca Geoespacial (PostGIS)
- `GET /locations/nearby` - Buscar locais próximos
  - Query params: `latitude`, `longitude`, `radius_meters` (opcional, padrão 1000m, máx 100000m)

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

### Exemplo de busca por proximidade
```bash
curl "http://localhost:8000/locations/nearby?latitude=-23.5505&longitude=-46.6333&radius_meters=5000"
```

Retorna locais ordenados por distância (mais próximos primeiro) com campo `distance_meters`.