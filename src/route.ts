import { GeoJsonObject } from "geojson";

/**
 * Routing result.
 */
export interface RouteResult {
  distanceMeters: number;
  durationSecs: number;
  geojson: GeoJsonObject;
}

/**
 * Router interface.
 *
 * It is expected that the implementation will do its own rate-limiting.
 */
export interface Router {
  /**
   * Given start and end locations, produce a driving route {@link RouteResult}.
   */
  route(
    startLat: number,
    startLon: number,
    endLat: number,
    endLon: number,
  ): Promise<RouteResult>;
}
