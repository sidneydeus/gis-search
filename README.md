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

- `GET /health` - Health check