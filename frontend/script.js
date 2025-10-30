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

    marker.bindTooltip(`<b>${c.name}</b><br>${c.city}, ${c.state}`, {
      direction: "top",
    });
  });
}
fetchData();
