import React from "react";

export const FeedbackIcon = props => (
  <svg width="1em" height="1em" viewBox="0 0 18 18" {...props}>
    <defs>
      <path
        opacity={0.496}
        d="M15 15v3a1 1 0 01-1.625.78L8.65 15H2a1 1 0 01-1-1V2a1 1 0 011-1h16a1 1 0 011 1v12a1 1 0 01-1 1h-3zm-2 .92V14a1 1 0 011-1h3V3H3v10h6a1 1 0 01.625.22L13 15.92zM5 7V5h10v2H5zm0 3V8h7v2H5z"
        id="feedbackIcon"
      />
    </defs>
    <use
      fill="#FFF"
      fillRule="nonzero"
      xlinkHref="#feedbackIcon"
      transform="translate(-1 -1)"
    />
  </svg>
);

export default FeedbackIcon;
