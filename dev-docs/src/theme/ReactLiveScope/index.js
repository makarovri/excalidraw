import React from "react";
import ExecutionEnvironment from "@docusaurus/ExecutionEnvironment";
let ExcalidrawComp = {};
if (ExecutionEnvironment.canUseDOM) {
  ExcalidrawComp = require("@excalidraw/excalidraw");
}
// Add react-live imports you need here
const ExcalidrawScope = {
  React,
  ...React,
  Excalidraw: ExcalidrawComp.Excalidraw,
  Footer: ExcalidrawComp.Footer,
  useDevice: ExcalidrawComp.useDevice,
  MainMenu: ExcalidrawComp.MainMenu,
  WelcomeScreen: ExcalidrawComp.WelcomeScreen,
};

export default ExcalidrawScope;
