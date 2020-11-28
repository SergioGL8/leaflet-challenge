// Earthquakes and Plates URL Variables
var earthquake_url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
var plates_url = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";

// Retrieve earthquakes and plates URL with D3
d3.json(earthquake_url, function(data) {
  let earthquakeData = data.features
  d3.json(plates_url, function(data) {
    let plateData = data.features

    createMap(earthquakeData,plateData)
  })
})

function createMap(earthquakeData, plateData) {
    
    // Determine Style of Marker
    let earthquakeMarkers = earthquakeData.map((feature) =>
        L.circleMarker([feature.geometry.coordinates[1],feature.geometry.coordinates[0]],{
            radius: magCheck(feature.properties.mag),
            stroke: true,
            weight: 0.5,
            color: 'black',
            opacity: 1,
            weight: 0.5,
            fill: true,
            fillColor: magColor(feature.properties.mag),
            fillOpacity: 0.9   
        })

        // Popup describing the place and time of the Earthquake
        .bindPopup("<h4>Location : " + feature.properties.place +
        "</h4><hr><p>Date & Time: " + new Date(feature.properties.time) +
        "</h3><hr><p>Magnitude" + feature.properties.mag + "</p>")
        );

      // Initialize and create a LayerGroup "earthquakes"
      var earthquakes = L.layerGroup(earthquakeMarkers);

      // Function to Determine the Polyline 
      function makePolyline(feature, layer){
        L.polyline(feature.geometry.coordinates);
      }
      
      // Style of the Polyline
      let plates = L.geoJSON(plateData, {
        onEachFeature: makePolyline,
          style: {
            color: 'red',
            opacity: 1
          }
      })

  // Adding darkmap tile layer
  var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/dark-v10",
    accessToken: API_KEY
  });

  // // Adding outdoors map tile layer
  var outdoors = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/outdoors-v11",
    accessToken: API_KEY
  });

  // Adding satellite map tile layer
  var satellite = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/satellite-v9",
    accessToken: API_KEY
  });

  // Create basemaps
  var baseMaps = {
    "Dark Map": darkmap,
    "Outdoors Map": outdoors,
    "Satellite Map": satellite
  };

  // Create overlay objects
  var overlayMaps = {
    Earthquakes: earthquakes,
    Plates : plates
  };

  // Create myMap object
  var myMap = L.map("map", {
    center: [39.02, -97.82],
    zoom: 4,
    layers: [satellite, earthquakes]
  });

// Set Up Legend
var legend = L.control({ position: "bottomright" });

legend.onAdd = function(){
    var div = L.DomUtil.create("div","legend");
    magnitudeLevels = [0, 1, 2, 3, 4, 5];

    div.innerHTML += "<h3>Magnitude</h3>"

    for (var i = 0; i < magnitudeLevels.length; i++) {
        div.innerHTML +=
            '<i style="background: ' + magColor(magnitudeLevels[i] + 1) + '"></i> ' +
            magnitudeLevels[i] + (magnitudeLevels[i + 1] ? '&ndash;' + magnitudeLevels[i + 1] + '<br>' : '+');
    }
    return div;
};

// Add legend to the Map
legend.addTo(myMap);
L.control.layers(baseMaps, overlayMaps, {
  collapsed: true
}).addTo(myMap);
}
    // // Function to Determine Color of Marker
     function magColor(mag) {
      var color = "";
      if (mag <= 2) { color = "#006633"; }
      else if (mag <= 3) {color = "#99CC00"; }
      else if (mag <= 4) { color = "#FFFF00"; }
      else if (mag <= 5) {color = "#FF6600"; }
      else { color = "#006633"; }
    
    return color;
    
    };

// Function to check for magnitude below 1
function magCheck(mag){
  if (mag <= 1){
      return 8
  }
  return mag * 8;
}