// Example page showing how to integrate Ethereum QR utilities
// Add this to: app/qr-demo/page.tsx

import { EthereumQRExample } from "@/components/examples/EthereumQRExample";

export default function QRDemoPage() {
    return <EthereumQRExample />;
}

export const metadata = {
    title: "Ethereum QR Code Demo | TradeWMe",
    description: "Validate and generate EIP-681 compliant Ethereum QR codes",
};
