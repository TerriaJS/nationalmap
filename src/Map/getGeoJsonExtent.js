'use strict';

/*global require*/
var applyFunctionToNamedPropertyFoundRecursively = require('../Core/applyFunctionToNamedPropertyFoundRecursively');
var Rectangle = require('../../third_party/cesium/Source/Core/Rectangle');

var getGeoJsonExtent = function(geoJson) {
    var ext = {west:180, east:-180, south:90, north: -90};
    applyFunctionToNamedPropertyFoundRecursively(geoJson, 'coordinates', function(obj, prop) { getExtent(obj[prop], ext); });
    return Rectangle.fromDegrees(ext.west, ext.south, ext.east, ext.north);
};

// Get Extent of geojson
function getExtent(pts, ext) {
    if (!(pts[0] instanceof Array) ) {
        if (pts[0] < ext.west)  { ext.west = pts[0];  }
        if (pts[0] > ext.east)  { ext.east = pts[0];  } 
        if (pts[1] < ext.south) { ext.south = pts[1]; }
        if (pts[1] > ext.north) { ext.north = pts[1]; }
    }
    else if (!((pts[0][0]) instanceof Array) ) {
        for (var i = 0; i < pts.length; i++) {
            getExtent(pts[i], ext);
        }
    }
    else {
        for (var j = 0; j < pts.length; j++) {
            getExtent(pts[j], ext);  //at array of arrays of points
        }
    }
}

module.exports = getGeoJsonExtent;
