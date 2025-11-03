# BabyBit (babycoin)

SIP-010 fungible token implemented in Clarity using Clarinet.

## Files
- `contracts/babybit.clar` — BabyBit token contract
- `Clarinet.toml` — Clarinet project config registering the contract

## Usage
Ensure Clarinet is installed, then:

- Check the contract compiles and passes static analysis:
  ```
  clarinet check
  ```
- Open a console to interact locally:
  ```
  clarinet console
  ```
  Initialize the contract owner (run once, by deployer):
  ```
  (contract-call? .babybit initialize)
  ```
  Mint, transfer, and query:
  ```
  (contract-call? .babybit mint 'ST3...RECIPIENT u1000000) ;; owner mints 1,000,000 BBIT to recipient
  (contract-call? .babybit transfer u100000 tx-sender 'ST3...RECIPIENT none) ;; send 100,000 BBIT from caller
  (contract-call? .babybit get-balance 'ST3...ADDRESS)
  (contract-call? .babybit get-total-supply)
  ```

Notes:
- Call `initialize` first; it sets the caller as the token owner who can `mint`/`burn`.
- Decimals: 6; Symbol: `BBIT`.
