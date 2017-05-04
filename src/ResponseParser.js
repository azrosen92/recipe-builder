var cheerio = require('cheerio');

module.exports = {
  /**
   Builds a json representing a recipe, should look like:
   recipe: {
      title: "Name of a recipe",
      smallImageURL: "<link to image of the food>",
      largeImageURL: "<probably the same as above>",
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
        return $(ingredientEl).text().replace(/\s+/g, ' ').trim();
      }).get();

    var instructionsContainerPath = "#global-page-frame > div.page-body-block > div > div.body-with-sidebar > div.main-content.recipe-main > article > section.clearfix > ol";
    var instructionsList =
      $(instructionsContainerPath).find('li[itemprop="recipeInstructions"]').map((_, instructionEl) => {
        return $(instructionEl).text().replace(/\s+/g, ' ').trim();
      }).get();

    var titleContainerPath = "#global-page-frame > div.page-body-block > div > div.body-with-sidebar > div.main-content.recipe-main > article > header > h1";
    var recipeTitle = $(titleContainerPath).text();

    var imageElementPath = "#recipe-gallery-frame > figure.photo-frame.first > img";
    var imageURL = $(imageElementPath).attr('src');

    return {
      title: recipeTitle,
      ingredients: ingredientsList,
      instructions: instructionsList,
      smallImageURL: imageURL,
      largeImageURL: imageURL
    }
  },

  /**
  Builds a list of search results from the html in the search page.
  [
    {
      recipeName: "Name of recipe",
      recipeUrl: "/recipes/22758-bright-n-zesty-mac-n-cheese"
    }, { }, ... { }
  ]
  */
  parseSearchResults: function(responseBody) {
    var $ = cheerio.load(responseBody);

    return $('.recipe-results-tiles').find('div > h3 > a').map((_, recipeTileEl) => {
      return {
        recipeName: $(recipeTileEl).attr('title'),
        recipeUrl: $(recipeTileEl).attr('href'),
        recipeImage: $(recipeTileEl).find('img').attr('src')
      }
    }).get();
  }
};