// Deploy Hardhat Network State for Subgraph Tests
// -----------------------------------------------
// Deploy a test environment to hardhat for subgraph development
// - Deploy system

import "module-alias/register";
import { getAccounts, getSystemFixture } from "@utils/test/index";
import { DeployHelper } from "@setprotocol/set-v2-strategies/utils/deploys";


async function main() {

  console.log("Starting deployment");

  const [owner] = await getAccounts();

  // Deploy system
  const deployer = new DeployHelper(owner.wallet);
  const setup = getSystemFixture(owner.address);
  await setup.initialize();

  managerCore = await deployer.managerCore.deployManagerCore();

}

main().catch(e => {
  console.error(e);
  process.exit(1);
});