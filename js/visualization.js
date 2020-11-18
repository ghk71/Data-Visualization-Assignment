d3.csv("data/2017 기상상태별 교통사고.csv", function(error, data) {
  var dataSet = [];
  var labelName = [];

  for(var i in data[0]) {
    dataSet.push(data[0][i]);
    labelName.push(i)
  }


  console.log(dataSet);
  console.log("-----");
  console.log(labelName);
});
