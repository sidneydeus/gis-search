from fastapi import FastAPI

app = FastAPI(title="GIS Search API")


@app.get("/health")
async def health_check():
    return {"status": "healthy"}