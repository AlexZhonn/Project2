from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fetchData import load_colleges
from algorithm import dfs_steps, bfs_steps, constructAdj, build_edges
from collections import defaultdict

app = FastAPI()

colleges = load_colleges()
edges = build_edges(colleges)
adj = constructAdj(edges)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"status": "College Pathfinding API Running"}

@app.get("/data")
def get_colleges():
    return colleges

@app.get("/colleges/edges")
def get_edges():
    return edges

@app.get("/colleges/adj")
def get_adj():
    return adj

@app.post("/colleges/path")
async def get_path(req: Request):
    data = await req.json()
    start, end = data["start"], data["end"]
    algo = data["algorithm"]

    name_to_coord = {c["name"]: [c["lat"], c["lon"]] for c in colleges}

    if algo == "bfs":
        path, steps = bfs_steps(adj, start, end)
    else:
        path, steps = dfs_steps(adj, start, end)

    coords = [name_to_coord[p] for p in path if p in name_to_coord]
    steps_coords = []
    for u, v in steps:
        if u in name_to_coord and v in name_to_coord:
            steps_coords.append([name_to_coord[u], name_to_coord[v]])

    return {"path": coords, "steps": steps_coords, "end": name_to_coord[end]}
