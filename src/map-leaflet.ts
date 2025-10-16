import { Map } from "./map.js";
import * as L from "leaflet";
import { GeoJsonObject } from "geojson";

/**
 * Map based on leaflet
 */
export class MapLeaflet implements Map {
  #map: L.Map;
  #pathLayer: null | L.Layer;

  constructor(id: string) {
    this.#map = L.map(id);
    this.#pathLayer = null;

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution:
        '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(this.#map);
  }

  /**
   * Render a map with given features.
   */
  render(input: {
    from?: { lat: number; lon: number };
    to?: { lat: number; lon: number };
    path?: GeoJsonObject;
  }): void {
    const { from, to, path } = input;

    if (!from) {
      this.#map.fitWorld();
      return;
    }

    if (!to) {
      this.#map.setView([from.lat, from.lon], 19);
      return;
    }

    this.#map.fitBounds(
      L.latLngBounds(L.latLng(from.lat, from.lon), L.latLng(to.lat, to.lon)),
    );

    if (!path) {
      return;
    }

    if (this.#pathLayer) {
      this.#map.removeLayer(this.#pathLayer);
      this.#pathLayer = null;
    }

    this.#pathLayer = L.geoJSON(path);
    this.#map.addLayer(this.#pathLayer);
  }
}
