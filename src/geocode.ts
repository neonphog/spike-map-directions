/**
 * Geocoding result.
 */
export interface GeocodeResult {
  nameShort: string;
  nameLong: string;
  lat: number;
  lon: number;
}

/**
 * Geocoder interface.
 *
 * It is expected that the implementation will do its own rate-limiting.
 */
export interface Geocoder {
  /**
   * Convert a search string into a {@link GeocodeResult} (lat/lon).
   */
  geocode(search: string): Promise<GeocodeResult>;
}
