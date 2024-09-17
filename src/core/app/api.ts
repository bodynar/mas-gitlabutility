import { isNullOrEmpty } from "@bodynarf/utils";
import { fetchAsync, getAsync, postAsync } from "@bodynarf/utils/api/simple";

/** Auth token */
let authToken: string;

/** Api endpoint url */
let apiUrl: string = undefined;

/**
 * Save current base api uri to use in requests
 * @param api New base api uri
 */
export const setApiBase = (api: string): void => {
    if (isNullOrEmpty(api)) {
        return;
    }

    if (!api.startsWith("https") && api.startsWith("http")) {
        const tempUrl = new URL(api);
        api = `https://${tempUrl.host}`;
    }

    let builtUrl = api.startsWith("https")
        ? new URL(api)
        : new URL(`https://${api}`);

    if (!builtUrl.pathname.includes("/api/v4")) {
        builtUrl = new URL("/api/v4", builtUrl);
    }

    apiUrl = builtUrl.href;
};

/**
 * Save current auth token to use in requests
 * @param token New token value
 */
export const setCurrentToken = (token: string): void => {
    if (isNullOrEmpty(token)) {
        return;
    }

    authToken = token;
};

/**
 * Send data to api to process via POST method
 * @param uri Api endpoint address
 * @param requestData Request data
 * @returns Promise with api processing result
 */
export const post = <TResult>(uri: string, requestData: Record<string, unknown>): Promise<TResult> => {
    return postAsync<TResult>(
        getFullApiEndpoint(uri),
        requestData,
        {
            headers: getAuthHeader(),
            timeout: 5 * 1000
        },
    );
};

/**
 * Send data to api to process via PUT method
 * @param uri Api endpoint address
 * @param requestData Request data
 * @returns Promise with api processing result
 */
export const put = <TResult>(uri: string, requestData: Record<string, unknown>): Promise<TResult> => {
    return fetchAsync<TResult>(
        getFullApiEndpoint(uri),
        {
            method: "PUT",
            body: JSON.stringify(requestData),
        },
        {
            headers: getAuthHeader(),
            timeout: 5 * 1000
        },
    );
};

/**
 * Send delete request
 * @param uri Api endpoint address
 * @returns Promise with nothing
 */
export const deleteRequest = (uri: string): Promise<void> => {
    return fetchAsync(
        getFullApiEndpoint(uri),
        {
            method: "DELETE",
            headers: getAuthHeader(),
        },
        {
            timeout: 5 * 1000
        },
    );
};

/**
 * Gather data from specified api
 * @param uri Api endpoint address
 * @returns Promise with api get result
 */
export const get = <TResult>(uri: string): Promise<TResult> => {
    return getAsync<TResult>(
        getFullApiEndpoint(uri),
        {
            headers: getAuthHeader(),
            timeout: 5 * 1000
        },
    );
};

/**
 * Get full API endpoint address to perform http request
 * @param apiEndpoint Endpoint partial name
 * @returns Full URI to API endpoint address
 */
const getFullApiEndpoint = (apiEndpoint: string): string => {
    return apiUrl
        + (apiEndpoint.startsWith("/") ? apiEndpoint : `/${apiEndpoint}`)
        ;
};


/**
 * Get auth header with token
 * @returns Authorization header
 */
const getAuthHeader = (): HeadersInit => {
    return { "Authorization": `Bearer ${authToken}` };
};
