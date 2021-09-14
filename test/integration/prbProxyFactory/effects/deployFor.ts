import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";

import { computeFinalSalt } from "../../../../dist/salts";
import { SALT_ONE, SALT_ZERO } from "../../../../helpers/constants";
import { computeProxyAddress } from "../../../shared/create2";
import { getCloneDeployedBytecode } from "../../../shared/eip1167";

export default function shouldBehaveLikeDeployFor(): void {
  let deployer: SignerWithAddress;
  let expectedBytecode: string;
  let owner: SignerWithAddress;
  let proxyAddress: string;

  beforeEach(async function () {
    deployer = this.signers.alice;
    expectedBytecode = getCloneDeployedBytecode(this.contracts.prbProxyImplementation.address);
    owner = this.signers.bob;
    proxyAddress = await computeProxyAddress.call(this, deployer.address);
  });

  context("when the deployer is the same as the owner", function () {
    it("deploys the proxy", async function () {
      await this.contracts.prbProxyFactory.connect(deployer).deployFor(deployer.address);
      const deployedBytecode: string = await ethers.provider.getCode(proxyAddress);
      expect(deployedBytecode).to.equal(expectedBytecode);
    });
  });

  context("when the deployer is not the same as the owner", function () {
    it("deploys the proxy", async function () {
      await this.contracts.prbProxyFactory.connect(deployer).deployFor(owner.address);
      const deployedBytecode: string = await ethers.provider.getCode(proxyAddress);
      expect(deployedBytecode).to.equal(expectedBytecode);
    });

    it("updates the nextSalts mapping", async function () {
      await this.contracts.prbProxyFactory.connect(deployer).deployFor(owner.address);
      const nextSalt: string = await this.contracts.prbProxyFactory.getNextSalt(deployer.address);
      expect(nextSalt).to.equal(SALT_ONE);
    });

    it("updates the proxies mapping", async function () {
      await this.contracts.prbProxyFactory.connect(deployer).deployFor(owner.address);
      const isProxy: boolean = await this.contracts.prbProxyFactory.isProxy(proxyAddress);
      expect(isProxy).to.equal(true);
    });

    it("emits a DeployProxy event", async function () {
      await expect(this.contracts.prbProxyFactory.connect(deployer).deployFor(owner.address))
        .to.emit(this.contracts.prbProxyFactory, "DeployProxy")
        .withArgs(
          deployer.address,
          deployer.address,
          owner.address,
          SALT_ZERO,
          computeFinalSalt(deployer.address, SALT_ZERO),
          proxyAddress,
        );
    });
  });
}
