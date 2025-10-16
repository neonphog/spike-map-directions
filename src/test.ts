import {
  GeocodeResult,
  GeocodeNominatim,
  RouteResult,
  RouteOsrm,
  GeoJsonObject,
  MapLeaflet,
} from "./index.js";

const USD_PER_KM = 0.34;
const USD_PER_MIN = 0.95;

const geocode = new GeocodeNominatim();
let geocodeFrom: null | GeocodeResult = null;
let geocodeTo: null | GeocodeResult = null;

const route = new RouteOsrm();
let routeInfo: null | RouteResult = null;

const map = new MapLeaflet("map");
map.render({});

function get<T>(id: string): T {
  return document.getElementById(id) as T;
}

const fromForm = get<HTMLFormElement>("from");
const fromSearch = get<HTMLInputElement>("from_search");
const fromCheck = get<HTMLInputElement>("from_check");
const fromResult = get<HTMLPreElement>("from_result");

const toForm = get<HTMLFormElement>("to");
const toSearch = get<HTMLInputElement>("to_search");
const toCheck = get<HTMLInputElement>("to_check");
const toResult = get<HTMLPreElement>("to_result");

const routeForm = get<HTMLFormElement>("route");
const routeCheck = get<HTMLInputElement>("route_check");
const routeResult = get<HTMLPreElement>("route_result");

function disableFrom(v: boolean) {
  fromForm.disabled = v;
  fromSearch.disabled = v;
  fromCheck.disabled = v;
}

function disableTo(v: boolean) {
  toForm.disabled = v;
  toSearch.disabled = v;
  toCheck.disabled = v;
}

function disableRoute(v: boolean) {
  routeForm.disabled = v;
  routeCheck.disabled = v;
}

function disableAll(v: boolean) {
  disableFrom(v);
  disableTo(v);
  disableRoute(v);
}

function renderMap() {
  const opts: {
    from?: { lat: number; lon: number };
    to?: { lat: number; lon: number };
    path?: GeoJsonObject;
  } = {};

  if (geocodeFrom) {
    opts.from = { lat: geocodeFrom.lat, lon: geocodeFrom.lon };
  }

  if (geocodeTo) {
    opts.to = { lat: geocodeTo.lat, lon: geocodeTo.lon };
  }

  if (routeInfo) {
    opts.path = routeInfo.geojson;
  }

  map.render(opts);
}

function submitFrom(evt: SubmitEvent) {
  evt.preventDefault();
  disableAll(true);
  fromResult.innerText = "searching for address...";
  geocode.geocode(fromSearch.value).then(
    (result) => {
      geocodeFrom = result;
      fromResult.innerText = JSON.stringify(result, null, 2);
      renderMap();
      disableAll(false);
    },
    (err) => {
      fromResult.innerText = err.toString();
      disableAll(false);
    },
  );
}

function submitTo(evt: SubmitEvent) {
  evt.preventDefault();
  disableAll(true);
  toResult.innerText = "searching for address...";
  geocode.geocode(toSearch.value).then(
    (result) => {
      geocodeTo = result;
      toResult.innerText = JSON.stringify(result, null, 2);
      renderMap();
      disableAll(false);
    },
    (err) => {
      toResult.innerText = err.toString();
      disableAll(false);
    },
  );
}

function submitRoute(evt: SubmitEvent) {
  evt.preventDefault();
  disableAll(true);

  if (!geocodeFrom) {
    routeResult.innerText = "please check a from location first";
    return;
  }

  if (!geocodeTo) {
    routeResult.innerText = "please check a to location first";
    return;
  }

  routeResult.innerText = "searching for route...";
  route
    .route(geocodeFrom.lat, geocodeFrom.lon, geocodeTo.lat, geocodeTo.lon)
    .then(
      (result) => {
        routeInfo = result;
        const km = Math.round(result.distanceMeters / 1000.0);
        const min = Math.round(result.durationSecs / 60.0);
        const usdPerKm = USD_PER_KM;
        const usdPerMin = USD_PER_MIN;
        const priceDistanceUSD = Math.round(km * usdPerKm * 100) / 100;
        const priceDurationUSD = Math.round(min * usdPerMin * 100) / 100;
        const priceTotalUSD = priceDistanceUSD + priceDurationUSD;
        routeResult.innerText = JSON.stringify(
          {
            distanceKm: km,
            durationMin: min,
            usdPerKm,
            usdPerMin,
            priceDistanceUSD,
            priceDurationUSD,
            priceTotalUSD,
          },
          null,
          2,
        );
        renderMap();
        disableAll(false);
      },
      (err) => {
        routeResult.innerText = err.toString();
        disableAll(false);
      },
    );
}

function main() {
  fromForm.onsubmit = submitFrom;
  toForm.onsubmit = submitTo;
  routeForm.onsubmit = submitRoute;

  disableAll(false);
}

main();
