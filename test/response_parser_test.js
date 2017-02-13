var ResponseParser = require('../src/ResponseParser');
var fs = require('fs');

fs.readFile("./test_response.html", (err, data) => {
  if (err) {
    return console.log(err);
  }

  console.log(ResponseParser.parseRecipe(data));
});