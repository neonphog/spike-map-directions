import { fetch } from "cross-fetch";

const REFERRER = "https://unyt.co/OpenMappingDemo";
const USER_AGENT = "Unyt/OpenMappingDemo/1.0";

export async function fetchJson(url: URL, ref?: boolean): Promise<any> {
  const opt: RequestInit = {};

  if (ref) {
    opt.referrer = REFERRER;
    opt.headers = {
      Referrer: REFERRER,
      "User-Agent": USER_AGENT,
    };
  }

  const res = await fetch(url, opt);

  if (res.status >= 400) {
    const msg = await res.text();
    throw new Error(`error(${res.status}): ${msg}`);
  }

  return await res.json();
}
