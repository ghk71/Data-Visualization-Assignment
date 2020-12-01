var svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

var inputValue = "병원";
var kind = ["병원", "종합병원", "상급종합"];

var g = svg.append("g");

var projection = d3.geoMercator()
    .center([128, 36])
    .scale(6000)
    .translate([width/2,height/2]);

var path = d3.geoPath()
    .projection(projection);

queue()
  .defer(d3.json, "../geo/municipalities-topo-simple.json")
  .defer(d3.csv, "../data/Hospital.csv")
  .await(ready);

  function ready(error, dataGeo, data) {
    var features = topojson.feature(dataGeo, dataGeo.objects["municipalities-geo"]).features;

    g.selectAll("path")
      .data(features)
      .enter().append("path")
        .attr("fill", "#b8b8b8")
        .attr("d", d3.geoPath().projection(projection))
        .style("stroke", "#fff")
        .style("stroke-width", 0.3);

    var rodents = svg.append("g").attr("class", "circle");

    var path = rodents.selectAll("path")
        .data(data)
        .enter().append("circle")
          .attr("cx", function(d) { return projection([d.longitude, d.latitude])[0]})
          .attr("cy", function(d) { return projection([d.longitude, d.latitude])[1]})
          .attr("r", 2)
          .attr("fill", "red")
          .attr("stroke", "none")
          .attr("opacity", 0.4)
          .attr("d", path)
          .attr("class", "incident")
        .on("mouseover", function(d) {
          if(d.kind == inputValue) {
            d3.select("h2").text(d.name);
            d3.select(this).attr("class", "incident hover");
            drawPie(d);
          }
        })
        .on("mouseout", function(d) {
          if(d.kind == inputValue) {
            d3.select("h2").text("");
            d3.select(this).attr("class", "incident");

            var header = document.querySelector(".p");
            header.parentNode.removeChild(header);
          }
        })
  }


function drawPie(d) {
  var data = new Object();

  data['General'] = d.General;
  data['Intern'] = d.Intern;
  data['Resident'] = d.Resident;
  data['Specialist'] = d.Specialist;

  var width=450, height=450, margin=40, radius = Math.min(width, height) / 2 - margin;

  var color = d3.scaleOrdinal()
      .range(["#98abc5", "#7b6888", "#a05d56", "#ff8c00"]);

  var pie = d3.pie()
      .value(function(d) { return d.value; });

  var data_ready = pie(d3.entries(data));

  var svg2 = d3.select(".pie")
      .append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("class", "p")
      .append("g")
        .attr("transform", "translate(" + width/2 + "," + height/2 + ")");

  var arcGenerator = d3.arc()
      .innerRadius(0)
      .outerRadius(radius);

  svg2.selectAll('mySlices')
      .data(data_ready)
      .enter().append('path')
        .attr('d', arcGenerator)
        .attr('fill', function(d) { return (color(d.data.key)) })
        .attr('stroke', 'black')
        .style('stroke-width', '2px')
        .style('opacity', 0.7);

  svg2.selectAll('mySlices')
      .data(data_ready)
      .enter().append('text')
      .text(function(d) {
        if(d.data.value == 0) return "";
        else return (d.data.key + ": " + d.data.value + "명")
      })
      .attr('transform', function(d) { return "translate(" + arcGenerator.centroid(d) + ")"; })
      .style('text-anchor', 'middle')
      .style('font-size', 15);
}

d3.select("#timeslide").on("input", function() {
  update(+this.value);
});

function update(value) {
  document.getElementById("range").innerHTML = kind[value];
  inputValue = kind[value];

  d3.selectAll(".incident")
      .attr("fill", colorMatch);
}

function colorMatch(data, value) {
  if(data.kind == inputValue) return "red";
  else return "none";
}
