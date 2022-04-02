import {
  OwnershipTransferred as OwnershipTransferredEvent,
  MethodologistChanged as MethodologistChangedEvent,
  OperatorAdded as OperatorAddedEvent,
  OperatorRemoved as OperatorRemovedEvent,
} from "../../generated/templates/DelegatedManager/DelegatedManager";
import { delegated_managers } from "../utils";

/**
 * Handler for OwnershipTransferred event
 * Index the event and updates the owner on the DelegatedManager
 *
 * @param event
 */
export function handleOwnershipTransferred(event: OwnershipTransferredEvent): void {
  delegated_managers.updateOwner(event);
}

/**
 * Handler for MethodologistChanged event
 * Index the event and updates the methodologist on the DelegatedManager
 *
 * @param event
 */
export function handleMethodologistChanged(event: MethodologistChangedEvent): void {
  delegated_managers.updateMethodologist(event);
}

/**
 * Handler for OperatorAdded event
 * Index the event and updates the operator on the DelegatedManager
 *
 * @param event
 */
export function handleOperatorAdded(event: OperatorAddedEvent): void {
  delegated_managers.addOperator(event);
}

/**
 * Handler for OperatorRemoved event
 * Index the event and updates the operator on the DelegatedManager
 *
 * @param event
 */
export function handleOperatorRemoved(event: OperatorRemovedEvent): void {
  delegated_managers.removeOperator(event);
}
