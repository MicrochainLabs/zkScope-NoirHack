# zkScope-NoirHack


## Overview 

A Noir library for the account abstraction ecosystem.

At the hackathon, we're developing Noir circuits to secure, and control the on-chain behavior of smart accounts.

It enables a trust-minimized off-chain framework that secures and governs a smart account's on-chain behavior according to the user's preferences and intended actions.

## 📂 Project Structure

```
project-root/
├── circuits/   # Zero-knowledge circuits written in Noir
├── contracts/  # Smart contracts 
├── js/         # JavaScript client and scripts interacting with circuits 
└── ...
```

## 🧩 Circuits Library Overview

- **circuits/** — Zero-knowledge circuits written in Noir.
  - **zkScope_lib/** — Reusable components and utility circuits:
    - `contract_value_whitelist.nr`: [A circuit that verifies whether a smart account interaction targets an approved contract address and transfers value (native or ERC-20) to an approved recipient address]
    - `gas_usage.nr`: [A circuit that governs the gas usage behavior of a smart account]
    - `utils.nr`: Helper functions for other circuits
  - `session_keys_demo`: [A main circuit leveraging zkScope_lib within a session key use case]
  - `spending_permission_note | add_spending_permission_notes`: [Main circuits: enable a smart account to define off-chain permission notes that authorize an app, trading bot, or AI agent to spend ERC-20 tokens on the user's behalf]

## A new paradigm for validating transactions/user operations by the Blockchain
We’re familiar with validating transactions/user operations based on different types of signers and signing algorithms, such as  ECDSA, Passkey (WebAuthn), and multisig. Today, most accounts, including externally owned accounts(EOAs) and smart accounts, are controlled via signers. So, the Blockchain is configured to only trust the signer: it will validate and accept a transaction based on providing a valid signature.


We’re introducing a new approach to control an account using a signer and the user's intended on-chain behavior. In such a configuration, the Blockchain will validate a transaction based on a signer and a proof that validates that the transaction behavior is compliant with the user-defined on-chain behavior. So, the blockchain will trust a new trust-minimized framework that lets him familiarize himself with the account's intended on-chain behavior. 
![Demo Screenshot](images/signer-and-on-chain-behavior_with_blockchain.png) 

All wallets rely on public-key cryptography, which provides cryptographic services over data—this is a form of purpose-specific cryptography. In recent years, we've entered a new era: cryptographic services over computation, also known as general-purpose or programmable cryptography, have emerged—driven especially by zero-knowledge proofs (ZKPs) and fully homomorphic encryption (FHE). As account abstraction (AA) evolves, wallets will increasingly integrate programmable cryptography as a native capability.
![Demo Screenshot](images/signer-and-on-chain-behavior.png) 

## ZK Apps for smart accounts

For any feature around securing and controlling the account's on-chain behavior:
* Define and put the state into a Merkle tree
* Program the feature business logic using Noir circuit.
![Demo Screenshot](images/zk-scope-cryptography.png)

general/session keys/spending permission notes for smart accounts

Framework - zk-kit

## Integration
* Safe account(Bybit attack, this is how can we tell the blockchain that the transction that upgrade the code that control the account is malicious and unintended behavior)
* Smart session module
## Use case
## Demo
An end-to-end example of using Noir circuits to control the on-chain behavior of a smart account.

Session keys: 

dApp: 

