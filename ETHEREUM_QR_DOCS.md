# Ethereum QR Code Validation & Generation

Complete documentation for the Ethereum QR code utilities following the **EIP-681** standard.

---

## 📋 Table of Contents

1. [What is EIP-681?](#what-is-eip-681)
2. [Installation](#installation)
3. [API Reference](#api-reference)
4. [Usage Examples](#usage-examples)
5. [Integration Guide](#integration-guide)
6. [Best Practices](#best-practices)
7. [Common Chain IDs](#common-chain-ids)
8. [Error Handling](#error-handling)
9. [Testing](#testing)

---

## What is EIP-681?

**EIP-681** (Ethereum Improvement Proposal 681) defines a standard URI scheme for Ethereum payment requests and contract interactions. It allows applications to encode transaction details in a QR code that can be scanned by wallets.

### URI Format

```
ethereum:<address>[@<chainId>][?<parameters>]
```

### Components

- **`address`** (required): The Ethereum address (recipient or contract)
- **`chainId`** (optional): The blockchain network ID
- **`parameters`** (optional): Query parameters like `value`, `data`, `gas`, etc.

### Examples

```
ethereum:0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
ethereum:0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb?value=1000000000000000000
ethereum:0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb?value=1000000000000000000&chainId=1
ethereum:0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb@1?value=1000000000000000000
ethereum:0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb?data=0xa9059cbb&value=0
```

---

## Installation

The utilities are already included in your TradeWMe project. No additional dependencies required!

### Files Included

- `src/lib/ethereum-qr.ts` - Core validation and generation functions
- `src/lib/ethereum-qr.test.ts` - Comprehensive test suite
- `src/components/examples/EthereumQRExample.tsx` - Interactive demo component

---

## API Reference

### `validateEthereumQR(payload, expectedChainId?)`

Validates an Ethereum QR code payload against the EIP-681 standard.

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `payload` | `string` | Yes | The QR code payload to validate |
| `expectedChainId` | `number \| string` | No | Expected chain ID for validation |

#### Returns

```typescript
interface EthereumQRValidationResult {
  ok: boolean;                    // Validation success status
  error?: string;                 // Error message if validation failed
  address?: Address;              // Validated Ethereum address
  value?: string;                 // Value in wei
  chainId?: string;               // Chain ID
  data?: string;                  // Contract call data (hex)
  gas?: string;                   // Gas amount
  gasLimit?: string;              // Gas limit
  gasPrice?: string;              // Gas price
  [key: string]: string | boolean | undefined;  // Custom parameters
}
```

#### Example

```typescript
import { validateEthereumQR } from "@/lib/ethereum-qr";

const result = validateEthereumQR(
  "ethereum:0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb?value=1000000000000000000&chainId=1",
  1
);

if (result.ok) {
  console.log("✅ Valid QR Code");
  console.log("Address:", result.address);
  console.log("Value:", result.value, "wei");
  console.log("Chain ID:", result.chainId);
} else {
  console.error("❌ Invalid:", result.error);
}
```

---

### `generateEthereumQR(address, options?)`

Generates an EIP-681 compliant Ethereum QR code payload.

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `address` | `string` | Yes | Ethereum address |
| `options` | `GenerateEthereumQROptions` | No | Transaction parameters |

#### Options

```typescript
interface GenerateEthereumQROptions {
  value?: string | number;        // Value in wei
  chainId?: number;               // Chain ID
  data?: string;                  // Contract call data (hex)
  gas?: string | number;          // Gas amount
  gasLimit?: string | number;     // Gas limit
  gasPrice?: string | number;     // Gas price
  [key: string]: string | number | undefined;  // Custom parameters
}
```

#### Returns

- `string` - The formatted Ethereum URI
- `null` - If the address is invalid

#### Example

```typescript
import { generateEthereumQR } from "@/lib/ethereum-qr";

// Simple payment request
const qr1 = generateEthereumQR("0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb", {
  value: "1000000000000000000",  // 1 ETH in wei
  chainId: 1
});
// Returns: "ethereum:0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb?chainId=1&value=1000000000000000000"

// Contract interaction
const qr2 = generateEthereumQR("0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb", {
  data: "0xa9059cbb000000000000000000000000...",
  gasLimit: "100000",
  chainId: 8453  // Base
});
```

---

### `parseEthereumAddress(input)`

Extracts and validates an Ethereum address from various input formats.

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `input` | `string` | Yes | Address string (can include ethereum: prefix) |

#### Returns

- `Address` - Validated Ethereum address
- `null` - If the address is invalid

#### Example

```typescript
import { parseEthereumAddress } from "@/lib/ethereum-qr";

const addr1 = parseEthereumAddress("0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb");
const addr2 = parseEthereumAddress("ethereum:0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb");
const addr3 = parseEthereumAddress("ethereum:0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb?value=1000");

// All return: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
```

---

### `formatWeiToEth(wei, decimals?)`

Converts wei to ETH for display purposes.

#### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `wei` | `string \| number` | Yes | - | Value in wei |
| `decimals` | `number` | No | 4 | Number of decimal places |

#### Example

```typescript
import { formatWeiToEth } from "@/lib/ethereum-qr";

const eth = formatWeiToEth("1000000000000000000", 4);
// Returns: "1.0000"
```

---

### `formatEthToWei(eth)`

Converts ETH to wei for transaction processing.

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `eth` | `string \| number` | Yes | Value in ETH |

#### Example

```typescript
import { formatEthToWei } from "@/lib/ethereum-qr";

const wei = formatEthToWei("1.5");
// Returns: "1500000000000000000"
```

---

## Usage Examples

### Basic Validation

```typescript
import { validateEthereumQR } from "@/lib/ethereum-qr";

// Validate a simple payment request
const result = validateEthereumQR(
  "ethereum:0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb?value=1000000000000000000"
);

if (result.ok) {
  // Process the payment
  console.log("Send", result.value, "wei to", result.address);
}
```

### Validation with Chain Check

```typescript
import { validateEthereumQR } from "@/lib/ethereum-qr";
import { useChainId } from "wagmi";

function MyComponent() {
  const chainId = useChainId();
  
  const handleScan = (qrData: string) => {
    const result = validateEthereumQR(qrData, chainId);
    
    if (!result.ok) {
      alert(`Invalid QR: ${result.error}`);
      return;
    }
    
    // Proceed with transaction
    console.log("Valid QR for current chain");
  };
}
```

### Generate Payment Request

```typescript
import { generateEthereumQR, formatEthToWei } from "@/lib/ethereum-qr";
import { useAccount, useChainId } from "wagmi";

function RequestPayment() {
  const { address } = useAccount();
  const chainId = useChainId();
  
  const createPaymentRequest = (ethAmount: string) => {
    if (!address) return null;
    
    const qrPayload = generateEthereumQR(address, {
      value: formatEthToWei(ethAmount),
      chainId: chainId
    });
    
    // Display as QR code or share
    return qrPayload;
  };
  
  const qr = createPaymentRequest("0.5");  // Request 0.5 ETH
  console.log(qr);
}
```

### Contract Interaction QR

```typescript
import { generateEthereumQR } from "@/lib/ethereum-qr";

// Generate QR for ERC-20 token transfer
const tokenAddress = "0x...";  // Token contract address
const transferData = "0xa9059cbb...";  // Encoded transfer function call

const qr = generateEthereumQR(tokenAddress, {
  data: transferData,
  value: "0",  // No ETH sent, just calling contract
  gasLimit: "100000",
  chainId: 1
});
```

---

## Integration Guide

### Step 1: Import the Utilities

```typescript
import { 
  validateEthereumQR, 
  generateEthereumQR,
  formatWeiToEth,
  formatEthToWei 
} from "@/lib/ethereum-qr";
```

### Step 2: Use in Your Components

#### Example: QR Scanner Component

```typescript
"use client";

import { useState } from "react";
import { validateEthereumQR } from "@/lib/ethereum-qr";
import { useChainId } from "wagmi";

export function QRScanner() {
  const chainId = useChainId();
  const [scannedData, setScannedData] = useState("");
  
  const handleScan = (data: string) => {
    setScannedData(data);
    
    const result = validateEthereumQR(data, chainId);
    
    if (result.ok) {
      // Show confirmation dialog
      confirmTransaction(result);
    } else {
      // Show error
      alert(result.error);
    }
  };
  
  const confirmTransaction = (result: any) => {
    // Your transaction logic here
    console.log("Sending to:", result.address);
    console.log("Amount:", result.value);
  };
  
  return (
    <div>
      {/* Your QR scanner UI */}
    </div>
  );
}
```

#### Example: Payment Request Generator

```typescript
"use client";

import { useState } from "react";
import { generateEthereumQR, formatEthToWei } from "@/lib/ethereum-qr";
import { useAccount, useChainId } from "wagmi";
import QRCode from "qrcode";  // Install: npm install qrcode

export function PaymentRequest() {
  const { address } = useAccount();
  const chainId = useChainId();
  const [amount, setAmount] = useState("");
  const [qrImage, setQrImage] = useState("");
  
  const generateQR = async () => {
    if (!address || !amount) return;
    
    const payload = generateEthereumQR(address, {
      value: formatEthToWei(amount),
      chainId: chainId
    });
    
    if (payload) {
      // Generate QR code image
      const imageUrl = await QRCode.toDataURL(payload);
      setQrImage(imageUrl);
    }
  };
  
  return (
    <div>
      <input 
        type="number" 
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Amount in ETH"
      />
      <button onClick={generateQR}>Generate QR</button>
      {qrImage && <img src={qrImage} alt="Payment QR" />}
    </div>
  );
}
```

### Step 3: Add to Your Pages

```typescript
// app/qr-demo/page.tsx
import { EthereumQRExample } from "@/components/examples/EthereumQRExample";

export default function QRDemoPage() {
  return <EthereumQRExample />;
}
```

---

## Best Practices

### ✅ DO

- **Always validate chain ID** when accepting QR codes to prevent cross-chain errors
- **Display amounts in ETH** to users, but store/transmit in wei
- **Show confirmation dialogs** before executing transactions from QR codes
- **Validate addresses** before generating QR codes
- **Handle errors gracefully** with user-friendly messages
- **Test with various formats** to ensure compatibility
- **Use TypeScript** for type safety

### ❌ DON'T

- **Don't skip chain ID validation** - users might scan QR codes for wrong networks
- **Don't auto-execute transactions** from QR codes without user confirmation
- **Don't expose private keys** in QR codes (this library doesn't support that anyway)
- **Don't assume all wallets support EIP-681** - provide fallback options
- **Don't use floating-point math** for wei calculations - use BigInt or string manipulation

---

## Common Chain IDs

| Network | Chain ID | Description |
|---------|----------|-------------|
| Ethereum Mainnet | `1` | Main Ethereum network |
| Base | `8453` | Coinbase L2 network |
| Optimism | `10` | Optimistic rollup L2 |
| Arbitrum One | `42161` | Arbitrum L2 network |
| Polygon | `137` | Polygon PoS network |
| Sepolia | `11155111` | Ethereum testnet |
| Base Sepolia | `84532` | Base testnet |

---

## Error Handling

The validation function returns descriptive errors:

| Error Message | Cause | Solution |
|---------------|-------|----------|
| `"Payload must be a non-empty string"` | Empty or invalid input | Provide valid string |
| `"Payload must start with 'ethereum:'"` | Missing prefix | Add `ethereum:` prefix |
| `"Missing Ethereum address in payload"` | No address provided | Include valid address |
| `"Invalid Ethereum address format"` | Malformed address | Use checksummed address |
| `"Chain ID mismatch: expected X, got Y"` | Wrong network | Switch to correct network |
| `"Value must be a valid number in wei"` | Invalid value format | Use numeric string |
| `"Value must be non-negative"` | Negative value | Use positive value |
| `"Data must be in hex format (0x...)"` | Invalid data format | Use hex string with 0x prefix |
| `"Malformed QR payload"` | Parse error | Check URI format |

### Example Error Handling

```typescript
const result = validateEthereumQR(qrData, expectedChainId);

if (!result.ok) {
  switch (true) {
    case result.error?.includes("Chain ID mismatch"):
      alert("Please switch to the correct network");
      break;
    case result.error?.includes("Invalid Ethereum address"):
      alert("The QR code contains an invalid address");
      break;
    default:
      alert(`QR validation failed: ${result.error}`);
  }
  return;
}

// Proceed with valid result
```

---

## Testing

### Run the Test Suite

```bash
# Using tsx (recommended)
npx tsx src/lib/ethereum-qr.test.ts

# Or using ts-node
npx ts-node src/lib/ethereum-qr.test.ts
```

### Test Coverage

The test suite includes **23 comprehensive tests** covering:

- ✅ Valid QR codes with all parameters
- ✅ Address-only QR codes
- ✅ Invalid addresses
- ✅ Chain ID validation and mismatches
- ✅ Invalid values (non-numeric, negative)
- ✅ Malformed payloads
- ✅ QR generation
- ✅ Round-trip validation (generate → validate)
- ✅ Contract data validation
- ✅ Gas parameter validation
- ✅ Custom parameters
- ✅ Address parsing from various formats
- ✅ Wei ↔ ETH conversions
- ✅ Case-insensitive prefix handling
- ✅ @chainId notation support

### Example Test Output

```
🧪 Running Ethereum QR Validation Test Suite

============================================================
✅ PASS: Should validate complete QR payload
✅ PASS: Should validate address-only QR
✅ PASS: Should reject invalid address
✅ PASS: Should detect chain ID mismatch
...
============================================================
📊 TEST SUMMARY
============================================================
Total Tests: 23
✅ Passed: 23
❌ Failed: 0
Success Rate: 100.0%
============================================================

🎉 All tests passed! The Ethereum QR utilities are working correctly.
```

---

## Additional Resources

- [EIP-681 Specification](https://eips.ethereum.org/EIPS/eip-681)
- [Viem Documentation](https://viem.sh/)
- [Wagmi Documentation](https://wagmi.sh/)
- [Ethereum Unit Converter](https://eth-converter.com/)

---

## Support

For issues or questions:
1. Check this documentation
2. Run the test suite to verify functionality
3. Review the example component for implementation patterns
4. Check the inline code comments in `ethereum-qr.ts`

---

**Last Updated:** December 2025  
**Version:** 1.0.0  
**License:** Part of the TradeWMe project
