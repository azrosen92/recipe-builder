var Alexa = require('alexa-sdk');
var CallAPIs = require("./CallAPIs");
var ResponseParser = require("./ResponseParser");

const DYNAMO_TABLE_NAME = "recipe_dynamo_table";
const states = {
  RECIPEMODE: '_RECIPEMODE',
  SEARCHMODE: '_SEARCHMODE'
};

exports.handler = function(event, context, callback) {
  var alexa = Alexa.handler(event, context);
  // alexa.appId = "amzn1.echo-sdk-ams.app.8c97fc78-342a-4e4f-823b-e2f91e7f3474";
  alexa.dynamoDBTableName = DYNAMO_TABLE_NAME;
  alexa.registerHandlers(recipeSearchHandlers, recipeHandlers);
  alexa.execute();
};

var recipeSearchHandlers = Alexa.CreateStateHandler(states.SEARCHMODE, {
  'LaunchRequest': function() {
    var say = 'Welcome! Ask me to find a recipe for your favorite food.';
    this.emit(':ask', say, 'What would you like to cook?');
  },

  "GetRecipeIntent": function() {
    var recipeName = this.event.request.intent.slots.recipeName.value;
    // Search for recipe on Food52.com by the above recipeName.
    CallAPIs.searchForRecipe(recipeName, (searchResponse) => {
      // TODO: Cache search results.
      this.attributes.searchResults = ResponseParser.parseSearchResults(searchResponse);
      this.attributes.selectedRecipeIndex = 0;

      var recipeJson = this.attributes.searchResults[this.attributes.selectedRecipeIndex];

      var recipeText = "I've sent you a link to the recipe. If you'd like to follow along, just check your Alexa app. <break time='0.1s' /> Are you ready to cook " + recipeJson.recipeName + "?";
      var repromptText = "So, how does it look?"

      var cardTitle = "Recipe Builder Card"
      var cardContent = recipeJson.recipeName

      var imgObj = {
        smallImageUrl: recipeJson.recipeImage,
        largeImageUrl: recipeJson.recipeImage
      };

      this.emit(':askWithCard', recipeText, repromptText, cardTitle, cardContent, imgObj);
    });
  },

  'AMAZON.YesIntent': function() {
    var recipe_url = this.attributes.searchResults[this.attributes.selectedRecipeIndex].recipeUrl
    CallAPIs.getRecipe(recipe_url, (recipeBody) => {
      var recipeData = ResponseParser.parseRecipe(recipeBody)
      var response = 'Excellent choice! You can ask me for the ingredients list or we can get started.'

      this.handler.state = states.RECIPEMODE;
      this.attributes.recipe = recipeData;
      this.attributes.instruction_no = 0;

      console.log(this.attributes.recipe);
      
      this.emitWithState(response);
    });
  },

  'AMAZON.NoIntent': function() {
    var nextRecipeIndex = this.attributes.selectedRecipeIndex + 1;
    if (nextRecipeIndex >= this.attributes.searchResults.length) {
      nextRecipeIndex = 0;
    }

    var recipeJson = this.attributes.searchResults[nextRecipeIndex];

    var recipeText = "Would you like to cook " + recipeJson.recipeName + "? <break time='0.1s' /> I've sent you a link to the recipe, if you'd like to follow along. Just check your Alexa app.";
    var repromptText = "So, how does it look?"

    var cardTitle = "Recipe Builder Card"
    var cardContent = recipeJson.recipeName

    var imgObj = {
      smallImageUrl: recipeJson.recipeImage,
      largeImageUrl: recipeJson.recipeImage
    };

    this.attributes.selectedRecipeIndex = this.attributes.selectedRecipeIndex + 1;
    this.handler.state = states.SEARCHMODE
    this.emit(':askWithCard', recipeText, repromptText, cardTitle, cardContent, imgObj);
  },

  'Unhandled': function() {
    this.handler.state = states.SEARCHMODE;
    this.emitWithState("Error! Error! Self destruct initiated!");
  }
});

var recipeHandlers = Alexa.CreateStateHandler(states.RECIPEMODE, {
  'LaunchRequest': function() {
    var say = 'Welcome!';
    // this.handler.state = states.RECIPEMODE
    this.emit(':ask', say, 'try again');
  },

  "GetCurrentInstructionIntent": function() {
    // Query Dynamo for recipe mapped to userId.
    var currentInstruction = this.attributes['instruction_no'];
    var currentInstructionText = this.attributes['recipe']['instructions'][currentInstruction];
    // Return current recipe instruction.
    this.emit(":tell", currentInstructionText);
  },

  "GetNextInstructionIntent": function() {
    // Query Dynamo for recipe mapped to userId.
    var nextInstruction = this.attributes['instruction_no'] + 1;
    var nextInstructionText = this.attributes['recipe']['instructions'][nextInstruction];
    // Increment current instruction marker and re-upload to dynamo under the same userId key.
    this.attributes['instruction_no'] = nextInstruction;

    this.emit(":tell", nextInstructionText);
  },

  "GetRecipeListIntent": function() {
    // Query dynamo for recipe mapped to userId
    // Emit list of ingredients necessary.
    var instructions = this.attributes.recipe.ingredients;
    var instructionsText = instructions.join(' <break time="0.5s" /> ');

    this.emit(":tell", instructionsText);
  },

  "GetIndividualIngredientIntent": function() {
    var recipeItem = this.event.request.intent.slots.recipe_item.value;
    // Get recipe mapped to userId from Dynamo.
    // Search through list of recipe_items in recipe mapped to userId for a recipe_item that contains the given recipeItem.
    var ingredientAmount =
      this.attributes['recipe']['ingredients'].find(function(el) {
        return el.includes(recipeItem);
      });
    // Emit the text of the recipe item.
    if (ingredientAmount != null) {
      this.emit(":tell", ingredientAmount);
    } else {
      this.emit(":tell", "I can't find any " + recipeItem + " in the ingredients list.");
    }
  },

  'AMAZON.HelpIntent': function() {
    this.emit(':ask', 'Say the name of a U.S. State.', 'try again');
  },

  'AMAZON.StopIntent': function() {
    var say = '';
    var myName = '';
    if (this.attributes['myName']) {
      myName = this.attributes['myName'];
    }
    say = 'Goodbye, ' + myName;

    this.emit(':tell', say);
  },

  'Unhandled': function() {
    this.handler.state = states.SEARCHMODE;
    this.emitWithState("I'm afraid I can't do that.");
  }
});

// var handlers = {
//   'LaunchRequest': function() {
//     var say = 'Welcome!';
//     this.handler.state = states.RECIPEMODE
//     this.emit(':ask', say, 'try again');
//   }
// };
  // end of handlers