/**
 * Created by pi on 7/21/16.
 */
//var Job = require('../../Models/pr/Job');
var Storage = require('../models/eq/Storage');
var GcsState = require('../lib/stateAndCategory/gcsState');
module.exports = function (app, i18n) {
    app.get('/storage/StorageList', function (req, res) {
        Storage.findAll({}).then(function (storages) {
            console.log('storages: ' + storages);
            res.render('storage/StorageList',
                {
                    storages: JSON.stringify(storages)
                });
        });

    });
    app.get('/storage/StorageList/createLine', function (req, res) {
        var lineInfo = {
            Ident: 'newLine',
            State: GcsState.Passive
        };
        Storage.create(lineInfo).then(function (newLine) {
            console.log('newLine: ' + JSON.stringify(newLine));
            // console.log('newRecipe.save: ' +newRecipe.save);
            res.json(newLine);
        });
    });
    app.post('/storage/StorageList/deleteStorage', function (req, res) {
        var toDeleteStorageIdsStr = req.body.toDeleteStorageIdsStr;
        console.log('toDeleteStorageIdsStr:  ' + toDeleteStorageIdsStr);
        var toDeleteLineIds = JSON.parse(toDeleteStorageIdsStr);
        Storage.destroy({
            where: {
                id: {
                    $in: toDeleteLineIds
                }
            }
        }).then(function (message) {
            res.json(message);
        });
    });

    app.get('/storage/StorageDetail/:id', function (req, res) {
        var id = req.params.id.substring(1);
        var storageStr='';
        var error ='';
        console.log('storage id: ' + id);
        Storage.findOne({
            where: {id: id}
        }).then(function (theStorage) {
            console.log('storage: ');
            console.dir(theStorage);
            if (theStorage) {
                storageStr = JSON.stringify(Storage);
                console.log('storage string: ' + storageStr);
            }
            else {

                error = i18n.__('storage not found');
                console.log(error);
            }
            res.render('storage/StorageDetail',
                {
                    storage: storageStr,
                    error: error

                });

        });
    });
    app.post('/storage/StorageDetail', function (req, res) {
        // for(var p in req){
        //     console.log('property of req: '+ p);
        // }
        var storageStr = req.body.storageStr;
        console.log('storageStr: ' + storageStr);
        var storageFromClient = JSON.parse(storageStr);
        console.log('lineFromClient: ' + storageFromClient);
        Storage.findOne({
            where: {id: storageFromClient.id}
        }).then(function (theStorage) {
            theStorage.update(storageFromClient).then(function () {
                console.log("save successfully");
                res.json("save successfully");
            });
        });

    });


}