use zkScope::contract_value_whitelist::validate_user_op;
use zkScope::utilis::user_op_hasher;


global MAX_DEPTH: u32 = 17; 
global TX_NB: u32 = 1;

fn main(
    smart_account: pub Field, 
    session_id: pub Field,
    contract_whitelist_root: Field, 
    value_whitelist_root: Field,
    dest: pub [Field; TX_NB], 
    value: pub [Field; TX_NB], 
    function_selector: pub [Field; TX_NB], 
    erc20_transfer_to: pub [Field; TX_NB],
    user_op_hash: pub Field,
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

    let smart_account = 755214674609239513844094901006445707489962006989;
    let session_id = 630582199873387284701482249245097140889445580438;
    let contract_whitelist_root = 1772011440465659367974540880227024983878887423287925274503066546974529382177;
    let value_whitelist_root = 13506592134768766857243003844004427544778631289511354676795669135056344408623;
    let op = 4148667739399203055288431972743540829846567430608043454045393934424895256720;

    let dest = [213148054024196271689910033015808239619859249780];
    let value = [10000000000000000];
    let function_selector = [0];
    let erc20_transfer_to = [0];

    let eth_to_siblings = [[
        1432269006499943160490243957128603964592885679140,
      14569315071440144662108998501596314685881909704314835167358592995111912548221,
      7423237065226347324353380772367382631490014989348495481811164164159255474657,
      11286972368698509976183087595462810875513684078608517520839298933882497716792,
      3607627140608796879659380071776844901612302623152076817094415224584923813162,
      19712377064642672829441595136074946683621277828620209496774504837737984048981,
      20775607673010627194014556968476266066927294572720319469184847051418138353016,
      3396914609616007258851405644437304192397291162432396347162513310381425243293,
      21551820661461729022865262380882070649935529853313286572328683688269863701601,
      6573136701248752079028194407151022595060682063033565181951145966236778420039,
      12413880268183407374852357075976609371175688755676981206018884971008854919922,
      14271763308400718165336499097156975241954733520325982997864342600795471836726,
      20066985985293572387227381049700832219069292839614107140851619262827735677018,
      9394776414966240069580838672673694685292165040808226440647796406499139370960,
      11331146992410411304059858900317123658895005918277453009197229807340014528524,
      15819538789928229930262697811477882737253464456578333862691129291651619515538,
      19217088683336594659449020493828377907203207941212636669271704950158751593251

    ]];
    let eth_to_path_indices = [0];
    let allowed_smart_contract_call_siblings = [[0, 0, 0, 0, 0, 0, 0,0, 0, 0, 0, 0, 0, 0,0, 0, 0]];
    let allowed_smart_contract_call_path_indices = [0];
    let erc20_to_address_siblings = [[0, 0, 0, 0, 0, 0, 0,0, 0, 0, 0, 0, 0, 0,0, 0, 0]];
    let erc20_to_address_path_indices = [0];
    let out = main(smart_account, session_id, contract_whitelist_root, value_whitelist_root, 
    dest, value, function_selector, erc20_transfer_to, op, 
    eth_to_siblings, eth_to_path_indices,
    allowed_smart_contract_call_siblings, allowed_smart_contract_call_path_indices, erc20_to_address_siblings, erc20_to_address_path_indices);
    println(out);
}