import { AddressesIMT, SessionClaimsIMT } from "microch";
import { ENTRYPOINT_ADDRESS_V07,UserOperation,bundlerActions, getAccountNonce, getSenderAddress, signUserOperationHashWithECDSA } from "permissionless";
import { pimlicoBundlerActions, pimlicoPaymasterActions } from "permissionless/actions/pimlico";
import { Address, Hex, createClient, createPublicClient, encodeFunctionData, http, parseEther } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { polygon } from "viem/chains";


//0xa1B50BEE65b80a82c33f0909f1D949F0ef529031
export async function deployAccountAndOpenNewZKSessionWithPaymaster(signer: string, walletClient: any){
    console.log(signer)
    console.log(walletClient)
    const publicClient = createPublicClient({
        transport: http("https://endpoints.omniatech.io/v1/matic/mainnet/public"), // https://rpc.ankr.com/polygon_amoy
        chain: polygon, // polygonAmoy
    })
    
    const chain = "137";//  polygon-amoy
    const apiKey = process.env.NEXT_PUBLIC_PIMLICO_API_KEY;
    const endpointUrl = `https://api.pimlico.io/v2/${chain}/rpc?apikey=${apiKey}`
    
    const bundlerClient = createClient({
        transport: http(endpointUrl),
        chain: polygon,
    })
        .extend(bundlerActions(ENTRYPOINT_ADDRESS_V07))
        .extend(pimlicoBundlerActions(ENTRYPOINT_ADDRESS_V07))
    
    const paymasterClient = createClient({
        transport: http(endpointUrl),
        chain: polygon, 
    }).extend(pimlicoPaymasterActions(ENTRYPOINT_ADDRESS_V07))


    const SIMPLE_ACCOUNT_FACTORY_ADDRESS = "0x499c664380Abc361e0a783721038425E05E1D033" 

    const saltArray: Uint8Array = new Uint8Array(32);
    window.crypto.getRandomValues(saltArray);
    // Convert to hexadecimal string
    const saltHex: string = Array.from(saltArray)
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');
    // Convert to BigInt
    const saltBigInt: bigint = BigInt('0x' + saltHex);
    const factory = SIMPLE_ACCOUNT_FACTORY_ADDRESS
    const factoryData = encodeFunctionData({
        abi: [
            {
                inputs: [
                    { name: "owner", type: "address" },
                    { name: "salt", type: "uint256" },
                ],
                name: "createAccount",
                outputs: [{ name: "ret", type: "address" }],
                stateMutability: "nonpayable",
                type: "function",
            },
        ],
        args: [signer as "0x${string}", saltBigInt],
    })

    const senderAddress = await getSenderAddress(publicClient, {
        factory,
        factoryData,
        entryPoint: ENTRYPOINT_ADDRESS_V07,
    })

    const addSessionCallData = encodeFunctionData({
        abi: [
            {
                "inputs": [
                  {
                    "internalType": "address",
                    "name": "_address",
                    "type": "address"
                  },
                  {
                    "internalType": "uint256",
                    "name": "sessionTreeRoot",
                    "type": "uint256"
                  }
                ],
                "name": "addNewZKSessionKey",
                "outputs": [
                  {
                    "internalType": "bool",
                    "name": "",
                    "type": "bool"
                  }
                ],
                "stateMutability": "nonpayable",
                "type": "function"
              }
        ],
        args: ["0x0000000000000000000000000000000000000000", BigInt(0)]
    })

    const gasPrice = await bundlerClient.getUserOperationGasPrice()

    console.log("senderAddress", senderAddress)

    const userOperation = {
        sender: senderAddress,
        nonce: BigInt(0),
        factory: factory as Address,
        factoryData,
        callData:addSessionCallData,
        maxFeePerGas: gasPrice.fast.maxFeePerGas,
        maxPriorityFeePerGas: gasPrice.fast.maxPriorityFeePerGas,
        // dummy signature, needs to be there so the SimpleAccount doesn't immediately revert because of invalid signature length
        signature:
            "0xa15569dd8f8324dbeabf8073fdec36d4b754f53ce5901e283c6de79af177dc94557fa3c9922cd7af2a96ca94402d35c39f266925ee6407aeb32b31d76978d4ba1c" as Hex,
    }

    const sponsorUserOperationResult = await paymasterClient.sponsorUserOperation({
        userOperation,
    })
    
    const sponsoredUserOperation: UserOperation<"v0.7"> = {
        ...userOperation,
        ...sponsorUserOperationResult,
    }
    
    console.log("Received paymaster sponsor result:", sponsorUserOperationResult)

    const signature = await signUserOperationHashWithECDSA({
        account: signer,
        client: walletClient,
        userOperation: sponsoredUserOperation,
        chainId: polygon.id,
        entryPoint: ENTRYPOINT_ADDRESS_V07,
    })
    sponsoredUserOperation.signature = signature

    const userOperationHash = await bundlerClient.sendUserOperation({
        userOperation: sponsoredUserOperation,
    })
    
    console.log("Received User Operation hash:", userOperationHash)
    
    // let's also wait for the userOperation to be included, by continually querying for the receipts
    console.log("Querying for receipts...")
    const receipt = await bundlerClient.waitForUserOperationReceipt({
        hash: userOperationHash,
    })
    const txHash = receipt.receipt.transactionHash
    
    console.log(`UserOperation included: https://polygonscan.com/tx/${txHash}`)
  

    return {
        accountIdentifier: senderAddress,
    }
}