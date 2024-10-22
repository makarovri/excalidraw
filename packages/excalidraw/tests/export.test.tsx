import React from "react";
import { render, waitFor } from "./test-utils";
import { Excalidraw } from "../index";
import { API } from "./helpers/api";
import {
  encodePngMetadata,
  encodeSvgMetadata,
  decodeSvgMetadata,
} from "../data/image";
import { serializeAsJSON } from "../data/json";
import { exportToSvg } from "../scene/export";
import type { FileId } from "../element/types";
import { getDataURL } from "../data/blob";
import { getDefaultAppState } from "../appState";

const { h } = window;

const testElements = [
  {
    ...API.createElement({
      type: "text",
      id: "A",
      text: "😀",
    }),
    // can't get jsdom text measurement to work so this is a temp hack
    // to ensure the element isn't stripped as invisible
    width: 16,
    height: 16,
  },
];

// tiny polyfill for TextDecoder.decode on which we depend
Object.defineProperty(window, "TextDecoder", {
  value: class TextDecoder {
    decode(ab: ArrayBuffer) {
      return new Uint8Array(ab).reduce(
        (acc, c) => acc + String.fromCharCode(c),
        "",
      );
    }
  },
});

describe("export", () => {
  beforeEach(async () => {
    await render(<Excalidraw />);
  });

  it("export embedded png and reimport", async () => {
    const pngBlob = await API.loadFile("./fixtures/smiley.png");
    const pngBlobEmbedded = await encodePngMetadata({
      blob: pngBlob,
      metadata: serializeAsJSON(testElements, h.state, {}, "local"),
    });
    await API.drop(pngBlobEmbedded);

    await waitFor(() => {
      expect(h.elements).toEqual([
        expect.objectContaining({ type: "text", text: "😀" }),
      ]);
    });
  });

  it("test encoding/decoding scene for SVG export", async () => {
    const encoded = await encodeSvgMetadata({
      text: serializeAsJSON(testElements, h.state, {}, "local"),
    });
    const decoded = JSON.parse(await decodeSvgMetadata({ svg: encoded }));
    expect(decoded.elements).toEqual([
      expect.objectContaining({ type: "text", text: "😀" }),
    ]);
  });

  it("import embedded png (legacy v1)", async () => {
    await API.drop(await API.loadFile("./fixtures/test_embedded_v1.png"));
    await waitFor(() => {
      expect(h.elements).toEqual([
        expect.objectContaining({ type: "text", text: "test" }),
      ]);
    });
  });

  it("import embedded png (v2)", async () => {
    await API.drop(await API.loadFile("./fixtures/smiley_embedded_v2.png"));
    await waitFor(() => {
      expect(h.elements).toEqual([
        expect.objectContaining({ type: "text", text: "😀" }),
      ]);
    });
  });

  it("import embedded svg (legacy v1)", async () => {
    await API.drop(await API.loadFile("./fixtures/test_embedded_v1.svg"));
    await waitFor(() => {
      expect(h.elements).toEqual([
        expect.objectContaining({ type: "text", text: "test" }),
      ]);
    });
  });

  it("import embedded svg (v2)", async () => {
    await API.drop(await API.loadFile("./fixtures/smiley_embedded_v2.svg"));
    await waitFor(() => {
      expect(h.elements).toEqual([
        expect.objectContaining({ type: "text", text: "😀" }),
      ]);
    });
  });

  it("exporting svg containing transformed images", async () => {
    const normalizeAngle = (angle: number) => (angle / 180) * Math.PI;

    const elements = [
      API.createElement({
        type: "image",
        fileId: "file_A",
        x: 0,
        y: 0,
        scale: [1, 1],
        width: 100,
        height: 100,
        angle: normalizeAngle(315),
      }),
      API.createElement({
        type: "image",
        fileId: "file_A",
        x: 100,
        y: 0,
        scale: [-1, 1],
        width: 50,
        height: 50,
        angle: normalizeAngle(45),
      }),
      API.createElement({
        type: "image",
        fileId: "file_A",
        x: 0,
        y: 100,
        scale: [1, -1],
        width: 100,
        height: 100,
        angle: normalizeAngle(45),
      }),
      API.createElement({
        type: "image",
        fileId: "file_A",
        x: 100,
        y: 100,
        scale: [-1, -1],
        width: 50,
        height: 50,
        angle: normalizeAngle(315),
      }),
    ];
    const appState = { ...getDefaultAppState(), exportBackground: false };
    const files = {
      file_A: {
        id: "file_A" as FileId,
        dataURL: await getDataURL(await API.loadFile("./fixtures/deer.png")),
        mimeType: "image/png",
        created: Date.now(),
        lastRetrieved: Date.now(),
      },
    } as const;

    const svg = await exportToSvg(elements, appState, files);

    const svgText = svg.outerHTML;

    // expect 1 <image> element (deduped)
    expect(svgText.match(/<image/g)?.length).toBe(1);
    // expect 4 <use> elements (one for each excalidraw image element)
    expect(svgText.match(/<use/g)?.length).toBe(4);

    // in case of regressions, save the SVG to a file and visually compare to:
    // src/tests/fixtures/svg-image-exporting-reference.svg
    expect(svgText).toMatchSnapshot(`svg export output`);
  });

  it("exporting svg containing rotated curved linear elements", async () => {
    const normalizeAngle = (angle: number) => (angle / 180) * Math.PI;

    const elements = [
      API.createElement({
        type: "line",
        angle: normalizeAngle(180),
        x: 0,
        y: 0,
        roughness: 0,
        strokeColor: "red",
        roundness: { type: 2 },
        points: [
          [0, 0],
          [0, 600],
          [600, 600],
        ],
      }),
      API.createElement({
        type: "line",
        angle: 0,
        x: -44,
        y: 44,
        roughness: 0,
        strokeStyle: "dotted",
        strokeColor: "gray",
        roundness: { type: 2 },
        points: [
          [0, 0],
          [600, 0],
          [600, 600],
        ],
      }),
      API.createElement({
        type: "arrow",
        angle: normalizeAngle(180),
        x: 656,
        y: 744,
        roughness: 0,
        strokeColor: "blue",
        roundness: { type: 2 },
        points: [
          [0, 0],
          [0, -600],
          [-600, -600],
        ],
      }),
      API.createElement({
        type: "arrow",
        angle: 0,
        x: 700,
        y: 700,
        roughness: 0,
        strokeStyle: "dotted",
        strokeColor: "gray",
        roundness: { type: 2 },
        points: [
          [0, 0],
          [-600, 0],
          [-600, -600],
        ],
      }),
    ];

    const appState = { ...getDefaultAppState(), exportBackground: false };

    const svg = await exportToSvg(elements, appState, null);

    const svgText = svg.outerHTML;

    // in case of regressions, save the SVG to a file and visually compare to:
    // ./fixtures/svg-linear-exporting-reference.svg
    expect(svgText).toMatchSnapshot(
      `rotated curved linear elements svg export`,
    );
  });
});
