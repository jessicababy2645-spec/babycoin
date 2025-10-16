# 🍼 BabyCoin Smart Contract

A fun and simple fungible token built on the Stacks blockchain using Clarity smart contracts. BabyCoin (BABY) implements the SIP-010 Fungible Token Standard.

## 🚀 Features

- **SIP-010 Compliant**: Fully implements the Stacks fungible token standard
- **Mintable**: Contract owner can mint new tokens (up to max supply)
- **Burnable**: Token holders can burn their tokens
- **Transferable**: Standard token transfer functionality
- **Metadata Support**: Token URI support for additional metadata

## 📊 Token Details

- **Name**: BabyCoin
- **Symbol**: BABY
- **Decimals**: 6
- **Max Supply**: 100,000,000 BABY (100M tokens)
- **Initial Supply**: 10,000 BABY (minted to contract deployer)

## 🛠️ Development Setup

### Prerequisites

- [Clarinet](https://github.com/hirosystems/clarinet) - Stacks smart contract development tool
- [Node.js](https://nodejs.org/) - For running tests
- [Stacks Wallet](https://www.hiro.so/wallet) - For interacting with deployed contracts

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd babycoin-contract
```

2. Install dependencies:
```bash
npm install
```

3. Check contract syntax:
```bash
clarinet check
```

### Testing

Run the test suite:
```bash
npm test
```

Run tests with coverage:
```bash
npm run test:coverage
```

### Local Development

Start a local Stacks node:
```bash
clarinet integrate
```

This will start a local blockchain where you can deploy and test your contracts.

## 📋 Contract Functions

### Read-Only Functions

- `get-name()` - Returns the token name ("BabyCoin")
- `get-symbol()` - Returns the token symbol ("BABY")
- `get-decimals()` - Returns the number of decimals (6)
- `get-balance(who: principal)` - Returns the balance of a principal
- `get-total-supply()` - Returns the current total supply
- `get-token-uri()` - Returns the token metadata URI (if set)

### Public Functions

- `transfer(amount: uint, from: principal, to: principal, memo: optional buff)` - Transfer tokens
- `mint(amount: uint, to: principal)` - Mint new tokens (owner only)
- `burn(amount: uint)` - Burn tokens from caller's balance
- `set-token-uri(uri: string-utf8)` - Set metadata URI (owner only)

## 🚀 Deployment

### Deploy to Devnet

1. Configure your deployment settings in `settings/Devnet.toml`
2. Deploy the contract:
```bash
clarinet deployments generate --devnet
clarinet deployments apply -p deployments/default.devnet-plan.yaml
```

### Deploy to Testnet

1. Configure your deployment settings in `settings/Testnet.toml`
2. Ensure you have STX tokens on testnet
3. Deploy the contract:
```bash
clarinet deployments generate --testnet
clarinet deployments apply -p deployments/default.testnet-plan.yaml
```

### Deploy to Mainnet

1. Configure your deployment settings in `settings/Mainnet.toml`
2. Ensure you have sufficient STX tokens for deployment
3. Deploy the contract:
```bash
clarinet deployments generate --mainnet
clarinet deployments apply -p deployments/default.mainnet-plan.yaml
```

## 🔧 Usage Examples

### Interacting with the Contract

Once deployed, you can interact with the contract using various Stacks tools:

#### Using Clarinet Console

```bash
clarinet console
```

Then in the console:
```clarity
;; Get token name
(contract-call? .babycoin get-name)

;; Check balance
(contract-call? .babycoin get-balance 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM)

;; Transfer tokens
(contract-call? .babycoin transfer u1000000 tx-sender 'ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5 none)
```

#### Using Stacks.js

```javascript
import { makeContractCall, broadcastTransaction } from '@stacks/transactions';

// Transfer tokens
const txOptions = {
  contractAddress: 'YOUR_CONTRACT_ADDRESS',
  contractName: 'babycoin',
  functionName: 'transfer',
  functionArgs: [
    uintCV(1000000), // 1 BABY token
    standardPrincipalCV('ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM'),
    standardPrincipalCV('ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5'),
    noneCV()
  ],
  // ... other options
};

const transaction = await makeContractCall(txOptions);
```

## ⚠️ Error Codes

- `u100` - ERR_OWNER_ONLY: Only contract owner can perform this action
- `u101` - ERR_NOT_TOKEN_OWNER: Sender is not authorized to transfer from this account
- `u102` - ERR_INSUFFICIENT_BALANCE: Insufficient token balance
- `u103` - ERR_INVALID_RECIPIENT: Invalid recipient address
- `u104` - Max supply exceeded

## 🛡️ Security Considerations

- The contract owner has the ability to mint new tokens up to the maximum supply
- Token holders can burn their own tokens at any time
- All transfers require proper authorization
- The contract follows SIP-010 standard for maximum compatibility

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Support

If you have any questions or need help, please open an issue in the GitHub repository.

---

**Happy coding with BabyCoin! 🍼**