"use strict";

/*global require*/

const polyline = require("@mapbox/polyline");

var defined = require("terriajs-cesium/Source/Core/defined").default;
var defineProperties = require("terriajs-cesium/Source/Core/defineProperties")
  .default;
var Color = require("terriajs-cesium/Source/Core/Color").default;
var Legend = require("terriajs/lib/Map/Legend");

var inherit = require("terriajs/lib/Core/inherit");
var DataSourceCatalogItem = require("terriajs/lib/Models/DataSourceCatalogItem");
var GeoJsonCatalogItem = require("terriajs/lib/Models/GeoJsonCatalogItem");
var loadJson = require("terriajs/lib/Core/loadJson");
const createCatalogMemberFromType = require("terriajs/lib/Models/createCatalogMemberFromType");

/**
 * A {@link DataSourceCatalogItem} representing NSW Live Traffic Data
 *
 * @alias NswLiveTrafficItem
 * @constructor
 * @extends DataSourceCatalogItem
 *
 * @param {Terria} terria The Terria instance.
 */
var NswLiveTrafficItem = function(terria) {
  DataSourceCatalogItem.call(this, terria);

  this._geoJsonItem = undefined;
};

inherit(DataSourceCatalogItem, NswLiveTrafficItem);

defineProperties(NswLiveTrafficItem.prototype, {
  /**
   * Gets the type of data member represented by this instance.
   * @memberOf RfsCatalogItem.prototype
   * @type {String}
   */
  type: {
    get: function() {
      return "nsw-live-traffic";
    }
  },

  /**
   * Gets a human-readable name for this type of data source, 'NSW RFS Incidents'.
   * @memberOf RfsCatalogItem.prototype
   * @type {String}
   */
  typeName: {
    get: function() {
      return "Nsw LiveTraffic";
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

NswLiveTrafficItem.prototype._getValuesThatInfluenceLoad = function() {
  return [];
};

NswLiveTrafficItem.register = function() {
  createCatalogMemberFromType.register("nsw-live-traffic", NswLiveTrafficItem);
};

function getColor(status) {
  if (status === "Bush fire") return new Color.fromCssColorString("#DF252E");
  return new Color.fromCssColorString("#f1c834");
}

NswLiveTrafficItem.prototype._load = function() {
  this._geoJsonItem = new GeoJsonCatalogItem(this.terria);
  this._geoJsonItem.clampToGround = true;
  this._geoJsonItem.style = this.style;

  const leg = new Legend({
    title: `Road Information`,
    items: [
      {
        imageUrl: "/images/fire_road_red.svg",
        imageWidth: 30,
        imageHeight: 30,
        title: "Road Information"
      },
      {
        imageUrl: `/images/fire_road_red_circle.svg`,
        imageWidth: 30,
        imageHeight: 30,
        title: "Road Information - Bush Fire"
      },
      {
        imageUrl: `/images/fire_road_orange_circle.svg`,
        imageWidth: 30,
        imageHeight: 30,
        title: "Road Information - Incidents"
      }
    ]
  });
  this._legendUrl = leg.getLegendUrl();

  const that = this;

  return loadJson(
    "/proxy/https://api.transport.nsw.gov.au/v1/live/hazards/incident/all"
  ).then(function(incidentJson) {
    return loadJson(
      "/proxy/https://api.transport.nsw.gov.au/v1/live/hazards/fire/all"
    ).then(function(json) {
      const lines = [];
      json.features = json.features.concat(incidentJson.features);
      json.features.forEach(function(f) {
        f.properties.lastUpdatedReadable = new Date(
          f.properties.lastUpdated
        ).toISOString();

        if (
          defined(f.properties.roads[0]) &&
          defined(f.properties.roads[0].impactedLanes[0])
        ) {
          const r = f.properties.roads[0].impactedLanes[0];
          f.properties.roadDescription = `${r.roadType} ${r.extent} - ${
            r.affectedDirection
          }`;
        } else {
          f.properties.roadDescription = "";
        }

        if (f.geometry.type === "POINT") f.geometry.type = "Point";
        if (f.properties.encodedPolylines) {
          f.properties.encodedPolylines.forEach(function(p) {
            const gj = {
              properties: f.properties,
              geometry: polyline.toGeoJSON(p.coords)
            };
            lines.push(gj);
          });
        }
      });
      json.features = json.features.concat(lines);
      that._geoJsonItem.data = json;
      that.featureInfoTemplate = {
        template: `
         <h4>{{headline}}</h4>
         <p><strong>Advice:</strong> {{adviceA}} {{adviceB}}</p>
         <p>{{roadDescription}}</p>
         {{otherAdvice}}
         <p>Last Updated: {{lastUpdatedReadable}}</p>
        `,
        formats: {
          lastUpdatedReadable: {
            type: "dateTime",
            format: "ddd, mmm d, yyyy, h:MM:ss TT"
          }
        }
      };
      return that._geoJsonItem.load().then(function() {
        const entities = that.dataSource.entities;
        entities.suspendEvents();
        entities.values.forEach(function(entity) {
          updateEntityStyling(entity);
        });
        entities.resumeEvents();
      });
    });
  });
};

function updateEntityStyling(entity) {
  if (defined(entity.point)) {
    entity.point.color = getColor(entity.properties["mainCategory"]._value);
  }
  if (defined(entity.polyline)) {
    entity.zIndex = 2;
    entity.polyline.material = Color.fromCssColorString("#DF252E");
    entity.polyline.width = 4;
  }
}

NswLiveTrafficItem.prototype._enable = function() {
  if (defined(this._geoJsonItem)) {
    this._geoJsonItem._enable();
  }
};

NswLiveTrafficItem.prototype._disable = function() {
  if (defined(this._geoJsonItem)) {
    this._geoJsonItem._disable();
  }
};

NswLiveTrafficItem.prototype._show = function() {
  if (defined(this._geoJsonItem)) {
    this._geoJsonItem._show();
  }
};

NswLiveTrafficItem.prototype._hide = function() {
  if (defined(this._geoJsonItem)) {
    this._geoJsonItem._hide();
  }
};

NswLiveTrafficItem.prototype.showOnSeparateMap = function(globeOrMap) {
  if (defined(this._geoJsonItem)) {
    return this._geoJsonItem.showOnSeparateMap(globeOrMap);
  }
};

module.exports = NswLiveTrafficItem;
