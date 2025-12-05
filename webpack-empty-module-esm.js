// Empty module to replace viem test decorators during build (ESM version)
// This provides stub exports to prevent build errors

const noop = () => { };

export const testActions = noop;
export const dropTransaction = noop;
export const dumpState = noop;
export const getAutomine = noop;
export const getTxpoolContent = noop;
export const getTxpoolStatus = noop;
export const impersonateAccount = noop;
export const increaseTime = noop;
export const inspectTxpool = noop;
export const loadState = noop;
export const mine = noop;
export const removeBlockTimestampInterval = noop;
export const reset = noop;
export const revert = noop;
export const sendUnsignedTransaction = noop;
export const setAutomine = noop;
export const setBalance = noop;
export const setBlockGasLimit = noop;
export const setBlockTimestampInterval = noop;
export const setCode = noop;
export const setCoinbase = noop;
export const setIntervalMining = noop;
export const setLoggingEnabled = noop;
export const setMinGasPrice = noop;
export const setNextBlockBaseFeePerGas = noop;
export const setNextBlockTimestamp = noop;
export const setNonce = noop;
export const setRpcUrl = noop;
export const setStorageAt = noop;
export const snapshot = noop;
export const stopImpersonatingAccount = noop;

export default {
    testActions,
    dropTransaction,
    dumpState,
    getAutomine,
    getTxpoolContent,
    getTxpoolStatus,
    impersonateAccount,
    increaseTime,
    inspectTxpool,
    loadState,
    mine,
    removeBlockTimestampInterval,
    reset,
    revert,
    sendUnsignedTransaction,
    setAutomine,
    setBalance,
    setBlockGasLimit,
    setBlockTimestampInterval,
    setCode,
    setCoinbase,
    setIntervalMining,
    setLoggingEnabled,
    setMinGasPrice,
    setNextBlockBaseFeePerGas,
    setNextBlockTimestamp,
    setNonce,
    setRpcUrl,
    setStorageAt,
    snapshot,
    stopImpersonatingAccount,
};
