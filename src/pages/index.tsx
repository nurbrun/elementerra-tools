import { Metaplex, PublicKey } from '@metaplex-foundation/js';
import {
    AppBar,
    Box,
    FormControl,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    SelectChangeEvent,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
} from '@mui/material';
import { useWallet } from '@solana/wallet-adapter-react';
import { Connection } from '@solana/web3.js';
import { DAS, Helius } from 'helius-sdk';
import _ from 'lodash';
import { useCallback, useEffect, useState } from 'react';

import { CrystalsTable } from '../app/components/CrystalsTable';
import { Header } from '../app/components/Header';
import { RabbitsTable } from '../app/components/RabbitsTable';
import { CRYSTALS_ELE_PER_HOUR, RABBITS_ELE_PER_HOUR } from '../lib/constants';
import {
    ELEMENTERRA_CRYSTALS_COLLECTION,
    ELEMENTERRA_ELEMENTS_COLLECTION,
    ELEMENTERRA_RABBITS_COLLECTION,
} from './_app';
import styles from '../styles/Home.module.css';
import Head from 'next/head';
import { NextPage } from 'next';

export type Stakable = {
    nft: DAS.GetAssetResponse;
    level: string;
    elePerHour: number;
};

const connection = new Connection(process.env.NEXT_PUBLIC_SOLANA_RPC_ENDPOINT!);
const metaplex = Metaplex.make(connection);
const helius = new Helius(process.env.NEXT_PUBLIC_HELIUS_API_KEY!);

// const Home: NextPage = () => {
export default function Home() {
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
    const [pageLoading, setPageLoading] = useState(false);

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

    async function getRabbitLevel(rabbit: DAS.GetAssetResponse): Promise<number> {
        const metadataAddress = metaplex
            .nfts()
            .pdas()
            .metadata({ mint: new PublicKey(rabbit.id) })
            .toString();
        const url = `https://api.helius.xyz/v0/addresses/${metadataAddress}/transactions?api-key=${process.env.NEXT_PUBLIC_HELIUS_API_KEY}&type=COMPRESSED_NFT_BURN`;
        const res = await fetch(url, {
            method: 'GET',
            headers: {
                'content-type': 'application/json',
            },
        });
        const data = await res.json();
        return data.length;
    }

    const fetchNft = useCallback(async () => {
        setPageErrors('');
        setPageLoading(true);
        if (walletAddress) {
            try {
                const assets = await helius.rpc.getAssetsByOwner({
                    ownerAddress: walletAddress,
                    page: 1,
                    // limit: 100,
                });

                const unburnt = assets.items.filter((item) => !item.burnt);

                const rabbitsRes = unburnt.filter(
                    (item) => _.first(item.grouping)?.group_value == ELEMENTERRA_RABBITS_COLLECTION
                );

                const rabbitLevels = await Promise.all(rabbitsRes.map((rabbit) => getRabbitLevel(rabbit)));

                let rabbitsElePerHour = 0;
                const rabbits = [];
                for (const [res, lvl] of _.zip(rabbitsRes, rabbitLevels)) {
                    if (!_.isNil(res) && !_.isNil(lvl)) {
                        const level = lvl.toString();
                        const elePerHour = RABBITS_ELE_PER_HOUR[level];
                        rabbitsElePerHour += elePerHour;
                        rabbits.push({ nft: res, level, elePerHour });
                    }
                }

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
                        level,
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
                setPageLoading(false);
            } catch (err: any) {
                setPageErrors(err.toString());
                setRabbits([]);
                setRabbitsElePerHour(0);
                setCrystals([]);
                setCrystalsElePerHour(0);
                setPageLoading(false);
            }
        }
    }, [walletAddress]);

    useEffect(() => {
        fetchEleSolPrice();
        fetchEleUsdcPrice();
    }, []);

    useEffect(() => {
        if (wallet.connected) {
            setWalletAddress(wallet.publicKey?.toString());
            fetchNft();
        }
    }, [fetchNft, wallet.publicKey, wallet.connected]);

    useEffect(() => {
        fetchNft();
    }, [fetchNft, walletAddress]);

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
        <>
            <Head>
                <title>Elementerra tools</title>
                <meta name="description" content="Tools for Elementerra.io players, created by @nedrise." />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <div className={styles.container}>
                <Header eleSolPrice={eleSolPrice} eleUsdcPrice={eleUsdcPrice} refresh={refreshAll} />

                <main className={styles.main}>
                    {viewWalletInput()}

                    {pageLoading ? (
                        <>
                            <h3>Loading ...</h3>
                        </>
                    ) : (
                        <>
                            <Box
                                sx={{
                                    bgcolor: 'background.paper',
                                    boxShadow: 1,
                                    borderRadius: 1,
                                    p: 2,
                                    width: '100%',
                                    maxWidth: '1080px',
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
                                            <TableCell>Summary</TableCell>
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
                                            <TableCell variant="head">
                                                {perTimeFrame(eleInSol(totalElePerHour()))} SOL
                                            </TableCell>
                                            <TableCell variant="head">
                                                {perTimeFrame(eleInUsdc(totalElePerHour()))} USDC
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </TableContainer>

                            <br />

                            <RabbitsTable rabbits={rabbits} eleSolPrice={eleSolPrice} />

                            <br />

                            <CrystalsTable crystals={crystals} eleSolPrice={eleSolPrice} />
                        </>
                    )}
                    <br />
                </main>

                <AppBar position="static">
                    <div className={styles.footer}>
                        <span>
                            Made by{' '}
                            <a href="https://github.com/nedrise27?tab=repositories" target="_blank" rel="noreferrer">
                                nedrise
                            </a>
                        </span>
                    </div>
                </AppBar>
            </div>
        </>
    );
}

// export default Home;
