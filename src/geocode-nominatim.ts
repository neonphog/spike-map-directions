import { Geocoder, GeocodeResult } from "./geocode.js";
import { fetchJson } from "./fetch.js";

interface GeocodeQuery {
  search: string;
  resolve: (res: GeocodeResult) => void;
  reject: (err: Error) => void;
}

const geocodeQueue: GeocodeQuery[] = [];

/// Rate-limit the geocoding to one every 3 seconds.
setInterval(async () => {
  const query = geocodeQueue.shift();
  if (!query) {
    return;
  }

  try {
    const url = new URL("https://nominatim.openstreetmap.org");
    url.pathname = "search";
    url.searchParams.append("format", "jsonv2");
    url.searchParams.append("q", query.search);

    const data = await fetchJson(url, true);

    if (!Array.isArray(data)) {
      throw new Error(`invalid response`);
    }
    if (data.length < 1) {
      throw new Error(`no matching address`);
    }

    const first = data[0];

    if (
      !first ||
      typeof first !== "object" ||
      typeof first.name !== "string" ||
      typeof first.display_name !== "string" ||
      typeof first.lat !== "string" ||
      typeof first.lon !== "string"
    ) {
      throw new Error(`invalid response`);
    }

    query.resolve({
      nameShort: first.name,
      nameLong: first.display_name,
      lat: parseFloat(first.lat),
      lon: parseFloat(first.lon),
    });
  } catch (e: any) {
    if (e instanceof Error) {
      query.reject(e);
    } else {
      query.reject(new Error(e));
    }
  }
}, 3000);

/**
 * Use https://nominatim.openstreetmap.org for geocoding.
 *
 * NOTE this doesn't seem to work in nodejs at the moment despite
 * trying to follow the rules. But it works in a browser.
 */
export class GeocodeNominatim implements Geocoder {
  /**
   * Convert a search string into a {@link GeocodeResult} (lat/lon).
   */
  geocode(search: string): Promise<GeocodeResult> {
    return new Promise((resolve, reject) => {
      geocodeQueue.push({
        search,
        resolve,
        reject,
      });
    });
  }
}
