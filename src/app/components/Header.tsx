import { Refresh } from '@mui/icons-material';
import { AppBar, IconButton } from '@mui/material';
import _ from 'lodash';

import styles from '../../styles/Header.module.css';
import dynamic from 'next/dynamic';
import Link from 'next/link';

type Props = {
    readonly eleSolPrice?: number;
    readonly eleUsdcPrice?: number;
    readonly refresh?: () => void;
};

const WalletDisconnectButtonDynamic = dynamic(
    async () => (await import('@solana/wallet-adapter-react-ui')).WalletDisconnectButton,
    { ssr: false }
);

const WalletMultiButtonDynamic = dynamic(
    async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
    { ssr: false }
);

export function Header(props: Props) {
    return (
        <>
            <AppBar position="static">
                <nav className={styles.Navigation}>
                    <div className={styles.Note}>
                        Custom RPC endpoint. Please use in fair way:{' '}
                        <strong>{process.env.NEXT_PUBLIC_SOLANA_RPC_ENDPOINT}</strong>
                    </div>
                    <div className={styles.NavItems}>
                        <Link href={'/'}>Home</Link>
                        <Link href={'/roi'}>Roi Tables</Link>
                        <Link href={'/elements'}>Elements</Link>
                    </div>
                </nav>
                <div className={styles.Header}>
                    {props.eleSolPrice && props.eleUsdcPrice ? (
                        <div className={styles.globalStats}>
                            <p>ELE/SOL: {_.round(props.eleSolPrice || 0, 8)} SOL</p>
                            <p>ELE/USDC: {_.round(props.eleUsdcPrice || 0, 8)} USDC</p>
                        </div>
                    ) : (
                        <div></div>
                    )}

                    <div className={styles.walletButtons}>
                        <div className={styles.Warning}>
                            <h3>Do NOT connect your Wallet if you do not know nedrise!</h3>
                        </div>
                        <WalletMultiButtonDynamic />
                        <WalletDisconnectButtonDynamic />
                        {props.refresh ? (
                            <IconButton aria-label="refresh" onClick={props.refresh}>
                                <Refresh />
                            </IconButton>
                        ) : (
                            <div></div>
                        )}
                    </div>
                </div>
            </AppBar>
        </>
    );
}
