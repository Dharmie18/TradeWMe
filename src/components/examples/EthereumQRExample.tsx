"use client";

import { useState } from "react";
import {
    validateEthereumQR,
    generateEthereumQR,
    formatWeiToEth,
    formatEthToWei,
    type EthereumQRValidationResult
} from "@/lib/ethereum-qr";
import { useAccount, useChainId } from "wagmi";

/**
 * Interactive demo component for Ethereum QR code validation and generation
 * 
 * Features:
 * - Validate EIP-681 formatted QR codes
 * - Generate QR codes for payment requests
 * - Real-time validation feedback
 * - Integration with wagmi for wallet connection
 */
export function EthereumQRExample() {
    const { address, isConnected } = useAccount();
    const chainId = useChainId();

    // Validation state
    const [qrInput, setQrInput] = useState("");
    const [validationResult, setValidationResult] = useState<EthereumQRValidationResult | null>(null);

    // Generation state
    const [recipientAddress, setRecipientAddress] = useState("");
    const [ethAmount, setEthAmount] = useState("");
    const [useCurrentChain, setUseCurrentChain] = useState(true);
    const [customChainId, setCustomChainId] = useState("");
    const [generatedQR, setGeneratedQR] = useState("");
    const [includeData, setIncludeData] = useState(false);
    const [dataHex, setDataHex] = useState("0x");

    // Example QR codes
    const examples = [
        {
            label: "Simple Payment (1 ETH)",
            value: "ethereum:0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb?value=1000000000000000000&chainId=1"
        },
        {
            label: "Payment on Base",
            value: "ethereum:0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb?value=500000000000000000&chainId=8453"
        },
        {
            label: "Address Only",
            value: "ethereum:0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"
        },
        {
            label: "With Contract Data",
            value: "ethereum:0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb?data=0xa9059cbb&value=0"
        }
    ];

    const handleValidate = () => {
        if (!qrInput.trim()) {
            setValidationResult({
                ok: false,
                error: "Please enter a QR code payload"
            });
            return;
        }

        const result = validateEthereumQR(qrInput, isConnected ? chainId : undefined);
        setValidationResult(result);
    };

    const handleGenerate = () => {
        // Use connected wallet address if no recipient specified
        const targetAddress = recipientAddress || address;

        if (!targetAddress) {
            setGeneratedQR("❌ Please connect wallet or enter a recipient address");
            return;
        }

        // Convert ETH to wei if amount is provided
        const weiValue = ethAmount ? formatEthToWei(ethAmount) : undefined;

        // Determine chain ID
        const targetChainId = useCurrentChain
            ? chainId
            : (customChainId ? Number(customChainId) : undefined);

        // Build options
        const options: any = {};
        if (weiValue) options.value = weiValue;
        if (targetChainId) options.chainId = targetChainId;
        if (includeData && dataHex && dataHex !== "0x") options.data = dataHex;

        const qr = generateEthereumQR(targetAddress, options);

        if (qr) {
            setGeneratedQR(qr);
        } else {
            setGeneratedQR("❌ Failed to generate QR code. Check the address format.");
        }
    };

    const loadExample = (exampleValue: string) => {
        setQrInput(exampleValue);
        setValidationResult(null);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-12 px-4">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Ethereum QR Code Utilities
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                        Validate and generate EIP-681 compliant Ethereum QR codes for payment requests and contract interactions
                    </p>
                    {isConnected && (
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            Connected: {address?.slice(0, 6)}...{address?.slice(-4)} • Chain: {chainId}
                        </div>
                    )}
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* VALIDATION SECTION */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                                <span className="text-2xl">🔍</span>
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                                Validate QR Code
                            </h2>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    QR Code Payload
                                </label>
                                <textarea
                                    value={qrInput}
                                    onChange={(e) => setQrInput(e.target.value)}
                                    placeholder="ethereum:0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb?value=1000000000000000000&chainId=1"
                                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white resize-none"
                                    rows={3}
                                />
                            </div>

                            <button
                                onClick={handleValidate}
                                className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                            >
                                Validate QR Code
                            </button>

                            {validationResult && (
                                <div className={`p-4 rounded-lg border-2 ${validationResult.ok
                                        ? 'bg-green-50 dark:bg-green-900/20 border-green-500'
                                        : 'bg-red-50 dark:bg-red-900/20 border-red-500'
                                    }`}>
                                    {validationResult.ok ? (
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-green-700 dark:text-green-300 font-semibold">
                                                <span>✅</span>
                                                <span>Valid QR Code</span>
                                            </div>
                                            <div className="text-sm space-y-1 text-slate-700 dark:text-slate-300">
                                                <div className="font-mono break-all">
                                                    <strong>Address:</strong> {validationResult.address}
                                                </div>
                                                {validationResult.value && (
                                                    <div>
                                                        <strong>Value:</strong> {formatWeiToEth(validationResult.value)} ETH ({validationResult.value} wei)
                                                    </div>
                                                )}
                                                {validationResult.chainId && (
                                                    <div>
                                                        <strong>Chain ID:</strong> {validationResult.chainId}
                                                    </div>
                                                )}
                                                {validationResult.data && (
                                                    <div className="font-mono break-all">
                                                        <strong>Data:</strong> {validationResult.data}
                                                    </div>
                                                )}
                                                {validationResult.gas && (
                                                    <div>
                                                        <strong>Gas:</strong> {validationResult.gas}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-start gap-2 text-red-700 dark:text-red-300">
                                            <span>❌</span>
                                            <span className="flex-1">{validationResult.error}</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Examples */}
                            <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Try these examples:
                                </p>
                                <div className="space-y-2">
                                    {examples.map((example, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => loadExample(example.value)}
                                            className="w-full text-left px-3 py-2 text-sm bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors"
                                        >
                                            <div className="font-medium text-slate-900 dark:text-white">
                                                {example.label}
                                            </div>
                                            <div className="text-xs text-slate-500 dark:text-slate-400 font-mono truncate">
                                                {example.value}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* GENERATION SECTION */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                                <span className="text-2xl">⚡</span>
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                                Generate QR Code
                            </h2>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Recipient Address
                                </label>
                                <input
                                    type="text"
                                    value={recipientAddress}
                                    onChange={(e) => setRecipientAddress(e.target.value)}
                                    placeholder={address || "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"}
                                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-mono text-sm"
                                />
                                {isConnected && !recipientAddress && (
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                        Using your connected wallet address
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Amount (ETH)
                                </label>
                                <input
                                    type="number"
                                    value={ethAmount}
                                    onChange={(e) => setEthAmount(e.target.value)}
                                    placeholder="1.0"
                                    step="0.01"
                                    min="0"
                                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    <input
                                        type="checkbox"
                                        checked={useCurrentChain}
                                        onChange={(e) => setUseCurrentChain(e.target.checked)}
                                        className="rounded"
                                    />
                                    Use current chain ({chainId})
                                </label>
                                {!useCurrentChain && (
                                    <input
                                        type="number"
                                        value={customChainId}
                                        onChange={(e) => setCustomChainId(e.target.value)}
                                        placeholder="Chain ID (e.g., 1, 8453)"
                                        className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                    />
                                )}
                            </div>

                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    <input
                                        type="checkbox"
                                        checked={includeData}
                                        onChange={(e) => setIncludeData(e.target.checked)}
                                        className="rounded"
                                    />
                                    Include contract data
                                </label>
                                {includeData && (
                                    <input
                                        type="text"
                                        value={dataHex}
                                        onChange={(e) => setDataHex(e.target.value)}
                                        placeholder="0xa9059cbb..."
                                        className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-mono text-sm"
                                    />
                                )}
                            </div>

                            <button
                                onClick={handleGenerate}
                                disabled={!isConnected && !recipientAddress}
                                className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-medium rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Generate QR Payload
                            </button>

                            {generatedQR && (
                                <div className="p-4 bg-slate-100 dark:bg-slate-700 rounded-lg">
                                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Generated QR Payload:
                                    </p>
                                    <code className="text-xs break-all text-slate-900 dark:text-white block p-3 bg-white dark:bg-slate-800 rounded border border-slate-300 dark:border-slate-600">
                                        {generatedQR}
                                    </code>
                                    <button
                                        onClick={() => navigator.clipboard.writeText(generatedQR)}
                                        className="mt-2 text-sm text-purple-600 dark:text-purple-400 hover:underline"
                                    >
                                        📋 Copy to clipboard
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Info Section */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
                        📚 About EIP-681
                    </h3>
                    <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                        EIP-681 defines a standard URI scheme for Ethereum payment requests and contract interactions.
                        The format is: <code className="bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded">ethereum:&lt;address&gt;[@&lt;chainId&gt;][?&lt;parameters&gt;]</code>
                    </p>
                    <div className="grid md:grid-cols-3 gap-4 text-sm">
                        <div>
                            <strong className="text-blue-900 dark:text-blue-100">Common Chain IDs:</strong>
                            <ul className="mt-1 text-blue-700 dark:text-blue-300 space-y-1">
                                <li>• Ethereum: 1</li>
                                <li>• Base: 8453</li>
                                <li>• Optimism: 10</li>
                            </ul>
                        </div>
                        <div>
                            <strong className="text-blue-900 dark:text-blue-100">Parameters:</strong>
                            <ul className="mt-1 text-blue-700 dark:text-blue-300 space-y-1">
                                <li>• value (wei)</li>
                                <li>• chainId</li>
                                <li>• data (hex)</li>
                            </ul>
                        </div>
                        <div>
                            <strong className="text-blue-900 dark:text-blue-100">Use Cases:</strong>
                            <ul className="mt-1 text-blue-700 dark:text-blue-300 space-y-1">
                                <li>• Payment requests</li>
                                <li>• Token transfers</li>
                                <li>• Contract calls</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
