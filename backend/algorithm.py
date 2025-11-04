from collections import defaultdict, deque
import math, heapq

def constructAdj(edges): #construct the adjancent list for future dfs and bfs algorithm.
    adj = defaultdict(list)
    for u, neighbors in edges.items(): 
        for dist, v in neighbors:
            adj[u].append((v, dist))
            adj[v].append((u, dist))
    return adj


def haversine(lat1, lon1, lat2, lon2): #cited from https://stackoverflow.com/questions/4913349/haversine-formula-in-python-bearing-and-distance-between-two-gps-points
    R = 6372.8
    dLat = math.radians(lat2 - lat1)
    dLon = math.radians(lon2 - lon1)
    lat1 = math.radians(lat1)
    lat2 = math.radians(lat2)
    a = math.sin(dLat/2)**2 + math.cos(lat1)*math.cos(lat2)*math.sin(dLon/2)**2
    c = 2*math.asin(math.sqrt(a))
    return R * c

def build_edges(colleges, k_in_state=3):
    by_state = defaultdict(list)
    for c in colleges:
        by_state[c["state"]].append(c)
    edges = defaultdict(list)
    for c in colleges:
        lat, lon, state, name = c["lat"], c["lon"], c["state"], c["name"]
        same_state = by_state[state]
        distances = []
        for other in same_state:
            if other["name"] == name:
                continue
            dist = haversine(lat, lon, other["lat"], other["lon"])
            distances.append((dist, other["name"]))
        distances.sort(key=lambda x: x[0])
        nearest_state = distances[:k_in_state]
        nearest_cross = None
        min_cross = float("inf")
        for other in colleges:
            if other["state"] == state:
                continue
            dist = haversine(lat, lon, other["lat"], other["lon"])
            if dist < min_cross:
                min_cross = dist
                nearest_cross = (dist, other["name"])
        edges[name] = nearest_state + ([nearest_cross] if nearest_cross else [])
    return edges


# algorithm belows are specifically for animation on web
def bfs_steps(adj, start, end):
    visited = set([start])
    q = deque([start])
    parent = {}
    steps = []  
    while q:
        u = q.popleft()
        for v, _ in adj[u]:
            if v not in visited:
                visited.add(v)
                parent[v] = u
                q.append(v)
                steps.append((u, v))  
            if v == end:
                break
    path = [end]
    while path[-1] in parent:
        path.append(parent[path[-1]])
    path.reverse()
    return path, steps


def dfs_steps(adj, start, end):
    visited = set()
    parent = {}
    steps = []
    found = False

    stack = [start]
    while stack:
        u = stack.pop()
        if u in visited:
            continue
        visited.add(u)

        if u == end:
            found = True
            break

        for v, _ in reversed(adj[u]):
            if v not in visited:
                parent[v] = u
                steps.append((u, v))
                stack.append(v)

    path = []
    if found:
        node = end
        while node in parent:
            path.append(node)
            node = parent[node]
        path.append(start)
        path.reverse()
    return path, steps

