import { ComponentExchanged as ComponentExchangedEvent } from "../../generated/templates/TradeModule/TradeModule";
import { modules } from "../utils";

/**
 * Handler for ComponentExchanged event
 * Index the rebalance trade event
 *
 * @param event
 */
 export function handleComponentExchanged(event: ComponentExchangedEvent): void {
  modules.trade.addRebalanceTrade(event);
}