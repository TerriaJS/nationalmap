import React from "react";

export const MailIcon = props => (
  <svg width="1em" height="1em" viewBox="0 0 18 16" {...props}>
    <defs>
      <path
        d="M19 5.053V17a1 1 0 01-1 1H2a1 1 0 01-1-1V3a1 1 0 011-1h16a1 1 0 011 1v2.053zm-2-.416V4H3v.586l6.298 6.297a1 1 0 001.411.003L17 4.637zm0 2.82l-4.881 4.848a3 3 0 01-4.236-.007L3 7.414V16h14V7.456z"
        id="hatIcon"
      />
    </defs>
    <g fill="none" fillRule="evenodd">
      <path d="M-647-450H633v800H-647z" />
      <g transform="translate(-1 -2)" opacity={0.496}>
        <mask id="hatIconMask" fill="#fff">
          <use xlinkHref="#hatIcon" />
        </mask>
        <use fill="#4D5766" fillRule="nonzero" xlinkHref="#hatIcon" />
        <g mask="url(#hatIconMask)" fill="#FFF">
          <path d="M0 0h20v20H0z" />
        </g>
      </g>
    </g>
  </svg>
);

export default MailIcon;
