// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.4;

/// @title IPRBProxyFactory
/// @author Paul Razvan Berg
/// @notice Deploys new proxy instances with CREATE2.
interface IPRBProxyFactory {
    /// EVENTS ///

    event DeployProxy(
        address indexed origin,
        address indexed deployer,
        address indexed owner,
        bytes32 salt,
        bytes32 finalSalt,
        address proxy
    );

    /// PUBLIC CONSTANT FUNCTIONS ///

    /// @notice Gets the next salt that will be used to deploy the proxy.
    /// @param eoa The externally owned account which deployed proxies.
    function getNextSalt(address eoa) external view returns (bytes32 result);

    /// @notice Mapping to track all deployed proxies.
    /// @param proxy The address of the proxy to make the check for.
    function isProxy(address proxy) external view returns (bool result);

    /// PUBLIC NON-CONSTANT FUNCTIONS ///

    /// @notice Deploys a new proxy via CREATE2.
    /// @dev Sets "msg.sender" as the owner of the proxy.
    /// @return proxy The address of the newly deployed proxy contract.
    function deploy() external returns (address payable proxy);

    /// @notice Deploys a new proxy via CREATE2, for the given owner.
    /// @param owner The owner of the proxy.
    /// @return proxy The address of the newly deployed proxy contract.
    function deployFor(address owner) external returns (address payable proxy);
}
