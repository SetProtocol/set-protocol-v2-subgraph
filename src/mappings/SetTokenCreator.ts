import { SetTokenCreated as SetTokenCreatedEvent } from "../../generated/templates/SetTokenCreator/SetTokenCreator";
import { sets } from "../utils";

/**
 * Handler for SetTokenCreated event in SetToken contract
 * Instantiate the SetToken template and index the new SetToken
 *
 * @param event
 */
export function handleSetTokenCreated(event: SetTokenCreatedEvent): void {
  sets.createSetTokenTemplate(event);
  sets.createSetToken(event);
}
