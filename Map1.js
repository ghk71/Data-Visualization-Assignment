var width = 1300, height = 800;
var svg = d3.select("#map")
    .append("svg")
      .attr("width", width)
      .attr("height", height);

var projection = d3.geoMercator()
    .center([128,36])
    .scale(4000)
    .translate([width/2, height/2]);

var path = d3.geoPath()
    .projection(projection);

var g = svg.append("g");

var quantize = d3.scaleQuantize()
    .domain([0, 1000])
    .range(d3.range(9).map(function(i) { return "p" + i; }));

queue()
  .defer(d3.json, "municipalities-topo-simple.json")
  .defer(d3.csv, "data/Hospital_NumDoctor_Convert.csv", function(d) {
    console.log(d);
    popByName.set(d.name, +d.doctor);
  })
  .await(ready);

function ready(error, data) {
  var features = topojson.feature(data, data.objects["municipalities-geo"]).features;

  features.forEach(function(d) {
    d.properties.population = popByName.get(d.properties.name);
    d.properties.density = d.properties.population;
    d.properties.quantized = quantize(d.properties.density);
  });

  g.selectAll("path")
      .data(features)
    .enter().append("path")
      .attr("class", function(d) { return "municipality " + d.properties.quantized; })
      .attr("d", path)
      .attr("id", function(d) {return d.properties.city; })
    .append("title")
      .text(function(d) { return d.properties.name + ": " + d.properties.population + "명" });
}

var zoom = d3.zoom()
  .on("zoom", function() {
    svg.attr("transform", d3.event.transform);
    svg.selectAll("path").attr("d", path.projection(projection));
  });

svg.call(zoom)
