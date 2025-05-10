import { UltraHonkBackend } from "@aztec/bb.js"
import { Noir } from "@noir-lang/noir_js";
import circuit from './session_keys_demo.json';

import { IMT } from "@zk-kit/imt"
import { poseidon2 } from "poseidon-lite"
import { parseEther, toHex } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { hexlify } from "ethers";
import { LeanIMT } from "@zk-kit/lean-imt";
import { LibZip } from 'solady'




// Hash function used to compute the tree nodes.
const hash = (a: string | number | bigint, b: string | number | bigint) => poseidon2([a, b])

function padArray(arr: any[], length: number, fill: any = 0) {
  return arr.concat(Array(length - arr.length).fill(fill));
}

function uint8ArrayToHex(uint8Array: Uint8Array): string {
  return Array.from(uint8Array)
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');
}

async function  main(){

const depth = 10
const zeroValue = 0
const arity = 2

const accountIdentifier = "0xb9890DC58a1A1a9264cc0E3542093Ee0A1780822";

const sessionStateTree = new IMT(poseidon2, 2, zeroValue, arity);

const sessionAllowedSmartContracts: string[] = ["0x337Df693AE75a0ff64317A77dAC8886F61455b85", "0x2CA1d854C83997d56263Bf560A2D198911383b2b", "0x94D869Ed79067747Be5f160a9566CC79DDc28C3E"] 
const accountAllowedToAddressesTree: string[] = ["0xbd8faF57134f9C5584da070cC0be7CA8b5A24953", "0xb9890DC58a1A1a9264cc0E3542093Ee0A1780822", "0x45B52500cb12Ae6046D8566598aB9ccFa7B21aD7"]

//const smartContractCallsWhitelistTree = new IMT(poseidon2, depth, zeroValue, arity);
const smartContractCallsWhitelistTree = new LeanIMT(hash)
for (let address of sessionAllowedSmartContracts) {
    await smartContractCallsWhitelistTree.insert(BigInt(address));
}

//const valueTransferWhitelistTree = new IMT(poseidon2, depth, zeroValue, arity);
const valueTransferWhitelistTree = new LeanIMT(hash)
for (let address of accountAllowedToAddressesTree) {
    await valueTransferWhitelistTree.insert(BigInt(address));
}

const sessionOwnerPrivateKey = generatePrivateKey()
const sessionOwner = privateKeyToAccount(sessionOwnerPrivateKey)

sessionStateTree.insert(BigInt(accountIdentifier))
sessionStateTree.insert(BigInt(sessionOwner.address))
sessionStateTree.insert(smartContractCallsWhitelistTree.root)
sessionStateTree.insert(valueTransferWhitelistTree.root)
console.log("session State Tree root: ", toHex(sessionStateTree.root));

//const parsedAmountValue = parseEther("1")
const transaction= {
    dest: BigInt("0x337Df693AE75a0ff64317A77dAC8886F61455b85"),
    value: BigInt("0x0"),
    functionSelector: BigInt("0xa9059cbb"),
    Erc20TransferTo: BigInt("0xb9890DC58a1A1a9264cc0E3542093Ee0A1780822")
}

const transactions = [
      transaction
]

const SNARK_SCALAR_FIELD = BigInt("0x30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f0000001");
let userOpHash= "0x9a58fb6799b1e11cc129a14592f0a75a00970cf141e2abfbf76d070d4c01f893";
let op = BigInt(hexlify(userOpHash));
op %= SNARK_SCALAR_FIELD;

const circuitInputs = {
    smart_account: accountIdentifier,
    session_id: sessionOwner.address,
    user_op_hash: toHex(op),
    contract_whitelist_root: toHex(smartContractCallsWhitelistTree.root),
    value_whitelist_root: toHex(valueTransferWhitelistTree.root),
    dest:[] as string[],
    value: [] as string[],
    function_selector: [] as string[], 
    erc20_transfer_to:[] as string[], 
    native_coin_transfer_siblings: [] as string[][], 
    native_coin_transfer_path_indices: [] as string[][],  
    native_coin_transfer_merkle_proof_length: 0,   
    smart_contract_call_siblings: [] as string[][],
    smart_contract_call_path_indices: [] as string[][],
    smart_contract_call_merkle_proof_length: 0,
    erc20_transfer_siblings: [] as string[][],
    erc20_transfer_path_indices: [] as string[][],
    erc20_transfer_merkle_proof_length: 0 
}

for(let tx of transactions){
    
    circuitInputs.dest.push(toHex(tx.dest))
    circuitInputs.value.push(toHex(tx.value))
    circuitInputs.function_selector.push(toHex(tx.functionSelector))
    circuitInputs.erc20_transfer_to.push(toHex(tx.Erc20TransferTo))
    if(tx.value != BigInt(0)){
      const index= await valueTransferWhitelistTree.indexOf(BigInt(tx.dest));
      const allowedToProof= await valueTransferWhitelistTree.generateProof(index);
      circuitInputs.native_coin_transfer_siblings.push(padArray(allowedToProof.siblings.map(v => toHex(v)), depth, "0x0"))
      circuitInputs.native_coin_transfer_merkle_proof_length = allowedToProof.siblings.length;
      const merkleProofIndices = []
      for (let i = 0; i < depth; i += 1) {
        merkleProofIndices.push((allowedToProof.index >> i) & 1)
      }
      circuitInputs.native_coin_transfer_path_indices.push(merkleProofIndices.map(v => toHex(v)))
    }else{
      //static value
      circuitInputs.native_coin_transfer_siblings.push(["0x0", "0x0", "0x0", "0x0", "0x0", "0x0", "0x0","0x0", "0x0", "0x0"])
      circuitInputs.native_coin_transfer_path_indices.push(["0x0", "0x0", "0x0", "0x0", "0x0", "0x0", "0x0","0x0", "0x0", "0x0"])
    }

    if(tx.functionSelector != BigInt("0x0")){
      const index= await smartContractCallsWhitelistTree.indexOf(BigInt(tx.dest));
      const allowedSmartContractProof= await smartContractCallsWhitelistTree.generateProof(index);
      circuitInputs.smart_contract_call_siblings.push(padArray(allowedSmartContractProof.siblings.map(v => toHex(v)), depth, "0x0"))
      circuitInputs.smart_contract_call_merkle_proof_length = allowedSmartContractProof.siblings.length;
      const merkleProofIndices = []
      for (let i = 0; i < depth; i += 1) {
        merkleProofIndices.push((allowedSmartContractProof.index >> i) & 1)
      }
      circuitInputs.smart_contract_call_path_indices.push(merkleProofIndices.map(v => toHex(v)))
    }else{
      //static value
      circuitInputs.smart_contract_call_siblings.push(["0x0", "0x0", "0x0", "0x0", "0x0", "0x0", "0x0","0x0", "0x0", "0x0"])
      circuitInputs.smart_contract_call_path_indices.push(["0x0", "0x0", "0x0", "0x0", "0x0", "0x0", "0x0","0x0", "0x0", "0x0"])
    }
    if(tx.Erc20TransferTo != BigInt("0x0")){
      const index= await valueTransferWhitelistTree.indexOf(BigInt(tx.Erc20TransferTo));
      const allowedSmartContractProof= await valueTransferWhitelistTree.generateProof(index);
      circuitInputs.erc20_transfer_siblings.push(padArray(allowedSmartContractProof.siblings.map(v => toHex(v)), depth, "0x0"))
      circuitInputs.erc20_transfer_merkle_proof_length = allowedSmartContractProof.siblings.length;
      const merkleProofIndices = []
      for (let i = 0; i < depth; i += 1) {
        merkleProofIndices.push((allowedSmartContractProof.index >> i) & 1)
      }
      circuitInputs.erc20_transfer_path_indices.push(merkleProofIndices.map(v => toHex(v)))
    }else{
      //static value
      circuitInputs.erc20_transfer_siblings.push(["0x0", "0x0", "0x0", "0x0", "0x0", "0x0", "0x0","0x0", "0x0", "0x0"])
      circuitInputs.erc20_transfer_path_indices.push(["0x0", "0x0", "0x0", "0x0", "0x0", "0x0", "0x0","0x0", "0x0", "0x0"])
    }
}

//@ts-ignore
const noir = new Noir(circuit);

//@ts-ignore
const { witness } = await noir.execute(circuitInputs);

//@ts-ignore
const backend = new UltraHonkBackend(circuit.bytecode);

console.log("Proof Generation ...");
const proof = await backend.generateProof(witness);
//console.log("Proof: ", proof);
const proof1 = uint8ArrayToHex(proof.proof)
console.log("Proof1 size: ", proof1.length);
const proof2 = LibZip.flzCompress(proof1)
console.log("Proof2 size: ", proof2.length);

}

//npx ts-node src/sessionKeys.ts
main()