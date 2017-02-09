const Alexa = require("alexa-sdk");

const recipesBaseUrl = "https://food52.com/recipes/search?q=";
const DYNAMO_TABLE_NAME = "recipe_dynamo_table";

exports.handler = function(event, context, callback) {
	const alexa = Alexa.handler(event, context);
	alexa.dynamoDBTableName = DYNAMO_TABLE_NAME;
	alexa.registerHandlers(handlers);
	alexa.execute();
};

var storeInDynamo = function(recipeJson, instructionNumber) {
	this.attributes['recipe'] = recipeJson;
	this.attributes['instruction_no'] = instructionNumber;
}

/**
 Builds a json representing a recipe, should look like:
 recipe: {
 	ingredients: [
		"1 cup of sugar",
		...,
		"2 tbsp of salt"
	],
	instructions: [
		"Preheat oven to 350 degrees",
		...,
		"Take out of oven and let cool"
	]
 }
 */
var parseRecipe = function(recipeBody) {
	return {
		recipe: {
			title: "Kale Macaroni and Cheese in Homage to Woodberry Kitchen",
			ingredients: [
				"1	bunch lacinato kale",
				"1	pound penne pasta",
				"1	tablespoon butter",
				"1	tablespoon olive oil, plus some to grease",
				"2	tablespoons flour",
				"2	cups whole milk",
				"15 to 20	ounces shredded cheese (I use a mix of mild and sharp aged cheddar and Asiago)",
				"1/2	cup breadcrumbs (I like a mix of whole wheat and panko)",
				"1/2	cup grated or ground Pecorino Romano cheese"
			],
			instructions: [
				"Preheat oven to 350º F",
				"In a large pot, bring 6 cups water to a boil, then blanch the kale in the boiling water for 30 seconds. Leaving the boiled water in the pot, use a slotted spoon to scoop the kale out of the water and into a strainer, and allow the excess water to drain. Let cool, then chop, removing and discarding the stems.",
				"Bring the water in the pot back to a boil, add the penne, and cook according to the package until just under al dente, then drain and set aside. The pasta is going to be baked, so you want it to be just under cooked at this stage.",
				"In a large saucepan, melt the butter and olive oil over medium-low heat until the butter starts to foam. While whisking, add in the flour and continue whisking for another 2 minutes. Add the milk slowly while whisking continuously to make sure there are no lumps. Once you have a smooth texture, turn off the heat and add the cheese. Mix well until the cheese is melted, then add the kale, making sure it doesn't stay in clumps.",
				"Add the pasta to saucepan and combine with the cheese sauce. If your saucepan is not large enough, add the pasta and the cheesy kale mixture back into the drained pasta pot and mix well.",
				"Grease an 11- or 12-inch cast iron pan or other oven-proof baking dish with some oil. Transfer the pasta/cheesy kale mixture into it, then sprinkle the breadcrumbs and Pecorino Romano over the top.",
				"Bake for 35 to 40 minutes until bubbling and golden brown on top. If after 40 minutes this has not happened, raise heat to 400º F and check again after 5 minutes. Let stand for a few minutes before serving."
			]
		}
	}
}

var searchForRecipe = function(recipeName) {
 return true;
}

const handlers = {
	"GetRecipeIntent": function() {
		var recipeName = "Mac n' cheese"; //this.event.request.intent.slots.recipe_name.value;
		// Search for recipe on Food52.com by the above recipeName.
		var recipe = searchForRecipe(recipeName);
		// Build JSON with data for recipe.
		var recipeJson = parseRecipe(recipe);
		// Store in Dynamo mapped to userId.
		const STARTING_INSTRUCTION_NUMBER = 0;
		storeInDynamo(recipeJson, STARTING_INSTRUCTION_NUMBER)

		var recipeText = "Are you ready to cook " + recipeName + "?";

		this.emit(":ask", recipeText);
	},

	"GetCurrentInstructionIntent": function() {
		// Query Dynamo for recipe mapped to userId.
		var currentInstruction = this.attributes['instruction_no'];
		var currentInstructionText = this.attributes['recipe']['instructions'][currentInstruction];
		// Return current recipe instruction.
		this.emit(":tell", currentInstruction);
	},

	"GetNextInstructionIntent": function() {
		// Query Dynamo for recipe mapped to userId.
		var nextInstruction = this.attributes['instruction_no'] + 1;
		var nextInstructionText = this.attributes['recipe']['instructions'][currentInstruction];
		// Increment current instruction marker and re-upload to dynamo under the same userId key.
		this.attributes['instruction_no'] = nextInstruction;

		this.emit(":tell", nextInstructionText);
	},

	"GetRecipeListIntent": function() {
		// Query dynamo for recipe mapped to userId
		// Emit list of ingredients necessary.
		var instructions = this.attribute["recipe"]["instructions"];
		var instructionsText = instructions.join("<break time='0.5s'>");

		this.emit(":tell", instructionsText);
	},

	"GetIndividualIngredientIntent": function() {
		var recipeItem = this.event.request.intent.slots.recipe_item.value;
		// Get recipe mapped to userId from Dynamo.
		// Search through list of recipe_items in recipe mapped to userId for a recipe_item that contains the given recipeItem.
		var ingredientAmount =
			this.attributes['recipe']['ingredients'].find(function(el) {
				el.includes(recipeItem);
			});
		// Emit the text of the recipe item.
		this.emit(":tell", ingredientAmount)
	}
};