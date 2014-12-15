'use strict';

/* global require */
var defined = require('../../third_party/cesium/Source/Core/defined');
var DeveloperError = require('../../third_party/cesium/Source/Core/DeveloperError');

var applyFunctionToNamedPropertyFoundRecursively = function(target, propertyName, functionToApply) {
    if (!defined(functionToApply) || typeof functionToApply !== 'function' ) {
        throw new DeveloperError('functionToApply is required and must be a function.');
    }

    for (var p in target) {
        if (target.hasOwnProperty(p) === false) {
            continue;
        }
        else if (p === propertyName) {
           functionToApply(target, propertyName);
        }
        else if (typeof target[p] === 'object') {
            applyFunctionToNamedPropertyFoundRecursively(target[p], propertyName, functionToApply);
        }
    }
};

module.exports = applyFunctionToNamedPropertyFoundRecursively;
