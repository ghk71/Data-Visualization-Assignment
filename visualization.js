var svgHeight = 240;
var barElements;
var dataSet = [1.83, 3.63, 2.52, 9.09, 2.76, 1.28]

barElements = d3.select("#myGraph").selectAll("rect").data(dataSet)

barElements.enter()
    .append("rect")
    .attr("class", "bar")
    .attr("height", function(d,i){
      return d * 10;
    })
    .attr("width", 20)
    .attr("x", function(d,i){
      return i*25
    })
    .attr("y", function(d,i) {
      return svgHeight-d*10;
    })
    .selectAll("rect")
    .data(dataSet)
    .enter()
    .append("rect")
