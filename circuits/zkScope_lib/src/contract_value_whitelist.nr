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
    native_coin_transfer_siblings: [[Field; MAX_DEPTH]; TX_NB],  native_coin_transfer_path_indices: [Field; TX_NB],
    smart_contract_call_siblings: [[Field; MAX_DEPTH]; TX_NB], smart_contract_call_path_indices: [Field; TX_NB],
    erc20_transfer_siblings: [[Field; MAX_DEPTH]; TX_NB], erc20_transfer_path_indices: [Field; TX_NB],
) -> Field {

    for i in 0..TX_NB {
        if(value[i] != 0){
            let native_coin_transfer_path_indices_bits: [u1; MAX_DEPTH] = native_coin_transfer_path_indices[i].to_be_bits();
            let user_op_value_to_root = binary_merkle_root(poseidon2, dest[i], MAX_DEPTH, native_coin_transfer_path_indices_bits, native_coin_transfer_siblings[i]);
            assert(user_op_value_to_root == value_whitelist_root);
        }
        if(function_selector[i] != 0){
            let smart_contract_call_path_indices_bits: [u1; MAX_DEPTH] = smart_contract_call_path_indices[i].to_be_bits();
            let user_op_smart_contract_call_root = binary_merkle_root(poseidon2, dest[i], MAX_DEPTH, smart_contract_call_path_indices_bits, smart_contract_call_siblings[i]);
            assert(user_op_smart_contract_call_root == contract_whitelist_root);
            if(function_selector[i] == 2835717307) {
                let erc20_transfer_path_indices_bits: [u1; MAX_DEPTH] = erc20_transfer_path_indices[i].to_be_bits();
                let user_op_erc20_to_root = binary_merkle_root(poseidon2, erc20_transfer_to[i], MAX_DEPTH, erc20_transfer_path_indices_bits, erc20_transfer_siblings[i]);
                assert(user_op_erc20_to_root == value_whitelist_root);
            }
        }
    }

    let state_tree01 = poseidon2([smart_account, session_id]);
    let state_tree23 = poseidon2([contract_whitelist_root, value_whitelist_root]);
    let state_root = poseidon2([state_tree01, state_tree23]);

    state_root
}