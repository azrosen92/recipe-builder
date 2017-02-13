var CallAPIs = require("../src/CallAPIs");

CallAPIs.searchForRecipe("Mac n cheese", (res) => {
  console.log("BODY: " + res.toString());
});