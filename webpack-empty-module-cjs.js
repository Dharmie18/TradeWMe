// Empty module to replace viem test decorators during build (CJS version)
// This provides stub exports to prevent build errors

const noop = () => { };

module.exports = {
    testActions: noop,
    dropTransaction: noop,
    dumpState: noop,
    getAutomine: noop,
    getTxpoolContent: noop,
    getTxpoolStatus: noop,
    impersonateAccount: noop,
    increaseTime: noop,
    inspectTxpool: noop,
    loadState: noop,
    mine: noop,
    removeBlockTimestampInterval: noop,
    reset: noop,
    revert: noop,
    sendUnsignedTransaction: noop,
    setAutomine: noop,
    setBalance: noop,
    setBlockGasLimit: noop,
    setBlockTimestampInterval: noop,
    setCode: noop,
    setCoinbase: noop,
    setIntervalMining: noop,
    setLoggingEnabled: noop,
    setMinGasPrice: noop,
    setNextBlockBaseFeePerGas: noop,
    setNextBlockTimestamp: noop,
    setNonce: noop,
    setRpcUrl: noop,
    setStorageAt: noop,
    snapshot: noop,
    stopImpersonatingAccount: noop,
};
