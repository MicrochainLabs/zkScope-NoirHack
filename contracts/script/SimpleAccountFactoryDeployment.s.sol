pragma solidity ^0.8.23;

import "forge-std/Script.sol";
import "../src/SimpleAccountFactory.sol";

//Deploy contract: forge script script/SimpleAccountFactoryDeployment.s.sol SimpleAccountFactoryDeployment --broadcast --verify --rpc-url polygon --legacy

//V6:0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789;
//V7:0x0000000071727De22E5E9d8BAf0edAc6f37da032;

/*
##### polygon
✅  [Success] Hash: 0xbfbee7f4080ae4646093b45cc8094d3319bd7a097a5177bc6143c8b498c5ae86
Contract Address: 0x2E6D87c51041EDfa49aA222280Bc01C4da020969
Block: 71091758

 */
contract SimpleAccountFactoryDeployment is Script {
    function setUp() public {}

    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);
        address entryPointAddress = 0x0000000071727De22E5E9d8BAf0edAc6f37da032;
        address _honkVerifier = 0x97589235155FcA05e4f9dA0c4BEDbcFB9aD59912;

        SimpleAccountFactory pv = new SimpleAccountFactory(IEntryPoint(entryPointAddress), HonkVerifier(_honkVerifier));
        
        vm.stopBroadcast();
    }
}

