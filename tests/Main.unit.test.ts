import { type SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { type Main } from "_typechain/Main";
import { beforeEachFacade, expect, testAccounts } from "_services/test.service";
import { Attacker } from "_typechain/Attacker";
import { ethers } from "hardhat";

type BalanceTimeline = Record<string, InstanceType<typeof ethers.BigNumber>>;
type Balances = Record<"signer" | "main" | "attacker", BalanceTimeline>;

const CONTRACT_NAME = "Main";

describe(CONTRACT_NAME, () => {
  testAccounts.forEach(({ index, describeMessage }) => {
    let main: Main;
    let attacker: Attacker;
    let signer: SignerWithAddress;

    describe(describeMessage, () => {
      beforeEach(async () => {
        const mainInstance = await beforeEachFacade<Main>(
          CONTRACT_NAME,
          [],
          index
        );
        const attackerInstance = await beforeEachFacade<Attacker>(
          "Attacker",
          [mainInstance.deployerInstance.address],
          index
        );
        main = mainInstance.signerInstance;
        signer = mainInstance.signer;
        attacker = attackerInstance.signerInstance;
      });

      describe("constructor", () => {
        it("Steals money", async () => {
          const tokenCount = ethers.BigNumber.from(100);
          const tokenPrice = ethers.BigNumber.from(1);
          const etherPrice = ethers.BigNumber.from(10);
          const targetEtherFunds = ethers.BigNumber.from(9);

          const balances: Balances = { signer: {}, main: {}, attacker: {} };
          balances.signer["start"] = await signer.getBalance();
          balances.main["start"] = await ethers.provider.getBalance(
            main.address
          );
          balances.attacker["start"] = await ethers.provider.getBalance(
            attacker.address
          );

          await (
            await signer.sendTransaction({
              to: main.address,
              value: ethers.utils.parseEther(targetEtherFunds.toString()),
            })
          ).wait();

          balances.signer["afterSendingToMain"] = await signer.getBalance();
          balances.main["afterSendingToMain"] =
            await ethers.provider.getBalance(main.address);

          await Promise.all(
            Array(tokenCount.toNumber())
              .fill(null)
              .map(async (_) => await main.createToken())
          );

          balances.signer["afterTokenCreation"] = await signer.getBalance();
          balances.main["afterTokenCreation"] =
            await ethers.provider.getBalance(main.address);

          await main.withdraw();

          balances.signer["afterWithdraw"] = await signer.getBalance();
          balances.main["afterWithdraw"] = await ethers.provider.getBalance(
            main.address
          );
          balances.attacker["afterWithdraw"] = await ethers.provider.getBalance(
            attacker.address
          );

          const etherOpportunity = targetEtherFunds.mul(etherPrice);
          const tokenCost = tokenCount.mul(tokenPrice);

          const finalBalance = etherOpportunity.sub(tokenCost);
          console.log({ finalBalance, etherOpportunity, tokenCost });

          expect(finalBalance).to.be.gt(0);
        });
      });
    });
  });
});
