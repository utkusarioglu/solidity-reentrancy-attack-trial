import { strict as assert } from "assert";
import { DeployFunction } from "hardhat-deploy/dist/types";

const deployer: DeployFunction = async ({
  deployments: { deploy },
  getNamedAccounts,
  storageLayout,
}) => {
  const { deployer, user1 } = await getNamedAccounts();
  assert(!!deployer, "Deployer not available");
  const mainContractName = "Main";
  const mainInstance = (await deploy(mainContractName, {
    from: deployer,
    args: [],
  })) as any; // #1
  await storageLayout.export();
  console.log(`"${mainContractName}" deployed at ${mainInstance.address}`);

  const attackerContractName = "Attacker";
  const attackerInstance = (await deploy(attackerContractName, {
    from: user1!,
    args: [mainInstance.address],
  })) as any;
  await storageLayout.export();
  console.log(
    `"${attackerContractName}" deployed at ${attackerInstance.address}`
  );
};

export default deployer;
