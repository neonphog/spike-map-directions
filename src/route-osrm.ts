import { RouteResult, Router } from "./route.js";
import { fetchJson } from "./fetch.js";
import { GeoJsonObject } from "geojson";

interface RouteQuery {
  startLat: number;
  startLon: number;
  endLat: number;
  endLon: number;
  resolve: (res: RouteResult) => void;
  reject: (err: Error) => void;
}

const routeQueue: RouteQuery[] = [];

/// Rate-limit the routing to one every 3 seconds.
setInterval(async () => {
  const query = routeQueue.shift();
  if (!query) {
    return;
  }

  try {
    const url = new URL("https://router.project-osrm.org");
    url.pathname = `route/v1/driving/${query.startLon},${query.startLat};${query.endLon},${query.endLat}`;
    url.searchParams.append("geometries", "geojson");
    url.searchParams.append("overview", "simplified");

    const data = await fetchJson(url);

    console.log(JSON.stringify(data, null, 2));

    if (
      !data ||
      typeof data !== "object" ||
      data.code !== "Ok" ||
      !Array.isArray(data.routes) ||
      data.routes.length < 1
    ) {
      throw new Error(`invalid route response`);
    }

    const route = data.routes[0];

    if (
      !route ||
      typeof route !== "object" ||
      typeof route.geometry !== "object" ||
      typeof route.duration !== "number" ||
      typeof route.distance !== "number"
    ) {
      throw new Error(`invalid route respones`);
    }

    query.resolve({
      distanceMeters: route.distance,
      durationSecs: route.duration,
      geojson: route.geometry as GeoJsonObject,
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
 * Get driving route via OSRM service.
 */
export class RouteOsrm implements Router {
  /**
   * Given start and end locations, produce a driving route {@link RouteResult}.
   */
  route(
    startLat: number,
    startLon: number,
    endLat: number,
    endLon: number,
  ): Promise<RouteResult> {
    return new Promise((resolve, reject) => {
      routeQueue.push({
        startLat,
        startLon,
        endLat,
        endLon,
        resolve,
        reject,
      });
    });
  }
}
