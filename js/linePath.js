var svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

var projection = d3.geoMercator()
    .center([128, 36])
    .scale(4000)
    .translate([width/2, height/2]);

var path = d3.geoPath()
    .projection(projection);

queue()
  .defer(d3.json, "../municipalities-topo-simple.json")
  .defer(d3.csv, "../data/FireStationDestination.csv")
  .await(ready);

function ready(error, dataGeo, data) {
  var features = topojson.feature(dataGeo, dataGeo.objects["municipalities-geo"]).features;

  var link = []
  data.forEach(function(row) {
    source = [+row.long1, +row.lat1]
    target = [+row.long2, +row.lat2]
    topush = { type: "LineString", coordinates: [source, target], name: row.name, dest: row.dest}
    link.push(topush)
  });

  svg.append("g")
      .selectAll("path")
      .data(features)
      .enter().append("path")
        .attr("fill", "#b8b8b8")
        .attr("d", d3.geoPath().projection(projection))
        .style("stroke", "#fff")
        .style("stroke-width", 0.3)

  svg.selectAll("myPath")
      .data(link)
      .enter().append("path")
        .attr("d", function(d) { return path(d); })
        .style("fill", "none")
        .on("mouseover", function() { d3.select(this).style("stroke", "red"); })
        .on("mouseout", function() {
          d3.select(this).style("stroke", function(d) {
            for (i in d) {
              if(d[i] == "LineString") continue;

              var startLatRads = degreesToRadians(d[i][0][1]);
              var startLongRads = degreesToRadians(d[i][0][0]);
              var destLatRads = degreesToRadians(d[i][1][1]);
              var destLongRads = degreesToRadians(d[i][1][0]);

              var Radius = 6371;
              var distance = Math.acos(Math.sin(startLatRads) * Math.sin(destLatRads) +
              Math.cos(startLatRads) * Math.cos(destLatRads) * Math.cos(startLongRads - destLongRads)) * Radius;

              if(distance > 10) return "black";
              else return "white";
            }
          })
        })
        .style("stroke", function(d) {
          for (i in d) {
            if(d[i] == "LineString") continue;//console.log(d[i]);
            var startLatRads = degreesToRadians(d[i][0][1]);
            var startLongRads = degreesToRadians(d[i][0][0]);
            var destLatRads = degreesToRadians(d[i][1][1]);
            var destLongRads = degreesToRadians(d[i][1][0]);

            var Radius = 6371;
            var distance = Math.acos(Math.sin(startLatRads) * Math.sin(destLatRads) +
            Math.cos(startLatRads) * Math.cos(destLatRads) * Math.cos(startLongRads - destLongRads)) * Radius;

            if(distance > 10) return "black";
            else return "white";
          }
        })
        .style("stroke-width", 2)
      .append("title")
        .text(function(d) { return d.name + " to " + d.dest; });
}

function degreesToRadians(degrees) {
  radians = (degrees * Math.PI) / 180;
  return radians;
}

var zoom = d3.zoom()
  .on("zoom", function() {
    svg.attr("transform", d3.event.transform);
    svg.selectAll("path").attr("d", path.projection(projection));
  });

svg.call(zoom);
