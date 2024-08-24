import type { GeometricShape } from "./geometry/shape";
import {
  pointInEllipse,
  pointInPolygon,
  pointOnCurve,
  pointOnEllipse,
  pointOnLineSegment,
  pointOnPolycurve,
  pointOnPolygon,
  pointOnPolyline,
  closePolygon,
} from "./geometry/geometry";
import type { GlobalPoint, LocalPoint, Polygon } from "@excalidraw/math";

// check if the given point is considered on the given shape's border
export const isPointOnShape = <Point extends GlobalPoint | LocalPoint>(
  point: Point,
  shape: GeometricShape<Point>,
  tolerance = 0,
) => {
  // get the distance from the given point to the given element
  // check if the distance is within the given epsilon range
  switch (shape.type) {
    case "polygon":
      return pointOnPolygon(point, shape.data, tolerance);
    case "ellipse":
      return pointOnEllipse(point, shape.data, tolerance);
    case "line":
      return pointOnLineSegment(point, shape.data, tolerance);
    case "polyline":
      return pointOnPolyline(point, shape.data, tolerance);
    case "curve":
      return pointOnCurve(point, shape.data, tolerance);
    case "polycurve":
      return pointOnPolycurve(point, shape.data, tolerance);
    default:
      throw Error(`shape ${shape} is not implemented`);
  }
};

// check if the given point is considered inside the element's border
export const isPointInShape = <Point extends GlobalPoint | LocalPoint>(
  point: Point,
  shape: GeometricShape<Point>,
) => {
  switch (shape.type) {
    case "polygon":
      return pointInPolygon(point, shape.data);
    case "line":
      return false;
    case "curve":
      return false;
    case "ellipse":
      return pointInEllipse(point, shape.data);
    case "polyline": {
      const polygon = closePolygon(
        shape.data.flat() as Polygon<Point>,
      ) as Polygon<Point>;
      return pointInPolygon(point, polygon);
    }
    case "polycurve": {
      return false;
    }
    default:
      throw Error(`shape ${shape} is not implemented`);
  }
};

// check if the given element is in the given bounds
export const isPointInBounds = <Point extends GlobalPoint | LocalPoint>(
  point: Point,
  bounds: Polygon<Point>,
) => {
  return pointInPolygon(point, bounds);
};
