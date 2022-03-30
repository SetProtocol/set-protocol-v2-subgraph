import { log } from "@graphprotocol/graph-ts";
import {
  DelegatedManager,
  Manager,
  ManagerUpdate,
  Methodologist,
  MethodologistUpdate,
  Operator,
  OperatorUpdate,
  Owner,
  OwnerUpdate
} from "../../generated/schema";
import {
  DelegatedManagerFactory as DelegatedManagerFactoryTemplate,
  DelegatedManager as DelegatedManagerTemplate
} from "../../generated/templates";
import {
  FactoryAdded as ManagerCoreFactoryAddedEvent,
  ManagerAdded as ManagerCoreManagerAddedEvent
} from "../../generated/ManagerCore/ManagerCore";
import { ManagerEdited as ManagerEditedEvent } from "../../generated/templates/SetToken/SetToken";
import {
  DelegatedManagerCreated as DelegatedManagerCreatedEvent,
  DelegatedManagerInitialized as DelegatedManagerInitializedEvent
} from "../../generated/templates/DelegatedManagerFactory/DelegatedManagerFactory";
import {
  OwnershipTransferred as OwnershipTransferredEvent,
  MethodologistChanged as MethodologistChangedEvent,
  OperatorAdded as OperatorAddedEvent,
  OperatorRemoved as OperatorRemovedEvent,
} from "../../generated/templates/DelegatedManager/DelegatedManager";
import { constants, sets } from "./";

/**
 * MANAGERS namespace
 */
export namespace managers {

  /**
   * Create new Manager entity and update protocol manager count
   *
   * @param id  manager address
   * @returns   manager entity
   */
  function createNewManager(id: string): Manager {
    let manager = new Manager(id);
    manager.address = id; // NOTE: The manager.address field will be deprecated on new subgraph sync
    if (DelegatedManager.load(manager.id)) {
      manager.type = getManagerTypeString(constants.ManagerType.DELEGATED_MANAGER);
    }
    else {
      manager.type = getManagerTypeString(constants.ManagerType.EXTERNAL_ACCOUNT_OR_CONTRACT);
    }
    manager.save();
    return manager;
  }

  /**
   * Return existing or index new Manager entity
   *
   * @param id  manager address
   * @returns   manager entity
   */
  export function getManager(id: string): Manager {
    let manager = Manager.load(id);
    // Create manager if they don't exist
    if (!manager) {
      manager = createNewManager(id);
    }
    return manager as Manager;
  }

  /**
   * Mapping method for ManagerType enum in constants namespace to string
   *
   * @param type  enum index number
   * @returns     string ManagerType
   */
  export function getManagerTypeString(type: number): string {
    if (type == 1) return "DelegatedManager";
    else return "ExternalAccountOrContract";  // default (type == 0)
  }

  /**
   * Index new ManagerEdited event to ManagerUpdate entity and update Manager
   * and SetToken
   *
   * @param event
   */
  export function update(event: ManagerEditedEvent): void {
    let set = sets.getSetToken(event.address.toHexString());
    let manager = getManager(event.params._newManager.toHexString());
    const oldManagerId = event.params._oldManager.toHexString();
    // If old manager was DelegatedManager, must remove SetToken from
    // associated Owner, Methodologist, and Operators
    if (delegated_managers.isDelegatedManager(oldManagerId)) {
      let dm = delegated_managers.getDelegatedManager(oldManagerId);
      delegated_managers.unmapSetTokenFromDelegatedManager(dm, set.id);
    }
    // Index the event
    const id = event.transaction.hash.toHexString();
    let managerUpdate = new ManagerUpdate(id);
    managerUpdate.timestamp = event.block.timestamp;
    managerUpdate.oldManager = set.manager; // old manager
    managerUpdate.newManager = manager.id; //  new manager
    managerUpdate.activityLog = set.id;
    managerUpdate.save();
    // Update Manager data
    if (delegated_managers.isDelegatedManager(manager.id)) {
      manager.type = getManagerTypeString(constants.ManagerType.DELEGATED_MANAGER);
    } else {
      manager.type = getManagerTypeString(constants.ManagerType.EXTERNAL_ACCOUNT_OR_CONTRACT);
    }
    manager.save();
    // Save the new manager to the SetToken
    set.manager = manager.id;
    set.save();
  }

}

/**
 * DELEGATED MANAGERS namespace
 */
export namespace delegated_managers {

  /**
   * Create new template for DelegatedManagerFactory
   *
   * @param event
   */
  export function createDelegatedManagerFactoryTemplate(event: ManagerCoreFactoryAddedEvent): void {
    DelegatedManagerFactoryTemplate.create(event.params._factory);
  }

  /**
   * Create new entity template on DelegatedManagerCreated event trigger
   *
   * @param event
   */
  export function createDelegatedManagerTemplate(event: DelegatedManagerCreatedEvent): void {
    DelegatedManagerTemplate.create(event.params._manager);
  }

  /**
   * Create new DelegatedManager entity
   *
   * @param event
   */
  export function createDelegatedManager(event: DelegatedManagerCreatedEvent): void {
    let delegatedManager = new DelegatedManager(event.params._manager.toHexString());
    delegatedManager.setToken = event.params._setToken.toHexString();
    delegatedManager.save();
  }

  /**
   * Check if an address is a DelegatedManager entity
   *
   * @param id  ID of the DelegatedManager
   * @returns   true if is DelegatedManager, otherwise false
   */
  export function isDelegatedManager(id: string): boolean {
    let delegatedManager = DelegatedManager.load(id);
    if (delegatedManager) return true;
    return false;
  }

  /**
   * Return existing DelegatedManager, or throw critical error
   *
   * @param id  ID of the DelegatedManager
   * @returns   DelegatedManager entity
   */
  export function getDelegatedManager(id: string): DelegatedManager {
    let delegatedManager = DelegatedManager.load(id);
    if (!delegatedManager) log.critical("DelegatedManager not found for id {}", [id]);
    return delegatedManager as DelegatedManager;
  }

  /**
   * Return existing or index new Owner entity
   *
   * @param id  owner address
   * @returns   Owner entity
   */
  export function getOwner(id: string): Owner {
    let owner = Owner.load(id);
    // Create owner if they don't exist
    if (!owner) {
      owner = new Owner(id);
      owner.save();
    }
    return owner as Owner;
  }

  /**
   * Return existing or index new Methodologist entity
   *
   * @param id  methodologist address
   * @returns   Methodologist entity
   */
  export function getMethodologist(id: string): Methodologist {
    let methodologist = Methodologist.load(id);
    // Create methodologist if they don't exist
    if (!methodologist) {
      methodologist = new Methodologist(id);
      methodologist.save();
    }
    return methodologist as Methodologist;
  }

  /**
   * Return existing or index new Operator entity
   *
   * @param id  operator address
   * @returns   Operator entity
   */
  export function getOperator(id: string): Operator {
    let operator = Operator.load(id);
    // Create operator if they don't exist
    if (!operator) {
      operator = new Operator(id);
      operator.save();
    }
    return operator as Operator;
  }

  /**
   * Update manager on SetToken from DelegatedManagerInitialized event
   *
   * @param event
   */
  export function updateSetTokenManager(event: DelegatedManagerInitializedEvent): void {
    let manager = managers.getManager(event.params._manager.toHexString());
    manager.type = managers.getManagerTypeString(constants.ManagerType.DELEGATED_MANAGER);
    manager.save();
    let set = sets.getSetToken(event.params._setToken.toHexString());
    set.manager = manager.id;
    set.save();
    // Index the event in the ManagerUpdate entity
    // This is required here because the SetToken ManagerEdited event is not
    // fired when migrating a SetToken from an EOA to DelegatedManager
    const eventId = event.transaction.hash.toHexString();
    let managerUpdate = new ManagerUpdate(eventId);
    managerUpdate.timestamp = event.block.timestamp;
    managerUpdate.oldManager = set.manager; // old manager
    managerUpdate.newManager = manager.id; //  new manager
    managerUpdate.activityLog = set.id;
    managerUpdate.save();
  }

  /**
   * Index new OwnershipTransferred event to OwnerUpdate entity and update
   * DelegatedManager
   *
   * @param event
   */
  export function updateOwner(event: OwnershipTransferredEvent): void {
    let owner = getOwner(event.params.newOwner.toHexString());
    // Index new owner on the DelegatedManager
    let delegatedManager = getDelegatedManager(event.address.toHexString());
    delegatedManager.owner = owner.id;
    delegatedManager.save();
    // Add SetToken to new Owner entity
    const setId = (delegatedManager.setToken != null) ? delegatedManager.setToken as string : constants.ZERO_ADDRESS.toHexString();
    mapSetTokenToAddress(owner, setId);
    // Remove SetToken from previous Owner (if not ZERO_ADDRESS)
    const previousOwnerId = event.params.previousOwner.toHexString();
    if (previousOwnerId != constants.ZERO_ADDRESS.toHexString()) {
      let previousOwner = getOwner(previousOwnerId);
      unmapSetTokenFromAddress(previousOwner, setId);
    }
    // Index the event
    const eventId = event.transaction.hash.toHexString();
    let ownerUpdate = new OwnerUpdate(eventId);
    ownerUpdate.timestamp = event.block.timestamp;
    ownerUpdate.address = owner.id;
    ownerUpdate.activityLog = setId;
    ownerUpdate.save();
  }

  /**
   * Index new MethodologistChanged event to MethodologistUpdate entity and update
   * DelegatedManager
   *
   * @param event
   */
  export function updateMethodologist(event: MethodologistChangedEvent): void {
    let methodologist = getMethodologist(event.params._newMethodologist.toHexString());
    // Index new methodologist on the DelegatedManager
    let delegatedManager = getDelegatedManager(event.address.toHexString());
    const oldMethodologistId = delegatedManager.methodologist;
    delegatedManager.methodologist = methodologist.id;
    delegatedManager.save();
    // Add SetToken to Methodologist entity
    const setId = (delegatedManager.setToken != null) ? delegatedManager.setToken as string : constants.ZERO_ADDRESS.toHexString();
    mapSetTokenToAddress(methodologist, setId);
    // Remove SetToken from previous Methodologist entity, if it was set
    if (oldMethodologistId) {
      let oldMethodologist = getMethodologist(oldMethodologistId);
      unmapSetTokenFromAddress(oldMethodologist, setId);
    }
    // Index the event
    const eventId = event.transaction.hash.toHexString();
    let methodologistUpdate = new MethodologistUpdate(eventId);
    methodologistUpdate.timestamp = event.block.timestamp;
    methodologistUpdate.address = methodologist.id;
    methodologistUpdate.activityLog = setId;
    methodologistUpdate.save();
  }

  /**
   * Index new OperatorAdded event to OperatorUpdate entity and update
   * DelegatedManager
   *
   * @param event
   */
  export function addOperator(event: OperatorAddedEvent): void {
    let operator = getOperator(event.params._operator.toHexString());
    let delegatedManager = getDelegatedManager(event.address.toHexString());
    // Add SetToken to Operator entity
    const setId = (delegatedManager.setToken != null) ? delegatedManager.setToken as string : constants.ZERO_ADDRESS.toHexString() as string;
    mapSetTokenToAddress(operator, setId);
    // Add Operator on DelegatedManager
    let operators = delegatedManager.operators;
    if (!operators) operators = [operator.id];
    else operators.push(operator.id);
    delegatedManager.operators = operators;
    delegatedManager.save();
    // Index the event
    const eventId = event.transaction.hash.toHexString();
    let operatorUpdate = new OperatorUpdate(eventId);
    operatorUpdate.action = "OperatorAdded";
    operatorUpdate.timestamp = event.block.timestamp;
    operatorUpdate.address = operator.id;
    operatorUpdate.activityLog = setId;
    operatorUpdate.save();
  }

  /**
   * Index new OperatorRemoved event to OperatorUpdate entity and update
   * DelegatedManager to remove Operator
   *
   * @param event
   */
  export function removeOperator(event: OperatorRemovedEvent): void {
    let operator = getOperator(event.params._operator.toHexString());
    let delegatedManager = getDelegatedManager(event.address.toHexString());
    // Remove SetToken from Operator entity
    const setId = (delegatedManager.setToken != null) ? delegatedManager.setToken as string : constants.ZERO_ADDRESS.toHexString() as string;
    unmapSetTokenFromAddress(operator, setId);
    // Remove Operator from DelegatedManager
    const operators = delegatedManager.operators;
    if (operators) {
      let newOperatorsArray = new Array<string>(0);
      for (let i = 0; i < operators.length; i++)
        if (operators[i] != operator.id)
          newOperatorsArray.push(operators[i]);
      delegatedManager.operators = newOperatorsArray;
      delegatedManager.save();
    }
    // Index the event
    const eventId = event.transaction.hash.toHexString();
    let operatorUpdate = new OperatorUpdate(eventId);
    operatorUpdate.action = "OperatorRemoved";
    operatorUpdate.timestamp = event.block.timestamp;
    operatorUpdate.address = operator.id;
    operatorUpdate.activityLog = setId;
    operatorUpdate.save();
  }

  /**
   * Map a SetToken address to a given user (Owner, Methodologist, or Operator)
   *
   * @param user  Owner, Methodologist, or Operator entity
   * @param setId ID of the SetToken to add
   */
  export function mapSetTokenToAddress<T>(user: T, setId: string): void {
    // Do not map to ZERO_ADDRESS
    if (user.id == constants.ZERO_ADDRESS.toHexString()) return;
    let setTokens = user.setTokens;
    if (!setTokens) setTokens = [setId];
    else setTokens.push(setId);
    user.setTokens = setTokens;
    user.save();
  }

  /**
   * Remove a SetToken address mapped to a given user (Owner, Methodologist,
   * or Operator)
   *
   * @param user  Owner, Methodologist, or Operator entity
   * @param setId ID of the SetToken to remove
   */
  export function unmapSetTokenFromAddress<T>(user: T, setId: string): void {
    const setTokens = user.setTokens;
    if (!setTokens) return;
    let newSet = new Array<string>(0);
    for (let i = 0; i < setTokens.length; i++)
      if (setTokens[i] != setId)
        newSet.push(setTokens[i]);
    user.setTokens = newSet;
    user.save();
  }

  /**
   * Remove a SetToken from a DelegatedManager's Owner, Methodologist, and Operators
   * For when a DM-managed SetToken is moved to an EOA manager
   *
   * @param delegatedManager  DelegatedManager entity
   * @param setId             ID of the SetToken to remove
   */
  export function unmapSetTokenFromDelegatedManager(delegatedManager: DelegatedManager, setId: string): void {
    // Remove Owner mapping
    const ownerId = delegatedManager.owner;
    if (ownerId) {
      let owner = getOwner(ownerId);
      unmapSetTokenFromAddress(owner, setId);
    }
    // Remove Methodologist mapping
    const methodologistId = delegatedManager.methodologist;
    if (methodologistId) {
      let methodologist = getMethodologist(methodologistId);
      unmapSetTokenFromAddress(methodologist, setId);
    }
    // Remove Operator mapping
    const operators = delegatedManager.operators;
    if (operators) {
      for (let i = 0; i < operators.length; i++) {
        const operatorId = operators[i];
        let operator = getOperator(operatorId);
        unmapSetTokenFromAddress(operator, setId);
      }
    }
  }

}