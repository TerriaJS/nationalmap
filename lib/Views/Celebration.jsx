import React, { useState } from "react";
import classNames from "classnames";
import Styles from "./celebration.scss";
import { useKeyPress } from "./useKeyPress.js";


export const Celebration = () => {
  const [showCelebration, setShowCelebration] = useState(true);
  const [celebrationVisible, setCelebrationVisible] = useState(true);

  const handleOpen = () => {
    setCelebrationVisible(true);
    setShowCelebration(!showCelebration);
  };

  const handleClose = () => {
    setCelebrationVisible(false);
    setTimeout(() => {
      setShowCelebration(!showCelebration);
    }, 300);
  };
  useKeyPress("Escape", () => {
    if (showCelebration) {
      handleClose();
    }
  });

  const toggleCelebration = () => {
    // If not enabled
    if (!showCelebration) {
      handleOpen();
    }
    // Otherwise we immediately trigger exit animations, then close it 300ms later
    if (showCelebration) {
      handleClose();
    }
  };

  return (
    <>
      <button onClick={toggleCelebration}>🎉</button>
      <If condition={showCelebration}>
        <div
          className={classNames({
            [Styles.videoGuideWrapper]: true,
            [Styles.videoGuideWrapperClosing]: !celebrationVisible
          })}
          onClick={toggleCelebration}
        >
          <div
            className={Styles.videoGuide}
            onClick={e => e.stopPropagation()}
            style={
              {
                // backgroundImage: `url(${require("../../../wwwroot/images/data-stories-getting-started.jpg")})`
              }
            }
          >
            <h1>NationalMap is turning 5!</h1>
            <p>We’re looking for great stories.<br />Help us tell yours!</p>
            <p>What impact has NationalMap had on you?<br />What changes would you like to see?</p>
            <button>Send us a birthday email</button>
            <button>Leave feedback</button>
            <p>Maybe later | Don't show again</p>
          </div>
        </div>
      </If>
    </>
  );
};

export default Celebration;
