var cheerio = require('cheerio');

module.exports = {
    /**
     Builds a json representing a recipe, should look like:
     recipe: {
        title: "Name of a recipe",
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
    parseRecipe: function(responseBody) {
      var $ = cheerio.load(responseBody);

      var ingredientsList = 
        $('ul.recipe-list').find('li[itemprop="ingredients"]').map((_, ingredientEl) => {
          return $(ingredientEl).text().replace(/\s+/g,' ').trim();
        }).get();

      var instructionsContainer = "#global-page-frame > div.page-body-block > div > div.body-with-sidebar > div.main-content.recipe-main > article > section.clearfix > ol";
      var instructionsList = 
        $(instructionsContainer).find('li[itemprop="recipeInstructions"]').map((_, instructionEl) => {
          return $(instructionEl).text().replace(/\s+/g,' ').trim();
        }).get();

      var titleContainer = "#global-page-frame > div.page-body-block > div > div.body-with-sidebar > div.main-content.recipe-main > article > header > h1";
      var recipeTitle = $(titleContainer).text();

      return {
        title: recipeTitle, 
        ingredients: ingredientsList,
        instructions: instructionsList
      }
    },

    /**
    Builds a list of search results from the html in the search page.
    [
      {
        recipe_name: "Name of recipe",
        recipe_url: "/recipes/22758-bright-n-zesty-mac-n-cheese"
      }, { }, ... { }
    ]
    */
    parseSearchResults: function(responseBody) {
      var $ = cheerio.load(responseBody);

      return $('.recipe-results-tiles').find('div > h3 > a').map((_, recipeTileEl) => {
        return {
          recipe_name: $(recipeTileEl).attr('title'),
          recipe_url: $(recipeTileEl).attr('href')
        }
      }).get();
    }
};