import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";

import { generateRandomSalt } from "../../../../dist/salts";
import { computeProxyAddress } from "../../../shared/create2";
import { getCloneDeployedBytecode } from "../../../shared/eip1167";

export default function shouldBehaveLikeDeploy(): void {
  const salt: string = generateRandomSalt();
  let deployer: SignerWithAddress;
  let proxyAddress: string;

  beforeEach(function () {
    deployer = this.signers.alice;
    proxyAddress = computeProxyAddress.call(this, deployer.address, salt);
  });

  it("deploys the proxy", async function () {
    await this.contracts.prbProxyFactory.connect(deployer).deploy(salt);
    const deployedBytecode: string = await ethers.provider.getCode(proxyAddress);
    const expectedBytecode: string = getCloneDeployedBytecode(this.contracts.prbProxyImplementation.address);
    expect(deployedBytecode).to.equal(expectedBytecode);
  });

  it("updates the mapping", async function () {
    await this.contracts.prbProxyFactory.connect(deployer).deploy(salt);
    const isProxy: boolean = await this.contracts.prbProxyFactory.isProxy(proxyAddress);
    expect(isProxy).to.equal(true);
  });

  it("emits a DeployProxy event", async function () {
    await expect(this.contracts.prbProxyFactory.connect(deployer).deploy(salt))
      .to.emit(this.contracts.prbProxyFactory, "DeployProxy")
      .withArgs(deployer.address, deployer.address, proxyAddress);
  });
}
