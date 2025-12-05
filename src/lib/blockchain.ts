// =============================================================================
// BLOCKCHAIN VERIFICATION - Real Transaction Verification
// =============================================================================

import { ethers } from 'ethers';
import { createPublicClient, http, formatEther } from 'viem';
import { mainnet, sepolia, bsc, polygon } from 'viem/chains';

// Network configurations
const NETWORKS = {
  ethereum: {
    chain: mainnet,
    rpcUrl: process.env.ETHEREUM_RPC_URL!,
    minConfirmations: parseInt(process.env.MIN_ETH_CONFIRMATIONS || '12'),
  },
  'ethereum-testnet': {
    chain: sepolia,
    rpcUrl: process.env.ETHEREUM_TESTNET_RPC_URL!,
    minConfirmations: 3,
  },
  bsc: {
    chain: bsc,
    rpcUrl: process.env.BSC_RPC_URL!,
    minConfirmations: parseInt(process.env.MIN_BSC_CONFIRMATIONS || '15'),
  },
  polygon: {
    chain: polygon,
    rpcUrl: process.env.POLYGON_RPC_URL!,
    minConfirmations: parseInt(process.env.MIN_POLYGON_CONFIRMATIONS || '128'),
  },
};

export type NetworkType = keyof typeof NETWORKS;

/**
 * Get public client for blockchain interaction
 */
export function getPublicClient(network: NetworkType) {
  const config = NETWORKS[network];

  return createPublicClient({
    chain: config.chain,
    transport: http(config.rpcUrl),
  });
}

/**
 * Verify a transaction on the blockchain
 * Returns full transaction details with confirmations
 */
export async function verifyTransaction(
  txHash: string,
  network: NetworkType
) {
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

    // Get current block for confirmations
    const currentBlock = await client.getBlockNumber();
    const confirmations = Number(currentBlock - receipt.blockNumber);

    // Get block timestamp
    const block = await client.getBlock({
      blockNumber: receipt.blockNumber,
    });

    // Check if transaction succeeded
    const status = receipt.status === 'success' ? 'success' : 'failed';

    return {
      success: true,
      transaction: {
        hash: receipt.transactionHash,
        from: transaction.from,
        to: transaction.to || '',
        value: formatEther(transaction.value),
        blockNumber: Number(receipt.blockNumber),
        confirmations,
        status,
        gasUsed: receipt.gasUsed.toString(),
        gasPrice: transaction.gasPrice?.toString() || '0',
        timestamp: Number(block.timestamp),
        blockTimestamp: new Date(Number(block.timestamp) * 1000),
      },
    };
  } catch (error) {
    console.error('Transaction verification error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Verification failed',
    };
  }
}

/**
 * Check if transaction has enough confirmations
 */
export function hasEnoughConfirmations(
  confirmations: number,
  network: NetworkType
): boolean {
  const required = NETWORKS[network].minConfirmations;
  return confirmations >= required;
}

/**
 * Get required confirmations for network
 */
export function getRequiredConfirmations(network: NetworkType): number {
  return NETWORKS[network].minConfirmations;
}

/**
 * Validate Ethereum address
 */
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Validate transaction hash
 */
export function isValidTxHash(txHash: string): boolean {
  return /^0x[a-fA-F0-9]{64}$/.test(txHash);
}

/**
 * Get token price in USD from CoinGecko
 */
export async function getTokenPriceUsd(symbol: string): Promise<number> {
  try {
    const tokenIds: Record<string, string> = {
      ETH: 'ethereum',
      BTC: 'bitcoin',
      SOL: 'solana',
      USDT: 'tether',
      USDC: 'usd-coin',
      BNB: 'binancecoin',
      MATIC: 'matic-network',
    };

    const tokenId = tokenIds[symbol.toUpperCase()];
    if (!tokenId) {
      throw new Error(`Unsupported token: ${symbol}`);
    }

    // Stablecoins always return 1
    if (['USDT', 'USDC'].includes(symbol.toUpperCase())) {
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
    console.error('Price fetch error:', error);
    return 0;
  }
}

/**
 * Calculate USD value of token amount
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
 * Format address for display
 */
export function formatAddress(address: string): string {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Get explorer URL for transaction
 */
export function getExplorerUrl(txHash: string, network: NetworkType): string {
  const explorers: Record<NetworkType, string> = {
    ethereum: 'https://etherscan.io',
    'ethereum-testnet': 'https://sepolia.etherscan.io',
    bsc: 'https://bscscan.com',
    polygon: 'https://polygonscan.com',
  };

  return `${explorers[network]}/tx/${txHash}`;
}

export const PLATFORM_DEPOSIT_ADDRESS = process.env.NEXT_PUBLIC_PLATFORM_DEPOSIT_ADDRESS || '0x0000000000000000000000000000000000000000';

export function isValidDepositAddress(address: string): boolean {
  return address.toLowerCase() === PLATFORM_DEPOSIT_ADDRESS.toLowerCase();
}
