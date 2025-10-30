from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fetchData import load_colleges

app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"Get The data": "Colleges"}

@app.get("/api/docs")
def get_docs():
    pass


@app.get("/data")
def get_data():
    return load_colleges()

