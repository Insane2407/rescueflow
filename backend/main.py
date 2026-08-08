import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database.session import engine
from models import domain
from api.routes import router

# Create the database tables
try:
    domain.Base.metadata.create_all(bind=engine)
except Exception as e:
    print(f"Warning: Could not create database tables (this is normal on read-only serverless environments like Vercel with SQLite): {e}")

app = FastAPI(title="FlowRescue API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)

@app.get("/")
def root():
    return {"message": "FlowRescue API is running"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
