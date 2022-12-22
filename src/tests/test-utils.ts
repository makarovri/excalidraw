import "pepjs";

import {
  render,
  queries,
  RenderResult,
  RenderOptions,
  waitFor,
} from "@testing-library/react";

import * as toolQueries from "./queries/toolQueries";
import { ImportedDataState } from "../data/types";
import { STORAGE_KEYS } from "../excalidraw-app/app_constants";

import { SceneData } from "../types";
import { getSelectedElements } from "../scene/selection";
import { ExcalidrawElement, FontString } from "../element/types";

const customQueries = {
  ...queries,
  ...toolQueries,
};

type TestRenderFn = (
  ui: React.ReactElement,
  options?: Omit<
    RenderOptions & { localStorageData?: ImportedDataState },
    "queries"
  >,
) => Promise<RenderResult<typeof customQueries>>;

const renderApp: TestRenderFn = async (ui, options) => {
  if (options?.localStorageData) {
    initLocalStorage(options.localStorageData);
    delete options.localStorageData;
  }

  const renderResult = render(ui, {
    queries: customQueries,
    ...options,
  });

  GlobalTestState.renderResult = renderResult;

  Object.defineProperty(GlobalTestState, "canvas", {
    // must be a getter because at the time of ExcalidrawApp render the
    // child App component isn't likely mounted yet (and thus canvas not
    // present in DOM)
    get() {
      return renderResult.container.querySelector("canvas")!;
    },
  });

  await waitFor(() => {
    const canvas = renderResult.container.querySelector("canvas");
    if (!canvas) {
      throw new Error("not initialized yet");
    }
  });

  return renderResult;
};

// re-export everything
export * from "@testing-library/react";

// override render method
export { renderApp as render };

/**
 * For state-sharing across test helpers.
 * NOTE: there shouldn't be concurrency issues as each test is running in its
 *  own process and thus gets its own instance of this module when running
 *  tests in parallel.
 */
export class GlobalTestState {
  /**
   * automatically updated on each call to render()
   */
  static renderResult: RenderResult<typeof customQueries> = null!;
  /**
   * retrieves canvas for currently rendered app instance
   */
  static get canvas(): HTMLCanvasElement {
    return null!;
  }
}

const initLocalStorage = (data: ImportedDataState) => {
  if (data.elements) {
    localStorage.setItem(
      STORAGE_KEYS.LOCAL_STORAGE_ELEMENTS,
      JSON.stringify(data.elements),
    );
  }
  if (data.appState) {
    localStorage.setItem(
      STORAGE_KEYS.LOCAL_STORAGE_APP_STATE,
      JSON.stringify(data.appState),
    );
  }
};

export const updateSceneData = (data: SceneData) => {
  (window.collab as any).excalidrawAPI.updateScene(data);
};

const originalGetBoundingClientRect =
  global.window.HTMLDivElement.prototype.getBoundingClientRect;

export const mockBoundingClientRect = (
  {
    top = 0,
    left = 0,
    bottom = 0,
    right = 0,
    width = 1920,
    height = 1080,
    x = 0,
    y = 0,
    toJSON = () => {},
  } = {
    top: 10,
    left: 20,
    bottom: 10,
    right: 10,
    width: 200,
    x: 10,
    y: 20,
    height: 100,
  },
) => {
  // override getBoundingClientRect as by default it will always return all values as 0 even if customized in html
  global.window.HTMLDivElement.prototype.getBoundingClientRect = () => ({
    top,
    left,
    bottom,
    right,
    width,
    height,
    x,
    y,
    toJSON,
  });
};

export const withExcalidrawDimensions = async (
  dimensions: { width: number; height: number },
  cb: () => void,
) => {
  mockBoundingClientRect(dimensions);
  // @ts-ignore
  window.h.app.refreshDeviceState(h.app.excalidrawContainerRef.current!);
  window.h.app.refresh();

  await cb();

  restoreOriginalGetBoundingClientRect();
  // @ts-ignore
  window.h.app.refreshDeviceState(h.app.excalidrawContainerRef.current!);
  window.h.app.refresh();
};

export const restoreOriginalGetBoundingClientRect = () => {
  global.window.HTMLDivElement.prototype.getBoundingClientRect =
    originalGetBoundingClientRect;
};

export const assertSelectedElements = (
  ...elements: (
    | (ExcalidrawElement["id"] | ExcalidrawElement)[]
    | ExcalidrawElement["id"]
    | ExcalidrawElement
  )[]
) => {
  const { h } = window;
  const selectedElementIds = getSelectedElements(
    h.app.getSceneElements(),
    h.state,
  ).map((el) => el.id);
  const ids = elements
    .flat()
    .map((item) => (typeof item === "string" ? item : item.id));
  expect(selectedElementIds.length).toBe(ids.length);
  expect(selectedElementIds).toEqual(expect.arrayContaining(ids));
};

export const APPROX_LINE_HEIGHT = 25;
export const INITIAL_WIDTH = 10;
export const DUMMY_WIDTH = 160;
export const DUMMY_HEIGHT = 240;

export const mockMeasureText = (
  text: string,
  font: FontString,
  container: HTMLDivElement,
  maxWidth?: number | null,
) => {
  let width = INITIAL_WIDTH;
  let height = APPROX_LINE_HEIGHT;
  let baseline = 10;
  if (!text) {
    return {
      width,
      height,
      baseline,
    };
  }
  baseline = 30;
  width = DUMMY_WIDTH;
  height = APPROX_LINE_HEIGHT * 5;
  if (font.includes("Virgil")) {
    height = APPROX_LINE_HEIGHT * 3;
  }

  if (font.includes("36")) {
    height += APPROX_LINE_HEIGHT;
  }

  return {
    width,
    height,
    baseline,
    container,
  };
};
