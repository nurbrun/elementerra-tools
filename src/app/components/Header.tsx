import { AppBar } from '@mui/material';
import _ from 'lodash';
import Link from 'next/link';

import styles from '../../styles/Header.module.css';

type Props = {
    readonly eleSolPrice?: number;
    readonly eleUsdcPrice?: number;
    readonly refresh?: () => void;
};

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
                </div>
            </AppBar>
        </>
    );
}
