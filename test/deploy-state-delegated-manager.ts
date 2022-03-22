/*
 * Deploy Hardhat Network State for Subgraph Tests
 * -----------------------------------------------
 * Deploy a test environment to hardhat for subgraph development
 *
 * Setup
 * - Deploy system
 * - Deploy ManagerCore and mock Extension
 *
 * Case 1: DelegatedManager managed SetToken
 * - Deploy SetToken
 * - Deploy DelegatedManager
 * - Add DelegatedManager to ManagerCore through factory
 * - Transfer ownership to DelegatedManager
 * - Update owner
 * - Update methodologist
 * - Add operatorTwo
 * - Remove operatorOne
 *
 * Case 2: EOA managed SetToken
 * - Deploy SetToken
 *
 * Case 3: DelegatedManager managed SetToken migrates to EOA manager
 * - Deploy SetToken
 * - Deploy DelegatedManager
 * - Add DelegatedManager to ManagerCore through factory
 * - Transfer ownership to DelegatedManager
 * - Set manager to EOA
 *
 * Case 4: Trivial DelegatedManager (owner/methodologist/operator all the same)
 * - Deploy SetToken
 * - Deploy DelegatedManager
 * - Add DelegatedManager to ManagerCore through factory
 * - Transfer ownership to DelegatedManager
 */

import "module-alias/register";
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
    factory,
    otherManager,
  ] = await getAccounts();

  // Setup
  // -----------------------------------------------

  // Deploy system
  const deployer = new DeployHelper(ownerOne.wallet);
  const setV2Setup = getSystemFixture(ownerOne.address);
  await setV2Setup.initialize();

  // Deploy ManagerCore and mock Extension
  const managerCore = await deployer.managerCore.deployManagerCore();
  await managerCore.initialize([factory.address]);
  const baseExtension = await deployer.mocks.deployBaseGlobalExtensionMock(managerCore.address);

  // Case 1: DelegatedManager managed SetToken
  // -----------------------------------------------

  // Deploy SetToken
  const setTokenOne = await setV2Setup.createSetToken(
    [setV2Setup.dai.address],
    [ether(1)],
    [setV2Setup.issuanceModule.address]
  );

  // Deploy DelegatedManager
  const delegatedManagerOne = await deployer.manager.deployDelegatedManager(
    setTokenOne.address,
    ownerOne.address,
    methodologistOne.address,
    [baseExtension.address],
    [operatorOne.address],
    [setV2Setup.usdc.address, setV2Setup.weth.address],
    true
  );

  // Add DelegatedManager to ManagerCore through factory
  await managerCore.connect(factory.wallet).addManager(delegatedManagerOne.address);

  // Transfer ownership to DelegatedManager
  await setTokenOne.setManager(delegatedManagerOne.address);

  // Update owner
  await delegatedManagerOne.connect(ownerOne.wallet).transferOwnership(ownerTwo.address);

  // Update methodologist
  await delegatedManagerOne.connect(methodologistOne.wallet).setMethodologist(methodologistTwo.address);

  // Add operatorTwo
  await delegatedManagerOne.connect(ownerTwo.wallet).addOperators([operatorTwo.address]);

  // Remove operatorOne
  await delegatedManagerOne.connect(ownerTwo.wallet).removeOperators([operatorOne.address]);

  // Case 2: EOA managed SetToken
  // -----------------------------------------------

  // Deploy SetToken
  await setV2Setup.createSetToken(
    [setV2Setup.dai.address],
    [ether(1)],
    [setV2Setup.issuanceModule.address]
  );

  // Case 3: DelegatedManager managed SetToken migrates to EOA manager
  // -----------------------------------------------

  // Deploy SetToken
  const setTokenTwo = await setV2Setup.createSetToken(
    [setV2Setup.dai.address],
    [ether(1)],
    [setV2Setup.issuanceModule.address]
  );

  // Deploy DelegatedManager
  const delegatedManagerTwo = await deployer.manager.deployDelegatedManager(
    setTokenTwo.address,
    ownerOne.address,
    methodologistOne.address,
    [baseExtension.address],
    [operatorOne.address],
    [setV2Setup.usdc.address, setV2Setup.weth.address],
    true
  );

  // Add DelegatedManager to ManagerCore through factory
  await managerCore.connect(factory.wallet).addManager(delegatedManagerTwo.address);

  // Transfer ownership to DelegatedManager
  await setTokenTwo.setManager(delegatedManagerTwo.address);

  // Transfer ownership to EOA
  await delegatedManagerTwo.setManager(otherManager.address);

  // Case 4: Trivial DelegatedManager (owner/methodologist/operator all the same)
  // -----------------------------------------------

  // Deploy SetToken
  const setTokenThree = await setV2Setup.createSetToken(
    [setV2Setup.dai.address],
    [ether(1)],
    [setV2Setup.issuanceModule.address]
  );

  // Deploy DelegatedManager
  const delegatedManagerThree = await deployer.manager.deployDelegatedManager(
    setTokenThree.address,
    operatorOne.address,
    operatorOne.address,
    [baseExtension.address],
    [operatorOne.address],
    [setV2Setup.usdc.address, setV2Setup.weth.address],
    true
  );

  // Add DelegatedManager to ManagerCore through factory
  await managerCore.connect(factory.wallet).addManager(delegatedManagerThree.address);

  // Transfer ownership to DelegatedManager
  await setTokenThree.setManager(delegatedManagerThree.address);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});