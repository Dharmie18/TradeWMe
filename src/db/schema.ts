import { sqliteTable, integer, text, real } from 'drizzle-orm/sqlite-core';

// Users table
export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull().unique(),
  walletAddress: text('wallet_address').unique(),
  premiumTier: text('premium_tier').notNull().default('free'),
  premiumExpiresAt: text('premium_expires_at'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Watchlists table
export const watchlists = sqliteTable('watchlists', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  name: text('name').notNull(),
  tokens: text('tokens', { mode: 'json' }).notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Price alerts table
export const priceAlerts = sqliteTable('price_alerts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  tokenSymbol: text('token_symbol').notNull(),
  tokenAddress: text('token_address').notNull(),
  condition: text('condition').notNull(),
  targetPrice: real('target_price').notNull(),
  currentPrice: real('current_price'),
  triggered: integer('triggered', { mode: 'boolean' }).notNull().default(false),
  notified: integer('notified', { mode: 'boolean' }).notNull().default(false),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Portfolios table
export const portfolios = sqliteTable('portfolios', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  walletAddress: text('wallet_address').notNull(),
  tokens: text('tokens', { mode: 'json' }).notNull(),
  totalValueUsd: real('total_value_usd'),
  lastSyncedAt: text('last_synced_at'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Transactions table
export const transactions = sqliteTable('transactions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  portfolioId: integer('portfolio_id').notNull().references(() => portfolios.id),
  txHash: text('tx_hash').notNull().unique(),
  type: text('type').notNull(),
  tokenIn: text('token_in'),
  tokenOut: text('token_out'),
  amountIn: real('amount_in'),
  amountOut: real('amount_out'),
  gasFee: real('gas_fee'),
  status: text('status').notNull().default('pending'),
  timestamp: text('timestamp').notNull(),
  createdAt: text('created_at').notNull(),
});

// Subscriptions table
export const subscriptions = sqliteTable('subscriptions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  stripeCustomerId: text('stripe_customer_id').notNull().unique(),
  stripeSubscriptionId: text('stripe_subscription_id').notNull().unique(),
  plan: text('plan').notNull(),
  status: text('status').notNull().default('active'),
  currentPeriodEnd: text('current_period_end').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Auth tables for better-auth
export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" })
    .$defaultFn(() => false)
    .notNull(),
  image: text("image"),
  role: text("role").notNull().default("user"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
});

export const session = sqliteTable("session", {
  id: text("id").primaryKey(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = sqliteTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: integer("access_token_expires_at", {
    mode: "timestamp",
  }),
  refreshTokenExpiresAt: integer("refresh_token_expires_at", {
    mode: "timestamp",
  }),
  scope: text("scope"),
  password: text("password"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const verification = sqliteTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
    () => new Date(),
  ),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(
    () => new Date(),
  ),
});

// ============================================================================
// TRADING PLATFORM TABLES - Wallet Integration & Deposits
// ============================================================================

// User Wallets table - tracks connected wallets per user
export const userWallets = sqliteTable('user_wallets', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  walletAddress: text('wallet_address').notNull().unique(),
  walletType: text('wallet_type').notNull(), // 'metamask', 'coinbase', 'walletconnect'
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Deposits table - tracks all user deposits
export const deposits = sqliteTable('deposits', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  walletId: integer('wallet_id').notNull().references(() => userWallets.id),
  txHash: text('tx_hash').notNull().unique(),
  fromAddress: text('from_address').notNull(),
  toAddress: text('to_address').notNull(),
  amount: text('amount').notNull(), // Store as string to avoid precision loss
  currency: text('currency').notNull().default('ETH'), // ETH, USDT, USDC, etc.
  amountUsd: real('amount_usd').notNull(), // USD value at time of deposit
  status: text('status').notNull().default('pending'), // 'pending', 'confirmed', 'failed'
  confirmations: integer('confirmations').notNull().default(0),
  blockNumber: integer('block_number'),
  gasUsed: text('gas_used'),
  gasPriceGwei: text('gas_price_gwei'),
  network: text('network').notNull().default('ethereum'), // 'ethereum', 'polygon', 'bsc'
  depositedAt: text('deposited_at').notNull(),
  confirmedAt: text('confirmed_at'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// User Balances table - current balance per user per currency
export const userBalances = sqliteTable('user_balances', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  currency: text('currency').notNull(), // 'ETH', 'USDT', 'USDC', etc.
  balance: text('balance').notNull().default('0'), // Available balance
  lockedBalance: text('locked_balance').notNull().default('0'), // In active trades
  totalDeposited: text('total_deposited').notNull().default('0'),
  totalWithdrawn: text('total_withdrawn').notNull().default('0'),
  totalProfits: text('total_profits').notNull().default('0'),
  balanceUsd: real('balance_usd').notNull().default(0),
  lastUpdated: text('last_updated').notNull(),
  createdAt: text('created_at').notNull(),
});

// Profit Records table - tracks profit calculations
export const profitRecords = sqliteTable('profit_records', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  balanceId: integer('balance_id').notNull().references(() => userBalances.id),
  profitType: text('profit_type').notNull(), // 'daily', 'trading', 'staking', 'referral'
  amount: text('amount').notNull(),
  amountUsd: real('amount_usd').notNull(),
  currency: text('currency').notNull(),
  rate: real('rate').notNull(), // Profit rate applied (e.g., 0.05 for 5%)
  baseAmount: text('base_amount').notNull(), // Amount profit was calculated on
  calculatedAt: text('calculated_at').notNull(),
  appliedAt: text('applied_at'),
  status: text('status').notNull().default('pending'), // 'pending', 'applied', 'cancelled'
  metadata: text('metadata', { mode: 'json' }), // Additional data (trade details, etc.)
  createdAt: text('created_at').notNull(),
});

// Profit Settings table - configurable profit rates per user
export const profitSettings = sqliteTable('profit_settings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }).unique(),
  dailyProfitRate: real('daily_profit_rate').notNull().default(0.02), // 2% daily default
  tradingProfitRate: real('trading_profit_rate').notNull().default(0.05), // 5% per trade
  compoundingEnabled: integer('compounding_enabled', { mode: 'boolean' }).notNull().default(false),
  autoApplyProfits: integer('auto_apply_profits', { mode: 'boolean' }).notNull().default(true),
  minBalanceForProfits: text('min_balance_for_profits').notNull().default('0.01'),
  lastProfitCalculation: text('last_profit_calculation'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});
