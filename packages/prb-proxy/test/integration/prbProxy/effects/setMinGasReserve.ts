import { Zero } from "@ethersproject/constants";
import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";

import { PRBProxyErrors } from "../../../shared/errors";
import { bn } from "../../../shared/numbers";

export function shouldBehaveLikeSetMinGasReserve(): void {
  let owner: SignerWithAddress;

  beforeEach(async function () {
    owner = this.signers.alice;
  });

  context("when the caller is not the owner", function () {
    it("reverts", async function () {
      const raider: SignerWithAddress = this.signers.bob;
      await expect(this.contracts.prbProxy.connect(raider).setMinGasReserve(Zero)).to.be.revertedWith(
        PRBProxyErrors.NOT_OWNER,
      );
    });
  });

  context("when the caller is the owner", function () {
    it("sets the min gas reserve", async function () {
      await this.contracts.prbProxy.connect(owner).setMinGasReserve(bn("5001"));
      const newMinGasReserve = await this.contracts.prbProxy.minGasReserve();
      expect(newMinGasReserve).to.equal(bn("5001"));
    });
  });
}
