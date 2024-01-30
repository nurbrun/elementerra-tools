import { ThemeProvider, createTheme } from '@mui/material';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { SolflareWalletAdapter, PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';
import type { AppProps } from 'next/app';
import type { FC } from 'react';
import React, { useMemo } from 'react';

// Use require instead of import since order matters
require('@solana/wallet-adapter-react-ui/styles.css');
require('../styles/globals.css');

export const ELEMENTERRA_CREATORS = [
    'B9G4GndCu93zFXxyeA6nbWhBHDAdL8ACwxeCL6wMXycZ',
    '4oZFNzopnabpEFz1TM2j3B4EasPGVcBzaVea2Qp1h2Ep',
];

export const ELEMENTERRA_RABBITS_COLLECTION = '4n4zLe1BcREy9XQyHwSMJJHR4YHn7AgP2dx4jL6X8GGR';
export const ELEMENTERRA_CRYSTALS_COLLECTION = 'C2Frjbg6DosmE3GSbb8veTxGg8H7kS73FzduYh3b8er9';
export const ELEMENTERRA_ELEMENTS_COLLECTION = 'CdES51P2ThUZsgAeqFG42k59QchQMWBR9hLLeUGeB2gL';

const App: FC<AppProps> = ({ Component, pageProps }) => {
    // Can be set to 'devnet', 'testnet', or 'mainnet-beta'
    const network = WalletAdapterNetwork.Devnet;

    // You can also provide a custom RPC endpoint
    const endpoint = useMemo(() => clusterApiUrl(network), [network]);

    const wallets = useMemo(
        () => [new SolflareWalletAdapter(), new PhantomWalletAdapter()],
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [network]
    );

    const darkTheme = createTheme({
        palette: {
            mode: 'dark',
        },
    });

    return (
        <ThemeProvider theme={darkTheme}>
            <ConnectionProvider endpoint={endpoint}>
                <WalletProvider wallets={wallets} autoConnect>
                    <WalletModalProvider>
                        <Component {...pageProps} />
                    </WalletModalProvider>
                </WalletProvider>
            </ConnectionProvider>
        </ThemeProvider>
    );
};

export default App;
