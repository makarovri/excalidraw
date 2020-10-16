import React from "react";
import {
  moveOneLeft,
  moveOneRight,
  moveAllLeft,
  moveAllRight,
} from "../zindex";
import { KEYS, isDarwin } from "../keys";
import { t } from "../i18n";
import { getShortcutKey } from "../utils";
import { register } from "./register";
import {
  SendBackwardIcon,
  BringToFrontIcon,
  SendToBackIcon,
  BringForwardIcon,
} from "../components/icons";

export const actionSendBackward = register({
  name: "sendBackward",
  perform: (elements, appState) => {
    return {
      elements: moveOneLeft(elements, appState),
      appState,
      commitToHistory: true,
    };
  },
  contextItemLabel: "labels.sendBackward",
  contextMenuOrder: 10,
  keyPriority: 40,
  keyTest: (event) =>
    event[KEYS.CTRL_OR_CMD] && !event.shiftKey && event.code === "BracketLeft",
  PanelComponent: ({ updateData, appState }) => (
    <button
      type="button"
      className="zIndexButton"
      onClick={() => updateData(null)}
      title={`${t("labels.sendBackward")} — ${getShortcutKey("CtrlOrCmd+[")}`}
    >
      <SendBackwardIcon appearance={appState.appearance} />
    </button>
  ),
});

export const actionBringForward = register({
  name: "bringForward",
  perform: (elements, appState) => {
    return {
      elements: moveOneRight(elements, appState),
      appState,
      commitToHistory: true,
    };
  },
  contextItemLabel: "labels.bringForward",
  contextMenuOrder: 11,
  keyPriority: 40,
  keyTest: (event) =>
    event[KEYS.CTRL_OR_CMD] && !event.shiftKey && event.code === "BracketRight",
  PanelComponent: ({ updateData, appState }) => (
    <button
      type="button"
      className="zIndexButton"
      onClick={() => updateData(null)}
      title={`${t("labels.bringForward")} — ${getShortcutKey("CtrlOrCmd+]")}`}
    >
      <BringForwardIcon appearance={appState.appearance} />
    </button>
  ),
});

export const actionSendToBack = register({
  name: "sendToBack",
  perform: (elements, appState) => {
    return {
      elements: moveAllLeft(elements, appState),
      appState,
      commitToHistory: true,
    };
  },
  contextItemLabel: "labels.sendToBack",
  contextMenuOrder: 12,
  keyTest: (event) => {
    return isDarwin
      ? event[KEYS.CTRL_OR_CMD] && event.altKey && event.code === "BracketLeft"
      : event[KEYS.CTRL_OR_CMD] &&
          event.shiftKey &&
          event.code === "BracketLeft";
  },
  PanelComponent: ({ updateData, appState }) => (
    <button
      type="button"
      className="zIndexButton"
      onClick={() => updateData(null)}
      title={`${t("labels.sendToBack")} — ${
        isDarwin
          ? getShortcutKey("CtrlOrCmd+Alt+[")
          : getShortcutKey("CtrlOrCmd+Shift+[")
      }`}
    >
      <SendToBackIcon appearance={appState.appearance} />
    </button>
  ),
});

export const actionBringToFront = register({
  name: "bringToFront",
  perform: (elements, appState) => {
    return {
      elements: moveAllRight(elements, appState),
      appState,
      commitToHistory: true,
    };
  },
  contextItemLabel: "labels.bringToFront",
  contextMenuOrder: 13,
  keyTest: (event) => {
    return isDarwin
      ? event[KEYS.CTRL_OR_CMD] && event.altKey && event.code === "BracketRight"
      : event[KEYS.CTRL_OR_CMD] &&
          event.shiftKey &&
          event.code === "BracketRight";
  },
  PanelComponent: ({ updateData, appState }) => (
    <button
      type="button"
      className="zIndexButton"
      onClick={(event) => updateData(null)}
      title={`${t("labels.bringToFront")} — ${
        isDarwin
          ? getShortcutKey("CtrlOrCmd+Alt+]")
          : getShortcutKey("CtrlOrCmd+Shift+]")
      }`}
    >
      <BringToFrontIcon appearance={appState.appearance} />
    </button>
  ),
});
