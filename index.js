// ------ Title: Leaflet Webmap with Biodiversity Net Gain site boundaries 
// ------ Author: Oli Everard
// ------ Last Modified: 2022-03-08
// ------ Requires Leaflet, Leaflet CSS, and jQuerry Libraries 
//------- Map Height needs to be defined in the HTML file also e.g. <div id="map" style="height: 98vh;"></div> sets to 98% of the viewport
//-------------------------------------------------------------------------------------------

// STYLING 
//-------------------------------------------------------------------------------------------

//Define Styles for the Polygon Layers as an Array. 
var polygonStyle = {
  "weight": 5,
  "opacity": 0.65,
  "fillOpacity": 0
};

//Assoisiate the styles to variables and give themm colours 
var localPlanningAuthStyle = Object.assign({}, polygonStyle, {"color": "#3297a8"});
var countyBoundariesStyle = Object.assign({}, polygonStyle, {"color": "#45008f"});
var nationalCharacterAreasStyle = Object.assign({}, polygonStyle, {"color": "#268f00"});


// MAP AND LAYER DEFINITIONS
//-------------------------------------------------------------------------------------------

//Definte the map, and set the view 
var map = L.map('map').setView([52.849, -1.306], 13);


// Overlay Layers

//Load in the County Boundaries layer from the ArcGIS API 
var countyBoundaries = L.geoJSON(null, {
  style: countyBoundariesStyle,
  onEachFeature: function(feature, layer) {
    var label = feature.properties['CTYUA22NM'];
    layer.bindTooltip(label);
  }
  });
$.getJSON("https://services1.arcgis.com/ESMARspQHYMw9BZ9/arcgis/rest/services/Counties_and_Unitary_Authorities_December_2022_UK_BFC/FeatureServer/0/query?outFields=*&where=1%3D1&f=geojson", function(data) {
  countyBoundaries.addData(data);
});

//Load in the Local Planning Authorities layer from the ArcGIS API 
var localPlanningAuthoritiesGeoJSON = L.geoJSON(null, {
  style: localPlanningAuthStyle,
  onEachFeature: function(feature, layer) {
    var label = feature.properties['LPA22NM'];
    layer.bindTooltip(label);
  }
  });
$.getJSON("https://services1.arcgis.com/ESMARspQHYMw9BZ9/arcgis/rest/services/Local_Planning_Authorities_April_2022_UK_BUC_2022/FeatureServer/0/query?outFields=*&where=1%3D1&f=geojson", function(data) {
  localPlanningAuthoritiesGeoJSON.addData(data);
});
  

//Load in the Local Planning Authorities layer from the ArcGIS API 
var nationalCharacterAreasGeoJSON = L.geoJSON(null, {
  style: nationalCharacterAreasStyle,
  onEachFeature: function(feature, layer) {
    var label = feature.properties['JCANAME'];
    layer.bindTooltip(label);
  }
  });
$.getJSON("https://services.arcgis.com/JJzESW51TqeY9uat/arcgis/rest/services/National_Character_Areas_England/FeatureServer/0/query?where=1%3D1&outFields=*&outSR=4326&f=geojson", function(data) {
  nationalCharacterAreasGeoJSON.addData(data);
});


// Base Layers

var baseLayer = {
  "ArcGIS World Imagery": L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 18,
  }).addTo(map),
  "OpenStreetMap": L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',
    maxZoom: 18,
  })
};

// CONTROLS: Layer Toggle and Search
//-------------------------------------------------------------------------------------------

// Create a control object with the layer toggle. Adds the layers to the toggle.
var overlayMaps = {
  "Local Planning Authorities": localPlanningAuthoritiesGeoJSON,
  "National Character Areas": nationalCharacterAreasGeoJSON,
  "County Boundaries": countyBoundaries,
};

//Adds the toggle control to the map
L.control.layers(baseLayer, overlayMaps, {position: 'topright'}).addTo(map);

//defines the location of the search control 
var searchControl = L.control({position: 'bottomleft'});

//defines the search control
searchControl.onAdd = function(map) {
  var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-search');
  container.innerHTML = '<input type="text" id="search-box" placeholder="Search..."><button type="button" id="search-button">Go</button>';

    // add event listener to search box input element
    var searchBox = container.querySelector('#search-box');
    searchBox.addEventListener('keydown', function(event) {
      if (event.keyCode === 13) {
        event.preventDefault();
        document.getElementById('search-button').click();
      }
    });
    
  return container;
};

//Adds the search control to the map
searchControl.addTo(map);


//EXTRA LISTENERS
//-------------------------------------------------------------------------------------------

//Add a listner for the search box button. 
document.getElementById('search-button').addEventListener('click', function() {
  var query = document.getElementById('search-box').value;
  //Pass to OpenStreetMap API, and return Co-Ords. Then set the map to view them. 
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
