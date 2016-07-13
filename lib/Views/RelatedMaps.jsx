import React from 'react';

import DropdownPanel from 'terriajs/lib/ReactViews/Map/Panels/DropdownPanel.jsx';
import DropdownStyles from 'terriajs/lib/ReactViews/Map/Panels/panel.scss';
import Styles from './related-maps.scss';
import classNames from 'classnames';

function RelatedMaps(props) {
    const dropdownTheme = {
        inner: Styles.dropdownInner
    };

    return (
        <DropdownPanel theme={dropdownTheme}
                       btnText="Related Maps"
                       viewState={props.viewState}
                       btnTitle="See related maps">
            <div className={classNames(DropdownStyles.header)}>
                <label className={DropdownStyles.heading}>Related Maps</label>
            </div>

            <p>
                Clicking on a map below will open it in a separate window or tab.
            </p>

            <div className={classNames(DropdownStyles.section, Styles.section)}>
                <a target="_blank" href="http://nationalmap.gov.au/renewables/">
                    <img className={Styles.image} src={require('../../wwwroot/images/aremi.jpg')}
                         alt="AREMI"/>
                </a>

                <a target="_blank" className={Styles.link} href="http://nationalmap.gov.au/renewables/">AREMI</a>

                <p>
                    AREMI provides access to Australian spatial data relevant to the Renewable Energy industry,
                    sourced from Government, Industry and Research.
                </p>
            </div>

            <div className={classNames(DropdownStyles.section, Styles.section)}>
                <a target="_blank" href="http://nationalmap.gov.au/northernaustralia/">
                    <img className={Styles.image} src={require('../../wwwroot/images/northernaustralia.jpg')}

                         alt="Northern Australia"/>
                </a>

                <a target="_blank" className={Styles.link} href="http://nationalmap.gov.au/northernaustralia/">Northern
                    Australia</a>

                <p>
                    The Northern Australia NationalMap forms part of the Government's commitment to developing
                    northern Australia by providing easy access to authoritative and other spatial data on northern
                    Australia to governments, business and the public.

                    More information on the Government's White Paper on Developing Northern Australia is available
                    here: <a target="_blank" href="https://northernaustralia.dpmc.gov.au">https://northernaustralia.dpmc.gov.au</a>.
                </p>
            </div>

            <div className={classNames(DropdownStyles.section, Styles.section)}>
                <a target="_blank" href="http://neiiviewer.nicta.com.au">
                    <img className={Styles.image} src={require('../../wwwroot/images/neii.jpg')}
                         alt="NEII Viewer"/>
                </a>

                <a target="_blank" className={Styles.link} href="http://neiiviewer.nicta.com.au">NEII Viewer</a>

                <p>
                    The National Environmental Information Infrastructure (NEII) is an information platform designed
                    to improve discovery, access and re-use of nationally significant environmental data. More
                    information on the NEII is available here: [www.neii.gov.au](http://www.neii.gov.au)
                </p>
            </div>

            <div className={classNames(DropdownStyles.section, Styles.section)}>
                <a target="_blank" href="http://map.aurin.org.au">
                    <img className={Styles.image} src={require('../../wwwroot/images/aurin-map.jpg')}
                         alt="AURIN Map"/>
                </a>

                <a target="_blank" className={Styles.link} href="http://map.aurin.org.au">AURIN Map</a>

                <p>
                    AURIN Map provides access to datasets on urban infrastructure for urban researchers, policy and
                    decision makers.
                </p>
            </div>
        </DropdownPanel>
    );
}

RelatedMaps.propTypes = {
    viewState: React.PropTypes.object.isRequired
};

export default RelatedMaps;