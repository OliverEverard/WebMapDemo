var localPlanningAuthStyle = {
  "color": "#3297a8",
  "weight": 5,
  "opacity": 0.65
};

var map = L.map('map').setView([51.505, -0.09], 13);

L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
  maxZoom: 18,
}).addTo(map);

var localPlanningAuthoritiesGeoJSON = L.geoJSON(null, {
  style: localPlanningAuthStyle,
  onEachFeature: function(feature, layer) {
    var label = feature.properties['LPA22NM'];
    layer.bindTooltip(label);
  }
  });
  

$.getJSON("./src/localPlanningAuthorities.geojson", function(data) {
  localPlanningAuthoritiesGeoJSON.addData(data);
});

// Create a base layer
var baseLayer = {
  "ArcGIS World Imagery": L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 18,
  }),
  "OpenStreetMap": L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',
    maxZoom: 18,
  })
};

// Create a control object with the layer toggle
var overlayMaps = {
  "Local Planning Authorities": localPlanningAuthoritiesGeoJSON,
};

L.control.layers(baseLayer, overlayMaps, {position: 'topright'}).addTo(map);

var searchControl = L.control({position: 'bottomleft'});

searchControl.onAdd = function(map) {
  var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-search');
  container.innerHTML = '<input type="text" id="search-box" placeholder="Search..."><button type="button" id="search-button">Go</button>';
  return container;
};

searchControl.addTo(map);

document.getElementById('search-button').addEventListener('click', function() {
  var query = document.getElementById('search-box').value;
  if (query.length > 0) {
    var url = 'https://nominatim.openstreetmap.org/search?q=' + encodeURIComponent(query) + '&format=json&limit=1';
    fetch(url)
      .then(function(response) {
        return response.json();
      })
      .then(function(data) {
        if (data.length > 0) {
          var result = data[0];
          var latlng = L.latLng(result.lat, result.lon);
          map.setView(latlng, 13);
        }
      });
  }
});
