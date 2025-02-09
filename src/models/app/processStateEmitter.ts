import { EventEmitter } from "events";

import { ProcessStateLoadingMessageConfig } from "@app/store/app";

/**
 * Handler of process state update events
 * @param state Current state value
 * @param message Explanation message
 * @param maxState New maximum state value
 */
export type ProcessStateEventHandler = (
    state: number,
    message?: string,
    maxState?: number
) => void;

/**
 * Emitter of process state update events
 */
export class ProcessStateEmitter {
    /** Event emitter */
    private emitter: EventEmitter = new EventEmitter();

    /** Name of internal event */
    private static eventName = "PROCESS_STATE_UPDATE";

    /** Is handler subscribed */
    private subscribed = false;

    /**
     * Initialize `ProcessStateEmitter`
     * @param maxState Maximum state value
     */
    constructor(
        private maxState: number
    ) {
    }

    /**
     * Subscribe to process state update events
     * @param handler Event handler
     */
    public subscribe(
        handler: ProcessStateEventHandler
    ): void {
        if (this.subscribed) {
            return;
        }

        this.emitter.addListener(
            ProcessStateEmitter.eventName,
            handler
        );

        this.subscribed = true;
    }

    /**
     * Trigger updating of processing state
     * @param param0 New state of processing state
     */
    public trigger(
        { message, state, maxState }:
            Omit<ProcessStateLoadingMessageConfig, "maxState">
            & { maxState?: number; }
    ): void {
        this.emitter.emit(
            ProcessStateEmitter.eventName,
            state, message, maxState
        );
    }
}
