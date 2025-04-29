use zkScope::contract_value_whitelist::validate_user_op;
use zkScope::utilis::user_op_hasher;


global MAX_DEPTH: u32 = 17; 
global TX_NB: u32 = 1;

fn main(
    smart_account: pub Field, 
    session_id: pub Field,
    user_op_hash: pub Field,
    contract_whitelist_root: Field, 
    value_whitelist_root: Field,
    dest: pub [Field; TX_NB], 
    value: pub [Field; TX_NB], 
    function_selector: pub [Field; TX_NB], 
    erc20_transfer_to: pub [Field; TX_NB],
    native_coin_transfer_siblings: [[Field; MAX_DEPTH]; TX_NB],  native_coin_transfer_path_indices: [Field; TX_NB],
    smart_contract_call_siblings: [[Field; MAX_DEPTH]; TX_NB], smart_contract_call_path_indices: [Field; TX_NB],
    erc20_transfer_siblings: [[Field; MAX_DEPTH]; TX_NB], erc20_transfer_path_indices: [Field; TX_NB],
)-> pub (Field, Field) {

    let state_root= validate_user_op(smart_account, session_id, contract_whitelist_root, value_whitelist_root,
        dest, value, function_selector, erc20_transfer_to,
        native_coin_transfer_siblings, native_coin_transfer_path_indices,
        smart_contract_call_siblings, smart_contract_call_path_indices,
        erc20_transfer_siblings, erc20_transfer_path_indices);

    let op_hasher = user_op_hasher(smart_account + session_id, state_root, user_op_hash);

    for i in 0..TX_NB {
        assert(value[i] == 0);
    }
    
    (state_root, op_hasher)
}

#[test]
fn test_main() {
    //main(1, 2);

    let smart_account = 0xb9890DC58a1A1a9264cc0E3542093Ee0A1780822;
    let session_id = 0x0f6CDADB6A7519BfBCF493609d1fF88a07058Dd1;
    let contract_whitelist_root = 0xa8ce3b12072b6ac6f31bc26fa501b4a54cc2a56ec7b2e280e02db17101f4c27;
    let value_whitelist_root = 0x18a409e851a7400ce5aa0d3f428ec99a81f9f33e20d898a9826b8ea52d1b3801;
    let op = 0x92c100ef61d009f9838d0220e6c9e4287fb5417d4b65a482bc726517c01f890;

    let dest = [0x337df693ae75a0ff64317a77dac8886f61455b85];
    let value = [0x0];
    let function_selector = [0xa9059cbb];
    let erc20_transfer_to = [0xb9890dc58a1a1a9264cc0e3542093ee0a1780822];

    let eth_to_siblings = [[0, 0, 0, 0, 0, 0, 0,0, 0, 0, 0, 0, 0, 0,0, 0, 0]];
    let eth_to_path_indices = [0];
    let allowed_smart_contract_call_siblings = [
        [ 
            0x2ca1d854c83997d56263bf560a2d198911383b2b,
            0x1994c815fba4d2774bb3b31f646d148f7fdfc82d28891e5ee6972edb4a2aefbd,
            0x1069673dcdb12263df301a6ff584a7ec261a44cb9dc68df067a4774460b1f1e1,
            0x18f43331537ee2af2e3d758d50f72106467c6eea50371dd528d57eb2b856d238,
            0x7f9d837cb17b0d36320ffe93ba52345f1b728571a568265caac97559dbc952a,
            0x2b94cf5e8746b3f5c9631f4c5df32907a699c58c94b2ad4d7b5cec1639183f55,
            0x2dee93c5a666459646ea7d22cca9e1bcfed71e6951b953611d11dda32ea09d78,
            0x78295e5a22b84e982cf601eb639597b8b0515a88cb5ac7fa8a4aabe3c87349d,
            0x2fa5e5f18f6027a6501bec864564472a616b2e274a41211a444cbe3a99f3cc61,
            0xe884376d0d8fd21ecb780389e941f66e45e7acce3e228ab3e2156a614fcd747,
            0x1b7201da72494f1e28717ad1a52eb469f95892f957713533de6175e5da190af2,
            0x1f8d8822725e36385200c0b201249819a6e6e1e4650808b5bebc6bface7d7636,
            0x2c5d82f66c914bafb9701589ba8cfcfb6162b0a12acf88a8d0879a0471b5f85a,
            0x14c54148a0940bb820957f5adf3fa1134ef5c4aaa113f4646458f270e0bfbfd0,
            0x190d33b12f986f961e10c0ee44d8b9af11be25588cad89d416118e4bf4ebe80c,
            0x22f98aa9ce704152ac17354914ad73ed1167ae6596af510aa5b3649325e06c92,
            0x2a7c7c9b6ce5880b9f6f228d72bf6a575a526f29c66ecceef8b753d38bba7323
        ]
    ];
    let allowed_smart_contract_call_path_indices = [0];
    let erc20_to_address_siblings = [
        [
            0xbd8faf57134f9c5584da070cc0be7ca8b5a24953,
            0x26a4dc6c6d72d09406652bfc21ab479f7271521ed0b14ff14a0901f70b4e3ce4,
            0x1069673dcdb12263df301a6ff584a7ec261a44cb9dc68df067a4774460b1f1e1,
            0x18f43331537ee2af2e3d758d50f72106467c6eea50371dd528d57eb2b856d238,
            0x7f9d837cb17b0d36320ffe93ba52345f1b728571a568265caac97559dbc952a,
            0x2b94cf5e8746b3f5c9631f4c5df32907a699c58c94b2ad4d7b5cec1639183f55,
            0x2dee93c5a666459646ea7d22cca9e1bcfed71e6951b953611d11dda32ea09d78,
            0x78295e5a22b84e982cf601eb639597b8b0515a88cb5ac7fa8a4aabe3c87349d,
            0x2fa5e5f18f6027a6501bec864564472a616b2e274a41211a444cbe3a99f3cc61,
            0xe884376d0d8fd21ecb780389e941f66e45e7acce3e228ab3e2156a614fcd747,
            0x1b7201da72494f1e28717ad1a52eb469f95892f957713533de6175e5da190af2,
            0x1f8d8822725e36385200c0b201249819a6e6e1e4650808b5bebc6bface7d7636,
            0x2c5d82f66c914bafb9701589ba8cfcfb6162b0a12acf88a8d0879a0471b5f85a,
            0x14c54148a0940bb820957f5adf3fa1134ef5c4aaa113f4646458f270e0bfbfd0,
            0x190d33b12f986f961e10c0ee44d8b9af11be25588cad89d416118e4bf4ebe80c,
            0x22f98aa9ce704152ac17354914ad73ed1167ae6596af510aa5b3649325e06c92,
            0x2a7c7c9b6ce5880b9f6f228d72bf6a575a526f29c66ecceef8b753d38bba7323
        ]
    ];
    let erc20_to_address_path_indices = [0x10000];
    let out = main(smart_account, session_id, op, contract_whitelist_root, value_whitelist_root, 
    dest, value, function_selector, erc20_transfer_to, 
    eth_to_siblings, eth_to_path_indices,
    allowed_smart_contract_call_siblings, allowed_smart_contract_call_path_indices, erc20_to_address_siblings, erc20_to_address_path_indices);
    println(out);
}