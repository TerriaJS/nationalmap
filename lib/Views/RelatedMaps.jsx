import React from "react";
import PropTypes from "prop-types";

import MenuPanel from "terriajs/lib/ReactViews/StandardUserInterface/customizable/MenuPanel.jsx";
import PanelStyles from "terriajs/lib/ReactViews/Map/Panels/panel.scss";
import Styles from "./related-maps.scss";
import classNames from "classnames";

function RelatedMaps(props) {
  const dropdownTheme = {
    inner: Styles.dropdownInner,
    icon: "gallery"
  };

  return (
    <MenuPanel
      theme={dropdownTheme}
      btnText="Related Maps"
      smallScreen={props.smallScreen}
      viewState={props.viewState}
      btnTitle="See related maps"
      showDropdownInCenter
    >
      <div className={classNames(PanelStyles.header)}>
        <label className={PanelStyles.heading}>Related Maps</label>
      </div>

      <p>Clicking on a map below will open it in a separate window or tab.</p>

      <div className={classNames(PanelStyles.section, Styles.section)}>
        <a target="_blank" href="https://nsw.digitaltwin.terria.io/">
          <img
            className={Styles.image}
            src={require("../../wwwroot/images/nsw-dt.png")}
            alt="NSW Spatial Digital Twin"
          />
        </a>

        <a
          target="_blank"
          className={Styles.link}
          href="https://nsw.digitaltwin.terria.io/"
        >
          NSW Spatial Digital Twin
        </a>

        <p>
          The NSW Spatial Digital Twin aims to respond to the NSW State
          Infrastructure Strategy by developing a 4D (3D+time) Foundation
          Spatial Data Framework. The goal is to help the NSW Government with
          infrastructure assets planning and management, integration with land
          use planning, data collaboration, and sharing.
        </p>
      </div>

      <div className={classNames(PanelStyles.section, Styles.section)}>
        <a target="_blank" href="https://qld.digitaltwin.terria.io/">
          <img
            className={Styles.image}
            src={require("../../wwwroot/images/qld-dt.png")}
            alt="QLD Spatial Digital Twin"
          />
        </a>

        <a
          target="_blank"
          className={Styles.link}
          href="https://qld.digitaltwin.terria.io/"
        >
          QLD Spatial Digital Twin
        </a>

        <p>
          The QLD Spatial Digital Twin is an evolving 4D data platform that
          enables users to discover, visualise, analyse and share a rich range
          of datasets in a real world context, to enable better planning and
          decision making. It is an initiative of Advance Queensland and the
          Department of Resources in partnership with CSIRO-Data61.
        </p>
      </div>

      <div className={classNames(PanelStyles.section, Styles.section)}>
        <a target="_blank" href="https://maps.dea.ga.gov.au/">
          <img
            className={Styles.image}
            src={require("../../wwwroot/images/dea.png")}
            alt="Digital Earth Australia"
          />
        </a>

        <a
          target="_blank"
          className={Styles.link}
          href="https://maps.dea.ga.gov.au/"
        >
          Digital Earth Australia
        </a>

        <p>
          Digital Earth Australia (DEA) Map is a website for map-based access to
          DEA’s products, developed by Data61 CSIRO for Geoscience Australia.
          DEA uses satellite data to detect physical changes across Australia in
          unprecedented detail. It identifies soil and coastal erosion, crop
          growth, water quality and changes to cities and regions.
        </p>
      </div>

      <div className={classNames(PanelStyles.section, Styles.section)}>
        <a target="_blank" href="https://map.drought.gov.au/">
          <img
            className={Styles.image}
            src={require("../../wwwroot/images/droughtmap.jpg")}
            alt="National Drought Map"
          />
        </a>

        <a
          target="_blank"
          className={Styles.link}
          href="https://map.drought.gov.au/"
        >
          National Drought Map
        </a>

        <p>
          The DroughtMap is a platform built for the Australian Government to
          assist with planning and management of drought effects in Australia.
        </p>
      </div>

      <div className={classNames(PanelStyles.section, Styles.section)}>
        <a target="_blank" href="http://map.aurin.org.au">
          <img
            className={Styles.image}
            src={require("../../wwwroot/images/aurin-map.jpg")}
            alt="AURIN Map"
          />
        </a>

        <a
          target="_blank"
          className={Styles.link}
          href="http://map.aurin.org.au"
        >
          AURIN Map
        </a>

        <p>
          AURIN Map provides access to datasets on urban infrastructure for
          urban researchers, policy and decision makers.
        </p>
      </div>
    </MenuPanel>
  );
}

RelatedMaps.propTypes = {
  viewState: PropTypes.object.isRequired,
  smallScreen: PropTypes.bool
};

export default RelatedMaps;
