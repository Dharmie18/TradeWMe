// ============================================================================
// BLOCKCHAIN UTILITIES - Real-time transaction verification
// ============================================================================

import { createPublicClient, http, formatEther, type PublicClient } from 'viem';
import { mainnet, polygon, bsc, arbitrum, optimism } from 'viem/chains';
import type { NetworkType } from '@/types/trading';

// Network configurations
const NETWORK_CONFIGS = {
  ethereum: {
    chain: mainnet,
    rpcUrl: 'https://eth.llamarpc.com', // Free public RPC
    explorerUrl: 'https://etherscan.io',
  },
  polygon: {
    chain: polygon,
    rpcUrl: 'https://polygon-rpc.com', // Free public RPC
    explorerUrl: 'https://polygonscan.com',
  },
  bsc: {
    chain: bsc,
    rpcUrl: 'https://bsc-dataseed.binance.org', // Free public RPC
    explorerUrl: 'https://bscscan.com',
  },
  arbitrum: {
    chain: arbitrum,
    rpcUrl: 'https://arb1.arbitrum.io/rpc', // Free public RPC
    explorerUrl: 'https://arbiscan.io',
  },
  optimism: {
    chain: optimism,
    rpcUrl: 'https://mainnet.optimism.io', // Free public RPC
    explorerUrl: 'https://optimistic.etherscan.io',
  },
} as const;

// Platform deposit address (REPLACE WITH YOUR ACTUAL ADDRESS)
export const PLATFORM_DEPOSIT_ADDRESS = process.env.NEXT_PUBLIC_PLATFORM_DEPOSIT_ADDRESS || '0x0000000000000000000000000000000000000000';

/**
 * Get public client for a specific network
 */
export function getPublicClient(network: NetworkType): PublicClient {
  const config = NETWORK_CONFIGS[network];
  
  return createPublicClient({
    chain: config.chain,
    transport: http(config.rpcUrl),
  });
}

/**
 * Verify a transaction on the blockchain
 * Returns transaction details including confirmations
 */
export async function verifyTransaction(txHash: string, network: NetworkType) {
  try {
    const client = getPublicClient(network);
    
    // Get transaction receipt
    const receipt = await client.getTransactionReceipt({
      hash: txHash as `0x${string}`,
    });

    if (!receipt) {
      return {
        success: false,
        error: 'Transaction not found',
      };
    }

    // Get transaction details
    const transaction = await client.getTransaction({
      hash: txHash as `0x${string}`,
    });

    // Get current block number for confirmations
    const currentBlock = await client.getBlockNumber();
    const confirmations = Number(currentBlock - receipt.blockNumber);

    // Get block timestamp
    const block = await client.getBlock({
      blockNumber: receipt.blockNumber,
    });

    return {
      success: true,
      transaction: {
        hash: receipt.transactionHash,
        from: transaction.from,
        to: transaction.to || '',
        value: formatEther(transaction.value),
        blockNumber: Number(receipt.blockNumber),
        confirmations,
        status: receipt.status === 'success' ? 'success' : 'failed',
        gasUsed: receipt.gasUsed.toString(),
        gasPrice: transaction.gasPrice?.toString() || '0',
        timestamp: Number(block.timestamp),
      },
    };
  } catch (error) {
    console.error('Error verifying transaction:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to verify transaction',
    };
  }
}

/**
 * Check if transaction is sent to platform address
 */
export function isValidDepositAddress(toAddress: string): boolean {
  return toAddress.toLowerCase() === PLATFORM_DEPOSIT_ADDRESS.toLowerCase();
}

/**
 * Get minimum confirmations required for a network
 */
export function getRequiredConfirmations(network: NetworkType): number {
  const confirmations = {
    ethereum: 12, // ~3 minutes
    polygon: 128, // ~5 minutes
    bsc: 15, // ~45 seconds
    arbitrum: 10,
    optimism: 10,
  };
  
  return confirmations[network] || 12;
}

/**
 * Check if transaction has enough confirmations
 */
export function hasEnoughConfirmations(
  confirmations: number,
  network: NetworkType
): boolean {
  return confirmations >= getRequiredConfirmations(network);
}

/**
 * Get explorer URL for a transaction
 */
export function getExplorerUrl(txHash: string, network: NetworkType): string {
  const config = NETWORK_CONFIGS[network];
  return `${config.explorerUrl}/tx/${txHash}`;
}

/**
 * Get current ETH price in USD (using CoinGecko)
 */
export async function getEthPriceUsd(): Promise<number> {
  try {
    const apiKey = process.env.COINGECKO_API_KEY;
    const url = apiKey
      ? `https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd&x_cg_demo_api_key=${apiKey}`
      : 'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd';

    const response = await fetch(url);
    const data = await response.json();
    
    return data.ethereum?.usd || 0;
  } catch (error) {
    console.error('Error fetching ETH price:', error);
    return 0;
  }
}

/**
 * Get token price in USD (supports multiple tokens)
 */
export async function getTokenPriceUsd(tokenSymbol: string): Promise<number> {
  try {
    const tokenIds: Record<string, string> = {
      ETH: 'ethereum',
      WETH: 'weth',
      USDT: 'tether',
      USDC: 'usd-coin',
      DAI: 'dai',
      MATIC: 'matic-network',
      BNB: 'binancecoin',
    };

    const tokenId = tokenIds[tokenSymbol.toUpperCase()];
    if (!tokenId) {
      throw new Error(`Unsupported token: ${tokenSymbol}`);
    }

    // Stablecoins always return 1
    if (['USDT', 'USDC', 'DAI'].includes(tokenSymbol.toUpperCase())) {
      return 1.0;
    }

    const apiKey = process.env.COINGECKO_API_KEY;
    const url = apiKey
      ? `https://api.coingecko.com/api/v3/simple/price?ids=${tokenId}&vs_currencies=usd&x_cg_demo_api_key=${apiKey}`
      : `https://api.coingecko.com/api/v3/simple/price?ids=${tokenId}&vs_currencies=usd`;

    const response = await fetch(url);
    const data = await response.json();
    
    return data[tokenId]?.usd || 0;
  } catch (error) {
    console.error('Error fetching token price:', error);
    return 0;
  }
}

/**
 * Calculate USD value of a token amount
 */
export async function calculateUsdValue(
  amount: string,
  currency: string
): Promise<number> {
  const price = await getTokenPriceUsd(currency);
  const numericAmount = parseFloat(amount);
  
  return numericAmount * price;
}

/**
 * Format wallet address for display (0x1234...5678)
 */
export function formatAddress(address: string): string {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Validate Ethereum address format
 */
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Validate transaction hash format
 */
export function isValidTxHash(txHash: string): boolean {
  return /^0x[a-fA-F0-9]{64}$/.test(txHash);
}
