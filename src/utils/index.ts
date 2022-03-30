import { Controller } from "../../generated/schema";
import { constants } from "./constants";

export * from "./constants";
export * from "./managers";
export * from "./modules";
export * from "./sets";

/**
 * Return existing or index new Manager entity
 *
 * @param id    address of the Controller
 * @returns     Controller entity
 */
export function getController(address: string): Controller {
  let controller = Controller.load(constants.CONTROLLER_ID);
  if (!controller) {
    controller = new Controller(constants.CONTROLLER_ID);
    controller.address = address;
    controller.save();
  }
  return controller as Controller;
}
