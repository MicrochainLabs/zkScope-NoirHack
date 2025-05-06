pragma solidity ^0.8.23;

import "forge-std/Script.sol";
import "../src/Verifier.sol";


//Deploy contract: forge script script/VerifierDeployment.s.sol VerifierDeployment.s --broadcast --verify --rpc-url polygon --legacy 
/*
##### polygon
✅  [Success] Hash: 0xb3da6a1829cf2bcc724db26247799de03b1f81ebd97c04eab8984fea677a538d
Contract Address: 0x97589235155FcA05e4f9dA0c4BEDbcFB9aD59912
Block: 71091722

 */
contract VerifierDeployment is Script {
    function setUp() public {}

    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);
       
        HonkVerifier pv = new HonkVerifier();
        
        vm.stopBroadcast();
    }
}

