/**
 * Chunk promises and execute in chain
 * @param promises Array of promises
 * @param chunkSize Size of chunk
 * @returns Promise with all results
 */
export const chainPromises = async <TResult>(
    promises: Array<Promise<TResult>>,
    chunkSize = 15,
): Promise<Array<TResult>> => {
    const groups = chunk(promises, chunkSize);

    const result: Array<TResult> = [];

    for (let index = 0; index < groups.length; index++) {
        const group = groups[index];

        const groupResult = await Promise.all(group);

        result.push(...groupResult);
    }

    return result;
};

/**
 * Chunk an array
 * @param items Source array to slice
 * @param chunkSize Max size of single chunk, default is `10`
 * @returns Chunked array
 */
export const chunk = <TItem>(
    items: Array<TItem>,
    chunkSize = 10,
): Array<Array<TItem>> => {
    return items.reduce((result, item, index) => {
        if (index % chunkSize === 0) {
            result.push([item]);
        } else {
            result[result.length - 1].push(item);
        }
        return result;
    }, []);
};

/**
 * Flash application 
 */
export const flash = (): void => {
    window.electron.app.flash();
};

/**
 * Prevent app close (display warning message box)
 * @param canClose Should app close be prevented
 */
export const preventClose = (canClose: boolean): void => {
    window.electron.app.preventClose(canClose);
};
