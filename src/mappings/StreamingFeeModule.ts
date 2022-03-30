import {
  FeeActualized as FeeActualizedEvent,
  StreamingFeeUpdated as StreamingFeeUpdatedEvent,
  FeeRecipientUpdated as FeeRecipientUpdatedEvent
} from "../../generated/templates/StreamingFeeModule/StreamingFeeModule";
import { modules } from "../utils";

/**
 * Handler for the FeeActualized event
 * Index the fee accrue event
 *
 * @param event
 */
export function handleFeeActualized(event: FeeActualizedEvent): void {
  modules.streaming_fees.addStreamingFeeAccrue(event);
}

/**
 * Handler for the StreamingFeeUpdated event
 * Index the streaming fee update event
 *
 * @param event
 */
 export function handleStreamingFeeUpdated(event: StreamingFeeUpdatedEvent): void {
  modules.streaming_fees.addStreamingFeeUpdate(event);
}

/**
 * Handler for the FeeRecipientUpdated event
 * Index the fee recipient update event
 *
 * @param event
 */
 export function handleFeeRecipientUpdated(event: FeeRecipientUpdatedEvent): void {
  modules.streaming_fees.addFeeRecipientUpdate(event);
}
