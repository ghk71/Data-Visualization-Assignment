window.onload = function() {
  draw();
}

var svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

var inputValue = 0;

var projection = d3.geoMercator()
    .center([128, 36])
    .scale(4000)
    .translate([width/2, height/2]);

var path = d3.geoPath()
    .projection(projection);

function draw() {
  queue()
    .defer(d3.json, "../geo/municipalities-topo-simple.json")
    .defer(d3.csv, "../data/FireStationDestination.csv")
    .await(ready);

    function ready(error, dataGeo, data) {
      var features = topojson.feature(dataGeo, dataGeo.objects["municipalities-geo"]).features;

      var link = []
      data.forEach(function(row) {
        if(row.distance >= inputValue) {
          source = [+row.long1, +row.lat1]
          target = [+row.long2, +row.lat2]
          topush = { type: "LineString", coordinates: [source, target], distance:row.distance,
                      name:row.name, dest:row.dest}
          link.push(topush)
        }
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
            .on("mouseover", function(d) {
              d3.select("h2").text(d.name + " -> " + d.dest + ": " + d.distance + "km");
              d3.select(this).style("stroke", "grey");
            })
            .on("mouseout", function(d) {
              d3.select("h2").text("");
              d3.select(this).style("stroke", "black");
            })
            .style("stroke", "black")
            .style("stroke-width", 2)

      svg.append("g")
          .selectAll("circle")
          .data(data)
          .enter().append("circle")
            .attr("cx", function(d) {return projection([d.long1, d.lat1])[0]})
            .attr("cy", function(d) {return projection([d.long1, d.lat1])[1]})
            .attr("r", 1)
            .attr("fill", function(d) {
              if(d.distance >= inputValue) return "red";
              else return "none";
            })
            .attr("class", "Firecircle");

        svg.append("g")
            .selectAll("circle")
            .data(data)
            .enter().append("circle")
              .attr("cx", function(d) {return projection([d.long2, d.lat2])[0]})
              .attr("cy", function(d) {return projection([d.long2, d.lat2])[1]})
              .attr("r", 1.5)
              .attr("fill", function(d) {
                if(d.distance >= inputValue) return "yellow";
                else return "none";
              })
              .attr("class", "Hospitalcircle");
    }
}

d3.select("#timeslide").on("input", function() {
  update(+this.value);
})

function update(value) {
  document.getElementById("range").innerHTML = value;
  inputValue = value;

  var header = document.querySelector(".Firecircle");
  header.parentNode.removeChild(header);

  var header2 = document.querySelector(".Hospitalcircle");
  header2.parentNode.removeChild(header2);

  draw();
}

var zoom = d3.zoom()
  .on("zoom", function() {
    svg.attr("transform", d3.event.transform);
    svg.selectAll("path").attr("d", path.projection(projection));
  });

svg.call(zoom);
