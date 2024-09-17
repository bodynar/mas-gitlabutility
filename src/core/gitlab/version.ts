import { get } from "@app/core";

/**
 * Get gitlab site version
 * @returns Promise with version result
 */
export const getVersion = async (): Promise<string> => {
    const { version } = await get<VersionApiResponse>(`/version`);

    return version;
};

interface VersionApiResponse {
    version: string;
    revision: string;
}
