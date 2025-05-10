pragma solidity ^0.8.23;

import "forge-std/Script.sol";
import "../src/SimpleAccountFactory.sol";

//Deploy contract: forge script script/SimpleAccountFactoryDeployment.s.sol SimpleAccountFactoryDeployment --broadcast --verify --rpc-url polygon --legacy

//V6:0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789;
//V7:0x0000000071727De22E5E9d8BAf0edAc6f37da032;

/*
##### polygon
✅  [Success] Hash: 0x0b4bb9aaebcb211242f9dae6221284562830c7d2eb81e582eebc0092610047dd
Contract Address: 0x5E7Bd51d3CE6e9135aC31F0553816E4F7F9552C1
Block: 71347216


 */
contract SimpleAccountFactoryDeployment is Script {
    function setUp() public {}

    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);
        address entryPointAddress = 0x0000000071727De22E5E9d8BAf0edAc6f37da032;
        address _honkVerifier = 0xE04fE8F2136301038C77Ebed370F6141487b3B41;

        SimpleAccountFactory pv = new SimpleAccountFactory(IEntryPoint(entryPointAddress), HonkVerifier(_honkVerifier));
        
        vm.stopBroadcast();
    }
}

