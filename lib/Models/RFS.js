"use strict";

/*global require*/
var defined = require("terriajs-cesium/Source/Core/defined").default;
var defineProperties = require("terriajs-cesium/Source/Core/defineProperties")
  .default;
var Color = require("terriajs-cesium/Source/Core/Color").default;
const HeightReference = require("terriajs-cesium/Source/Scene/HeightReference")
  .default;
var NearFarScalar = require("terriajs-cesium/Source/Core/NearFarScalar")
  .default;
var Legend = require("terriajs/lib/Map/Legend");

var inherit = require("terriajs/lib/Core/inherit");
var DataSourceCatalogItem = require("terriajs/lib/Models/DataSourceCatalogItem");
var GeoJsonCatalogItem = require("terriajs/lib/Models/GeoJsonCatalogItem");
var loadJson = require("terriajs/lib/Core/loadJson");

const createCatalogMemberFromType = require("terriajs/lib/Models/createCatalogMemberFromType");

/**
 * A {@link DataSourceCatalogItem} representing Senaps locations data.
 *
 * @alias RfsCatalogItem
 * @constructor
 * @extends DataSourceCatalogItem
 *
 * @param {Terria} terria The Terria instance.
 */
var RfsCatalogItem = function(terria) {
  DataSourceCatalogItem.call(this, terria);

  this._geoJsonItem = undefined;
};

inherit(DataSourceCatalogItem, RfsCatalogItem);

defineProperties(RfsCatalogItem.prototype, {
  /**
   * Gets the type of data member represented by this instance.
   * @memberOf RfsCatalogItem.prototype
   * @type {String}
   */
  type: {
    get: function() {
      return "nsw-rfs";
    }
  },

  /**
   * Gets a human-readable name for this type of data source, 'NSW RFS Incidents'.
   * @memberOf RfsCatalogItem.prototype
   * @type {String}
   */
  typeName: {
    get: function() {
      return "NSW RFS Incidents";
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

RfsCatalogItem.prototype._getValuesThatInfluenceLoad = function() {
  return [];
};

RfsCatalogItem.register = function() {
  createCatalogMemberFromType.register("nsw-rfs", RfsCatalogItem);
};

RfsCatalogItem.prototype._load = function() {
  this._geoJsonItem = new GeoJsonCatalogItem(this.terria);
  this._geoJsonItem.clampToGround = true;
  this._geoJsonItem.style = this.style;

  const leg = new Legend({
    title: `Alert Levels`,
    items: [
      {
        imageUrl: "/images/fire_white.svg",
        imageWidth: 30,
        imageHeight: 30,
        title: "Not Applicable"
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
        title: "Watch and Act"
      },
      {
        imageUrl: "/images/fire_red.svg",
        imageWidth: 30,
        imageHeight: 30,
        title: "Emergency Warning"
      }
    ]
  });

  this._legendUrl = leg.getLegendUrl();

  const that = this;

  return loadJson(
    "/proxy/http://www.rfs.nsw.gov.au/feeds/majorIncidents.json"
  ).then(function(json) {
    json.features.forEach(function(f) {
      const otherProperties = f.properties.description.split("<br />");
      f.properties.detailedProperties = {};
      otherProperties.forEach(function(p) {
        const propsAndKeys = p.split(": ");
        if (propsAndKeys[0].indexOf("MAJOR") > -1) {
          f.properties.detailedProperties["MORE_INFO"] = propsAndKeys[1];
        } else {
          f.properties.detailedProperties[
            propsAndKeys[0].replace(" ", "_")
          ] = propsAndKeys[1].trim();
        }
      });
      f.properties.lastUpdated = f.properties.detailedProperties.UPDATED;
    });
    that._geoJsonItem.data = json;
    that.featureInfoTemplate = {
      template: `
       <h4>{{title}}</h4>
       <p>Alert Level: {{detailedProperties.ALERT_LEVEL}}</p>
       <p>Status: {{detailedProperties.STATUS}}</p>

       <p>Location: {{detailedProperties.LOCATION}}</p>
       <p>Type: {{detailedProperties.TYPE}}</p>
       <p>Responsible Agency: {{detailedProperties.RESPONSIBLE_AGENCY}}</p>
       {{#detailedProperties.MORE_INFO}}
         <button class="nm-featureInfo-button">{{detailedProperties.MORE_INFO}}</button>
       {{/detailedProperties.MORE_INFO}}
       <p>Last Updated: {{lastUpdated}}</p>
    `,
      formats: {
        lastUpdated: {
          type: "dateTime",
          format: "ddd, mmm d, yyyy, h:MM:ss TT"
        }
      }
    };

    return that._geoJsonItem.load().then(function() {
      const entities = that.dataSource.entities;
      entities.suspendEvents();
      entities.values.forEach(function(entity) {
        updateEntityStyling(entity, that);
      });
      entities.resumeEvents();
    });
  });
};

function getTranslucency(status) {
  if (status === "Emergency Warning") return 1;
  if (status === "Watch and Act") return 1;
  if (status === "Advice") return 1;
  return 0.5;
}

function getSymbol(status) {
  if (status === "Emergency Warning") return "/images/fire_red.svg";
  if (status === "Watch and Act") return "/images/fire_yellow.svg";
  if (status === "Advice") return "/images/fire_blue.svg";
  return "/images/fire_white.svg";
}

function updateEntityStyling(entity, catalogItem) {
  if (defined(entity.point)) {
    entity.billboard = {
      image: getSymbol(
        entity.properties.detailedProperties._value["ALERT_LEVEL"]
      ),
      scaleByDistance: new NearFarScalar(500000, 0.7, 1, 1),
      translucencyByDistance: new NearFarScalar(
        500000,
        getTranslucency(
          entity.properties.detailedProperties._value["ALERT_LEVEL"]
        ),
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
    entity.polygon.material = Color.BLACK.withAlpha(0.5);
    // Has no effect when clampToGround is set
    // entity.polygon.outline = true;
    // entity.polygon.outlineWidth = 5;
    // entity.polygon.outlineColor = Color.BLACK;
  }
}

RfsCatalogItem.prototype._enable = function() {
  if (defined(this._geoJsonItem)) {
    this._geoJsonItem._enable();
  }
};

RfsCatalogItem.prototype._disable = function() {
  if (defined(this._geoJsonItem)) {
    this._geoJsonItem._disable();
  }
};

RfsCatalogItem.prototype._show = function() {
  if (defined(this._geoJsonItem)) {
    this._geoJsonItem._show();
  }
};

RfsCatalogItem.prototype._hide = function() {
  if (defined(this._geoJsonItem)) {
    this._geoJsonItem._hide();
  }
};

RfsCatalogItem.prototype.showOnSeparateMap = function(globeOrMap) {
  if (defined(this._geoJsonItem)) {
    return this._geoJsonItem.showOnSeparateMap(globeOrMap);
  }
};

module.exports = RfsCatalogItem;
