import { createGlobalStyle } from "styled-components";

export const GlobalStyles = createGlobalStyle`

// https://github.com/styled-components/styled-components/issues/2670
  // don't set body style to nunito to remind that text should be rendered with <Text />(?)
  // @import url("https://fonts.googleapis.com/css?family=Nunito:400,600,700&display=swap");
  // #ui {
  //   overflow-y: auto;
  // }
  // body {
  //   font-family: 'Nunito';
  //   margin: 0;
  // }
  // h1, h2, h3, h4, h5, h6 {
  //   margin-top:0;
  // }
`;

export default GlobalStyles;
