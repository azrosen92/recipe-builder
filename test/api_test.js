var CallAPIs = require("../src/CallAPIs");
var ResponseParser = require("../src/ResponseParser");

CallAPIs.searchForRecipe("Mac n cheese", (res) => {
  console.log(ResponseParser.parseRecipe(res.toString()));
});