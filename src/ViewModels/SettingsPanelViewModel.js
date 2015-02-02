'use strict';

/*global require*/
var defaultValue = require('../../third_party/cesium/Source/Core/defaultValue');
var defined = require('../../third_party/cesium/Source/Core/defined');
var DeveloperError = require('../../third_party/cesium/Source/Core/DeveloperError');
var knockout = require('../../third_party/cesium/Source/ThirdParty/knockout');

var loadView = require('../Core/loadView');
var ViewerMode = require('../Models/ViewerMode');

var SettingsPanelViewModel = function(options) {
    if (!defined(options) || !defined(options.application)) {
        throw new DeveloperError('options.application is required.');
    }

    this.application = options.application;

    this._domNodes = undefined;

    this.isVisible = defaultValue(options.isVisible, true);
    this.baseMaps = [];
    this.mouseOverBaseMap = undefined;

    var imageryLayer = this.application.cesium.scene.imageryLayers.get(0);

    this.brightness = imageryLayer.brightness;
    this.contrast = imageryLayer.contrast;
    this.hue = imageryLayer.hue;
    this.saturation = imageryLayer.saturation;
    this.gamma = imageryLayer.gamma;

    knockout.track(this, ['isVisible', 'baseMaps', 'mouseOverBaseMap', 'brightness', 'contrast', 'hue', 'saturation', 'gamma']);

    knockout.getObservable(this, 'brightness').subscribe(function() {
        this.application.cesium.scene.imageryLayers.get(0).brightness = Number.parseFloat(this.brightness);
        this.application.cesium.notifyRepaintRequired();
    }, this);

    knockout.getObservable(this, 'contrast').subscribe(function() {
        this.application.cesium.scene.imageryLayers.get(0).contrast = Number.parseFloat(this.contrast);
        this.application.cesium.notifyRepaintRequired();
    }, this);

    knockout.getObservable(this, 'hue').subscribe(function() {
        this.application.cesium.scene.imageryLayers.get(0).hue = Number.parseFloat(this.hue);
        this.application.cesium.notifyRepaintRequired();
    }, this);

    knockout.getObservable(this, 'saturation').subscribe(function() {
        this.application.cesium.scene.imageryLayers.get(0).saturation = Number.parseFloat(this.saturation);
        this.application.cesium.notifyRepaintRequired();
    }, this);

    knockout.getObservable(this, 'gamma').subscribe(function() {
        this.application.cesium.scene.imageryLayers.get(0).gamma = Number.parseFloat(this.gamma);
        this.application.cesium.notifyRepaintRequired();
    }, this);
};

SettingsPanelViewModel.prototype.show = function(container) {
    if (!defined(this._domNodes)) {
        this._domNodes = loadView(require('fs').readFileSync(__dirname + '/../Views/SettingsPanel.html', 'utf8'), container, this);
    }
};

SettingsPanelViewModel.prototype.close = function() {
    this.isVisible = false;
};

SettingsPanelViewModel.prototype.closeIfClickOnBackground = function(viewModel, e) {
    if (e.target.className === 'settings-panel-background') {
        this.close();
    }
    return true;
};

SettingsPanelViewModel.prototype.select2D = function() {
    this.application.viewerMode = ViewerMode.Leaflet;
};

SettingsPanelViewModel.prototype.select3DSmooth = function() {
    this.application.viewerMode = ViewerMode.CesiumEllipsoid;
};

SettingsPanelViewModel.prototype.select3DTerrain = function() {
    this.application.viewerMode = ViewerMode.CesiumTerrain;
};

SettingsPanelViewModel.prototype.changeHighlightedBaseMap = function(baseMap) {
    this.mouseOverBaseMap = baseMap;
};

SettingsPanelViewModel.prototype.selectBaseMap = function(baseMap) {
    this.application.baseMap = baseMap.catalogItem;

    var imageryLayer = this.application.cesium.scene.imageryLayers.get(0);

    this.brightness = imageryLayer.brightness;
    this.contrast = imageryLayer.contrast;
    this.hue = imageryLayer.hue;
    this.saturation = imageryLayer.saturation;
    this.gamma = imageryLayer.gamma;
};

SettingsPanelViewModel.prototype.resetHightedBaseMap = function() {
    this.mouseOverBaseMap = undefined;
};

module.exports = SettingsPanelViewModel;