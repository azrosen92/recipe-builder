var CallAPIs = require("../src/CallAPIs");
var ResponseParser = require("../src/ResponseParser");
var fs = require('fs');


CallAPIs.searchForRecipe("Mac n cheese", (res) => {
  var recipe_url = ResponseParser.parseSearchResults(res)[0].recipe_url
  var recipe_json = CallAPIs.getRecipe(recipe_url, (res) => {


  });
});