import { BigInt } from "@graphprotocol/graph-ts";
import {
  ActivityLog,
  SetToken,
  SetTokenCount
} from "../../generated/schema";
import {
  SetTokenCreator as SetTokenCreatorTemplate,
  SetToken as SetTokenTemplate,
  StreamingFeeModule as StreamingFeeModuleTemplate,
  TradeModule as TradeModuleTemplate
} from "../../generated/templates";
import { SetAdded as ControllerSetAddedEvent } from "../../generated/Controller/Controller";
import { ModuleInitialized as ModuleInitializedEvent } from "../../generated/templates/SetToken/SetToken";
import { SetTokenCreated as SetTokenCreatedEvent } from "../../generated/templates/SetTokenCreator/SetTokenCreator";
import { constants, managers, getController } from "./";

export namespace sets {

  /**
   * Create Controller entity if it does not yet exist
   * Create new template for SetTokenCreator factory contract
   *
   * @param event
   */
  export function createSetTokenCreatorTemplate(event: ControllerSetAddedEvent): void {
    getController(event.address.toHexString());
    SetTokenCreatorTemplate.create(event.params._factory);
  }

  /**
   * Create new template for SetToken contract
   *
   * @param event
   */
  export function createSetTokenTemplate(event: SetTokenCreatedEvent): void {
    SetTokenTemplate.create(event.params._setToken);
  }

  /**
   * Create new module template on ModuleInitialized event trigger
   *
   * @param event
   */
  export function createModuleTemplate(event: ModuleInitializedEvent): void {
    // NOTE: Ideally, this would only trigger the appropriate template creation
    //       based on the module being initialised; however, as we cannot
    //       fingerprint the calling module from within the subgraph, it
    //       currently triggers for all modules, creating templates never used
    TradeModuleTemplate.create(event.params._module);
    StreamingFeeModuleTemplate.create(event.params._module);
  }

  /**
   * Index new SetTokenCreated event to SetToken entity
   *
   * @param event
   */
  export function createSetToken(event: SetTokenCreatedEvent): void {
    const id = event.params._setToken.toHexString();
    let set = new SetToken(id);
    set.controller = getController(constants.CONTROLLER_ID).id;
    set.address = id; // NOTE: The set.address field will be deprecated on new subgraph sync
    set.inception = event.block.timestamp;
    set.manager = managers.getManager(event.params._manager.toHexString()).id;
    set.name = event.params._name;
    set.symbol = event.params._symbol;
    // Create associated ActivityLog entity
    const activityLog = getActivityLog(id);
    set.activityLog = activityLog.id;
    set.save();
    // Increase SetTokenCounts on entity
    increaseSetTokenCount();
  }

  /**
   * Return existing or index new SetToken entity
   *
   * @param id  SetToken address
   * @returns   SetToken entity
   */
  export function getSetToken(id: string): SetToken {
    let set = SetToken.load(id);
    // Create SetToken if it doesn't exist
    // Required for SetTokens created by DelegatedManager
    if (!set) {
      set = new SetToken(id);
      set.save();
    }
    return set as SetToken;
  }

  /**
   * Incrementally increase SetTokenCount entity
   */
  export function increaseSetTokenCount(): void {
    let setTokenCount = SetTokenCount.load("1");
    if (!setTokenCount) {
      setTokenCount = new SetTokenCount("1");
      setTokenCount.count = BigInt.fromI32(1);
    } else {
      setTokenCount.count += BigInt.fromI32(1);
    }
    setTokenCount.save();
  }

  /**
   * Return existing or index new ActivityLog entity
   *
   * @param id
   * @returns
   */
  export function getActivityLog(id: string): ActivityLog {
    let activityLog = ActivityLog.load(id);
    if (!activityLog) {
      activityLog = new ActivityLog(id);
      activityLog.save();
    }
    return activityLog as ActivityLog;
  }

}