pragma solidity ^0.8.23;

import "forge-std/Script.sol";
import "../src/Verifier.sol";


//Deploy contract: forge script script/VerifierDeployment.s.sol VerifierDeployment.s --broadcast --verify --rpc-url polygon --legacy 
/*
✅  [Success] Hash: 0xd91666aa3df42168f7910d7c49f0cb1d626790208bc065408033ecb88f8d6b92
Contract Address: 0xE04fE8F2136301038C77Ebed370F6141487b3B41
Block: 71347127

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

