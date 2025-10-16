import { Map } from "./map.js";
import * as L from "leaflet";
import { GeoJsonObject } from "geojson";

/**
 * Map based on leaflet
 */
export class MapLeaflet implements Map {
  #map: L.Map;
  #markerFrom: null | L.Layer;
  #markerTo: null | L.Layer;
  #pathLayer: null | L.Layer;

  constructor(id: string) {
    this.#map = L.map(id);
    this.#markerFrom = null;
    this.#markerTo = null;
    this.#pathLayer = null;

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution:
        '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(this.#map);
  }

  #clear(): void {
    if (this.#markerFrom) {
      this.#map.removeLayer(this.#markerFrom);
      this.#markerFrom = null;
    }
    if (this.#markerTo) {
      this.#map.removeLayer(this.#markerTo);
      this.#markerTo = null;
    }
    if (this.#pathLayer) {
      this.#map.removeLayer(this.#pathLayer);
      this.#pathLayer = null;
    }
  }

  /**
   * Render a map with given features.
   */
  render(input: {
    from?: { lat: number; lon: number };
    to?: { lat: number; lon: number };
    path?: GeoJsonObject;
  }): void {
    this.#clear();

    const { from, to, path } = input;

    if (!from) {
      this.#map.fitWorld();
      return;
    }

    this.#markerFrom = L.marker([from.lat, from.lon]);
    this.#map.addLayer(this.#markerFrom);

    if (!to) {
      this.#map.setView([from.lat, from.lon], 12);
      return;
    }

    this.#markerTo = L.marker([to.lat, to.lon]);
    this.#map.addLayer(this.#markerTo);

    this.#map.fitBounds(
      L.latLngBounds(L.latLng(from.lat, from.lon), L.latLng(to.lat, to.lon)),
    );

    if (!path) {
      return;
    }

    this.#pathLayer = L.geoJSON(path);
    this.#map.addLayer(this.#pathLayer);
  }
}
