// Store our API endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=2014-01-01&endtime=" +
  "2014-01-02&maxlongitude=-69.52148437&minlongitude=-123.83789062&maxlatitude=48.74894534&minlatitude=25.16517337";

// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {
  // Once we get a response, send the data.features object to the createFeatures function
  createFeatures(data.features);
});

function createFeatures(earthquakeData) {
  console.log(earthquakeData);
  
  function circleSize(mag) {
    return mag * 50000;
  }
  
  // An array containing all of the information needed to create city and state markers
  var locations = [
    {
      coordinates: [earthquakeData[0].geometry.coordinates[1],earthquakeData[0].geometry.coordinates[0]],
      state: {
        name: "New York State",
        population: 19795791
      },
      city: {
        name: "New York",
        population: 8550405
      }
    },
    {
      coordinates: [34.0522, -118.2437],
      state: {
        name: "California",
        population: 39250017
      },
      city: {
        name: "Lost Angeles",
        population: 3971883
      }
    },
    {
      coordinates: [41.8781, -87.6298],
      state: {
        name: "Michigan",
        population: 9928300
      },
      city: {
        name: "Chicago",
        population: 2720546
      }
    },
    {
      coordinates: [29.7604, -95.3698],
      state: {
        name: "Texas",
        population: 26960000
      },
      city: {
        name: "Houston",
        population: 2296224
      }
    },
    {
      coordinates: [41.2524, -95.9980],
      state: {
        name: "Nebraska",
        population: 1882000
      },
      city: {
        name: "Omaha",
        population: 446599
      }
    }
  ];
  
  // Define arrays to hold created city and state markers
  var quakes = [];
  var stateMarkers = [];
  
  // Loop through locations and create city and state markers
  for (var i = 0; i < earthquakeData.length; i++) {
    // // Setting the marker radius for the state by passing population into the markerSize function
    // stateMarkers.push(
    //   L.circle(locations[i].coordinates, {
    //     stroke: false,
    //     fillOpacity: 0.75,
    //     color: "white",
    //     fillColor: "white",
    //     radius: markerSize(locations[i].state.population)
    //   })
    // );
    
    var lowColor = '#f9f9f9';
    var highColor = '#bc2a66';
    var ramp = d3.scaleLinear().domain([0,10]).range([lowColor,highColor]);
    // Setting the marker radius for the city by passing population into the markerSize function
    quakes.push(
      L.circle([earthquakeData[i].geometry.coordinates[1],earthquakeData[i].geometry.coordinates[0]], {
        stroke: false,
        fillOpacity: 0.75,
        valueProperty: "mag",
        // Color scale
        scale: ["#ffffb2", "#b10026"],//["red", "blue"],
        // Number of breaks in step range
        steps: 5,
        // q for quantile, e for equidistant, k for k-means
        //mode: "q",
        // color: "purple",
        fillColor: function(d) { return ramp(earthquakeData[i].properties.mag) },
        radius: circleSize(earthquakeData[i].properties.mag)
      }).bindPopup("<h3>" + earthquakeData[i].properties.place +"</h3><hr><p>" + new Date(earthquakeData[i].properties.time) + "</p>")
    );
    
    var earthquakes = L.layerGroup(quakes);
  
  }
  // // Define a function we want to run once for each feature in the features array
  // // Give each feature a popup describing the place and time of the earthquake
  // // function onEachFeature(feature, layer) {
  // //   earthquakes.push(L.circle([29.7604, -95.3698],{radius:100000}));
  // //   // layer.bindPopup("<h3>" + feature.properties.place +
  // //   //   "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
  // // }

  // // Create a GeoJSON layer containing the features array on the earthquakeData object
  // // Run the onEachFeature function once for each piece of data in the array
  // // var earthquakes = L.geoJSON(earthquakeData, {
  // //   onEachFeature: onEachFeature
  // // });

  // // Sending our earthquakes layer to the createMap function
  console.log(earthquakes);
  createMap(earthquakes);
}

function createMap(earthquakes) {

  // Define streetmap and darkmap layers
  var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/outdoors-v10/tiles/256/{z}/{x}/{y}?" +
    "access_token=pk.eyJ1IjoidHJhdmlzZG9lc21hdGgiLCJhIjoiY2poOWNrYjRkMDQ2ejM3cGV1d2xqa2IyeCJ9.34tYWBvPBM_h8_YS3Z7__Q"
  );

  var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/dark-v9/tiles/256/{z}/{x}/{y}?" +
    "access_token=pk.eyJ1IjoidHJhdmlzZG9lc21hdGgiLCJhIjoiY2poOWNrYjRkMDQ2ejM3cGV1d2xqa2IyeCJ9.34tYWBvPBM_h8_YS3Z7__Q"
  );

  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Street Map": streetmap,
    "Dark Map": darkmap
  };

  var link = "https://jmekblad13.github.io/earthquatkehw/plates.json";

  // Grabbing our GeoJSON data..
  var faults = L.layerGroup();
  
  d3.json(link, function(data) {
    // Creating a GeoJSON layer with the retrieved data
    console.log(data);
    L.geoJson(data).addTo(faults);
    //var faults = L.layerGroup(L.geoJson(data));
  });

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    Earthquakes: earthquakes,
    Fault_Lines: faults
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 4,
    layers: [streetmap, earthquakes]
  });

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

    // Setting up the legend
    var legend = L.control({ position: "bottomright" });
    legend.onAdd = function() {
      var div = L.DomUtil.create("div", "info legend");
      var limits = [0,2,4,6,8];
      var colors = ["red","orange","yellow","green","blue"];
      var labels = [];
  
      // Add min & max
      var legendInfo = "<h1>Legend</h1>" +
        "<div class=\"labels\">" +
          "<div class=\"min\">0</div>" +
          "<div class=\"max\">10</div>" +
        "</div>";
  
      div.innerHTML = legendInfo;
  
      limits.forEach(function(limit, index) {
        labels.push("<li style=\"background-color: " + colors[index] + "\"></li>");
      });
  
      div.innerHTML += "<ul>" + labels.join("") + "</ul>";
      return div;
    };
  
    // Adding legend to the map
    legend.addTo(myMap);
}
