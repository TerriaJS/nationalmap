import {
  Menu,
  Nav,
  ExperimentalMenu
} from "terriajs/lib/ReactViews/StandardUserInterface/customizable/Groups";
import MeasureTool from "terriajs/lib/ReactViews/Map/Navigation/MeasureTool";
import MenuItem from "terriajs/lib/ReactViews/StandardUserInterface/customizable/MenuItem";
import PropTypes from "prop-types";
import React from "react";
import RelatedMaps from "./RelatedMaps";
import SplitPoint from "terriajs/lib/ReactViews/SplitPoint";
import StandardUserInterface from "terriajs/lib/ReactViews/StandardUserInterface/StandardUserInterface.jsx";
import version from "../../version";

import Celebration from "./Anniversary/Celebration.jsx";
import HatIcon from "./Anniversary/HatIcon.jsx";
import CelebrationStyles from "./Anniversary/celebration.scss";

import "./global.scss";

function loadAugmentedVirtuality(callback) {
  require.ensure(
    "terriajs/lib/ReactViews/Map/Navigation/AugmentedVirtualityTool",
    () => {
      const AugmentedVirtualityTool = require("terriajs/lib/ReactViews/Map/Navigation/AugmentedVirtualityTool");
      callback(AugmentedVirtualityTool);
    },
    "AugmentedVirtuality"
  );
}

function isBrowserSupportedAV() {
  return /Android|iPhone|iPad/i.test(navigator.userAgent);
}

export default function UserInterface(props) {
  return (
    <>
      <StandardUserInterface {...props} version={version}>
        <Menu>
          <RelatedMaps viewState={props.viewState} />
          <MenuItem caption="About" href="about.html" key="about-link" />
        </Menu>
        <Nav>
          <MeasureTool terria={props.viewState.terria} key="measure-tool" />
          <button
            title="Check out the new updates on NationalMap"
            className={CelebrationStyles.toggleCelebration}
            onClick={() => {
              props.viewState.showCelebration = true;
            }}
          >
            <HatIcon role="presentation" aria-hidden="true" />
          </button>
        </Nav>
        <ExperimentalMenu>
          <If condition={isBrowserSupportedAV()}>
            <SplitPoint
              loadComponent={loadAugmentedVirtuality}
              viewState={props.viewState}
              terria={props.viewState.terria}
              experimentalWarning={true}
            />
          </If>
        </ExperimentalMenu>
      </StandardUserInterface>

      <Celebration viewState={props.viewState} key="celebration" />
    </>
  );
}

UserInterface.propTypes = {
  terria: PropTypes.object,
  viewState: PropTypes.object
};
