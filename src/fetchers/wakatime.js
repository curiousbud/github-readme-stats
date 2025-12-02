// @ts-check

import axios from "axios";
import { CustomError, MissingParamError } from "../common/error.js";
import { isFetchAdapterSupported } from "../common/http.js";

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
