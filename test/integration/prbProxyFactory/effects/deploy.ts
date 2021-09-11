import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";

import { SALT_ONE, SALT_ZERO } from "../../../../helpers/constants";
import { computeProxyAddress } from "../../../shared/create2";
import { getCloneDeployedBytecode } from "../../../shared/eip1167";

export default function shouldBehaveLikeDeploy(): void {
  let deployer: SignerWithAddress;
  let proxyAddress: string;

  beforeEach(async function () {
    deployer = this.signers.alice;
    proxyAddress = await computeProxyAddress.call(this, deployer.address);
  });

  it("deploys the proxy", async function () {
    await this.contracts.prbProxyFactory.connect(deployer).deploy();
    const deployedBytecode: string = await ethers.provider.getCode(proxyAddress);
    const expectedBytecode: string = getCloneDeployedBytecode(this.contracts.prbProxyImplementation.address);
    expect(deployedBytecode).to.equal(expectedBytecode);
  });

  it("updates the nextSalts mapping", async function () {
    await this.contracts.prbProxyFactory.connect(deployer).deploy();
    const nextSalt: string = await this.contracts.prbProxyFactory.getNextSalt(deployer.address);
    expect(nextSalt).to.equal(SALT_ONE);
  });

  it("updates the proxies mapping", async function () {
    await this.contracts.prbProxyFactory.connect(deployer).deploy();
    const isProxy: boolean = await this.contracts.prbProxyFactory.isProxy(proxyAddress);
    expect(isProxy).to.equal(true);
  });

  it("emits a DeployProxy event", async function () {
    await expect(this.contracts.prbProxyFactory.connect(deployer).deploy())
      .to.emit(this.contracts.prbProxyFactory, "DeployProxy")
      .withArgs(deployer.address, deployer.address, deployer.address, proxyAddress);
  });
}
