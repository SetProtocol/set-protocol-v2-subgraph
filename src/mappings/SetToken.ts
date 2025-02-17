import {
  ManagerEdited as ManagerEditedEvent,
  ModuleInitialized as ModuleInitializedEvent
} from "../../generated/templates/SetToken/SetToken";
import { managers, sets } from "../utils";

/**
 * Handler for ModuleInitialized event
 * Initialize module templates on a SetToken
 *
 * @param event
 */
export function handleModuleInitialized(event: ModuleInitializedEvent): void {
  sets.createModuleTemplate(event);
}

/**
 * Handler for ManagerEdited event
 * Index the event and updates the manager on the given SetToken
 *
 * @param event
 */
export function handleManagerEdited(event: ManagerEditedEvent): void {
  managers.update(event);
}
