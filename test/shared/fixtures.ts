import { Signer } from "@ethersproject/abstract-signer";
import { artifacts, waffle } from "hardhat";
import { Artifact } from "hardhat/types";

import { PRBProxy__factory } from "../../src/types/factories/PRBProxy__factory";
import { PRBProxy } from "../../src/types/PRBProxy";
import { PRBProxyFactory } from "../../src/types/PRBProxyFactory";
import { PRBProxyRegistry } from "../../src/types/PRBProxyRegistry";
import { TargetChangeOwner } from "../../src/types/TargetChangeOwner";
import { TargetEcho } from "../../src/types/TargetEcho";
import { TargetEnvoy } from "../../src/types/TargetEnvoy";
import { TargetPanic } from "../../src/types/TargetPanic";
import { TargetRevert } from "../../src/types/TargetRevert";
import { TargetSelfDestruct } from "../../src/types/TargetSelfDestruct";

type IntegrationFixturePrbProxyReturnType = {
  prbProxy: PRBProxy;
  targets: {
    changeOwner: TargetChangeOwner;
    echo: TargetEcho;
    envoy: TargetEnvoy;
    panic: TargetPanic;
    revert: TargetRevert;
    selfDestruct: TargetSelfDestruct;
  };
};

export async function integrationFixturePrbProxy(signers: Signer[]): Promise<IntegrationFixturePrbProxyReturnType> {
  const deployer: Signer = signers[0];

  const prbProxyFactoryArtifact: Artifact = await artifacts.readArtifact("PRBProxyFactory");
  const prbProxyFactory: PRBProxyFactory = <PRBProxyFactory>(
    await waffle.deployContract(deployer, prbProxyFactoryArtifact, [])
  );

  const deployerAddress: string = await deployer.getAddress();
  const prbProxyAddress: string = await prbProxyFactory.connect(deployer).callStatic.deployFor(deployerAddress);
  await prbProxyFactory.connect(deployer).deployFor(deployerAddress);
  const prbProxy: PRBProxy = PRBProxy__factory.connect(prbProxyAddress, deployer);

  const targetChangeOwnerArtifact: Artifact = await artifacts.readArtifact("TargetChangeOwner");
  const targetChangeOwner: TargetChangeOwner = <TargetChangeOwner>(
    await waffle.deployContract(deployer, targetChangeOwnerArtifact, [])
  );

  const targetEchoArtifact: Artifact = await artifacts.readArtifact("TargetEcho");
  const targetEcho: TargetEcho = <TargetEcho>await waffle.deployContract(deployer, targetEchoArtifact, []);

  const targetEnvoyArtifact: Artifact = await artifacts.readArtifact("TargetEnvoy");
  const targetEnvoy: TargetEnvoy = <TargetEnvoy>await waffle.deployContract(deployer, targetEnvoyArtifact, []);

  const targetPanicArtifact: Artifact = await artifacts.readArtifact("TargetPanic");
  const targetPanic: TargetPanic = <TargetPanic>await waffle.deployContract(deployer, targetPanicArtifact, []);

  const targetRevertArtifact: Artifact = await artifacts.readArtifact("TargetRevert");
  const targetRevert: TargetRevert = <TargetRevert>await waffle.deployContract(deployer, targetRevertArtifact, []);

  const targetSelfDestructArtifact: Artifact = await artifacts.readArtifact("TargetSelfDestruct");
  const targetSelfDestruct: TargetSelfDestruct = <TargetSelfDestruct>(
    await waffle.deployContract(deployer, targetSelfDestructArtifact, [])
  );

  return {
    prbProxy,
    targets: {
      changeOwner: targetChangeOwner,
      echo: targetEcho,
      envoy: targetEnvoy,
      panic: targetPanic,
      revert: targetRevert,
      selfDestruct: targetSelfDestruct,
    },
  };
}

type IntegrationFixturePrbProxyFactoryReturnType = {
  prbProxy: PRBProxy;
  prbProxyFactory: PRBProxyFactory;
};

export async function integrationFixturePrbProxyFactory(
  signers: Signer[],
): Promise<IntegrationFixturePrbProxyFactoryReturnType> {
  const deployer: Signer = signers[0];

  const prbProxyArtifact: Artifact = await artifacts.readArtifact("PRBProxy");
  const prbProxy: PRBProxy = <PRBProxy>await waffle.deployContract(deployer, prbProxyArtifact, []);

  const prbProxyFactoryArtifact: Artifact = await artifacts.readArtifact("PRBProxyFactory");
  const prbProxyFactory: PRBProxyFactory = <PRBProxyFactory>(
    await waffle.deployContract(deployer, prbProxyFactoryArtifact, [])
  );

  return { prbProxy, prbProxyFactory };
}

type IntegrationFixturePrbProxyRegistryReturnType = {
  prbProxy: PRBProxy;
  prbProxyFactory: PRBProxyFactory;
  prbProxyRegistry: PRBProxyRegistry;
};

export async function integrationFixturePrbProxyRegistry(
  signers: Signer[],
): Promise<IntegrationFixturePrbProxyRegistryReturnType> {
  const deployer: Signer = signers[0];

  const prbProxyArtifact: Artifact = await artifacts.readArtifact("PRBProxy");
  const prbProxy: PRBProxy = <PRBProxy>await waffle.deployContract(deployer, prbProxyArtifact, []);

  const prbProxyFactoryArtifact: Artifact = await artifacts.readArtifact("PRBProxyFactory");
  const prbProxyFactory: PRBProxyFactory = <PRBProxyFactory>(
    await waffle.deployContract(deployer, prbProxyFactoryArtifact, [])
  );

  const prbProxyRegistryArtifact: Artifact = await artifacts.readArtifact("PRBProxyRegistry");
  const prbProxyRegistry: PRBProxyRegistry = <PRBProxyRegistry>(
    await waffle.deployContract(deployer, prbProxyRegistryArtifact, [prbProxyFactory.address])
  );

  return { prbProxy, prbProxyFactory, prbProxyRegistry };
}
