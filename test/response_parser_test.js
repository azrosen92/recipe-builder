var ResponseParser = require('../src/ResponseParser');
var fs = require('fs');

fs.readFileSync("test_response.html", (err, data) => {
  if (err) {
    return console.log(err);
  }

  console.log(ResponseParser.parseRecipe(data));
});