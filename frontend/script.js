const map = L.map("map", {
  zoomControl: false,
  dragging: true,
  scrollWheelZoom: true,
  doubleClickZoom: false,
  boxZoom: false,
  keyboard: false,
}).setView([37.8, -96], 5);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap contributors",
}).addTo(map);

let startMarker = null;
let endMarker = null;
let startCollege = null;
let endCollege = null;
let edgeLayers = [];
let edgesVisible = true;
let colleges = [];

async function fetchData() {
  const res_colleges = await fetch("http://127.0.0.1:8000/data");
  const res_edges = await fetch("http://127.0.0.1:8000/colleges/edges");
  colleges = await res_colleges.json();
  const edges = await res_edges.json();
  drawMarkers(colleges);
  drawEdges(edges, colleges);
}

function drawMarkers(colleges) {
  colleges.forEach((c) => {
    if (!c.lat || !c.lon) return;
    const marker = L.circleMarker([c.lat, c.lon], {
      radius: 3,
      fillColor: "red",
      color: "#021aeeff",
      weight: 1,
      fillOpacity: 0.8,
    }).addTo(map);
    marker.on("click", () => handleMarkerClick(marker, c));
    marker.bindTooltip(`<b>${c.name}</b><br>${c.city}, ${c.state}`, {
      direction: "top",
    });
  });
}

function drawEdges(edges, colleges) {
  const coordMap = {};
  colleges.forEach((c) => (coordMap[c.name] = [c.lat, c.lon]));
  const drawn = new Set();
  Object.entries(edges).forEach(([college, neighbors]) => {
    const src = coordMap[college];
    if (!src) return;
    neighbors.forEach(([dist, neighbor]) => {
      const dest = coordMap[neighbor];
      if (!dest) return;
      const key = [college, neighbor].sort().join("-");
      if (drawn.has(key)) return;
      drawn.add(key);
      const line = L.polyline([src, dest], {
        color: "gray",
        weight: 1,
        opacity: 0.3,
      }).addTo(map);
      edgeLayers.push(line);
    });
  });
}

document.getElementById("hide").addEventListener("click", () => {
  if (edgesVisible) {
    edgeLayers.forEach((l) => map.removeLayer(l));
    edgesVisible = false;
    document.getElementById("hide").innerText = "Show Edges";
  } else {
    edgeLayers.forEach((l) => l.addTo(map));
    edgesVisible = true;
    document.getElementById("hide").innerText = "Hide Edges";
  }
});

function handleMarkerClick(marker, college) {
  if (!startMarker) {
    startMarker = marker;
    startCollege = college;
    marker.setStyle({ fillColor: "green", radius: 7 });
    document.getElementById("start").value = college.name;
    return;
  }
  if (!endMarker) {
    if (college.name === startCollege.name) {
      alert("Start and End cannot be the same!");
      return;
    }
    endMarker = marker;
    endCollege = college;
    marker.setStyle({ fillColor: "blue", radius: 7 });
    document.getElementById("end").value = college.name;
    return;
  }
  resetSelection();
}

document.getElementById("reset").addEventListener("click", () => {
  window.location.reload();
});

document.getElementById("startBtn").addEventListener("click", async () => {
  if (!startCollege || !endCollege) {
    alert("Please select both start and end colleges!");
    return;
  }

  const algo = document.getElementById("algorithm").value;
  const res = await fetch("http://127.0.0.1:8000/colleges/path", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      algorithm: algo,
      start: startCollege.name,
      end: endCollege.name,
    }),
  });

  const data = await res.json();

  if (data.steps && data.steps.length > 0) {
    const stepColor = algo === "dfs" ? "green" : "blue";
    const reached = await animateSteps(data.steps, data.end, stepColor, 200);
    if (reached) {
      await animatePath(data.path);
      return;
    }
  }
  await animatePath(data.path);
});

async function animateSteps(steps, endCoord, color = "orange", delay) {
  for (let [p1, p2] of steps) {
    const line = L.polyline([p1, p2], {
      color: color,
      weight: 2,
      opacity: 0.6,
    }).addTo(map);

    if (p2[0] === endCoord[0] && p2[1] === endCoord[1]) {
      return true;
    }

    await new Promise((resolve) => setTimeout(resolve, delay));
  }
  return false;
}

async function animatePath(pathCoords) {
  if (!pathCoords || pathCoords.length < 2) return;

  for (let i = 0; i < pathCoords.length - 1; i++) {
    const segment = [pathCoords[i], pathCoords[i + 1]];
    L.polyline(segment, {
      color: "red",
      weight: 5,
      opacity: 0.8,
    }).addTo(map);
    await new Promise((resolve) => setTimeout(resolve, 300));
  }

  const pathLine = L.polyline(pathCoords, {
    color: "red",
    weight: 5,
    opacity: 1,
  }).addTo(map);

  map.fitBounds(pathLine.getBounds());
}

fetchData();
