/**
 * Created by pi on 8/15/16.
 */

var Job = require('../models/pr/Job');
var Recipe = require('../models/pr/Recipe');
var Line = require('../models/eq/Line');
var IngredientComponent = require('../models/pr/IngredientComponent');
var Promise = require('promise');
var getDisplayState = require('../lib/tools/getDisplayState');
// Job.belongsTo(Line,{as: 'line'});
// var ControllerAdapter = require('../adapters/ControllerAdapter');
var JobState = require('../lib/stateAndCategory/jobState');
// var Recipe = require('../../Models/pr/Recipe');
module.exports = function (app, controllerManager, i18n, socket) {
    app.get('/job/jobList/:lineIdent', function (req, res) {
        var lineIdent = req.params.lineIdent.substring(1);
        console.log('lineIdent: ' + lineIdent);

        console.log('isAuthenticated: ' + req.isAuthenticated());
        // var jobs =[];
        Job.findAll({
            where: {
                LineIdent: lineIdent
            }
        }).then(function (jobs) {

            console.log('jobs: ' + jobs);
            res.render('job/jobList',
                {
                    jobs: JSON.stringify(Job.getTranslatedJobs(jobs, i18n)),
                    LineIdent: lineIdent
                });
        });

    });
    app.get('/job/jobList/createJob/:lineIdent', function (req, res) {
        var lineIdent = req.params.lineIdent.substring(1);
        var errors = [];
        var error = '';
        console.log(lineIdent);
        Line.findOne({
            where: {Ident: lineIdent}
        }).then(function (theLine) {
            if (!theLine) {
                error = i18n.__('the line is not defined');
                res.json({error: error});
            } else {
                Job.getNewJobIdent(lineIdent).then(function (data) {
                    console.log('get max id: ' + data);
                    var jobInfo = {
                        ident: lineIdent + ':' + data,
                        name: lineIdent,
                        lineIdent: lineIdent,
                        ssTemplate: false,
                        state: JobState.Created,
                        LineId: theLine.id
                    };
                    Job.create(jobInfo).then(function (newJob) {
                        // for(var p in newJob){
                        //     console.log('Job property: ' + p);
                        // }
                        console.log('newJob');
                        console.dir(newJob);
                        var promises = [];
                        Recipe.findOne({
                            where: {
                                LineId: theLine.id,
                                isTemplate: true
                            }
                        }).then(function (RecipeTemplate) {
                            console.log('RecipeTemplate');
                            console.dir(RecipeTemplate);
                            if (RecipeTemplate) {
                                Recipe.create({
                                    Ident: newJob.Ident,
                                    Name: newJob.Ident,
                                    isTemplate: false,
                                    State: JobState.Created,
                                    JobId: newJob.id
                                }).then(function (newRecipe) {
                                    console.log('newRecipe');
                                    console.dir(newRecipe);
                                    RecipeTemplate.getSenders().then(function (ingredients) {
                                        ingredients.forEach(function (ingredient) {
                                            IngredientComponent.create({
                                                category: ingredient.category,
                                                targetPercentage: ingredient.targetPercentage,
                                                targetWeight: ingredient.targetWeight,
                                                storageIdent: ingredient.storageIdent,
                                                ProductId: ingredient.ProductId,
                                                RecipeId: newRecipe.id,
                                                productIdent: ingredient.productIdent
                                            }).then(function (newIngredient) {
                                                console.log('newIngredient');
                                                console.dir(newIngredient);
                                                if (newIngredient) {
                                                    console.log('created new ingredient');

                                                }
                                                else {
                                                    console.log('ingredient is empty');
                                                }
                                            });
                                        });
                                    });
                                });
                            } else {
                                error = i18n.__('the recipe template is not defined');
                                res.json({error: error});
                            }

                            // //console.log('Job addLine: ' + newJob.addLine);
                            // console.log('Job setLine: ' + newJob.setLine);
                            // console.log('Job getLine: ' + newJob.getLine);
                            // console.log('new Job: ' + JSON.stringify(newJob));
                            // var newJobStr = newJob.getTranslatedJobStr(i18n);
                            // console.log('converted new Job: ' + newJobStr);
                            // res.json({newJobStr: newJobStr});
                        });
                        var jobJson = newJob.getTranslatedJob(i18n);
                        res.json({job:jobJson});
                    });
                });

            }

        });

    });
    app.post('/job/jobList/deleteJob', isLoggedIn, function (req, res) {
        var toDeleteJobIdsStr = req.body.toDeleteJobIdsStr;
        console.log('toDeleteJobIdsStr:  ' + toDeleteJobIdsStr);
        var toDeleteJobIds = JSON.parse(toDeleteJobIdsStr);
        Job.destroy({
            where: {
                id: {
                    $in: toDeleteJobIds
                }
            }
        }).then(function (message) {
            res.json(message);
        });
    });
    app.get('/job/jobList/:lineIdent', isLoggedIn, function (req, res) {
        var lineIdent = req.params.lineIdent.substring(1);
        console.log(lineIdent);


        // var jobs =[];
        Job.findAll({
            where: {
                LineIdent: lineIdent,
            }
        }).then(function (jobs) {

            console.log('jobs: ' + jobs);
            res.render('job/jobList',
                {
                    jobs: JSON.stringify(Job.getTranslatedJobs(jobs, i18n)),
                    LineIdent: lineIdent
                });
        });

    });
    app.get('/job/jobDetail/:id', isLoggedIn, function (req, res) {
        var id = req.params.id.substring(1);
        Job.findOne({
            where: {id: id}
        }).then(function (theJob) {
            res.render('job/jobDetail',
                {
                    job: theJob

                });
        });

    });
    app.get('/job/jobDetail/startJob/:ident', isLoggedIn, function (req, res) {
        var lineIdent = '';
        var theLine,
            lineController;
        var ident = req.params.ident.substring(1);
        var message = '';
        var originMessage = '';
        var error = '';
        var originError = '';
        var controller = null;
        Job.findOne({
            where: {Ident: ident}
        }).then(function (theJob) {
            if (theJob) {
                theLine = theJob.getLine();
                console.log('TheLine:');
                console.dir(theLine);
                if (theLine) {
                    controller = controllerManager.getController(theLine.controllerName);
                    controller.startJob(theJob);
                }

            }
            else {
                originError = 'the job: {0} is not found';
                error = i18n.__(originError, ident);
                res.send({
                    error: error
                });
            }
        });


    });
};

function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated()) {

        console.log('is Authenticated!!!');
        return next();
    }


    // if they aren't redirect them to the home page
    res.redirect('/login');
}