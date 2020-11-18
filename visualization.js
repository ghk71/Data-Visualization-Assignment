function fetchLocal(url) {
  return new Promise(function(resolve, reject) {
    var xhr = new XMLHttpRequest
    xhr.onload = function() {
      resolve(new Response(xhr.responseText, {status: xhr.status}))
    }
    xhr.onerror = function() {
      reject(new TypeError('Local request failed'))
    }
    xhr.open('GET', url)
    xhr.send(null)
  })
}

d3.csv("data/2017.csv", function(error, data) {
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
