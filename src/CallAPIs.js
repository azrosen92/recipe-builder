var https = require('https');

const BASE_SEARCH_URL = "https://food52.com/recipes/search?q="
const BASE_RECIPE_URL = "https://food52.com";

module.exports = {
    searchForRecipe: function(searchTerm, callback) {
        var searchURL = BASE_SEARCH_URL + searchTerm.split(" ").join("+");

        var responseBody = "";

        https.get(searchURL, (res) => {
            if (res.statusCode == 200) {
                res.on('data', (data) => {
                    responseBody += data;
                });
                res.on('end', () => {
                    callback(responseBody);
                });
            } else {
                callback("NOT_FOUND");
            }
        }).on('error', (e) => {
            console.log(e);
            callback("NOT_FOUND");
        });
    },

    getRecipe: function(recipeURL, callback) {
        var responseBody = "";

        https.get(BASE_RECIPE_URL + recipeURL, (res) => {
            if (res.statusCode == 200) {
                res.on('data', (data) => {
                    responseBody += data;
                });
                res.on('end', () => {
                    callback(responseBody);
                });
            } else {
                callback("NOT_FOUND");
            }
        }).on('error', (e) => {
            console.log(e);
            callback("NOT_FOUND");
        })
    }
};

