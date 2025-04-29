import { UltraHonkBackend } from "@aztec/bb.js"
import { Noir } from "@noir-lang/noir_js";
import circuit from './add_spending_permission_notes.json';

import { IMT } from "@zk-kit/imt"
import { poseidon2, poseidon4 } from "poseidon-lite"
import { parseUnits, toHex } from "viem";


async function  main(){
/**
 * depth: number of nodes from the leaf to the tree's root node.
 * zeroValue: default zero, can vary based on the specific use-case.
 * arity: number of children per node (2 = Binary IMT, 5 = Quinary IMT).
 */

const depth = 16
const zeroValue = 0
const arity = 2

/**
 * To create an instance of an IMT, you need to provide the hash function
 * used to compute the tree nodes, as well as the depth, zeroValue, and arity of the tree.
 */
const noteCommitmentsTree = new IMT(poseidon2, depth, zeroValue, arity);

const accountIdentifier = "0xb9890DC58a1A1a9264cc0E3542093Ee0A1780822";

let nonce = 0;

const inputs = {
    smart_account: accountIdentifier,
    nonce: toHex(BigInt(nonce)),
    note_commitments_old_root: toHex(noteCommitmentsTree.root),
    note_commitments_new_root: "",
    default_leaf: "0x0",
    new_notes_spender: [] as string[],
    new_notes_token: [] as string[],
    new_notes_allowance: [] as string[],
    siblings: [] as string[][] 
}

const newSpendingPermissionNotes = [
    {
        spender: "0x1E8A0CD8045C7C0C9762408AFF2c64C63F26C5f4",
        token: "0x337Df693AE75a0ff64317A77dAC8886F61455b85",
        allowance:  parseUnits("100", 18) 
    },
    {
        spender: "0x84d11A20DAf639Ee6a2639332B99f844D599fc94",
        token: "0x94D869Ed79067747Be5f160a9566CC79DDc28C3E",
        allowance: parseUnits("20", 18)
    },
    {
        spender: "0x2Ef9Dbc8683d44d6e782823F2f637b22576fB7f1",
        token: "0x2CA1d854C83997d56263Bf560A2D198911383b2b",
        allowance: parseUnits("70", 18)
    }
]

const oldStateTree01 = poseidon2([BigInt(accountIdentifier), BigInt(nonce)]);
const oldStateTree23 = poseidon2([noteCommitmentsTree.root, 0]);
const oldStateToot = poseidon2([oldStateTree01, oldStateTree23]);
console.log("old state tree root: ", toHex(oldStateToot));


for(let note of newSpendingPermissionNotes){

    noteCommitmentsTree.insert(BigInt("0x0"));
    const merkleProof=  noteCommitmentsTree.createProof(nonce);
    inputs.siblings.push(merkleProof.siblings.map((s) => toHex(s[0])))

    inputs.new_notes_token.push(note.token)
    inputs.new_notes_spender.push(note.spender)
    inputs.new_notes_allowance.push(toHex(note.allowance))
    const noteCommitment = poseidon4([note.spender, nonce, note.token, note.allowance]);
    noteCommitmentsTree.update(nonce, noteCommitment);
    nonce++;
}

const newStateTree01 = poseidon2([BigInt(accountIdentifier), BigInt(nonce)]);
const newStateTree23 = poseidon2([noteCommitmentsTree.root, 0]);
const newStateToot = poseidon2([newStateTree01, newStateTree23]);
console.log("new state tree root: ", toHex(newStateToot));

inputs.note_commitments_new_root = toHex(noteCommitmentsTree.root) ;

//@ts-ignore
const noir = new Noir(circuit);

//@ts-ignore
const { witness } = await noir.execute(inputs);

//@ts-ignore
const backend = new UltraHonkBackend(circuit.bytecode);

console.log("Proof Generation ...");
const proof = await backend.generateProof(witness);
console.log("Proof: ", proof);

}

//npx ts-node src/addNewSpendingPermissionNotes.ts
main()