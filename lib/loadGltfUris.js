'use strict';
var fs = require('fs');
var path = require('path');
var Cesium = require('cesium');
var defined = Cesium.defined;
var defaultValue = Cesium.defaultValue;
var isDataUri = require('./isDataUri');
var dataUriToBuffer = require('data-uri-to-buffer');
var async = require('async');

module.exports = loadGltfUris;

function loadGltfUris(gltf, basePath, callback) {
    var shaders = gltf.shaders;

    //Iterate through each shader and load its uri
    if (defined(shaders)) {
        var shaderIds = Object.keys(shaders);
        async.each(shaderIds, function(shaderId, asyncCallback) {
            var shader = shaders[shaderId];
            var uri = shader.uri;
            shader.extras = defaultValue(shader.extras, {});
            loadURI(gltf, basePath, shader.extras, uri, asyncCallback);
        }, function(err) {
            if (err) {
                if (callback) {
                    process.nextTick(function() {
                        callback(err);
                    });
                }
                else{
                    throw err;
                }
            }
            else if (callback) {
                process.nextTick(function() {
                    callback();
                });
            }
        });
    }

    return gltf;
}

function loadURI(gltf, basePath, extras, uri, asyncCallback) {
    //Load the uri into the extras object based on the uri type
    if (isDataUri(uri)) {
        extras.source = dataUriToBuffer(uri);
        process.nextTick(function() {
            asyncCallback();
        });
    }
    else {
        var uriPath = path.join(basePath, uri);
        fs.readFile(uriPath, function (err, data) {
            if (err) {
                process.nextTick(function() {
                    asyncCallback(err);
                });
            }
            else {
                extras.source = data;
                process.nextTick(function() {
                    asyncCallback();
                });
            }
        });
    }
}