use binary_merkle_root::binary_merkle_root;
use std::hash::poseidon::bn254::hash_2 as poseidon2;

pub fn validate_user_op <let MAX_DEPTH: u32, let TX_NB: u32>(
    smart_account: Field, 
    session_id: Field,
    contract_whitelist_root: Field, 
    value_whitelist_root: Field,
    dest: [Field; TX_NB], 
    value: [Field; TX_NB], 
    function_selector: [Field; TX_NB], 
    erc20_transfer_to: [Field; TX_NB],
    native_coin_transfer_siblings: [[Field; MAX_DEPTH]; TX_NB],  native_coin_transfer_path_indices: [[u1; MAX_DEPTH]; TX_NB], native_coin_transfer_merkle_proof_length: u32,
    smart_contract_call_siblings: [[Field; MAX_DEPTH]; TX_NB], smart_contract_call_path_indices: [[u1; MAX_DEPTH]; TX_NB], smart_contract_call_merkle_proof_length: u32,
    erc20_transfer_siblings: [[Field; MAX_DEPTH]; TX_NB], erc20_transfer_path_indices: [[u1; MAX_DEPTH]; TX_NB], erc20_transfer_merkle_proof_length: u32,
) -> Field {

    for i in 0..TX_NB {
        if(value[i] != 0){
            let user_op_value_to_root = binary_merkle_root(poseidon2, dest[i], native_coin_transfer_merkle_proof_length, native_coin_transfer_path_indices[i], native_coin_transfer_siblings[i]);
            assert(user_op_value_to_root == value_whitelist_root);
        }
        if(function_selector[i] != 0){
            let user_op_smart_contract_call_root = binary_merkle_root(poseidon2, dest[i], smart_contract_call_merkle_proof_length, smart_contract_call_path_indices[i], smart_contract_call_siblings[i]);
            assert(user_op_smart_contract_call_root == contract_whitelist_root);
            if(function_selector[i] == 2835717307) {
                let user_op_erc20_to_root = binary_merkle_root(poseidon2, erc20_transfer_to[i], erc20_transfer_merkle_proof_length, erc20_transfer_path_indices[i], erc20_transfer_siblings[i]);
                assert(user_op_erc20_to_root == value_whitelist_root);
            }
        }
    }

    let state_tree01 = poseidon2([smart_account, session_id]);
    let state_tree23 = poseidon2([contract_whitelist_root, value_whitelist_root]);
    let state_root = poseidon2([state_tree01, state_tree23]);

    state_root
}