import { AddressZero } from "@ethersproject/constants";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";

import { computeFinalSalt, generateRandomSalt } from "../../../../dist/salts";
import { PRBProxy__factory } from "../../../../typechain/factories/PRBProxy__factory";
import { PRBProxy } from "../../../../typechain/PRBProxy";
import { computeProxyAddress } from "../../../shared/create2";
import { getCloneDeployedBytecode } from "../../../shared/eip1167";
import { OwnableErrors, PRBProxyRegistryErrors } from "../../../shared/errors";

export default function shouldBehaveLikeDeployFor(): void {
  const salt: string = generateRandomSalt();
  let deployer: SignerWithAddress;
  let expectedBytecode: string;
  let owner: SignerWithAddress;
  let proxyAddress: string;

  beforeEach(function () {
    deployer = this.signers.alice;
    expectedBytecode = getCloneDeployedBytecode(this.contracts.prbProxyImplementation.address);
    owner = this.signers.bob;
    proxyAddress = computeProxyAddress.call(this, deployer.address, salt);
  });

  context("when the owner is the zero address", function () {
    it("reverts", async function () {
      await expect(this.contracts.prbProxyRegistry.connect(deployer).deployFor(AddressZero, salt)).to.be.revertedWith(
        OwnableErrors.OwnerZeroAddress,
      );
    });
  });

  context("when the proxy is not the zero address", function () {
    context("when the proxy exists for the owner", function () {
      beforeEach(async function () {
        await this.contracts.prbProxyRegistry.connect(deployer).deployFor(owner.address, salt);
      });

      it("reverts", async function () {
        await expect(
          this.contracts.prbProxyRegistry.connect(deployer).deployFor(owner.address, salt),
        ).to.be.revertedWith(PRBProxyRegistryErrors.ProxyAlreadyDeployed);
      });
    });

    context("when the proxy does not exist for the owner", function () {
      context("when the owner transferred ownership", function () {
        let thirdParty: SignerWithAddress;

        beforeEach(async function () {
          thirdParty = this.signers.carol;

          await this.contracts.prbProxyRegistry.connect(deployer).deployFor(owner.address, salt);
          const prbProxy: PRBProxy = PRBProxy__factory.connect(proxyAddress, owner);
          await prbProxy.connect(owner).transferOwnership(thirdParty.address);
        });

        it("deploys the proxy", async function () {
          const newSalt: string = generateRandomSalt();
          await this.contracts.prbProxyRegistry.connect(deployer).deployFor(owner.address, newSalt);

          const newProxyAddress: string = computeProxyAddress.call(this, deployer.address, newSalt);
          const deployedBytecode: string = await ethers.provider.getCode(newProxyAddress);
          expect(deployedBytecode).to.equal(expectedBytecode);
        });
      });

      context("when the owner did not transfer ownership", function () {
        context("when the deployer is the same as the owner", function () {
          it("deploys the proxy", async function () {
            await this.contracts.prbProxyRegistry.connect(deployer).deployFor(deployer.address, salt);
            const deployedBytecode: string = await ethers.provider.getCode(proxyAddress);
            expect(deployedBytecode).to.equal(expectedBytecode);
          });
        });

        context("when the deployer is not the same as the owner", function () {
          context("when the salt was used", function () {
            beforeEach(async function () {
              await this.contracts.prbProxyRegistry.connect(deployer).deployFor(owner.address, salt);
            });

            it("reverts", async function () {
              await expect(
                this.contracts.prbProxyRegistry.connect(deployer).deployFor(owner.address, salt),
              ).to.be.revertedWith(PRBProxyRegistryErrors.ProxyAlreadyDeployed);
            });
          });

          context("when the salt was not used", function () {
            context("when it is the first proxy of the user", function () {
              it("deploys the proxy", async function () {
                await this.contracts.prbProxyRegistry.connect(deployer).deployFor(owner.address, salt);
                const deployedBytecode: string = await ethers.provider.getCode(proxyAddress);
                expect(deployedBytecode).to.equal(expectedBytecode);
              });

              it("updates the mapping", async function () {
                await this.contracts.prbProxyRegistry.connect(deployer).deployFor(owner.address, salt);
                const newProxyAddress: string = await this.contracts.prbProxyRegistry.proxies(owner.address, salt);
                expect(proxyAddress).to.equal(newProxyAddress);
              });
            });

            context("when it is the second proxy of the user", function () {
              const newSalt: string = generateRandomSalt();
              let proxyAddress: string;

              beforeEach(function () {
                proxyAddress = computeProxyAddress.call(this, deployer.address, newSalt);
              });

              it("deploys the proxy", async function () {
                await this.contracts.prbProxyRegistry.connect(deployer).deployFor(owner.address, newSalt);
                const deployedBytecode: string = await ethers.provider.getCode(proxyAddress);
                expect(deployedBytecode).to.equal(expectedBytecode);
              });

              it("updates the mapping", async function () {
                await this.contracts.prbProxyRegistry.connect(deployer).deployFor(owner.address, newSalt);
                const newProxyAddress: string = await this.contracts.prbProxyRegistry.proxies(owner.address, newSalt);
                expect(proxyAddress).to.equal(newProxyAddress);
              });
            });
          });
        });
      });
    });
  });
}
