"use strict";

/*global require*/
var Resource = require("terriajs-cesium/Source/Core/Resource").default;
var defined = require("terriajs-cesium/Source/Core/defined").default;
var defineProperties = require("terriajs-cesium/Source/Core/defineProperties")
  .default;
var NearFarScalar = require("terriajs-cesium/Source/Core/NearFarScalar")
  .default;
var Legend = require("terriajs/lib/Map/Legend");

var Color = require("terriajs-cesium/Source/Core/Color").default;
var Cartesian3 = require("terriajs-cesium/Source/Core/Cartesian3").default;
const HeightReference = require("terriajs-cesium/Source/Scene/HeightReference")
  .default;
var loadJson = require("terriajs/lib/Core/loadJson");

var inherit = require("terriajs/lib/Core/inherit");
var DataSourceCatalogItem = require("terriajs/lib/Models/DataSourceCatalogItem");
var GeoJsonCatalogItem = require("terriajs/lib/Models/GeoJsonCatalogItem");

const createCatalogMemberFromType = require("terriajs/lib/Models/createCatalogMemberFromType");

/**
 * A {@link DataSourceCatalogItem} representing SA CFS locations data.
 *
 * @alias SaCFSCatalogItem
 * @constructor
 * @extends DataSourceCatalogItem
 *
 * @param {Terria} terria The Terria instance.
 */
var SaCFSCatalogItem = function(terria) {
  DataSourceCatalogItem.call(this, terria);

  this._geoJsonItem = undefined;
};

inherit(DataSourceCatalogItem, SaCFSCatalogItem);

defineProperties(SaCFSCatalogItem.prototype, {
  /**
   * Gets the type of data member represented by this instance.
   * @memberOf RfsCatalogItem.prototype
   * @type {String}
   */
  type: {
    get: function() {
      return "sa-cfs";
    }
  },

  /**
   * Gets a human-readable name for this type of data source, 'NSW RFS Incidents'.
   * @memberOf RfsCatalogItem.prototype
   * @type {String}
   */
  typeName: {
    get: function() {
      return "SA CFS";
    }
  },

  /**
   * Gets the data source associated with this catalog item.
   * @memberOf SenapsLocationsCatalogItem.prototype
   * @type {DataSource}
   */
  dataSource: {
    get: function() {
      return this._geoJsonItem._dataSource;
    }
  }
});

SaCFSCatalogItem.prototype._getValuesThatInfluenceLoad = function() {
  return [];
};

SaCFSCatalogItem.register = function() {
  createCatalogMemberFromType.register("sa-cfs", SaCFSCatalogItem);
};

SaCFSCatalogItem.prototype._load = function() {
  this._geoJsonItem = new GeoJsonCatalogItem(this.terria);
  this._geoJsonItem.clampToGround = true;
  this._geoJsonItem.style = this.style;
  const that = this;

  const leg = new Legend({
    title: `Alert Levels`,
    items: [
      {
        imageUrl: "/images/fire_white.svg",
        imageWidth: 30,
        imageHeight: 30,
        title: "Level 1"
      },
      {
        imageUrl: "/images/fire_blue.svg",
        imageWidth: 30,
        imageHeight: 30,
        title: "Advice"
      },
      {
        imageUrl: "/images/fire_yellow.svg",
        imageWidth: 30,
        imageHeight: 30,
        title: "Level 2 / Watch and Act"
      },
      {
        imageUrl: "/images/fire_red.svg",
        imageWidth: 30,
        imageHeight: 30,
        title: "Level 3 / Emergency Warning"
      }
    ]
  });

  this._legendUrl = leg.getLegendUrl();

  var pointData = new Resource({
    url:
      "https://services.geohub.sa.gov.au/v1CFSHA/featurelayer/server/rest/services/Hosted/CFS_Warning_Points_Public/FeatureServer/0/query",
    queryParameters: {
      f: "geojson",
      where: "public = 'true' AND expiry_with_offset > CURRENT_TIMESTAMP",
      outFields: "*"
    }
  });

  var polygonData = new Resource({
    url:
      "https://services.geohub.sa.gov.au/v1CFSHA/featurelayer/server/rest/services/Hosted/CFS_Warnings_Polygons_Public/FeatureServer/0/query",
    queryParameters: {
      f: "geojson",
      where: "public = 'true' AND expiry_with_offset > CURRENT_TIMESTAMP",
      outFields: "*"
    }
  });

  return pointData.fetchJson().then(function(gj) {
    return polygonData.fetchJson().then(function(gj2) {
      gj.features = gj.features.concat(gj2.features);

      return loadJson(
        "/proxy/https://s3-ap-southeast-2.amazonaws.com/data.eso.sa.gov.au/prod/cfs/criimson/cfs_current_incidents.json"
      ).then(function(json) {
        const newFeatures = json.map(function(event) {
          const l = event.Location.split(",");
          event.icon = event.Level;
          return {
            type: "Feature",
            properties: event,
            geometry:
              l.length < 2
                ? null
                : {
                    type: "Point",
                    coordinates: [parseFloat(l[1]), parseFloat(l[0])]
                  }
          };
        });
        gj.features = gj.features.concat(newFeatures);
        that._geoJsonItem.data = gj;
        that.featureInfoTemplate = `
           <h4>{{Location_name}}</h4>
           <p>Alert Level: {{Level}}</p>
           <p>Status: {{Status}}</p>
           <p>Location: {{Location_name}}</p>
           <p>Type: {{Type}}</p>
           <p>Responsible Agency: Not available</p>
           <p>{{text}}</p>

           <p>Last Updated: {{Date}} {{Time}}</p>
        `;
        return that._geoJsonItem.load().then(function() {
          const entities = that.dataSource.entities;
          entities.suspendEvents();
          entities.values.forEach(function(entity) {
            updateEntityStyling(entity, that);
          });
          entities.resumeEvents();
        });
      });
    });
  });
};

function getSymbol(status) {
  if (status === "Emergency Warning" || status === 3)
    return "/images/fire_red.svg";
  if (status === "Watch and Act" || status === 2)
    return "/images/fire_yellow.svg";
  if (status === "Bushfire Advice") return "/images/fire_blue.svg";
  return "/images/fire_white.svg";
}

function getTranslucency(status) {
  if (
    status === "Emergency Warning" ||
    status === 2 ||
    status === 3 ||
    status === "Watch and Act" ||
    status === "Bushfire Advice"
  )
    return 1;
  return 0.5;
}

function getHeightVal(status) {
  if (status === "Emergency Warning" || status === 3) return -300;
  if (status === "Watch and Act" || status === 2) return -20;
  if (status === "Bushfire Advice") return -10;
  return -1;
}

function updateEntityStyling(entity, catalogItem) {
  if (defined(entity.point)) {
    entity.billboard = {
      image: getSymbol(entity.properties.icon._value),
      eyeOffset: new Cartesian3(
        0,
        0,
        getHeightVal(entity.properties.icon._value)
      ),
      translucencyByDistance: new NearFarScalar(
        500000,
        getTranslucency(entity.properties.icon._value),
        1,
        1
      ),
      heightReference: catalogItem.clampToGround
        ? HeightReference.RELATIVE_TO_GROUND
        : null
    };
    entity.point = undefined;
  }

  if (defined(entity.polygon)) {
    entity.polygon.material = Color.fromAlpha(Color.BLACK, 0.6);
    entity.polygon.outlineWidth = 2;
  }
}

SaCFSCatalogItem.prototype._enable = function() {
  if (defined(this._geoJsonItem)) {
    this._geoJsonItem._enable();
  }
};

SaCFSCatalogItem.prototype._disable = function() {
  if (defined(this._geoJsonItem)) {
    this._geoJsonItem._disable();
  }
};

SaCFSCatalogItem.prototype._show = function() {
  if (defined(this._geoJsonItem)) {
    this._geoJsonItem._show();
  }
};

SaCFSCatalogItem.prototype._hide = function() {
  if (defined(this._geoJsonItem)) {
    this._geoJsonItem._hide();
  }
};

SaCFSCatalogItem.prototype.showOnSeparateMap = function(globeOrMap) {
  if (defined(this._geoJsonItem)) {
    return this._geoJsonItem.showOnSeparateMap(globeOrMap);
  }
};

module.exports = SaCFSCatalogItem;
