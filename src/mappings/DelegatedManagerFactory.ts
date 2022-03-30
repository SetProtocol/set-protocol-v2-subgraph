import {
  DelegatedManagerCreated as DelegatedManagerCreatedEvent,
  DelegatedManagerInitialized as DelegatedManagerInitializedEvent,
} from "../../generated/templates/DelegatedManagerFactory/DelegatedManagerFactory";
import { delegated_managers } from "../utils";

/**
 * Handler for DelegatedManagerCreated event
 * Initialize DelegatedManager template, and index ManagerUpdate entity
 *
 * @param event
 */
export function handleDelegatedManagerCreated(event: DelegatedManagerCreatedEvent): void {
  delegated_managers.createDelegatedManagerTemplate(event);
  delegated_managers.createDelegatedManager(event);
}

/**
 * Handler for DelegatedManagerInitialized event
 * Update SetToken manager with DelegatedManager address
 *
 * @param event
 */
export function handleDelegatedManagerInitialized(event: DelegatedManagerInitializedEvent): void {
  delegated_managers.updateSetTokenManager(event);
}
