/**
 * Comprehensive test suite for Ethereum QR code validation
 * 
 * Run these tests to verify the validateEthereumQR and generateEthereumQR functions
 * work correctly with various inputs and edge cases.
 */

import {
    validateEthereumQR,
    generateEthereumQR,
    parseEthereumAddress,
    formatWeiToEth,
    formatEthToWei
} from "./ethereum-qr";

// Test data - using properly checksummed Ethereum addresses
const VALID_ADDRESS = "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"; // vitalik.eth
const VALID_ADDRESS_2 = "0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed"; // Sample address
const INVALID_ADDRESS = "0xinvalid";
const INVALID_ADDRESS_2 = "not-an-address";
const VALID_VALUE = "1000000000000000000"; // 1 ETH in wei
const VALID_CHAIN_ID = 1; // Ethereum mainnet
const BASE_CHAIN_ID = 8453; // Base

console.log("🧪 Running Ethereum QR Validation Test Suite\n");
console.log("=".repeat(60));

let passCount = 0;
let failCount = 0;

function runTest(testName: string, condition: boolean, details?: any) {
    if (condition) {
        console.log(`✅ PASS: ${testName}`);
        passCount++;
    } else {
        console.log(`❌ FAIL: ${testName}`);
        if (details) console.log("   Details:", details);
        failCount++;
    }
}

// ============================================================================
// TEST 1: Valid QR with all parameters
// ============================================================================
console.log("\n📋 Test 1: Valid QR with address, value, and chainId");
const test1 = validateEthereumQR(
    `ethereum:${VALID_ADDRESS}?value=${VALID_VALUE}&chainId=${VALID_CHAIN_ID}`,
    VALID_CHAIN_ID
);
runTest(
    "Should validate complete QR payload",
    test1.ok === true &&
    test1.address === VALID_ADDRESS &&
    test1.value === VALID_VALUE &&
    test1.chainId === String(VALID_CHAIN_ID),
    test1
);

// ============================================================================
// TEST 2: Valid QR with only address
// ============================================================================
console.log("\n📋 Test 2: Valid QR with only address");
const test2 = validateEthereumQR(`ethereum:${VALID_ADDRESS}`);
runTest(
    "Should validate address-only QR",
    test2.ok === true &&
    test2.address === VALID_ADDRESS &&
    test2.value === undefined &&
    test2.chainId === undefined,
    test2
);

// ============================================================================
// TEST 3: Invalid Ethereum address
// ============================================================================
console.log("\n📋 Test 3: Invalid Ethereum address");
const test3 = validateEthereumQR(`ethereum:${INVALID_ADDRESS}`);
runTest(
    "Should reject invalid address",
    test3.ok === false &&
    test3.error?.includes("Invalid Ethereum address"),
    test3
);

// ============================================================================
// TEST 4: Chain ID mismatch
// ============================================================================
console.log("\n📋 Test 4: Chain ID mismatch");
const test4 = validateEthereumQR(
    `ethereum:${VALID_ADDRESS}?chainId=1`,
    BASE_CHAIN_ID
);
runTest(
    "Should detect chain ID mismatch",
    test4.ok === false &&
    test4.error?.includes("Chain ID mismatch"),
    test4
);

// ============================================================================
// TEST 5: Invalid value (not a number)
// ============================================================================
console.log("\n📋 Test 5: Invalid value (not a number)");
const test5 = validateEthereumQR(
    `ethereum:${VALID_ADDRESS}?value=invalid`
);
runTest(
    "Should reject non-numeric value",
    test5.ok === false &&
    test5.error?.includes("Value must be a valid number"),
    test5
);

// ============================================================================
// TEST 6: Malformed QR payload
// ============================================================================
console.log("\n📋 Test 6: Malformed QR payload");
const test6 = validateEthereumQR("not-a-valid-qr");
runTest(
    "Should reject malformed payload",
    test6.ok === false &&
    test6.error?.includes("ethereum:"),
    test6
);

// ============================================================================
// TEST 7: Generate QR code
// ============================================================================
console.log("\n📋 Test 7: Generate QR code");
const test7 = generateEthereumQR(VALID_ADDRESS, {
    value: VALID_VALUE,
    chainId: VALID_CHAIN_ID,
});
runTest(
    "Should generate valid QR payload",
    test7 !== null &&
    test7.includes(`ethereum:${VALID_ADDRESS}`) &&
    test7.includes(`value=${VALID_VALUE}`) &&
    test7.includes(`chainId=${VALID_CHAIN_ID}`),
    test7
);

// ============================================================================
// TEST 8: Generate QR with invalid address
// ============================================================================
console.log("\n📋 Test 8: Generate QR with invalid address");
const test8 = generateEthereumQR(INVALID_ADDRESS);
runTest(
    "Should return null for invalid address",
    test8 === null,
    test8
);

// ============================================================================
// TEST 9: Validate a generated QR code (round-trip)
// ============================================================================
console.log("\n📋 Test 9: Validate a generated QR code (round-trip)");
const generated = generateEthereumQR(VALID_ADDRESS, {
    value: VALID_VALUE,
    chainId: VALID_CHAIN_ID,
});
const test9 = generated ? validateEthereumQR(generated, VALID_CHAIN_ID) : null;
runTest(
    "Should validate its own generated QR",
    test9 !== null &&
    test9.ok === true &&
    test9.address === VALID_ADDRESS,
    test9
);

// ============================================================================
// TEST 10: Negative value
// ============================================================================
console.log("\n📋 Test 10: Negative value should fail");
const test10 = validateEthereumQR(
    `ethereum:${VALID_ADDRESS}?value=-1000`
);
runTest(
    "Should reject negative value",
    test10.ok === false &&
    test10.error?.includes("non-negative"),
    test10
);

// ============================================================================
// TEST 11: Missing address
// ============================================================================
console.log("\n📋 Test 11: Missing address");
const test11 = validateEthereumQR("ethereum:?value=1000");
runTest(
    "Should reject missing address",
    test11.ok === false &&
    test11.error?.includes("address"),
    test11
);

// ============================================================================
// TEST 12: QR with data parameter (contract interaction)
// ============================================================================
console.log("\n📋 Test 12: QR with data parameter");
const test12 = validateEthereumQR(
    `ethereum:${VALID_ADDRESS}?data=0xa9059cbb&value=0`
);
runTest(
    "Should validate QR with data parameter",
    test12.ok === true &&
    test12.data === "0xa9059cbb",
    test12
);

// ============================================================================
// TEST 13: Invalid data format
// ============================================================================
console.log("\n📋 Test 13: Invalid data format (not hex)");
const test13 = validateEthereumQR(
    `ethereum:${VALID_ADDRESS}?data=notHex`
);
runTest(
    "Should reject invalid hex data",
    test13.ok === false &&
    test13.error?.includes("hex format"),
    test13
);

// ============================================================================
// TEST 14: QR with gas parameters
// ============================================================================
console.log("\n📋 Test 14: QR with gas parameters");
const test14 = validateEthereumQR(
    `ethereum:${VALID_ADDRESS}?gas=21000&gasLimit=100000&gasPrice=20000000000`
);
runTest(
    "Should validate QR with gas parameters",
    test14.ok === true &&
    test14.gas === "21000" &&
    test14.gasLimit === "100000" &&
    test14.gasPrice === "20000000000",
    test14
);

// ============================================================================
// TEST 15: Invalid gas parameter
// ============================================================================
console.log("\n📋 Test 15: Invalid gas parameter");
const test15 = validateEthereumQR(
    `ethereum:${VALID_ADDRESS}?gas=-100`
);
runTest(
    "Should reject negative gas",
    test15.ok === false &&
    test15.error?.includes("Gas must be"),
    test15
);

// ============================================================================
// TEST 16: QR with extra custom parameters
// ============================================================================
console.log("\n📋 Test 16: QR with extra custom parameters");
const test16 = validateEthereumQR(
    `ethereum:${VALID_ADDRESS}?value=1000&customParam=test&anotherParam=123`
);
runTest(
    "Should accept and preserve custom parameters",
    test16.ok === true &&
    test16.customParam === "test" &&
    test16.anotherParam === "123",
    test16
);

// ============================================================================
// TEST 17: Generate QR with custom parameters
// ============================================================================
console.log("\n📋 Test 17: Generate QR with custom parameters");
const test17 = generateEthereumQR(VALID_ADDRESS, {
    value: "500000000000000000",
    chainId: BASE_CHAIN_ID,
    customField: "test-value",
});
runTest(
    "Should generate QR with custom parameters",
    test17 !== null &&
    test17.includes("customField=test-value"),
    test17
);

// ============================================================================
// TEST 18: Parse Ethereum address from various formats
// ============================================================================
console.log("\n📋 Test 18: Parse Ethereum address");
const test18a = parseEthereumAddress(VALID_ADDRESS);
const test18b = parseEthereumAddress(`ethereum:${VALID_ADDRESS}`);
const test18c = parseEthereumAddress(`ethereum:${VALID_ADDRESS}?value=1000`);
const test18d = parseEthereumAddress(INVALID_ADDRESS_2);
runTest(
    "Should parse address from various formats",
    test18a === VALID_ADDRESS &&
    test18b === VALID_ADDRESS &&
    test18c === VALID_ADDRESS &&
    test18d === null,
    { test18a, test18b, test18c, test18d }
);

// ============================================================================
// TEST 19: Wei to ETH conversion
// ============================================================================
console.log("\n📋 Test 19: Wei to ETH conversion");
const test19 = formatWeiToEth("1000000000000000000", 4);
runTest(
    "Should convert wei to ETH",
    test19 === "1.0000",
    test19
);

// ============================================================================
// TEST 20: ETH to Wei conversion
// ============================================================================
console.log("\n📋 Test 20: ETH to Wei conversion");
const test20 = formatEthToWei("1.5");
runTest(
    "Should convert ETH to wei",
    test20 === "1500000000000000000",
    test20
);

// ============================================================================
// TEST 21: Empty payload
// ============================================================================
console.log("\n📋 Test 21: Empty payload");
const test21 = validateEthereumQR("");
runTest(
    "Should reject empty payload",
    test21.ok === false &&
    test21.error?.includes("non-empty string"),
    test21
);

// ============================================================================
// TEST 22: Case insensitive ethereum: prefix
// ============================================================================
console.log("\n📋 Test 22: Case insensitive ethereum: prefix");
const test22a = validateEthereumQR(`ETHEREUM:${VALID_ADDRESS}`);
const test22b = validateEthereumQR(`Ethereum:${VALID_ADDRESS}`);
runTest(
    "Should accept case-insensitive ethereum: prefix",
    test22a.ok === true && test22b.ok === true,
    { test22a, test22b }
);

// ============================================================================
// TEST 23: @chainId notation (alternative format)
// ============================================================================
console.log("\n📋 Test 23: @chainId notation");
const test23 = validateEthereumQR(
    `ethereum:${VALID_ADDRESS}@${VALID_CHAIN_ID}?value=1000`,
    VALID_CHAIN_ID
);
runTest(
    "Should support @chainId notation",
    test23.ok === true &&
    test23.chainId === String(VALID_CHAIN_ID),
    test23
);

// ============================================================================
// SUMMARY
// ============================================================================
console.log("\n" + "=".repeat(60));
console.log("📊 TEST SUMMARY");
console.log("=".repeat(60));
console.log(`Total Tests: ${passCount + failCount}`);
console.log(`✅ Passed: ${passCount}`);
console.log(`❌ Failed: ${failCount}`);
console.log(`Success Rate: ${((passCount / (passCount + failCount)) * 100).toFixed(1)}%`);
console.log("=".repeat(60));

if (failCount === 0) {
    console.log("\n🎉 All tests passed! The Ethereum QR utilities are working correctly.");
} else {
    console.log("\n⚠️  Some tests failed. Please review the errors above.");
}
