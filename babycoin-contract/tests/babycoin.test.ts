import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v1.0.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
    name: "Ensure that token name, symbol, and decimals are correct",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        
        let block = chain.mineBlock([
            Tx.contractCall('babycoin', 'get-name', [], deployer.address),
            Tx.contractCall('babycoin', 'get-symbol', [], deployer.address),
            Tx.contractCall('babycoin', 'get-decimals', [], deployer.address),
        ]);
        
        block.receipts[0].result.expectOk().expectAscii('BabyCoin');
        block.receipts[1].result.expectOk().expectAscii('BABY');
        block.receipts[2].result.expectOk().expectUint(6);
    },
});

Clarinet.test({
    name: "Ensure initial supply is correctly set",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        
        let block = chain.mineBlock([
            Tx.contractCall('babycoin', 'get-total-supply', [], deployer.address),
            Tx.contractCall('babycoin', 'get-balance', [types.principal(deployer.address)], deployer.address),
        ]);
        
        block.receipts[0].result.expectOk().expectUint(10000000000);
        block.receipts[1].result.expectOk().expectUint(10000000000);
    },
});

Clarinet.test({
    name: "Can transfer tokens between accounts",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const wallet1 = accounts.get('wallet_1')!;
        
        let block = chain.mineBlock([
            Tx.contractCall('babycoin', 'transfer', [
                types.uint(1000000), // 1 BABY token
                types.principal(deployer.address),
                types.principal(wallet1.address),
                types.none()
            ], deployer.address),
        ]);
        
        block.receipts[0].result.expectOk().expectBool(true);
        
        // Check balances after transfer
        let balanceBlock = chain.mineBlock([
            Tx.contractCall('babycoin', 'get-balance', [types.principal(deployer.address)], deployer.address),
            Tx.contractCall('babycoin', 'get-balance', [types.principal(wallet1.address)], deployer.address),
        ]);
        
        balanceBlock.receipts[0].result.expectOk().expectUint(9999000000);
        balanceBlock.receipts[1].result.expectOk().expectUint(1000000);
    },
});

Clarinet.test({
    name: "Cannot transfer tokens without authorization",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const wallet1 = accounts.get('wallet_1')!;
        const wallet2 = accounts.get('wallet_2')!;
        
        // wallet1 tries to transfer deployer's tokens without authorization
        let block = chain.mineBlock([
            Tx.contractCall('babycoin', 'transfer', [
                types.uint(1000000),
                types.principal(deployer.address),
                types.principal(wallet2.address),
                types.none()
            ], wallet1.address),
        ]);
        
        block.receipts[0].result.expectErr().expectUint(101); // ERR_NOT_TOKEN_OWNER
    },
});

Clarinet.test({
    name: "Cannot transfer to same address",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        
        let block = chain.mineBlock([
            Tx.contractCall('babycoin', 'transfer', [
                types.uint(1000000),
                types.principal(deployer.address),
                types.principal(deployer.address),
                types.none()
            ], deployer.address),
        ]);
        
        block.receipts[0].result.expectErr().expectUint(103); // ERR_INVALID_RECIPIENT
    },
});

Clarinet.test({
    name: "Owner can mint new tokens",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const wallet1 = accounts.get('wallet_1')!;
        
        let block = chain.mineBlock([
            Tx.contractCall('babycoin', 'mint', [
                types.uint(5000000000), // 5000 BABY tokens
                types.principal(wallet1.address)
            ], deployer.address),
        ]);
        
        block.receipts[0].result.expectOk().expectBool(true);
        
        // Check balances and total supply after mint
        let checkBlock = chain.mineBlock([
            Tx.contractCall('babycoin', 'get-balance', [types.principal(wallet1.address)], deployer.address),
            Tx.contractCall('babycoin', 'get-total-supply', [], deployer.address),
        ]);
        
        checkBlock.receipts[0].result.expectOk().expectUint(5000000000);
        checkBlock.receipts[1].result.expectOk().expectUint(15000000000); // 10000 + 5000
    },
});

Clarinet.test({
    name: "Non-owner cannot mint tokens",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const wallet1 = accounts.get('wallet_1')!;
        const wallet2 = accounts.get('wallet_2')!;
        
        let block = chain.mineBlock([
            Tx.contractCall('babycoin', 'mint', [
                types.uint(1000000),
                types.principal(wallet2.address)
            ], wallet1.address),
        ]);
        
        block.receipts[0].result.expectErr().expectUint(100); // ERR_OWNER_ONLY
    },
});

Clarinet.test({
    name: "Cannot mint beyond max supply",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const wallet1 = accounts.get('wallet_1')!;
        
        // Try to mint more than max supply allows
        let block = chain.mineBlock([
            Tx.contractCall('babycoin', 'mint', [
                types.uint(100000000000000), // Exceeds max supply
                types.principal(wallet1.address)
            ], deployer.address),
        ]);
        
        block.receipts[0].result.expectErr().expectUint(104); // Max supply exceeded
    },
});

Clarinet.test({
    name: "Can burn tokens",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        
        let initialBalance = 10000000000;
        let burnAmount = 2000000000;
        
        let block = chain.mineBlock([
            Tx.contractCall('babycoin', 'burn', [
                types.uint(burnAmount)
            ], deployer.address),
        ]);
        
        block.receipts[0].result.expectOk().expectBool(true);
        
        // Check balance and total supply after burn
        let checkBlock = chain.mineBlock([
            Tx.contractCall('babycoin', 'get-balance', [types.principal(deployer.address)], deployer.address),
            Tx.contractCall('babycoin', 'get-total-supply', [], deployer.address),
        ]);
        
        checkBlock.receipts[0].result.expectOk().expectUint(initialBalance - burnAmount);
        checkBlock.receipts[1].result.expectOk().expectUint(initialBalance - burnAmount);
    },
});

Clarinet.test({
    name: "Owner can set token URI",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const tokenUri = "https://babycoin.example.com/metadata.json";
        
        let block = chain.mineBlock([
            Tx.contractCall('babycoin', 'set-token-uri', [
                types.utf8(tokenUri)
            ], deployer.address),
        ]);
        
        block.receipts[0].result.expectOk().expectBool(true);
        
        // Check that URI was set
        let checkBlock = chain.mineBlock([
            Tx.contractCall('babycoin', 'get-token-uri', [], deployer.address),
        ]);
        
        checkBlock.receipts[0].result.expectOk().expectSome().expectUtf8(tokenUri);
    },
});

Clarinet.test({
    name: "Non-owner cannot set token URI",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const wallet1 = accounts.get('wallet_1')!;
        const tokenUri = "https://fake.example.com/metadata.json";
        
        let block = chain.mineBlock([
            Tx.contractCall('babycoin', 'set-token-uri', [
                types.utf8(tokenUri)
            ], wallet1.address),
        ]);
        
        block.receipts[0].result.expectErr().expectUint(100); // ERR_OWNER_ONLY
    },
});


import { describe, expect, it } from "vitest";

const accounts = simnet.getAccounts();
const address1 = accounts.get("wallet_1")!;

/*
  The test below is an example. To learn more, read the testing documentation here:
  https://docs.hiro.so/stacks/clarinet-js-sdk
*/

describe("example tests", () => {
  it("ensures simnet is well initialised", () => {
    expect(simnet.blockHeight).toBeDefined();
  });

  // it("shows an example", () => {
  //   const { result } = simnet.callReadOnlyFn("counter", "get-counter", [], address1);
  //   expect(result).toBeUint(0);
  // });
});
