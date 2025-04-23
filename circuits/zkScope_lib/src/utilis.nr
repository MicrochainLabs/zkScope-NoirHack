use std::hash::poseidon::bn254::hash_2 as poseidon2;

pub fn user_op_hasher(smart_account: Field, secret: Field, op: Field) -> Field {
    let hash = poseidon2([smart_account+secret, op]);
    hash
}