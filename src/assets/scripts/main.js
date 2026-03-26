import L from "leaflet";
import "leaflet/dist/leaflet.css";

const mapElement = document.getElementById("climbing-map");

if (mapElement) {
  const map = L.map("climbing-map").setView([40.05, -0.08], 10);

L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
  attribution: "&copy; OpenStreetMap &copy; CARTO",
}).addTo(map);


  // 🧗 Icono personalizado (emoji)
  const climbingIcon = L.divIcon({
    className: "climbing-marker",
    html: "🧗‍♀️",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -28],
  });

  // 📍 CRAGS (escuelas)
  const crags = [
    {
      name: "La Botalaria",
      coords: [40.047009, -0.080668],
    },
    {
      name: "Figueroles",
      coords: [40.133627, -0.219256],
    },
    {
      name: "Roca del Molí (L'Alcora)",
      coords: [40.097044, -0.212465],
    },
    {
      name: "Torre-Xiva",
      coords: [40.0660, -0.0880], 
    },
    {
      name: "La Cantera (Castellón)",
      coords: [40.035333, -0.001944],
    },
    {
      name: "El Peturro (Castellón)",
      coords: [40.037389, -0.026667],
    },
  ];

  const bounds = [];

  crags.forEach((crag) => {
    L.marker(crag.coords, { icon: climbingIcon })
      .addTo(map)
      .bindPopup(`<strong>${crag.name}</strong>`);

    bounds.push(crag.coords);
  });

  // 🔍 Ajusta el zoom automáticamente
  if (bounds.length) {
    map.fitBounds(bounds, { padding: [40, 40] });
  }
}