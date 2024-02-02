import { Metaplex, PublicKey } from '@metaplex-foundation/js';
import {
    AppBar,
    Box,
    Button,
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
import { OTHER_STAKABLE_NFT_COLLECTIONS } from '../lib/constants/otherNfts';
import { OtherNftsTable } from '../app/components/OtherNftsTable';

export type Stakable = {
    nft: DAS.GetAssetResponse;
    level: string;
    elePerHour: number;
};

const connection = new Connection(process.env.NEXT_PUBLIC_SOLANA_RPC_ENDPOINT!);
const metaplex = Metaplex.make(connection);
const helius = new Helius(process.env.NEXT_PUBLIC_HELIUS_API_KEY!);

type LoadinState = 'initial' | 'loading' | 'loaded';

// const Home: NextPage = () => {
export default function Home() {
    const wallet = useWallet();

    const [walletAddresses, setWalletAddresses] = useState<string[]>([]);
    // const [walletAddress, setWalletAddress] = useState<string>();

    const [rabbits, setRabbits] = useState<Stakable[]>([]);
    const [crystals, setCrystals] = useState<Stakable[]>([]);
    const [otherNFTs, setOtherNFTs] = useState<Stakable[]>([]);

    const [rabbitsElePerHour, setRabbitsElePerHour] = useState<number>(0);
    const [crystalsElePerHour, setCrystalsElePerHour] = useState<number>(0);
    const [otherNFTsElePerHour, setOtherNFTsElePerHour] = useState<number>(0);

    const [eleSolPrice, setEleSolPrice] = useState<number>(0);
    const [eleUsdcPrice, setEleUsdcPrice] = useState<number>(0);

    const [timeframe, setTimeframe] = useState<number>(1);

    const [pageErrors, setPageErrors] = useState<string>('');
    const [loadingState, setLoadingState] = useState<LoadinState>('initial');

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
        setLoadingState('loading');
        if (!_.isEmpty(walletAddresses)) {
            try {
                const assetResponses = await Promise.all(
                    walletAddresses.map((ownerAddress) =>
                        helius.rpc.getAssetsByOwner({
                            ownerAddress,
                            page: 1,
                            limit: 1000,
                        })
                    )
                );

                const assets = assetResponses.flatMap((res) => res.items);

                const unburnt = assets.filter((item) => !item.burnt);

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

                const otherNFTs = [];
                let otherNFTsElePerHour = 0;
                for (const nft of unburnt) {
                    const collectionGroup = nft.grouping?.find((g) => g.group_key === 'collection');
                    if (!_.isNil(collectionGroup)) {
                        const collection = OTHER_STAKABLE_NFT_COLLECTIONS[collectionGroup.group_value];
                        if (!_.isNil(collection)) {
                            otherNFTsElePerHour += collection.elePerHour;
                            otherNFTs.push({
                                nft,
                                level: '',
                                elePerHour: collection.elePerHour,
                            });
                        }
                    }
                }

                setRabbits(rabbits);
                setRabbitsElePerHour(rabbitsElePerHour);
                setCrystals(crystals);
                setCrystalsElePerHour(crystalsElePerHour);
                setOtherNFTs(otherNFTs);
                setOtherNFTsElePerHour(otherNFTsElePerHour);
                setLoadingState('loaded');
            } catch (err: any) {
                setPageErrors(err.toString());
                resetState();
            }
        } else {
            resetState();
            setLoadingState('loaded');
        }
    }, [walletAddresses]);

    useEffect(() => {
        fetchNft();
    }, [walletAddresses]);

    useEffect(() => {
        fetchEleSolPrice();
        fetchEleUsdcPrice();
    }, []);

    useEffect(() => {
        if (wallet.connected) {
            const walletAddress = wallet.publicKey?.toString();
            if (walletAddress) {
                setWalletAddresses([]);
                addWalletAddress(0, walletAddress);
            }
        } else {
            setWalletAddresses([]);
        }
    }, [wallet.publicKey, wallet.connected, wallet.disconnecting]);

    function resetState() {
        setRabbits([]);
        setRabbitsElePerHour(0);
        setCrystals([]);
        setCrystalsElePerHour(0);
        setOtherNFTs([]);
        setOtherNFTsElePerHour(0);

        setLoadingState('loaded');
    }

    async function refreshAll() {
        await fetchEleSolPrice();
        await fetchEleUsdcPrice();
        await fetchNft();
    }

    function addWalletAddress(index: number, walletAddress: string) {
        let newAddresses = _.clone(walletAddresses);

        if (_.isEmpty(walletAddress)) {
            newAddresses.splice(index, 1);
        } else if (!walletAddresses.includes(walletAddress)) {
            if (walletAddresses.length <= index) {
                newAddresses.push(walletAddress);
            } else {
                newAddresses[index] = walletAddress;
            }
        }

        setWalletAddresses(newAddresses);
    }

    function handleTimeframeChange(event: SelectChangeEvent<number>) {
        event.preventDefault();
        setTimeframe(_.toNumber(event.target.value));
    }

    function totalElePerHour() {
        return rabbitsElePerHour + crystalsElePerHour + otherNFTsElePerHour;
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

    function viewWalletInputs(index: number) {
        return (
            <TextField
                key={index}
                fullWidth
                label="Wallet Address"
                id="walletAddress"
                variant="outlined"
                value={walletAddresses[index]}
                error={!_.isEmpty(pageErrors)}
                onChange={(event) => addWalletAddress(index, event.target.value)}
            />
        );
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
                    <Box
                        sx={{
                            bgcolor: 'background.paper',
                            boxShadow: 1,
                            borderRadius: 1,
                            p: 2,
                            width: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'end',
                        }}
                    >
                        {_.range(0, walletAddresses.length + 1).map(viewWalletInputs)}
                    </Box>

                    {loadingState === 'initial' || loadingState === 'loaded' ? (
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
                                            <TableCell>Other NFTs</TableCell>
                                            <TableCell>{perTimeFrame(otherNFTsElePerHour)} ELE</TableCell>
                                            <TableCell>{perTimeFrame(eleInSol(otherNFTsElePerHour))} SOL</TableCell>
                                            <TableCell>{perTimeFrame(eleInUsdc(otherNFTsElePerHour))} USDC</TableCell>
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

                            <br />

                            <OtherNftsTable otherNfts={otherNFTs} eleSolPrice={eleSolPrice} />
                        </>
                    ) : (
                        <>
                            <h3>Loading ...</h3>
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
