import { Metaplex, PublicKey } from '@metaplex-foundation/js';
import { useWallet } from '@solana/wallet-adapter-react';
import { Connection } from '@solana/web3.js';
import { DAS, Helius } from 'helius-sdk';
import type { NextPage } from 'next';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import _ from 'lodash';
import { Diversity1, Refresh } from '@mui/icons-material';

import { Crystal } from '../app/components/Crystal';
import { Nft } from '../app/components/Nft';
import styles from '../styles/Home.module.css';
import {
    ELEMENTERRA_CRYSTALS_COLLECTION,
    ELEMENTERRA_ELEMENTS_COLLECTION,
    ELEMENTERRA_RABBITS_COLLECTION,
} from './_app';
import { CRYSTALS_ELE_PER_HOUR, RABBITS_ELE_PER_HOUR } from '../lib/constants';
import {
    InputLabel,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    FormControl,
    MenuItem,
    Select,
    SelectChangeEvent,
    Box,
    Container,
    IconButton,
    TextField,
    TableFooter,
    AppBar,
} from '@mui/material';

const WalletDisconnectButtonDynamic = dynamic(
    async () => (await import('@solana/wallet-adapter-react-ui')).WalletDisconnectButton,
    { ssr: false }
);
const WalletMultiButtonDynamic = dynamic(
    async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
    { ssr: false }
);

export type Stakable = {
    nft: DAS.GetAssetResponse;
    elePerHour: number;
};

const connection = new Connection(process.env.NEXT_PUBLIC_SOLANA_RPC_ENDPOINT!);
const metaplex = Metaplex.make(connection);
const helius = new Helius(process.env.NEXT_PUBLIC_HELIUS_API_KEY!);

const Home: NextPage = () => {
    const wallet = useWallet();

    const [walletAddress, setWalletAddress] = useState<string>();

    const [rabbits, setRabbits] = useState<Stakable[]>([]);
    const [crystals, setCrystals] = useState<Stakable[]>([]);

    const [rabbitsElePerHour, setRabbitsElePerHour] = useState<number>(0);
    const [crystalsElePerHour, setCrystalsElePerHour] = useState<number>(0);

    const [eleSolPrice, setEleSolPrice] = useState<number>(0);
    const [eleUsdcPrice, setEleUsdcPrice] = useState<number>(0);

    const [timeframe, setTimeframe] = useState<number>(1);

    const [pageErrors, setPageErrors] = useState<string>('');

    const fetchEleSolPrice = async () => {
        const res = await fetch('https://price.jup.ag/v4/price?ids=ELE&vsToken=SOL');
        const body = await res.json();
        setEleSolPrice(body.data.ELE.price);
    };

    const fetchEleUsdcPrice = async () => {
        const res = await fetch('https://price.jup.ag/v4/price?ids=ELE&vsToken=USDC');
        const body = await res.json();
        setEleUsdcPrice(body.data.ELE.price);
    };

    const fetchNft = async () => {
        setPageErrors('');
        if (walletAddress) {
            try {
                const assets = await helius.rpc.getAssetsByOwner({
                    ownerAddress: walletAddress,
                    page: 1,
                });

                const unburnt = assets.items.filter((item) => !item.burnt);

                const rabbitsRes = unburnt.filter(
                    (item) => _.first(item.grouping)?.group_value == ELEMENTERRA_RABBITS_COLLECTION
                );
                let rabbitsElePerHour = 0;
                const rabbits = rabbitsRes.map((res) => {
                    const level = '17'; // TODO: get level from blockchain
                    const elePerHour = RABBITS_ELE_PER_HOUR[level];
                    rabbitsElePerHour += elePerHour;
                    return {
                        nft: res,
                        elePerHour,
                    };
                });

                const crystalsRes = unburnt.filter(
                    (item) => _.first(item.grouping)?.group_value == ELEMENTERRA_CRYSTALS_COLLECTION
                );
                let crystalsElePerHour = 0;
                const crystals = crystalsRes.map((res) => {
                    const level = res.content?.metadata?.attributes?.find((a) => a.trait_type == 'level')?.value!;
                    const elePerHour = CRYSTALS_ELE_PER_HOUR[level];
                    crystalsElePerHour += elePerHour;
                    return {
                        nft: res,
                        elePerHour,
                    };
                });

                const elements = unburnt.filter(
                    (item) => _.first(item.grouping)?.group_value == ELEMENTERRA_ELEMENTS_COLLECTION
                );

                setRabbits(rabbits);
                setRabbitsElePerHour(rabbitsElePerHour);
                setCrystals(crystals);
                setCrystalsElePerHour(crystalsElePerHour);
            } catch (err: any) {
                setPageErrors(err.toString());
                setRabbits([]);
                setRabbitsElePerHour(0);
                setCrystals([]);
                setCrystalsElePerHour(0);
            }
        }
    };

    useEffect(() => {
        fetchEleSolPrice();
        fetchEleUsdcPrice();
    }, []);

    useEffect(() => {
        if (wallet.connected) {
            setWalletAddress(wallet.publicKey?.toString());
            fetchNft();
        }
    }, [wallet.connected]);

    useEffect(() => {
        fetchNft();
    }, [walletAddress]);

    async function refreshAll() {
        await fetchEleSolPrice();
        await fetchEleUsdcPrice();
        await fetchNft();
    }

    function handleWalletInput(walletAddress: string) {
        setWalletAddress(walletAddress);
    }

    function handleTimeframeChange(event: SelectChangeEvent<number>) {
        event.preventDefault();
        setTimeframe(_.toNumber(event.target.value));
    }

    function totalElePerHour() {
        return rabbitsElePerHour + crystalsElePerHour;
    }

    function perTimeFrame(perHour: number) {
        return _.round(timeframe * perHour, 8);
    }

    function eleInSol(ele: number) {
        return ele * eleSolPrice;
    }

    function eleInUsdc(ele: number) {
        return ele * eleUsdcPrice;
    }

    function viewWalletInput() {
        if (!wallet?.connected) {
            return (
                <Box
                    sx={{
                        bgcolor: 'background.paper',
                        boxShadow: 1,
                        borderRadius: 1,
                        p: 2,
                        width: '100%',
                    }}
                >
                    <TextField
                        fullWidth
                        label="Wallet Address"
                        id="walletAddress"
                        variant="outlined"
                        error={!_.isEmpty(pageErrors)}
                        onChange={(event) => handleWalletInput(event.target.value)}
                    />
                </Box>
            );
        }
    }

    return (
        <div className={styles.container}>
            <Head>
                <title>Elementerra tools</title>
                <meta name="description" content="Tools for Elementerra.io players, created by @nedrise." />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main className={styles.main}>
                <AppBar position="static">
                    <div className={styles.Header}>
                        <div className={styles.globalStats}>
                            <p>ELE/SOL: {_.round(eleSolPrice, 8)} SOL</p>
                            <p>ELE/USDC: {_.round(eleUsdcPrice, 8)} USDC</p>
                        </div>
                        <div className={styles.walletButtons}>
                            <WalletMultiButtonDynamic />
                            <WalletDisconnectButtonDynamic />
                            <IconButton aria-label="refresh" onClick={refreshAll}>
                                <Refresh />
                            </IconButton>
                        </div>
                    </div>
                </AppBar>

                {viewWalletInput()}

                <Box
                    sx={{
                        bgcolor: 'background.paper',
                        boxShadow: 1,
                        borderRadius: 1,
                        p: 2,
                        width: '100%',
                    }}
                >
                    <FormControl fullWidth>
                        <InputLabel id="eleProductionTimeframeLabel">Timeframe</InputLabel>
                        <Select
                            labelId="eleProductionTimeframeLabel"
                            aria-label="Timeframe"
                            id="eleProductionTimeframe"
                            value={timeframe}
                            label="Timeframe"
                            onChange={handleTimeframeChange}
                        >
                            <MenuItem value={1} selected>
                                One Hour
                            </MenuItem>
                            <MenuItem value={24}>One Day</MenuItem>
                            <MenuItem value={168}>7 Days</MenuItem>
                            <MenuItem value={720}>30 Days</MenuItem>
                        </Select>
                    </FormControl>
                </Box>

                <TableContainer component={Paper}>
                    <Table sx={{ minWidth: 600 }} aria-label="ELE production table">
                        <TableHead>
                            <TableRow>
                                <TableCell></TableCell>
                                <TableCell>ELE/{timeframe}h</TableCell>
                                <TableCell>SOL/{timeframe}h</TableCell>
                                <TableCell>USDC/{timeframe}h</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            <TableRow>
                                <TableCell>Rabbits</TableCell>
                                <TableCell>{perTimeFrame(rabbitsElePerHour)} ELE</TableCell>
                                <TableCell>{perTimeFrame(eleInSol(rabbitsElePerHour))} SOL</TableCell>
                                <TableCell>{perTimeFrame(eleInUsdc(rabbitsElePerHour))} USDC</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>Crystals</TableCell>
                                <TableCell>{perTimeFrame(crystalsElePerHour)} ELE</TableCell>
                                <TableCell>{perTimeFrame(eleInSol(crystalsElePerHour))} SOL</TableCell>
                                <TableCell>{perTimeFrame(eleInUsdc(crystalsElePerHour))} USDC</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell variant="head">All</TableCell>
                                <TableCell variant="head">{perTimeFrame(totalElePerHour())} ELE</TableCell>
                                <TableCell variant="head">{perTimeFrame(eleInSol(totalElePerHour()))} SOL</TableCell>
                                <TableCell variant="head">{perTimeFrame(eleInUsdc(totalElePerHour()))} USDC</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </TableContainer>

                <div className={styles.grid}>
                    {rabbits.map((stakable) => (
                        <div key={stakable.nft.id} className={styles.card}>
                            <Nft key={stakable.nft.id} stakable={stakable} />
                        </div>
                    ))}
                </div>

                <div className={styles.grid}>
                    {crystals.map((stakable) => (
                        <div key={stakable.nft.id} className={styles.card}>
                            <Nft key={stakable.nft.id} stakable={stakable} />
                        </div>
                    ))}
                </div>
            </main>

            <footer className={styles.footer}></footer>
        </div>
    );
};

export default Home;
