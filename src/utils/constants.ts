import { Address } from "@graphprotocol/graph-ts";

export namespace constants {

  // Static Controller ID for reference
  // There is only ever one Controller deployed per network
  export const CONTROLLER_ID = "1";

  // Zero address
  export const ZERO_ADDRESS = Address.fromString(
    '0x0000000000000000000000000000000000000000'
  );

  // Ordering must not change without updating mapping method getManagerType()
  // in utils/index.ts
  export const enum ManagerType {
    EXTERNAL_ACCOUNT_OR_CONTRACT,
    DELEGATED_MANAGER
  };

}
