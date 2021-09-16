import React from "react";
import PropTypes from "prop-types";
import Icon from "terriajs/lib/Styled/Icon";

import Styles from "./close-button.scss";

export const CloseButton = ({ onClick }) => (
  <button
    type="button"
    className={Styles.closeBtn}
    onClick={onClick}
    title="Close"
    aria-label="Close"
  >
    <Icon glyph={Icon.GLYPHS.close} />
  </button>
);

CloseButton.propTypes = {
  onClick: PropTypes.func.isRequired
};

export default CloseButton;
