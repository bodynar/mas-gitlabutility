import { generateGuid } from "@bodynarf/utils";

/** Token for cancellation of operation */
export class CancellationToken {
    /**
     * Private constructor for access managing. Producing a new instance of `CancellationToken`
     * @param isCancelRequested Is token requested (is operation cancelled)
     * @param cancelTime When token was requested
     * @param [id=generateGuid()] Token identifier
     */
    private constructor(
        private isCancelRequested = false,
        private cancelTime: Date | undefined = undefined,
        private id: string = generateGuid(),
    ) { }

    /** Create an instance of `CancellationToken` */
    public static create(): CancellationToken {
        return new CancellationToken();
    }

    /**
     * Cancel operation via requesting token back
     */
    public cancel(): void {
        this.isCancelRequested = true;
        this.cancelTime = new Date();
    }

    /**
     * Check is token requested (is operation cancelled)
     */
    public get isCancelled(): boolean {
        return this.isCancelRequested;
    }

    /**
     * Get information about when token was requested
     */
    public get canceledOn(): Date | undefined {
        return this.cancelTime;
    }
}
