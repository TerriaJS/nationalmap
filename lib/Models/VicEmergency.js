"use strict";

/*global require*/
var defined = require("terriajs-cesium/Source/Core/defined").default;
var defineProperties = require("terriajs-cesium/Source/Core/defineProperties")
  .default;
var NearFarScalar = require("terriajs-cesium/Source/Core/NearFarScalar")
  .default;
var Color = require("terriajs-cesium/Source/Core/Color").default;
var Cartesian3 = require("terriajs-cesium/Source/Core/Cartesian3").default;
const HeightReference = require("terriajs-cesium/Source/Scene/HeightReference")
  .default;
var Legend = require("terriajs/lib/Map/Legend");

var inherit = require("terriajs/lib/Core/inherit");
var DataSourceCatalogItem = require("terriajs/lib/Models/DataSourceCatalogItem");
var GeoJsonCatalogItem = require("terriajs/lib/Models/GeoJsonCatalogItem");
var loadJson = require("terriajs/lib/Core/loadJson");

const createCatalogMemberFromType = require("terriajs/lib/Models/createCatalogMemberFromType");

/**
 * A {@link DataSourceCatalogItem} representing Vic Emergencyu locations data.
 *
 * @alias VicEmergencyCatalogItem
 * @constructor
 * @extends DataSourceCatalogItem
 *
 * @param {Terria} terria The Terria instance.
 */
var VicEmergencyCatalogItem = function(terria) {
  DataSourceCatalogItem.call(this, terria);

  this._geoJsonItem = undefined;
};

inherit(DataSourceCatalogItem, VicEmergencyCatalogItem);

defineProperties(VicEmergencyCatalogItem.prototype, {
  /**
   * Gets the type of data member represented by this instance.
   * @memberOf RfsCatalogItem.prototype
   * @type {String}
   */
  type: {
    get: function() {
      return "vic-emergency";
    }
  },

  /**
   * Gets a human-readable name for this type of data source, 'NSW RFS Incidents'.
   * @memberOf RfsCatalogItem.prototype
   * @type {String}
   */
  typeName: {
    get: function() {
      return "Vic Emergencies";
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

VicEmergencyCatalogItem.prototype._getValuesThatInfluenceLoad = function() {
  return [];
};

VicEmergencyCatalogItem.register = function() {
  createCatalogMemberFromType.register(
    "vic-emergency",
    VicEmergencyCatalogItem
  );
};

VicEmergencyCatalogItem.prototype._load = function() {
  this._geoJsonItem = new GeoJsonCatalogItem(this.terria);
  this._geoJsonItem.clampToGround = true;
  this._geoJsonItem.style = this.style;

  const leg = new Legend({
    title: `Alert Levels`,
    itemHeight: 32,
    items: [
      {
        imageUrl: "/images/info_marker.svg",
        imageWidth: 30,
        imageHeight: 30,
        title: "Community Update or Other"
      },
      {
        imageUrl: "/images/fire_white.svg",
        imageWidth: 30,
        imageHeight: 30,
        title: "Fire - Other"
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

  var d = new Date();

  return loadJson(
    `/proxy/https://emergency.vic.gov.au/public/osom-geojson.json?_=${d.getTime()}`
  ).then(function(json) {
    json.features.forEach(function(f) {
      if (f.properties.text) {
        const moreInfoLoc = f.properties.text.indexOf("More details at ");
        if (moreInfoLoc > -1) {
          f.properties.moreInfoLine = f.properties.text.slice(moreInfoLoc + 16);
        }
      }
    });
    that._geoJsonItem.data = json;
    that.featureInfoTemplate = {
      template: `
       {{#sourceTitle}}
         <h4>{{sourceTitle}}</h4>
       {{/sourceTitle}}

       <p>Alert Level: {{category1}}</p>
       <p>Status: {{status}}</p>
       <p>Location: {{location}}</p>
       {{#cap}}
         <p>Type: {{cap.event}}</p>
       {{/cap}}
       <p>{{text}}</p>
       {{#moreInfoLine}}
         <button class="nm-featureInfo-button"><a href="{{moreInfoLine}}">More information</a></button>
       {{/moreInfoLine}}
       <p>Last Updated: {{updated}}</p>
    `,
      formats: {
        updated: {
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

function getSymbol(status) {
  if (status === "Emergency Warning") return "/images/fire_red.svg";
  if (status === "Watch and Act") return "/images/fire_yellow.svg";
  if (status === "Advice") return "/images/fire_blue.svg";
  if (status === "Fire") return "/images/fire_white.svg";
  if (status === "Community Update") return "/images/info_marker.svg";
  return "/images/info_marker.svg";
}

function getTranslucency(status) {
  if (status === "Emergency Warning") return 1;
  if (status === "Watch and Act") return 1;
  if (status === "Advice") return 1;
  return 0.5;
}

function getHeightVal(status) {
  if (status === "Emergency Warning") return -300;
  if (status === "Watch and Act") return -20;
  if (status === "Advice") return -10;
  return -1;
}

function updateEntityStyling(entity, catalogItem) {
  if (defined(entity.point)) {
    entity.billboard = {
      image: getSymbol(entity.properties.category1._value),
      scaleByDistance: new NearFarScalar(500000, 0.7, 1, 1),
      translucencyByDistance: new NearFarScalar(
        500000,
        getTranslucency(entity.properties.category1._value),
        1,
        1
      ),
      eyeOffset: new Cartesian3(
        0,
        0,
        getHeightVal(entity.properties.category1._value)
      ),
      heightReference: catalogItem.clampToGround
        ? HeightReference.RELATIVE_TO_GROUND
        : null
    };
    entity.point = undefined;
  }

  if (defined(entity.polygon)) {
    entity.polygon.material = Color.fromAlpha(Color.RED, 0.4);
    // Has no effect when clampToGround is set
    // entity.polygon.outlineWidth = 2;
  }
}

VicEmergencyCatalogItem.prototype._enable = function() {
  if (defined(this._geoJsonItem)) {
    this._geoJsonItem._enable();
  }
};

VicEmergencyCatalogItem.prototype._disable = function() {
  if (defined(this._geoJsonItem)) {
    this._geoJsonItem._disable();
  }
};

VicEmergencyCatalogItem.prototype._show = function() {
  if (defined(this._geoJsonItem)) {
    this._geoJsonItem._show();
  }
};

VicEmergencyCatalogItem.prototype._hide = function() {
  if (defined(this._geoJsonItem)) {
    this._geoJsonItem._hide();
  }
};

VicEmergencyCatalogItem.prototype.showOnSeparateMap = function(globeOrMap) {
  if (defined(this._geoJsonItem)) {
    return this._geoJsonItem.showOnSeparateMap(globeOrMap);
  }
};

module.exports = VicEmergencyCatalogItem;
