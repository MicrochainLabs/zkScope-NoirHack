
use binary_merkle_root::binary_merkle_root;
use std::hash::poseidon::bn254::hash_2 as poseidon2;
use std::hash::poseidon::bn254::hash_4 as poseidon4;

pub struct SpendingPermissionNote {
    spender: Field, //signer
    token: Field,
    allowance: Field,
    nonce: Field,
}

pub struct  PubKey {
    x: [u8; 32],
    y: [u8; 32],
}

type Address = [u8; 20];
type Signature = [u8; 64];
type Hash = [u8; 32];

fn hash_values(leaves: [Field; 2]) -> Field {
    let hash = poseidon2(leaves);
    hash
}

fn merkle_tree_root<let DEPTH: u32>(leaf: Field, path_indices: Field, siblings: ([Field; DEPTH])) -> Field {
    //let index_bits = path_indices.to_be_bits(N);
    let index_bits:[u1; DEPTH] = path_indices.to_le_bits(); 
    let mut current = leaf;
    for i in 0..DEPTH {
        let path_bit = index_bits[i] as bool;
        let (hash_left, hash_right) = if path_bit {
            (siblings[i], current)
        } else {
            (current, siblings[i])
        };
        current = hash_values([hash_left, hash_right]);
    }
    current
}

// compute note commitment
pub fn compute_note_commitment(spender: Field, nonce: Field, token: Field, allowance: Field) -> Field{
    let hash = poseidon4([spender, nonce, token, allowance]);
    hash
}


pub fn addNewNotes <let DEPTH: u32, let NOTE_NB: u32>(
    smart_account: Field, 
    nonce: Field,
    note_commitments_old_root: Field,
    note_commitments_new_root: Field,
    default_leaf: Field,
    new_notes_spender: [Field; NOTE_NB],
    new_notes_token: [Field; NOTE_NB],
    new_notes_allowance: [Field; NOTE_NB],
    siblings: [[Field; DEPTH]; NOTE_NB],
) -> (Field, Field) {

    let old_state_tree01 = poseidon2([smart_account, nonce]);
    let old_state_tree23 = poseidon2([note_commitments_old_root, 0]);
    let old_state_root = poseidon2([old_state_tree01, old_state_tree23]);

    let mut current_root = note_commitments_old_root;
    let mut previous_nonce = nonce - 1;
    let mut current_nonce = nonce;
    
    for i in 0..NOTE_NB {
        
        //if token or allowance or spender ==0
        //let path_bits:[u1; DEPTH] = previous_nonce.to_le_bits();  // Little-endian conversion
        let path_bits:[u1; DEPTH] = previous_nonce.to_be_bits(); // Big-endian alternative
        
        // Verify old root contains default_leaf
        let computed_old_root = binary_merkle_root(
            poseidon2,
            default_leaf,
            DEPTH,
            path_bits,
            siblings[i]
        );
        let computed_old_root1 = merkle_tree_root(
            default_leaf,
            previous_nonce,
            siblings[i]
        );
       /* println(previous_nonce);
        println(current_nonce);
        println(default_leaf);
        println(computed_old_root);
        println(path_bits);
        println(siblings[i]);
        println(computed_old_root1);*/
        println(previous_nonce);
        println(default_leaf);
        println(path_bits);
        println(siblings[i]);
        println(computed_old_root);
         println(computed_old_root1);
        println(current_root);

        assert(computed_old_root == current_root);
        
        // Compute new root
        let note_commitment = compute_note_commitment(
            new_notes_spender[i],
            current_nonce,
            new_notes_token[i],
            new_notes_allowance[i]
        );
        current_root = binary_merkle_root(
            poseidon2,
            note_commitment,
            DEPTH,
            path_bits,
            siblings[i]
        );

        previous_nonce = previous_nonce + 1;
        current_nonce = current_nonce + 1;
    }
    assert (current_root == note_commitments_new_root);

    let new_state_tree01 = poseidon2([smart_account, current_nonce]);
    let new_state_tree23 = poseidon2([note_commitments_new_root, 0]);
    let new_state_root = poseidon2([new_state_tree01, new_state_tree23]);

    (old_state_root, new_state_root)
}

fn revokeNotes <let DEPTH: u32, let NOTE_NB: u32>(
    // Public inputs
    note_commitments_old_root: Field,
    note_commitments_new_root: Field,
    default_leaf: Field,
    smart_account: Field, 
    // Private inputs
    notes: [SpendingPermissionNote; NOTE_NB],
    path_indices: [[Field; DEPTH]; NOTE_NB],
    siblings: [[Field; DEPTH]; NOTE_NB],
) {
    //compute path indices from the note nonce
    //compute note commitment
    //compute state commitment tree root/assert
    //compute global state tree root/assert
    //compute new commitment state tree root
    //compute new global state tree root

    // or just add a nullifier of the revoked notes on-chain by the note issuer
}


pub fn validate_spend_permission_note <let DEPTH: u32, let STATE_TREE_DEPTH: u32>(
    smart_account: Field, 
    signer: PubKey,
    signature: Signature,
    user_op_hash: Hash,
    note_commitment_tree_root: Field,
    note_siblings: [Field; DEPTH],
    note_path_indice: Field,
    smart_account_siblings: [Field; DEPTH],
    samrt_account_note_path_indice: Field,//static value(instance, main)
    note_commitments_siblings: [Field; DEPTH],
    note_commitments_path_indice: Field,//static value(instance, main)
    /*start: Field,
    end: Field,
    period: Field,*/
    note: SpendingPermissionNote,
    dest: Field, 
    value: Field, 
    erc20_transfer_amount: Field,
) -> (Field, Field) {

    assert(std::ecdsa_secp256k1::verify_signature(signer.x, signer.y, signature, user_op_hash));

     // Then, find the address to which the verifying key corresponds.
    let mut uncompressed_pubkey = [0; 64];
    for j in 0..32 {
        uncompressed_pubkey[j] = signer.x[j];
        uncompressed_pubkey[j + 32] = signer.y[j];
    }
    let pubkey_hash = std::hash::keccak256(uncompressed_pubkey, 64);
    let mut address: Address = [0; 20];
    for j in 0..20 {
        address[j] = pubkey_hash[j + 12];
    }
    let mut result : Field = 0;
    let mut v : Field = 1;
    for k in 0..20 {
        result += address[19 - k] as Field * v;
        v *= 256 as Field;
    }        

    assert(note.spender == result);
    assert(note.token == dest);
    assert(note.allowance == erc20_transfer_amount);
    assert(value == 0);

    let note_commitment = compute_note_commitment(
        note.spender,
        note.nonce,
        note.token,
        note.allowance
    );

    let note_path_indices_bits: [u1; DEPTH] = note_path_indice.to_be_bits();
    let computed_note_commitment_tree_root = binary_merkle_root(
        poseidon2,
        note_commitment,
        DEPTH,
        note_path_indices_bits,
        note_siblings
    );
    assert(computed_note_commitment_tree_root == note_commitment_tree_root);

    let smart_account_path_indices_bits: [u1; DEPTH] = samrt_account_note_path_indice.to_be_bits();
    let computed_smart_account_state_tree_root = binary_merkle_root(
        poseidon2,
        smart_account,
        STATE_TREE_DEPTH,
        smart_account_path_indices_bits,
        smart_account_siblings
    );
    let note_commitments_path_indices_bits: [u1; DEPTH] = note_commitments_path_indice.to_be_bits();
    let computed_note_commitments_state_tree_root = binary_merkle_root(
        poseidon2,
        note_commitment_tree_root,
        STATE_TREE_DEPTH,
        note_commitments_path_indices_bits,
        note_commitments_siblings
    );
    assert(computed_smart_account_state_tree_root == computed_note_commitments_state_tree_root);

    let nullifier = poseidon2([smart_account, note_commitment]);

    (computed_smart_account_state_tree_root, nullifier)
}