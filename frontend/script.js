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

//config for user Selection
let startMarker = null; // start mark
let endMarker = null; //end mark
let line = null; // vitualization of two colleges
let startCollege = null; //start college
let endCollege = null; // end college
let algorithm = null; // algorithm

async function fetchData() {
  const res = await fetch("http://127.0.0.1:8000/data");
  const colleges = await res.json();
  drawMarkers(colleges);
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

function handleMarkerClick(marker, college) {
  if (!startMarker) {
    startMarker = marker;
    startCollege = college;
    marker.setStyle({ fillColor: "green", radius: 7 });
    marker.bindPopup(`<b>Start:</b> ${college.name}`).openPopup();
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
    marker.bindPopup(`<b>End:</b> ${college.name}`).openPopup();

    const startLatLng = startMarker.getLatLng();
    const endLatLng = endMarker.getLatLng();
    line = L.polyline([startLatLng, endLatLng], {
      color: "yellow",
      weight: 3,
      dashArray: "6,6",
    }).addTo(map);

    return;
  }

  resetSelection();
}

function resetSelection() {
  if (startMarker) startMarker.setStyle({ fillColor: "red", radius: 4 });
  if (endMarker) endMarker.setStyle({ fillColor: "red", radius: 4 });
  if (line) map.removeLayer(line);

  startMarker = null;
  endMarker = null;
  startCollege = null;
  endCollege = null;
  line = null;
}

document.getElementById("algorithm").addEventListener("change", (event) => {
  algorithm = event.target.value;
});

async function passCollegeSelection() {
  //start visualization
  if (!startMarker || !endMarker) {
    alert("One or Two of the college is not selected");
  }
  const startName = startCollege;
  const endName = endCollege.name;

  try {
    const response = await fetch("http://127.0.0.1:8000/colleges/path", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        start: startName,
        end: endName,
        algorithm: algorithm,
      }),
    });

    if (!response.ok) {
      throw new Error("error: " + response.status);
    }

    const data = await response.json();

    if (data.path) {
      L.polyline(data.path, { color: "lime", weight: 4 }).addTo(map);
    }
  } catch (err) {
    console.error("Error for fetching", err);
  }
}

fetchData();
