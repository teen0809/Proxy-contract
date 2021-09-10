import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";

import { SALT_ZERO } from "../../../../helpers/constants";
import { computeProxyAddress } from "../../../shared/create2";
import { getCloneDeployedBytecode } from "../../../shared/eip1167";

export default function shouldBehaveLikeDeploy(): void {
  let deployer: SignerWithAddress;
  let proxyAddress: string;

  beforeEach(function () {
    deployer = this.signers.alice;
    proxyAddress = computeProxyAddress.call(this, deployer.address, SALT_ZERO);
  });

  it("deploys the proxy", async function () {
    await this.contracts.prbProxyRegistry.connect(deployer).deploy();
    const deployedBytecode: string = await ethers.provider.getCode(proxyAddress);
    const expectedBytecode: string = getCloneDeployedBytecode(this.contracts.prbProxyImplementation.address);
    expect(deployedBytecode).to.equal(expectedBytecode);
  });

  it("updates the proxies mapping", async function () {
    await this.contracts.prbProxyRegistry.connect(deployer).deploy();
    const newProxyAddress: string = await this.contracts.prbProxyRegistry.proxies(deployer.address, SALT_ZERO);
    expect(proxyAddress).to.equal(newProxyAddress);
  });
}
