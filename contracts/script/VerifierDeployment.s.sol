pragma solidity ^0.8.23;

import "forge-std/Script.sol";
import "../src/Verifier.sol";


//Deploy contract: forge script script/VerifierDeployment.s.sol VerifierDeployment.s --broadcast --verify --rpc-url amoy --legacy 

contract VerifierDeployment is Script {
    function setUp() public {}

    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);
       
        HonkVerifier pv = new HonkVerifier();
        
        vm.stopBroadcast();
    }
}

