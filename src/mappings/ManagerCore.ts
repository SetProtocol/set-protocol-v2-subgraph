import {
  FactoryAdded as FactoryAddedEvent,
  ManagerAdded as ManagerAddedEvent
} from "../../generated/ManagerCore/ManagerCore";
import { delegated_managers } from "../utils";

/**
 * Handler for FactoryAdded event
 * Bulk initialize factory templates (DelegatedManagerFactory)
 *
 * @param event
 */
export function handleFactoryAdded(event: FactoryAddedEvent): void {
  delegated_managers.createDelegatedManagerFactoryTemplate(event);
}

/**
 * Handler for ManagerAdded event
 * Index new DelegatedManager entities
 *
 * @param event
 */
export function handleManagerAdded(event: ManagerAddedEvent): void {
  // Note: currently unused handler
}
