import { isAddress, type Address } from "viem";

/**
 * Result type for Ethereum QR validation
 */
export interface EthereumQRValidationResult {
    ok: boolean;
    error?: string;
    address?: Address;
    value?: string;
    chainId?: string;
    data?: string;
    gas?: string;
    gasLimit?: string;
    gasPrice?: string;
    [key: string]: string | boolean | undefined;
}

/**
 * Options for generating Ethereum QR codes
 */
export interface GenerateEthereumQROptions {
    value?: string | number;
    chainId?: number;
    data?: string;
    gas?: string | number;
    gasLimit?: string | number;
    gasPrice?: string | number;
    [key: string]: string | number | undefined;
}

/**
 * Validates an Ethereum QR code payload following the EIP-681 standard
 * 
 * EIP-681 defines a URI scheme for Ethereum transactions:
 * ethereum:<address>[@<chainId>][?<parameters>]
 * 
 * @param payload - The QR code payload (e.g., 'ethereum:0xabc...def?value=1000000000000000000&chainId=1')
 * @param expectedChainId - Optional expected chain ID to validate against
 * @returns Validation result with parsed data or error message
 * 
 * @example
 * ```ts
 * const result = validateEthereumQR(
 *   'ethereum:0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb?value=1000000000000000000&chainId=1',
 *   1
 * );
 * 
 * if (result.ok) {
 *   console.log('Address:', result.address);
 *   console.log('Value:', result.value);
 *   console.log('Chain ID:', result.chainId);
 * } else {
 *   console.error('Validation error:', result.error);
 * }
 * ```
 */
export function validateEthereumQR(
    payload: string,
    expectedChainId?: number | string
): EthereumQRValidationResult {
    // Validate input
    if (!payload || typeof payload !== "string") {
        return { ok: false, error: "Payload must be a non-empty string" };
    }

    // Check if payload starts with 'ethereum:'
    if (!payload.toLowerCase().startsWith("ethereum:")) {
        return { ok: false, error: "Payload must start with 'ethereum:'" };
    }

    try {
        // Parse the ethereum: URI by replacing it with a dummy https:// URL
        // This allows us to use the URL API to parse the address and query parameters
        const url = new URL(payload.replace(/^ethereum:/i, "https://dummy/"));

        // Extract the address from the pathname (remove leading slash)
        let address = url.pathname.replace(/^\//, "");

        // Handle @chainId notation (e.g., ethereum:0xabc@1)
        let chainIdFromAddress: string | undefined;
        if (address.includes("@")) {
            const parts = address.split("@");
            address = parts[0];
            chainIdFromAddress = parts[1];
        }

        // Validate that we have an address
        if (!address) {
            return { ok: false, error: "Missing Ethereum address in payload" };
        }

        // Validate the Ethereum address using viem's isAddress utility
        if (!isAddress(address)) {
            return { ok: false, error: "Invalid Ethereum address format" };
        }

        // Parse query parameters
        const params = new URLSearchParams(url.search);
        const result: EthereumQRValidationResult = {
            ok: true,
            address: address as Address,
        };

        // Extract chainId from params or from @chainId notation
        const chainIdFromParams = params.get("chainId");
        const chainId = chainIdFromParams || chainIdFromAddress;

        if (chainId) {
            // Validate chainId is a valid number
            if (isNaN(Number(chainId))) {
                return { ok: false, error: "Chain ID must be a valid number" };
            }

            result.chainId = chainId;

            // Validate against expected chain ID if provided
            if (expectedChainId !== undefined) {
                if (Number(chainId) !== Number(expectedChainId)) {
                    return {
                        ok: false,
                        error: `Chain ID mismatch: expected ${expectedChainId}, got ${chainId}`
                    };
                }
            }
        }

        // Extract and validate value (in wei)
        const value = params.get("value");
        if (value) {
            // Validate value is a valid number
            if (isNaN(Number(value))) {
                return { ok: false, error: "Value must be a valid number in wei" };
            }

            // Validate that value is non-negative
            if (Number(value) < 0) {
                return { ok: false, error: "Value must be non-negative" };
            }

            result.value = value;
        }

        // Extract other common parameters
        const data = params.get("data");
        if (data) {
            // Validate data is hex format
            if (!/^0x[0-9a-fA-F]*$/.test(data)) {
                return { ok: false, error: "Data must be in hex format (0x...)" };
            }
            result.data = data;
        }

        // Extract gas parameters
        const gas = params.get("gas");
        if (gas) {
            if (isNaN(Number(gas)) || Number(gas) < 0) {
                return { ok: false, error: "Gas must be a valid non-negative number" };
            }
            result.gas = gas;
        }

        const gasLimit = params.get("gasLimit");
        if (gasLimit) {
            if (isNaN(Number(gasLimit)) || Number(gasLimit) < 0) {
                return { ok: false, error: "Gas limit must be a valid non-negative number" };
            }
            result.gasLimit = gasLimit;
        }

        const gasPrice = params.get("gasPrice");
        if (gasPrice) {
            if (isNaN(Number(gasPrice)) || Number(gasPrice) < 0) {
                return { ok: false, error: "Gas price must be a valid non-negative number" };
            }
            result.gasPrice = gasPrice;
        }

        // Include any other parameters
        params.forEach((value, key) => {
            if (!["chainId", "value", "data", "gas", "gasLimit", "gasPrice"].includes(key)) {
                result[key] = value;
            }
        });

        return result;
    } catch (err) {
        // Catch any parsing errors (e.g., malformed URL)
        return {
            ok: false,
            error: err instanceof Error ? `Malformed QR payload: ${err.message}` : "Malformed QR code payload"
        };
    }
}

/**
 * Generates an Ethereum QR code payload following the EIP-681 standard
 * 
 * @param address - The Ethereum address
 * @param options - Optional parameters (value in wei, chainId, data, gas params, etc.)
 * @returns The formatted Ethereum URI string, or null if address is invalid
 * 
 * @example
 * ```ts
 * // Simple payment request
 * const qr1 = generateEthereumQR('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb', {
 *   value: '1000000000000000000', // 1 ETH in wei
 *   chainId: 1
 * });
 * // Returns: 'ethereum:0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb?value=1000000000000000000&chainId=1'
 * 
 * // Contract interaction
 * const qr2 = generateEthereumQR('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb', {
 *   data: '0xa9059cbb000000000000000000000000...',
 *   gasLimit: '100000',
 *   chainId: 8453
 * });
 * ```
 */
export function generateEthereumQR(
    address: string,
    options?: GenerateEthereumQROptions
): string | null {
    // Validate the address first
    if (!address || !isAddress(address)) {
        return null;
    }

    // Start with the base ethereum: URI
    let uri = `ethereum:${address}`;

    // Add query parameters if provided
    if (options && Object.keys(options).length > 0) {
        const params = new URLSearchParams();

        // Add parameters in a consistent order
        const orderedKeys = ["chainId", "value", "data", "gas", "gasLimit", "gasPrice"];

        // Add ordered parameters first
        orderedKeys.forEach((key) => {
            const value = options[key];
            if (value !== undefined && value !== null) {
                params.append(key, String(value));
            }
        });

        // Add any other custom parameters
        Object.entries(options).forEach(([key, value]) => {
            if (!orderedKeys.includes(key) && value !== undefined && value !== null) {
                params.append(key, String(value));
            }
        });

        const queryString = params.toString();
        if (queryString) {
            uri += `?${queryString}`;
        }
    }

    return uri;
}

/**
 * Parses an Ethereum address from various formats
 * Useful for handling user input
 * 
 * @param input - Address string (can include ethereum: prefix)
 * @returns Validated address or null
 */
export function parseEthereumAddress(input: string): Address | null {
    if (!input) return null;

    // Remove ethereum: prefix if present
    let address = input.replace(/^ethereum:/i, "").split("?")[0].split("@")[0];

    // Remove leading slash if present
    address = address.replace(/^\//, "");

    // Validate and return
    return isAddress(address) ? (address as Address) : null;
}

/**
 * Formats wei value to ETH for display
 * 
 * @param wei - Value in wei (as string or number)
 * @param decimals - Number of decimal places (default: 4)
 * @returns Formatted ETH value
 */
export function formatWeiToEth(wei: string | number, decimals: number = 4): string {
    const weiValue = BigInt(wei);
    const ethValue = Number(weiValue) / 1e18;
    return ethValue.toFixed(decimals);
}

/**
 * Formats ETH value to wei
 * 
 * @param eth - Value in ETH (as string or number)
 * @returns Wei value as string
 */
export function formatEthToWei(eth: string | number): string {
    const ethValue = Number(eth);
    const weiValue = BigInt(Math.floor(ethValue * 1e18));
    return weiValue.toString();
}
