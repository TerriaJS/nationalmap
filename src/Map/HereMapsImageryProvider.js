/*global define*/
"use strict";

var defaultValue = require('../../third_party/cesium/Source/Core/defaultValue');
var WebMercatorTilingScheme = require('../../third_party/cesium/Source/Core/WebMercatorTilingScheme');
var defineProperties = require('../../third_party/cesium/Source/Core/defineProperties');
var DeveloperError = require('../../third_party/cesium/Source/Core/DeveloperError');
var Rectangle = require('../../third_party/cesium/Source/Core/Rectangle');
var ImageryProvider = require('../../third_party/cesium/Source/Scene/ImageryProvider');
var defined = require('../../third_party/cesium/Source/Core/defined');
var CesiumEvent = require('../../third_party/cesium/Source/Core/Event');

/**
 * Provides tiled imagery using the Bing Maps Imagery REST API.
 *
 * @alias BingMapsImageryProvider
 * @constructor
 *
 * @param {Object} options Object with the following properties:
 * @param {String} options.url The url of the Bing Maps server hosting the imagery.
 * @param {String} [options.key] The Bing Maps key for your application, which can be
 *        created at {@link https://www.bingmapsportal.com/}.
 *        If this parameter is not provided, {@link BingMapsApi.defaultKey} is used.
 *        If {@link BingMapsApi.defaultKey} is undefined as well, a message is
 *        written to the console reminding you that you must create and supply a Bing Maps
 *        key as soon as possible.  Please do not deploy an application that uses
 *        Bing Maps imagery without creating a separate key for your application.
 * @param {String} [options.tileProtocol] The protocol to use when loading tiles, e.g. 'http:' or 'https:'.
 *        By default, tiles are loaded using the same protocol as the page.
 * @param {String} [options.mapStyle=BingMapsStyle.AERIAL] The type of Bing Maps
 *        imagery to load.
 * @param {TileDiscardPolicy} [options.tileDiscardPolicy] The policy that determines if a tile
 *        is invalid and should be discarded.  If this value is not specified, a default
 *        {@link DiscardMissingTileImagePolicy} is used which requests
 *        tile 0,0 at the maximum tile level and checks pixels (0,0), (120,140), (130,160),
 *        (200,50), and (200,200).  If all of these pixels are transparent, the discard check is
 *        disabled and no tiles are discarded.  If any of them have a non-transparent color, any
 *        tile that has the same values in these pixel locations is discarded.  The end result of
 *        these defaults should be correct tile discarding for a standard Bing Maps server.  To ensure
 *        that no tiles are discarded, construct and pass a {@link NeverTileDiscardPolicy} for this
 *        parameter.
 * @param {Proxy} [options.proxy] A proxy to use for requests. This object is
 *        expected to have a getURL function which returns the proxied URL, if needed.
 *
 * @see ArcGisMapServerImageryProvider
 * @see GoogleEarthImageryProvider
 * @see OpenStreetMapImageryProvider
 * @see SingleTileImageryProvider
 * @see TileMapServiceImageryProvider
 * @see WebMapServiceImageryProvider
 *
 * @see {@link http://msdn.microsoft.com/en-us/library/ff701713.aspx|Bing Maps REST Services}
 * @see {@link http://www.w3.org/TR/cors/|Cross-Origin Resource Sharing}
 *
 * @example
 * var bing = new Cesium.BingMapsImageryProvider({
 *     url : '//dev.virtualearth.net',
 *     key : 'get-yours-at-https://www.bingmapsportal.com/',
 *     mapStyle : Cesium.BingMapsStyle.AERIAL
 * });
 */
var HereMapsImageryProvider = function HereMapsImageryProvider(options) {
    options = defaultValue(options, {});

    this._url = 'http://{subdomain}.aerial.maps.cit.api.here.com/maptile/2.1/maptile/newest/hybrid.day/{level}/{x}/{y}/256/jpg?app_id=V7FblxbU8MpSsTiHjueU&app_code=FGaJrsmAjh-s_h8qWn4G8Q';
    this._proxy = options.proxy;
    this._credit = undefined;

    this._tilingScheme = new WebMercatorTilingScheme();

    this._tileWidth = 256;
    this._tileHeight = 256;
    this._maximumLevel = 25;
    this._imageUrlTemplate = this._url;
    this._imageUrlSubdomains = ['1', '2', '3', '4'];

    this._errorEvent = new CesiumEvent();

    this._ready = true;
};

defineProperties(HereMapsImageryProvider.prototype, {
    /**
     * Gets the name of the BingMaps server url hosting the imagery.
     * @memberof HereMapsImageryProvider.prototype
     * @type {String}
     */
    url : {
        get : function() {
            return this._url;
        }
    },

    /**
     * Gets the proxy used by this provider.
     * @memberof HereMapsImageryProvider.prototype
     * @type {Proxy}
     */
    proxy : {
        get : function() {
            return this._proxy;
        }
    },


    /**
     * Gets the width of each tile, in pixels. This function should
     * not be called before {@link BingMapsImageryProvider#ready} returns true.
     * @memberof HereMapsImageryProvider.prototype
     * @type {Number}
     */
    tileWidth : {
        get : function() {
            //>>includeStart('debug', pragmas.debug);
            if (!this._ready) {
                throw new DeveloperError('tileWidth must not be called before the imagery provider is ready.');
            }
            //>>includeEnd('debug');

            return this._tileWidth;
        }
    },

    /**
     * Gets the height of each tile, in pixels.  This function should
     * not be called before {@link BingMapsImageryProvider#ready} returns true.
     * @memberof HereMapsImageryProvider.prototype
     * @type {Number}
     */
    tileHeight: {
        get : function() {
            //>>includeStart('debug', pragmas.debug);
            if (!this._ready) {
                throw new DeveloperError('tileHeight must not be called before the imagery provider is ready.');
            }
            //>>includeEnd('debug');

            return this._tileHeight;
        }
    },


    /**
     * Gets the maximum level-of-detail that can be requested.  This function should
     * not be called before {@link BingMapsImageryProvider#ready} returns true.
     * @memberof HereMapsImageryProvider.prototype
     * @type {Number}
     */
    maximumLevel : {
        get : function() {
            //>>includeStart('debug', pragmas.debug);
            if (!this._ready) {
                throw new DeveloperError('maximumLevel must not be called before the imagery provider is ready.');
            }
            //>>includeEnd('debug');

            return this._maximumLevel;
        }
    },

    /**
     * Gets the minimum level-of-detail that can be requested.  This function should
     * not be called before {@link BingMapsImageryProvider#ready} returns true.
     * @memberof HereMapsImageryProvider.prototype
     * @type {Number}
     */
    minimumLevel : {
        get : function() {
            //>>includeStart('debug', pragmas.debug);
            if (!this._ready) {
                throw new DeveloperError('minimumLevel must not be called before the imagery provider is ready.');
            }
            //>>includeEnd('debug');

            return 0;
        }
    },

    /**
     * Gets the tiling scheme used by this provider.  This function should
     * not be called before {@link BingMapsImageryProvider#ready} returns true.
     * @memberof HereMapsImageryProvider.prototype
     * @type {TilingScheme}
     */
    tilingScheme : {
        get : function() {
            //>>includeStart('debug', pragmas.debug);
            if (!this._ready) {
                throw new DeveloperError('tilingScheme must not be called before the imagery provider is ready.');
            }
            //>>includeEnd('debug');

            return this._tilingScheme;
        }
    },

    /**
     * Gets the rectangle, in radians, of the imagery provided by this instance.  This function should
     * not be called before {@link BingMapsImageryProvider#ready} returns true.
     * @memberof HereMapsImageryProvider.prototype
     * @type {Rectangle}
     */
    rectangle : {
        get : function() {
            //>>includeStart('debug', pragmas.debug);
            if (!this._ready) {
                throw new DeveloperError('rectangle must not be called before the imagery provider is ready.');
            }
            //>>includeEnd('debug');

            return this._tilingScheme.rectangle;
        }
    },

    /**
     * Gets the tile discard policy.  If not undefined, the discard policy is responsible
     * for filtering out "missing" tiles via its shouldDiscardImage function.  If this function
     * returns undefined, no tiles are filtered.  This function should
     * not be called before {@link HereMapsImageryProvider#ready} returns true.
     * @memberof HereMapsImageryProvider.prototype
     * @type {TileDiscardPolicy}
     */
    tileDiscardPolicy : {
        get : function() {
            //>>includeStart('debug', pragmas.debug);
            if (!this._ready) {
                throw new DeveloperError('tileDiscardPolicy must not be called before the imagery provider is ready.');
            }
            //>>includeEnd('debug');

            return this._tileDiscardPolicy;
        }
    },

    /**
     * Gets an event that is raised when the imagery provider encounters an asynchronous error.  By subscribing
     * to the event, you will be notified of the error and can potentially recover from it.  Event listeners
     * are passed an instance of {@link TileProviderError}.
     * @memberof HereMapsImageryProvider.prototype
     * @type {Event}
     */
    errorEvent : {
        get : function() {
            return this._errorEvent;
        }
    },

    /**
     * Gets a value indicating whether or not the provider is ready for use.
     * @memberof HereMapsImageryProvider.prototype
     * @type {Boolean}
     */
    ready : {
        get : function() {
            return this._ready;
        }
    },

    /**
     * Gets the credit to display when this imagery provider is active.  Typically this is used to credit
     * the source of the imagery.  This function should not be called before {@link BingMapsImageryProvider#ready} returns true.
     * @memberof HereMapsImageryProvider.prototype
     * @type {Credit}
     */
    credit : {
        get : function() {
            return this._credit;
        }
    },

    /**
     * Gets a value indicating whether or not the images provided by this imagery provider
     * include an alpha channel.  If this property is false, an alpha channel, if present, will
     * be ignored.  If this property is true, any images without an alpha channel will be treated
     * as if their alpha is 1.0 everywhere.  Setting this property to false reduces memory usage
     * and texture upload time.
     * @memberof HereMapsImageryProvider.prototype
     * @type {Boolean}
     */
    hasAlphaChannel : {
        get : function() {
            return false;
        }
    }
});

var rectangleScratch = new Rectangle();

/**
 * Gets the credits to be displayed when a given tile is displayed.
 *
 * @param {Number} x The tile X coordinate.
 * @param {Number} y The tile Y coordinate.
 * @param {Number} level The tile level;
 * @returns {Credit[]} The credits to be displayed when the tile is displayed.
 *
 * @exception {DeveloperError} <code>getTileCredits</code> must not be called before the imagery provider is ready.
 */
HereMapsImageryProvider.prototype.getTileCredits = function(x, y, level) {
    if (!this._ready) {
        throw new DeveloperError('getTileCredits must not be called before the imagery provider is ready.');
    }

    return undefined;
};

/**
 * Requests the image for a given tile.  This function should
 * not be called before {@link BingMapsImageryProvider#ready} returns true.
 *
 * @param {Number} x The tile X coordinate.
 * @param {Number} y The tile Y coordinate.
 * @param {Number} level The tile level.
 * @returns {Promise} A promise for the image that will resolve when the image is available, or
 *          undefined if there are too many active requests to the server, and the request
 *          should be retried later.  The resolved image may be either an
 *          Image or a Canvas DOM object.
 *
 * @exception {DeveloperError} <code>requestImage</code> must not be called before the imagery provider is ready.
 */
HereMapsImageryProvider.prototype.requestImage = function(x, y, level) {
    //>>includeStart('debug', pragmas.debug);
    if (!this._ready) {
        throw new DeveloperError('requestImage must not be called before the imagery provider is ready.');
    }
    //>>includeEnd('debug');

    var url = buildImageUrl(this, x, y, level);
    return ImageryProvider.loadImage(this, url);
};

function buildImageUrl(imageryProvider, x, y, level) {
    var imageUrl = imageryProvider._imageUrlTemplate;

    imageUrl = imageUrl.replace('{level}', level);
    imageUrl = imageUrl.replace('{x}', x);
    imageUrl = imageUrl.replace('{y}', y);

    var subdomains = imageryProvider._imageUrlSubdomains;
    var subdomainIndex = (x + y + level) % subdomains.length;
    imageUrl = imageUrl.replace('{subdomain}', subdomains[subdomainIndex]);

    var proxy = imageryProvider._proxy;
    if (defined(proxy)) {
        imageUrl = proxy.getURL(imageUrl);
    }

    return imageUrl;
}

module.exports = HereMapsImageryProvider;
