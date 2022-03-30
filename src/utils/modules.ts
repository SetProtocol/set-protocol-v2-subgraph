import {
  FeeRecipientUpdate,
  RebalanceTrade,
  StreamingFeeAccrue,
  StreamingFeeUpdate
 } from "../../generated/schema";
import {
  FeeActualized as FeeActualizedEvent,
  StreamingFeeUpdated as StreamingFeeUpdatedEvent,
  FeeRecipientUpdated as FeeRecipientUpdatedEvent
} from "../../generated/templates/StreamingFeeModule/StreamingFeeModule";
import { ComponentExchanged as ComponentExchangedEvent } from "../../generated/templates/TradeModule/TradeModule";
import { sets } from "./";

export namespace modules {

  /**
   * TRADE MODULE namespace
   */
  export namespace trade {

    /**
     * Index new ComponentExchanged event to RebalanceTrade entity
     *
     * @param event
     */
    export function addRebalanceTrade(event: ComponentExchangedEvent): void {
      const set = sets.getSetToken(event.params._setToken.toHexString());
      // Index the event
      const eventId = event.transaction.hash.toHexString();
      let trade = new RebalanceTrade(eventId);
      trade.timestamp = event.block.timestamp;
      trade.exchange = event.params._exchangeAdapter.toHexString();
      trade.sendToken = event.params._sendToken.toHexString();
      trade.receiveToken = event.params._receiveToken.toHexString();
      trade.totalSendAmount = event.params._totalSendAmount;
      trade.totalReceiveAmount = event.params._totalReceiveAmount;
      trade.fee = event.params._protocolFee;
      trade.activityLog = set.id;
      trade.save();
    }

  }

  /**
   * STREAMING FEES MODULE namespace
   */
  export namespace streaming_fees {

    /**
     * Index new FeeRecipientUpdated event to FeeRecipientUpdate entity
     *
     * @param event
     */
    export function addFeeRecipientUpdate(event: FeeRecipientUpdatedEvent): void {
      const set = sets.getSetToken(event.params._setToken.toHexString());
      // Index the event
      const eventId = event.transaction.hash.toHexString();
      let recipient = new FeeRecipientUpdate(eventId);
      recipient.timestamp = event.block.timestamp;
      recipient.address = event.params._newFeeRecipient.toHexString();
      recipient.activityLog = set.id;
      recipient.save();
    }

    /**
     * Index new FeeActualized event to StreamingFeeAccrue entity
     *
     * @param event
     */
    export function addStreamingFeeAccrue(event: FeeActualizedEvent): void {
      let set = sets.getSetToken(event.params._setToken.toHexString());
      // Index the event
      const eventId = event.transaction.hash.toHexString();
      let accrue = new StreamingFeeAccrue(eventId);
      accrue.timestamp = event.block.timestamp;
      accrue.managerFee = event.params._managerFee;
      accrue.protocolFee = event.params._protocolFee;
      accrue.activityLog = set.id;
      accrue.save();
    }

    /**
     * Index new StreamingFeeUpdated event to StreamingFeeUpdate entity
     *
     * @param event
     */
    export function addStreamingFeeUpdate(event: StreamingFeeUpdatedEvent): void {
      const set = sets.getSetToken(event.params._setToken.toHexString());
      // Index the event
      const eventId = event.transaction.hash.toHexString();
      let fee = new StreamingFeeUpdate(eventId);
      fee.timestamp = event.block.timestamp;
      fee.fee = event.params._newStreamingFee;
      fee.activityLog = set.id;
      fee.save();
    }

  }

}