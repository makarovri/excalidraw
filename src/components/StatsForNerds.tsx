import React, { useEffect, useState } from "react";
import { getCommonBounds } from "../element/bounds";
import { NonDeletedExcalidrawElement } from "../element/types";
import {
  getElementsStorageSize,
  getTotalStorageSize,
} from "../excalidraw-app/data/localStorage";
import { t } from "../i18n";
import { getSelectedElements } from "../scene";
import { AppState } from "../types";
import { debounce, nFormatter } from "../utils";
import { close } from "./icons";
import { Island } from "./Island";
import "./StatsForNerds.scss";

type StorageSizes = { scene: number; total: number };

const getStorageSizes = debounce((cb: (sizes: StorageSizes) => void) => {
  cb({
    scene: getElementsStorageSize(),
    total: getTotalStorageSize(),
  });
}, 500);

export const StatsForNerds = (props: {
  appState: AppState;
  elements: readonly NonDeletedExcalidrawElement[];
  onClose: () => void;
}) => {
  const [storageSizes, setStorageSizes] = useState<StorageSizes>({
    scene: 0,
    total: 0,
  });

  useEffect(() => {
    getStorageSizes((sizes) => {
      setStorageSizes(sizes);
    });
  });

  useEffect(() => () => getStorageSizes.cancel(), []);

  const boundingBox = getCommonBounds(props.elements);
  const selectedElements = props.appState.editingElement
    ? [props.appState.editingElement]
    : getSelectedElements(props.elements, props.appState);
  const selectedBoundingBox = getCommonBounds(selectedElements);

  return (
    <div className="StatsForNerds">
      <Island padding={2}>
        <div className="close" onClick={props.onClose}>
          {close}
        </div>
        <h3>{t("stats.title")}</h3>
        <table>
          <tbody>
            <tr>
              <th colSpan={2}>{t("stats.scene")}</th>
            </tr>
            <tr>
              <td>{t("stats.elements")}</td>
              <td>{props.elements.length}</td>
            </tr>
            <tr>
              <td>{t("stats.width")}</td>
              <td>{Math.round(boundingBox[2]) - Math.round(boundingBox[0])}</td>
            </tr>
            <tr>
              <td>{t("stats.height")}</td>
              <td>{Math.round(boundingBox[3]) - Math.round(boundingBox[1])}</td>
            </tr>
            <tr>
              <th colSpan={2}>{t("stats.storage")}</th>
            </tr>
            <tr>
              <td>{t("stats.scene")}</td>
              <td>{nFormatter(storageSizes.scene, 1)}</td>
            </tr>
            <tr>
              <td>{t("stats.total")}</td>
              <td>{nFormatter(storageSizes.total, 1)}</td>
            </tr>

            {selectedElements.length === 1 && (
              <>
                <tr>
                  <th colSpan={2}>{t("stats.element")}</th>
                </tr>
              </>
            )}

            {selectedElements.length > 1 && (
              <>
                <tr>
                  <th colSpan={2}>{t("stats.selected")}</th>
                </tr>
                <tr>
                  <td>{t("stats.elements")}</td>
                  <td>{selectedElements.length}</td>
                </tr>
              </>
            )}
            {selectedElements.length > 0 && (
              <>
                <tr>
                  <td>{"x"}</td>
                  <td>
                    {Math.round(
                      selectedElements.length === 1
                        ? selectedElements[0].x
                        : selectedBoundingBox[0],
                    )}
                  </td>
                </tr>
                <tr>
                  <td>{"y"}</td>
                  <td>
                    {Math.round(
                      selectedElements.length === 1
                        ? selectedElements[0].y
                        : selectedBoundingBox[1],
                    )}
                  </td>
                </tr>
                <tr>
                  <td>{t("stats.width")}</td>
                  <td>
                    {Math.round(
                      selectedElements.length === 1
                        ? selectedElements[0].width
                        : selectedBoundingBox[2] - selectedBoundingBox[0],
                    )}
                  </td>
                </tr>
                <tr>
                  <td>{t("stats.height")}</td>
                  <td>
                    {Math.round(
                      selectedElements.length === 1
                        ? selectedElements[0].height
                        : selectedBoundingBox[3] - selectedBoundingBox[1],
                    )}
                  </td>
                </tr>
              </>
            )}
          </tbody>
        </table>
      </Island>
    </div>
  );
};
