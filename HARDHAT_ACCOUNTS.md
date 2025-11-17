# Hardhat Test Accounts

These are the standard Hardhat test accounts that come pre-funded with 10,000 ETH each.

## Quick Reference - First 5 Accounts

**Account 1:**
- Address: `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`
- Private Key: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`
- Balance: 10,000 ETH

**Account 2:**
- Address: `0x70997970C51812dc3A010C7d01b50e0d17dc79C8`
- Private Key: `0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d`
- Balance: 10,000 ETH

**Account 3:**
- Address: `0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC`
- Private Key: `0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a`
- Balance: 10,000 ETH

**Account 4:**
- Address: `0x90F79bf6EB2c4f870365E785982E1f101E93b906`
- Private Key: `0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6`
- Balance: 10,000 ETH

**Account 5:**
- Address: `0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65`
- Private Key: `0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a`
- Balance: 10,000 ETH

## How to Import into MetaMask

1. **Open MetaMask**
2. **Click the account icon** (top right) → **Import Account**
3. **Paste the Private Key** (the long string starting with `0x`)
4. **Click Import**

## Connect MetaMask to Hardhat Network

1. Open MetaMask
2. Click the network dropdown → **Add Network** → **Add a network manually**
3. Enter:
   - **Network Name**: Hardhat Local
   - **RPC URL**: `http://127.0.0.1:8545`
   - **Chain ID**: `1337`
   - **Currency Symbol**: `ETH`
4. Click **Save**

## Get All Accounts

Run this command to see all 20 accounts:
```bash
npx hardhat run scripts/get-accounts.cjs
```

Or check the terminal window where you ran `npx hardhat node` - it displays all accounts with their private keys when it starts!



