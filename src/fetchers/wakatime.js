// @ts-check

import axios from "axios";
import { CustomError, MissingParamError } from "../common/error.js";

/**
 * Check if the fetch adapter is available and supported.
 * Returns true if the fetch adapter can be used, false otherwise.
 *
 * @returns {boolean} Whether the fetch adapter is supported.
 */
const isFetchAdapterSupported = () => {
  // In test environments, use the default adapter for compatibility with axios-mock-adapter
  if (process.env.NODE_ENV === "test" || process.env.JEST_WORKER_ID) {
    return false;
  }

  // Check if global fetch is available (Node.js 18+ or browser environment)
  return (
    typeof globalThis.fetch === "function" &&
    typeof globalThis.Request === "function" &&
    typeof globalThis.Response === "function"
  );
};

/**
 * WakaTime data fetcher.
 *
 * @param {{username: string, api_domain: string }} props Fetcher props.
 * @returns {Promise<import("./types").WakaTimeData>} WakaTime data response.
 */
const fetchWakatimeStats = async ({ username, api_domain }) => {
  if (!username) {
    throw new MissingParamError(["username"]);
  }

  try {
    /** @type {import('axios').AxiosRequestConfig} */
    const config = {};

    // Use fetch adapter in production to avoid url.parse() deprecation warning
    // from follow-redirects (a transitive dependency of axios's http adapter).
    if (isFetchAdapterSupported()) {
      config.adapter = "fetch";
    }

    const { data } = await axios.get(
      `https://${
        api_domain ? api_domain.replace(/\/$/gi, "") : "wakatime.com"
      }/api/v1/users/${username}/stats?is_including_today=true`,
      config,
    );

    return data.data;
  } catch (err) {
    if (err.response.status < 200 || err.response.status > 299) {
      throw new CustomError(
        `Could not resolve to a User with the login of '${username}'`,
        "WAKATIME_USER_NOT_FOUND",
      );
    }
    throw err;
  }
};

export { fetchWakatimeStats };
export default fetchWakatimeStats;
