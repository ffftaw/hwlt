/**
 * Created by pi on 7/21/16.
 */
var Job = require('../Models/Pr/Job');
var Line = require('../Models/Eq/Line');
var Recipe = require('../Models/Pr/Recipe');
module.exports = function (app, i18n) {
    app.get('/admin/recipe/RecipeList', function (req, res) {
        console.log("Recipe localed in i18n: " + i18n.getLocale(req));
        Recipe.findAll({
            where: {IsTemplate: true}
        }).then(function (recipes) {
            console.log('recipes: \n' + recipes);
            var recipesStr = JSON.stringify(recipes);
            res.render('admin/recipe/RecipeList', {
                    recipes: recipesStr
                }
            );
            //res.json(recipes);
        });

    });

    app.get('/admin/recipe/RecipeList/createRecipe', function (req, res) {
        // var lineIdent = req.params.lineIdent.substring(1);
        // console.log(lineIdent);
        var recipeInfo = {
            Ident: 'newRecipeTemplate',
            IsTemplate: true
        };
        Recipe.create(recipeInfo).then(function (newRecipe) {
            console.log('newRecipe: ' + JSON.stringify(newRecipe));
            // console.log('newRecipe.save: ' +newRecipe.save);
            res.json(newRecipe);
        });

    });
    app.get('/admin/recipe/RecipeList/deleteRecipe/:toDeleteIds', function (req, res) {
        var toDeleteIdsStr = req.params.toDeleteIds.substring(1);
        var toDeleteIds = JSON.parse(toDeleteIdsStr);
        Recipe.destroy({
            where:{
              id: {
                  $in: toDeleteIds
              }
            }
        }).then(function (message) {
            res.json(message);
        });

    });

    //--------------------------------------------------------------------
    app.get('/admin/recipe/RecipeDetail/:id', function (req, res) {
        var id = req.params.id.substring(1);
        console.log('Recipe id: ' + id);
        Recipe.findOne({
            where: {id: id}
        }).then(function (theRecipe) {
            var recipeStr = JSON.stringify(theRecipe);
            console.log('recipe string: ' + recipeStr);
            res.render('admin/recipe/RecipeDetail',
                {
                    recipe: recipeStr

                });
        });
    });
    app.get('/admin/recipe/RecipeDetail/UpdateRecipe/:recipeJsonStr', function (req, res) {
        var recipeJsonStr = req.params.recipeJsonStr.substring(1);

        var recipeFromClient = JSON.parse(recipeJsonStr);
        console.log('recipeFromClient: ' + recipeFromClient);
        Recipe.findOne({
            where: {id: recipeFromClient.id}
        }).then(function (theRecipe) {
            theRecipe.update(recipeFromClient).then(function () {
                console.log("save successfully");
                res.json("save successfully");
            });
        });

    });

}