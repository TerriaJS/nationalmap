import React from "react";

export const HatIcon = props => (
  <svg width="1em" height="1em" viewBox="0 0 18 19" {...props}>
    <defs>
      <path
        d="M9.894 1.789l7.382 14.764A1 1 0 0116.382 18H1.618a1 1 0 01-.894-1.447L8.106 1.789a1 1 0 011.788 0z"
        id="anniversaryHat"
      />
    </defs>
    <g transform="rotate(-35 3.944 13.426)" fill="none" fillRule="evenodd">
      <mask id="anniversaryHatMask" fill="#fff">
        <use xlinkHref="#anniversaryHat" />
      </mask>
      <use fill="#FA6400" xlinkHref="#anniversaryHat" />
      <path
        d="M18.5 13.5l-5.547 5.547L18.5 13.5zm-2-2l-6.961 6.961L16.5 11.5zM15 9l-9.461 9.461L15 9zm-1-3L-.85 20.85 14 6zm-1-3L-1.85 17.85 13 3zm0-4L-1.85 13.85 13-1z"
        stroke="#FF8F8F"
        strokeLinecap="square"
        mask="url(#anniversaryHatMask)"
      />
    </g>
  </svg>
);

export default HatIcon;
