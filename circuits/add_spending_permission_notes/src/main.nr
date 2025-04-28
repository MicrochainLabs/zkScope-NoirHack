use zkScope::spend_permission_notes::addNewNotes;

global DEPTH: u32 = 16; 
global NOTE_NB: u32 = 3;

fn main(
    smart_account: pub Field, 
    nonce: Field,
    note_commitments_old_root: Field,
    note_commitments_new_root: Field,
    default_leaf: pub Field,
    new_notes_spender: [Field; NOTE_NB],
    new_notes_token: [Field; NOTE_NB],
    new_notes_allowance: [Field; NOTE_NB],
    siblings: [[Field; DEPTH]; NOTE_NB]
) -> pub (Field, Field) {

    let(old_state_root, new_state_root) = addNewNotes(smart_account, nonce, note_commitments_old_root, note_commitments_new_root, default_leaf, new_notes_spender, new_notes_token, new_notes_allowance, siblings);
    (old_state_root, new_state_root)

}

#[test]
fn test_main() {

    // main(1, 1);

}
