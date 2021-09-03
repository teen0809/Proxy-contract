import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";

import { getProxyAddress, getRandomSalt } from "../../../shared/create2";

export default function shouldBehaveLikeDeploy(): void {
  const salt: string = getRandomSalt();
  let deployer: SignerWithAddress;
  let proxyAddress: string;

  beforeEach(async function () {
    deployer = this.signers.alice;
    proxyAddress = getProxyAddress.call(this, deployer.address, salt);
  });

  it("deploys the proxy", async function () {
    await this.contracts.prbProxyRegistry.connect(deployer).deploy(salt);
    const deployedBytecode: string = await ethers.provider.getCode(proxyAddress);
    expect(deployedBytecode).to.equal(this.artifacts.prbProxy.deployedBytecode);
  });

  it("updates the mapping", async function () {
    await this.contracts.prbProxyRegistry.connect(deployer).deploy(salt);
    const mappingProxyAddress: string = await this.contracts.prbProxyRegistry.proxies(deployer.address);
    expect(proxyAddress).to.equal(mappingProxyAddress);
  });
}
