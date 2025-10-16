import { GeoJsonObject } from "geojson";

/**
 * Map interface.
 */
export interface Map {
  /**
   * Render a map with given features.
   */
  render(input: {
    from?: { lat: number; lon: number };
    to?: { lat: number; lon: number };
    path?: GeoJsonObject;
  }): void;
}
