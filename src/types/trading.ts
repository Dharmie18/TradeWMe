// ============================================================================
// TRADING PLATFORM TYPES - Wallet Integration & Deposits
// ============================================================================

// Wallet Types
export type WalletType = 'metamask' | 'coinbase' | 'walletconnect' | 'trust' | 'rainbow';
export type NetworkType = 'ethereum' | 'polygon' | 'bsc' | 'arbitrum' | 'optimism';
export type CurrencyType = 'ETH' | 'USDT' | 'USDC' | 'DAI' | 'WETH' | 'MATIC' | 'BNB';

// Transaction Status
export type TransactionStatus = 'pending' | 'confirmed' | 'failed' | 'cancelled';
export type ProfitType = 'daily' | 'trading' | 'staking' | 'referral' | 'bonus';
export type ProfitStatus = 'pending' | 'applied' | 'cancelled';

// ============================================================================
// WALLET CONNECTION
// ============================================================================

export interface WalletConnectionRequest {
  walletAddress: string;
  walletType: WalletType;
  signature?: string; // Optional signature for verification
  message?: string; // Message that was signed
}

export interface WalletConnectionResponse {
  success: boolean;
  wallet?: {
    id: number;
    walletAddress: string;
    walletType: WalletType;
    isActive: boolean;
    createdAt: string;
  };
  message: string;
  error?: string;
}

export interface WalletDisconnectRequest {
  walletAddress: string;
}

export interface WalletDisconnectResponse {
  success: boolean;
  message: string;
}

// ============================================================================
// DEPOSITS
// ============================================================================

export interface DepositRequest {
  txHash: string;
  fromAddress: string;
  amount: string;
  currency: CurrencyType;
  network: NetworkType;
}

export interface DepositResponse {
  success: boolean;
  deposit?: {
    id: number;
    txHash: string;
    amount: string;
    currency: CurrencyType;
    amountUsd: number;
    status: TransactionStatus;
    confirmations: number;
    depositedAt: string;
  };
  message: string;
  error?: string;
}

export interface DepositStatusRequest {
  txHash: string;
}

export interface DepositStatusResponse {
  success: boolean;
  deposit?: {
    id: number;
    txHash: string;
    amount: string;
    currency: CurrencyType;
    amountUsd: number;
    status: TransactionStatus;
    confirmations: number;
    blockNumber?: number;
    depositedAt: string;
    confirmedAt?: string;
  };
  message: string;
  error?: string;
}

export interface DepositHistoryRequest {
  limit?: number;
  offset?: number;
  status?: TransactionStatus;
  currency?: CurrencyType;
}

export interface DepositHistoryResponse {
  success: boolean;
  deposits: Array<{
    id: number;
    txHash: string;
    amount: string;
    currency: CurrencyType;
    amountUsd: number;
    status: TransactionStatus;
    confirmations: number;
    network: NetworkType;
    depositedAt: string;
    confirmedAt?: string;
  }>;
  total: number;
  message: string;
}

// ============================================================================
// BALANCE
// ============================================================================

export interface BalanceResponse {
  success: boolean;
  balances: Array<{
    currency: CurrencyType;
    balance: string;
    lockedBalance: string;
    availableBalance: string;
    totalDeposited: string;
    totalWithdrawn: string;
    totalProfits: string;
    balanceUsd: number;
    lastUpdated: string;
  }>;
  totalBalanceUsd: number;
  message: string;
}

export interface BalanceUpdateRequest {
  currency: CurrencyType;
  amount: string;
  operation: 'add' | 'subtract' | 'lock' | 'unlock';
  reason?: string;
}

// ============================================================================
// PROFITS
// ============================================================================

export interface ProfitCalculationRequest {
  profitType: ProfitType;
  currency?: CurrencyType; // If not provided, calculate for all currencies
  customRate?: number; // Override default rate
}

export interface ProfitCalculationResponse {
  success: boolean;
  profits: Array<{
    id: number;
    currency: CurrencyType;
    amount: string;
    amountUsd: number;
    rate: number;
    baseAmount: string;
    profitType: ProfitType;
    calculatedAt: string;
    status: ProfitStatus;
  }>;
  totalProfitUsd: number;
  message: string;
}

export interface ProfitHistoryRequest {
  limit?: number;
  offset?: number;
  profitType?: ProfitType;
  status?: ProfitStatus;
  startDate?: string;
  endDate?: string;
}

export interface ProfitHistoryResponse {
  success: boolean;
  profits: Array<{
    id: number;
    currency: CurrencyType;
    amount: string;
    amountUsd: number;
    rate: number;
    profitType: ProfitType;
    calculatedAt: string;
    appliedAt?: string;
    status: ProfitStatus;
  }>;
  total: number;
  totalProfitUsd: number;
  message: string;
}

export interface ProfitSettingsResponse {
  success: boolean;
  settings?: {
    dailyProfitRate: number;
    tradingProfitRate: number;
    compoundingEnabled: boolean;
    autoApplyProfits: boolean;
    minBalanceForProfits: string;
    lastProfitCalculation?: string;
  };
  message: string;
}

export interface ProfitSettingsUpdateRequest {
  dailyProfitRate?: number;
  tradingProfitRate?: number;
  compoundingEnabled?: boolean;
  autoApplyProfits?: boolean;
  minBalanceForProfits?: string;
}

// ============================================================================
// DASHBOARD SUMMARY
// ============================================================================

export interface DashboardSummaryResponse {
  success: boolean;
  summary: {
    totalBalanceUsd: number;
    totalDepositsUsd: number;
    totalProfitsUsd: number;
    profitPercentage: number;
    balances: Array<{
      currency: CurrencyType;
      balance: string;
      balanceUsd: number;
    }>;
    recentDeposits: Array<{
      txHash: string;
      amount: string;
      currency: CurrencyType;
      amountUsd: number;
      depositedAt: string;
    }>;
    recentProfits: Array<{
      amount: string;
      currency: CurrencyType;
      amountUsd: number;
      profitType: ProfitType;
      calculatedAt: string;
    }>;
    connectedWallet?: {
      address: string;
      type: WalletType;
    };
  };
  message: string;
}

// ============================================================================
// BLOCKCHAIN TRANSACTION VERIFICATION
// ============================================================================

export interface TransactionVerificationRequest {
  txHash: string;
  network: NetworkType;
}

export interface TransactionVerificationResponse {
  success: boolean;
  transaction?: {
    hash: string;
    from: string;
    to: string;
    value: string;
    blockNumber: number;
    confirmations: number;
    status: 'success' | 'failed' | 'pending';
    gasUsed: string;
    gasPrice: string;
    timestamp: number;
  };
  message: string;
  error?: string;
}

// ============================================================================
// ERROR TYPES
// ============================================================================

export interface ApiError {
  success: false;
  error: string;
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export interface PaginationParams {
  limit?: number;
  offset?: number;
}

export interface DateRangeParams {
  startDate?: string;
  endDate?: string;
}
