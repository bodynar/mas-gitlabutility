import { isNullOrUndefined } from "@bodynarf/utils";

/**
 * Result of safe operation
 */
export class SafeActionResult<TResult extends object, TError extends object> {
    /**
     * Information about the error that occurred
     */
    public error?: TError;

    /**
     * Result of operation
     */
    public result?: TResult;

    /**
     * Initialize `SafeActionResult`
     * @param param0 Object parameters
     */
    private constructor({ result, error }: {
        error?: TError,
        result?: TResult;
    }
    ) {
        if (isNullOrUndefined(error) && isNullOrUndefined(result)) {
            throw new Error("Cannot create an empty result");
        }

        if (isNullOrUndefined(error)) {
            this.result = result;
        } else {
            this.error = error;
        }
    }

    /**
     * Create an instance of `SafeActionResult` with the result of the successful operation.
     * @param result Result of operation
     * @returns An instance of `SafeActionResult`
     */
    public static complete<TResult extends object>(result: TResult): SafeActionResult<TResult, any> {
        return new SafeActionResult({ result });
    }

    /**
     * Create an instance of `SafeActionResult` with the result of the failed operation.
     * @param error Information about the error that occurred
     * @returns An instance of `SafeActionResult`
     */
    public static fail<TError extends object>(error: TError): SafeActionResult<any, TError> {
        return new SafeActionResult({ error });
    }

    /**
     * Check if the operation failed
     * @returns `true` if operation failed; otherwise - `false`
     */
    public hasError(): boolean {
        return isNullOrUndefined(this.result);
    }
}
