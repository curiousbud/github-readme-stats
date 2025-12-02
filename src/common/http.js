// @ts-check

import axios from "axios";

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
 * Send GraphQL request to GitHub API.
 *
 * @param {import('axios').AxiosRequestConfig['data']} data Request data.
 * @param {import('axios').AxiosRequestConfig['headers']} headers Request headers.
 * @returns {Promise<any>} Request response.
 */
const request = (data, headers) => {
  /** @type {import('axios').AxiosRequestConfig} */
  const config = {
    url: "https://api.github.com/graphql",
    method: "post",
    headers,
    data,
  };

  // Use fetch adapter in production to avoid url.parse() deprecation warning
  // from follow-redirects (a transitive dependency of axios's http adapter).
  if (isFetchAdapterSupported()) {
    config.adapter = "fetch";
  }

  return axios(config);
};

export { request };
