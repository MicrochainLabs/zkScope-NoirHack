import { ENTRYPOINT_ADDRESS_V07,UserOperation,bundlerActions, getAccountNonce, getSenderAddress, getUserOperationHash, signUserOperationHashWithECDSA } from "permissionless";
import { Address, createClient, createPublicClient, createWalletClient, custom, encodeFunctionData, Hex, http } from "viem";
import { polygon, polygonAmoy } from "viem/chains";
import { pimlicoBundlerActions, pimlicoPaymasterActions } from "permissionless/actions/pimlico";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { AddressesIMT, SessionClaimsIMT } from "microch";
import { hash, zkSessionKeyArgType } from "@/libs/utils";
import { DAI_ADDRESS, UDSC_ADDRESS, UDST_ADDRESS } from "./constants";
import { LeanIMT } from "@zk-kit/lean-imt";




export async function openNewZKSessionWithPaymaster(accountIdentifier: string, signer: string, walletClient: any) : Promise<zkSessionKeyArgType>{
    
    const publicClient = createPublicClient({
        transport: http("https://endpoints.omniatech.io/v1/matic/mainnet/public"),
        chain: polygon,
    })
    
    const chain = "137";
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

    const sessionTree = new SessionClaimsIMT(2, 0, 2);


    const sessionAllowedSmartContracts: string[] = [UDSC_ADDRESS, DAI_ADDRESS, UDST_ADDRESS] 
    const accountAllowedToAddressesTree: string[] = ["0xbd8faF57134f9C5584da070cC0be7CA8b5A24953", "0xb9890DC58a1A1a9264cc0E3542093Ee0A1780822", "0x45B52500cb12Ae6046D8566598aB9ccFa7B21aD7"]

    /*const sessionAllowedSmartContractTree: AddressesIMT = new AddressesIMT(17, 0, 2);
    for (let address of sessionAllowedSmartContracts) {
        await sessionAllowedSmartContractTree.addAddress(BigInt(address));
    }*/
    const smartContractCallsWhitelistTree = new LeanIMT(hash)
    for (let address of sessionAllowedSmartContracts) {
        await smartContractCallsWhitelistTree.insert(BigInt(address));
    }

    /*const sessionAllowedToTree: AddressesIMT = new AddressesIMT(17, 0, 2);
    for (let address of accountAllowedToAddressesTree) {
        await sessionAllowedToTree.addAddress(BigInt(address));
    }*/
    const valueTransferWhitelistTree = new LeanIMT(hash)
    for (let address of accountAllowedToAddressesTree) {
        await valueTransferWhitelistTree.insert(BigInt(address));
    }

    const sessionOwnerPrivateKey = generatePrivateKey()
    const sessionOwner = privateKeyToAccount(sessionOwnerPrivateKey)

    sessionTree.addClaim(BigInt(accountIdentifier))
    sessionTree.addClaim(BigInt(sessionOwner.address))
    sessionTree.addClaim(smartContractCallsWhitelistTree.root)
    sessionTree.addClaim(valueTransferWhitelistTree.root)

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
        args: [sessionOwner.address, sessionTree.root]
    })

    const nonce = await getAccountNonce(publicClient, {
        sender: accountIdentifier as Address,
        entryPoint: ENTRYPOINT_ADDRESS_V07,
    })

    const gasPrice = await bundlerClient.getUserOperationGasPrice()

    const userOperation = {
        sender: accountIdentifier,
        nonce: nonce,
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


    let userOpHash = getUserOperationHash({
        userOperation: sponsoredUserOperation,
        chainId: polygon.id,
        entryPoint: ENTRYPOINT_ADDRESS_V07
    })
    console.log("userOpHash: ", userOpHash)
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
  

    return  {
        accountIdentifier: accountIdentifier,
        sessionOwnerPrivateKey:sessionOwnerPrivateKey,
        sessionAllowedSmartContracts: sessionAllowedSmartContracts,
        sessionAllowedToTree: accountAllowedToAddressesTree,
    }
}