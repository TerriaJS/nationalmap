'use strict';

var terriaOptions = {
    baseUrl: 'build/TerriaJS'
};

import { runInAction } from "mobx";
import ConsoleAnalytics from 'terriajs/lib/Core/ConsoleAnalytics';
import GoogleAnalytics from 'terriajs/lib/Core/GoogleAnalytics';
import ShareDataService from 'terriajs/lib/Models/ShareDataService';
import registerCustomComponentTypes from 'terriajs/lib/ReactViews/Custom/registerCustomComponentTypes';
import Terria from 'terriajs/lib/Models/Terria';
import updateApplicationOnHashChange from 'terriajs/lib/ViewModels/updateApplicationOnHashChange';
import updateApplicationOnMessageFromParentWindow from 'terriajs/lib/ViewModels/updateApplicationOnMessageFromParentWindow';
import ViewState from 'terriajs/lib/ReactViewModels/ViewState';
import BingMapsSearchProviderViewModel from 'terriajs/lib/Models/SearchProviders/BingMapsSearchProvider';
import render from './lib/Views/render';
import registerCatalogMembers from 'terriajs/lib/Models/Catalog/registerCatalogMembers';
import defined from 'terriajs-cesium/Source/Core/defined';

// Register all types of catalog members in the core TerriaJS.  If you only want to register a subset of them
// (i.e. to reduce the size of your application if you don't actually use them all), feel free to copy a subset of
// the code in the registerCatalogMembers function here instead.
// registerCatalogMembers();
// registerAnalytics();

// we check exact match for development to reduce chances that production flag isn't set on builds(?)
if (process.env.NODE_ENV === "development") {
    terriaOptions.analytics = new ConsoleAnalytics();
} else {
    terriaOptions.analytics = new GoogleAnalytics();
}

// Construct the TerriaJS application, arrange to show errors to the user, and start it up.
var terria = new Terria(terriaOptions);

// Register custom components in the core TerriaJS.  If you only want to register a subset of them, or to add your own,
// insert your custom version of the code in the registerCustomComponentTypes function here instead.
registerCustomComponentTypes(terria);

// Create the ViewState before terria.start so that errors have somewhere to go.
const viewState = new ViewState({
    terria: terria
});

registerCatalogMembers();

if (process.env.NODE_ENV === "development") {
    window.viewState = viewState;
}

// If we're running in dev mode, disable the built style sheet as we'll be using the webpack style loader.
// Note that if the first stylesheet stops being TerriaMap.css then this will have to change.
if (process.env.NODE_ENV !== "production" && module.hot) {
    document.styleSheets[0].disabled = true;
}

terria.filterStartDataCallback = function(startData) {
    if (startData.initSources) {
        // Do not allow share URLs to load old versions of the catalog that
        // are included in the initSources.
        startData.initSources = startData.initSources.filter(function(initSource) {
            if (typeof initSource === 'string') {
                return initSource.indexOf('static.nationalmap.nicta.com.au/init') < 0 &&
                    initSource.indexOf('init/nm.json') < 0;
            }
            return true;
        });

        // Backward compatibility for old ABS-ITT catalog items.  Go load an annex catalog that contains them.
        const containsAbsIttItems = startData.initSources.some(function(initSource) {
            return initSource.sharedCatalogMembers && Object.keys(initSource.sharedCatalogMembers).some(shareKey => initSource.sharedCatalogMembers[shareKey].type === 'abs-itt');
        });

        if (containsAbsIttItems) {
            terria.error.raiseEvent({
                title: 'Warning',
                message: 'The share link you just visited is using an old interface to the ABS census data that will stop working in a future version of NationalMap.  If this is your link, please update it to use the new ABS catalog items in the National Datasets section.'
            });
            startData.initSources.unshift('init/abs-itt.json');
        }
    }
};

module.exports = terria.start({
    // If you don't want the user to be able to control catalog loading via the URL, remove the applicationUrl property below
    // as well as the call to "updateApplicationOnHashChange" further down.
    applicationUrl: window.location,
    configUrl: 'config.json',
    shareDataService: new ShareDataService({
        terria: terria
    })
})
.catch(function(e) {
  terria.raiseErrorToUser(e);
})
.finally(function() {
    terria.loadInitSources().then(result => result.raiseError(terria));
    try {
        viewState.searchState.locationSearchProviders = [
            new BingMapsSearchProviderViewModel({
                terria: terria,
                key: terria.configParameters.bingMapsKey
            }),
        ];

        // Automatically update Terria (load new catalogs, etc.) when the hash part of the URL changes.
        updateApplicationOnHashChange(terria, window);
        updateApplicationOnMessageFromParentWindow(terria, window);

        // Show a modal disclaimer before user can do anything else.
        if (defined(terria.configParameters.globalDisclaimer)) {
            var globalDisclaimer = terria.configParameters.globalDisclaimer;
            var hostname = window.location.hostname;
            if (globalDisclaimer.enableOnLocalhost || hostname.indexOf('localhost') === -1) {
                var message = '';
                // Sometimes we want to show a preamble if the user is viewing a site other than the official production instance.
                // This can be expressed as a devHostRegex ("any site starting with staging.") or a negative prodHostRegex ("any site not ending in .gov.au")
                if (defined(globalDisclaimer.devHostRegex) && hostname.match(globalDisclaimer.devHostRegex) ||
                    defined(globalDisclaimer.prodHostRegex) && !hostname.match(globalDisclaimer.prodHostRegex)) {
                        message += require('./lib/Views/DevelopmentDisclaimerPreamble.html');
                }
                message += require('./lib/Views/GlobalDisclaimer.html');

                var options = {
                    title: (globalDisclaimer.title !== undefined) ? globalDisclaimer.title : 'Warning',
                    confirmText: (globalDisclaimer.buttonTitle || "Ok"),
                    denyText: (globalDisclaimer.denyText || "Cancel"),
                    denyAction: globalDisclaimer.afterDenyLocation ? function() {
                        window.location = globalDisclaimer.afterDenyLocation;
                    } : undefined,
                    width: 600,
                    height: 550,
                    message: message,
                    horizontalPadding : 100
                };
                runInAction(() => {
                    viewState.disclaimerSettings = options;
                    viewState.disclaimerVisible = true;
                });
            }
        }

        render(terria, [], viewState);
    } catch (e) {
        console.error(e);
        console.error(e.stack);
    }
});
