import {
  FactoryAdded as FactoryAddedEvent,
  SetAdded as SetAddedEvent,
  ModuleAdded as ModuleAddedEvent
} from "../../generated/Controller/Controller";
import { sets } from "../utils";

/**
 * Handler for FactoryAdded event
 * Bulk initialize factory templates (SetTokenCreator)
 *
 * @param event
 */
export function handleFactoryAdded(event: FactoryAddedEvent): void {
  // NOTE: Not fired on Controller.initialize(); cannot use for subgraph template instantiation
}

/**
 * Handler for ModuleAdded event
 * Bulk initialize Module templates (StreamingFeeModule, TradeModule)
 *
 * @param event
 */
export function handleModuleAdded(event: ModuleAddedEvent): void {
  // NOTE: Not fired on Controller.initialize(); cannot use for subgraph template instantiation
}

/**
 * Handler for SetAdded event
 * Bulk initialize factory templates (SetTokenCreator)
 *
 * @param event
 */
export function handleSetAdded(event: SetAddedEvent): void {
  sets.createSetTokenCreatorTemplate(event);
}
