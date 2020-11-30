var minValue;
var maxValue;

$(function() {
  $( "#slider-range" ).slider({
    range: true,
    min: 0,
    max: 500,
    values: [ 75, 300 ],
    slide: function( event, ui ) {
      $( "#amount" ).val( "$" + ui.values[ 0 ] + " - $" + ui.values[ 1 ] );
      minValue = ui.values[0];
      maxValue = ui.values[1];

      printConsole();
    }
  });
  $( "#amount" ).val( "$" + $( "#slider-range" ).slider( "values", 0 ) +
    " - $" + $( "#slider-range" ).slider( "values", 1 ) );
});

var width = 960, height = 500;
var projection = d3.geoMercator().center([128,36]).scale(4000).translate([width/2, height/2]);
var svg = d3.select("#map").append("svg")
    .attr("width", width).attr("height", height);
var path = d3.geoPath().projection(projection);
var g = svg.append("g");

d3.json("municipalities-topo-simple.json", function(error, topology) {
  d3.csv("cities.csv", function(error, data) {
    g.selectAll("circle")
      .data(data).enter().append("circle")
      .attr("cx", function(d) { return projection([d.longitude, d.latitude])[0];
      })
      .attr("cy", function(d) {return projection([d.longitude, d.latitude])[1];
      })
      .attr("r", 1).style("fill", "red");
  });

  var features = topojson.feature(topology, topology.objects["municipalities-geo"]).features;

  g.selectAll("path")
    .data(features)
    .enter().append("path")
      .attr("d", path)
});

var zoom = d3.zoom()
  .on("zoom", function() {
    g.attr("transform", d3.event.transform);
    g.selectAll("circle").attr("d", path.projection(projection));
    g.selectAll("path").attr("d", path.projection(projection));
  });

svg.call(zoom)
