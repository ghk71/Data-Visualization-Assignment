window.onload = function() {
  line();
}

function foo(select) {
   if(select.options[select.selectedIndex].getAttribute("myid") == 1) {
     bar();
   }

   else {
     line();
   }
}

function del(id) {
  var parent = document.getElementById(id);
  var svg = document.getElementById("chart");

  if(svg != null) parent.removeChild(svg);
}

function bar() {
del("lineChart");

var margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var svg = d3.select("#barChart")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .attr("id", "chart");
var g = svg.append("g").attr("transform","translate(" + margin.left + "," + margin.top + ")");

var svg = d3.select("svg"),
    margin = {top:20, right:20, bottom:30, left: 40},
    width = +svg.attr("width") - margin.left - margin.right,
    height = +svg.attr("height") - margin.top - margin.bottom,
    g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var x0 = d3.scaleBand()
    .rangeRound([0, width])
    .paddingInner(0.1);

var x1 = d3.scaleBand()
    .padding(0.05);

var y = d3.scaleLinear()
    .rangeRound([height, 0]);

var z= d3.scaleOrdinal()
    .range(["#98abc5", "#6b486b", "#ff8c00"]);

d3.csv("../data/drunk_drive2.csv", function(d, i, columns) {
  for(var i=1, n=columns.length; i<n; ++i) {
    d[columns[i]] = +d[columns[i]];
  }
  return d;
  }, function(error, data) {
  if(error) throw error;

  var keys = data.columns.slice(1);

  x0.domain(data.map(function(d) {return d.month; }));
  x1.domain(keys).rangeRound([0, x0.bandwidth()]);
  y.domain([0, d3.max(data, function(d) {return d3.max(keys, function(key) {return d[key]; }); })]).nice();

  g.append("g")
    .selectAll("g")
    .data(data)
    .enter().append("g")
    .attr("class", "bar")
    .attr("transform", function(d) {return "translate(" + x0(d.month) + ",0)"; })
    .selectAll("rect")
    .data(function(d) {return keys.map(function(key) {return {key: key, value: d[key]}; }); })
    .enter().append("rect")
      .attr("x", function(d) { return x1(d.key); })
      .attr("y", function(d) { return y(d.value); })
      .attr("width", x1.bandwidth())
      .attr("height", function(d) { return height - y(d.value); })
      .attr("fill", function(d) { return z(d.key); });

  g.append("g")
    .attr("class", "axis")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x0));

  g.append("g")
    .attr("class", "y axis")
    .call(d3.axisLeft(y).ticks(null, "s"))
    .append("text")
    .attr("x", 2)
    .attr("y", y(y.ticks().pop()) + 0.5)
    .attr("dy", "0.32em")
    .attr("fill", "#000")
    .attr("font-weight", "bold")
    .attr("text-anchor", "start")
    .text("rate");

  var legend = g.append("g")
      .attr("font-family", "sans-serif")
      .attr("font-size", 10)
      .attr("text-anchor", "end")
      .selectAll("g")
      .data(keys.slice().reverse())
      .enter().append("g")
      .attr("transform", function(d, i) {return "translate(0, " + i*20 + ")"; });

  legend.append("rect")
    .attr("x", width - 17)
    .attr("width", 15)
    .attr("height", 15)
    .attr("fill", z)
    .attr("stroke", z)
    .attr("stroke-width", 2)
    .on("click", function(d) { update(d) });

  legend.append("text")
    .attr("x", width - 24)
    .attr("y", 0.5)
    .attr("dy", "0.32em")
    .text(function(d) {return d;});

  var filtered = [];

  function update(d) {
    if(filtered.indexOf(d) == -1) {
      filtered.push(d);

      if(filtered.length == keys.length) filtered = [];
    }

    else {
      filtered.splice(filtered.indexOf(d), 1);
    }

    var newKeys = [];
    keys.forEach(function (d) {
      if(filtered.indexOf(d) == -1) {
        newKeys.push(d);
      }
    })

    x1.domain(newKeys).rangeRound([0, x0.bandwidth()]);
    y.domain([0, d3.max(data, function(d) {return d3.max(keys, function(key) {if(filtered.indexOf(key) == -1) return d[key]; }); })]).nice();
      svg.select(".y").transition().call(d3.axisLeft(y).ticks(null, "s")).duration(500);

      var bars = svg.selectAll(".bar").selectAll("rect")
          .data(function(d) {return keys.map(function(key) {return {key:key, value:d[key]}; }); });

      bars.filter(function(d) {
          return filtered.indexOf(d.key) > -1;
        })
        .transition()
        .attr("x", function(d) {
          return (+d3.select(this).attr("x")) + (+d3.select(this).attr("width")) / 2;
        })
        .attr("height", 0)
        .attr("width", 0)
        .attr("y", function(d) {return height; })
        .duration(500);

      bars.filter(function(d) {
          return filtered.indexOf(d.key) == -1;
        })
        .transition()
        .attr("x", function(d) {return x1(d.key); })
        .attr("y", function(d) {return y(d.value); })
        .attr("height", function(d) {return height - y(d.value); })
        .attr("width", x1.bandwidth())
        .attr("fill", function(d) {return z(d.key); })
        .duration(500);

      legend.selectAll("rect")
        .transition()
        .attr("fill", function(d) {
          if(filtered.length) {
            if(filtered.indexOf(d) == -1) {
              return z(d);
            }
            else {
              return "white";
            }
          }
          else {
            return z(d);
          }
        }).duration(100);
  }
});
}

function line() {
del("barChart");

var margin = {top: 10, right: 30, bottom: 30, left: 60},
    width = 1560 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#lineChart")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .attr("id", "chart")
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

//Read the data
d3.csv("../data/drunk_drive.csv",

  // When reading the csv, I must format variables:
  function(d){
    return { date : d3.timeParse("%Y-%m-%d")(d.date), value : d.value }
  },

  // Now I can use this dataset:
  function(data) {

    // Add X axis --> it is a date format
    var x = d3.scaleTime()
      .domain(d3.extent(data, function(d) { return d.date; }))
      .range([ 0, width ]);
    xAxis = svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

    // Add Y axis
    var y = d3.scaleLinear()
      .domain([0, d3.max(data, function(d) { return +d.value; })])
      .range([ height, 0 ]);
    yAxis = svg.append("g")
      .call(d3.axisLeft(y));

    // Add a clipPath: everything out of this area won't be drawn.
    var clip = svg.append("defs").append("svg:clipPath")
        .attr("id", "clip")
        .append("svg:rect")
        .attr("width", width )
        .attr("height", height )
        .attr("x", 0)
        .attr("y", 0);

    // Add brushing
    var brush = d3.brushX()                   // Add the brush feature using the d3.brush function
        .extent( [ [0,0], [width,height] ] )  // initialise the brush area: start at 0,0 and finishes at width,height: it means I select the whole graph area
        .on("end", updateChart)               // Each time the brush selection changes, trigger the 'updateChart' function

    // Create the area variable: where both the area and the brush take place
    var area = svg.append('g')
      .attr("clip-path", "url(#clip)")

    // Create an area generator
    var areaGenerator = d3.area()
      .x(function(d) { return x(d.date) })
      .y0(y(0))
      .y1(function(d) { return y(d.value) })

    // Add the area
    area.append("path")
      .datum(data)
      .attr("class", "myArea")  // I add the class myArea to be able to modify it later on.
      .attr("fill", "#69b3a2")
      .attr("fill-opacity", .3)
      .attr("stroke", "black")
      .attr("stroke-width", 1)
      .attr("d", areaGenerator )

    // Add the brushing
    area
      .append("g")
        .attr("class", "brush")
        .call(brush);

    // A function that set idleTimeOut to null
    var idleTimeout
    function idled() { idleTimeout = null; }

    // A function that update the chart for given boundaries
    function updateChart() {

      // What are the selected boundaries?
      extent = d3.event.selection

      // If no selection, back to initial coordinate. Otherwise, update X axis domain
      if(!extent){
        if (!idleTimeout) return idleTimeout = setTimeout(idled, 350); // This allows to wait a little bit
        x.domain([ 4,8])
      }else{
        x.domain([ x.invert(extent[0]), x.invert(extent[1]) ])
        area.select(".brush").call(brush.move, null) // This remove the grey brush area as soon as the selection has been done
      }

      // Update axis and area position
      xAxis.transition().duration(1000).call(d3.axisBottom(x))
      area
          .select('.myArea')
          .transition()
          .duration(1000)
          .attr("d", areaGenerator)
    }

    // If user double click, reinitialize the chart
    svg.on("dblclick",function(){
      x.domain(d3.extent(data, function(d) { return d.date; }))
      xAxis.transition().call(d3.axisBottom(x))
      area
        .select('.myArea')
        .transition()
        .attr("d", areaGenerator)
    });
})
}
