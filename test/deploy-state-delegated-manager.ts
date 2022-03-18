// Deploy Hardhat Network State for Subgraph Tests
// -----------------------------------------------
// Deploy a test environment to hardhat for subgraph development
// - Setup
//   - Deploy system
//   - Deploy SetToken
//   - Deploy ManagerCore and mock Extension
//   - Deploy DelegatedManager
//   - Transfer ownership to DelegatedManager
//   - Add DelegatedManager to ManagerCore through factory
// - Trigger events for testing
//   - Update owner
//   - Update methodologist
//   - Add operatorTwo
//   - Remove operatorOne

import "module-alias/register";
import { ADDRESS_ZERO } from "@utils/constants";
import { getSystemFixture } from "@setprotocol/set-protocol-v2/utils/test/index";
import DeployHelper from "@utils/deploys";
import {
  ether,
  getAccounts,
} from "@utils/index";


async function main() {

  console.log("Starting deployment");

  const [
    ownerOne,
    ownerTwo,
    methodologistOne,
    methodologistTwo,
    operatorOne,
    operatorTwo,
    factory
  ] = await getAccounts();

  // Setup
  // -----------------------------------------------

  // Deploy system
  const deployer = new DeployHelper(ownerOne.wallet);
  const setV2Setup = getSystemFixture(ownerOne.address);
  await setV2Setup.initialize();

  // Deploy SetToken
  const setToken = await setV2Setup.createSetToken(
    [setV2Setup.dai.address],
    [ether(1)],
    [setV2Setup.issuanceModule.address]
  );
  await setV2Setup.issuanceModule.initialize(setToken.address, ADDRESS_ZERO);

  // Deploy ManagerCore and mock Extension
  const managerCore = await deployer.managerCore.deployManagerCore();
  const baseExtension = await deployer.mocks.deployBaseGlobalExtensionMock(managerCore.address);

  // Deploy DelegatedManager
  const delegatedManager = await deployer.manager.deployDelegatedManager(
    setToken.address,
    ownerOne.address,
    methodologistOne.address,
    [baseExtension.address],
    [operatorOne.address],
    [setV2Setup.usdc.address, setV2Setup.weth.address],
    true
  );

  // Transfer ownership to DelegatedManager
  await setToken.setManager(delegatedManager.address);

  // Add DelegatedManager to ManagerCore through factory
  await managerCore.initialize([factory.address]);
  await managerCore.connect(factory.wallet).addManager(delegatedManager.address);

  // Trigger events for testing
  // -----------------------------------------------

  // Update owner
  await delegatedManager.connect(ownerOne.wallet).transferOwnership(ownerTwo.address);

  // Update methodologist
  await delegatedManager.connect(methodologistOne.wallet).setMethodologist(methodologistTwo.address);

  // Add operatorTwo
  await delegatedManager.connect(ownerTwo.wallet).addOperators([operatorTwo.address]);

  // Remove operatorOne
  await delegatedManager.connect(ownerTwo.wallet).removeOperators([operatorOne.address]);

}

main().catch(e => {
  console.error(e);
  process.exit(1);
});