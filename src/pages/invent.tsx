import {
    Grid,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
} from '@mui/material';
import { Connection, clusterApiUrl } from '@solana/web3.js';
import _ from 'lodash';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Header } from '../app/components/Header';
import { Element, useElementsInfoStore } from '../app/stores/shopElements';
import { Box, display } from '@mui/system';
import { Button, Tab } from '@mui/base';
import { Delete, Remove } from '@mui/icons-material';

const connection = new Connection(process.env.NEXT_PUBLIC_SOLANA_RPC_ENDPOINT || clusterApiUrl('mainnet-beta'));

export type ElementToGuess = {
    element: Element;
    minAmount: number;
    maxAmount: number;
};

export default function InventPage() {
    const elements = useElementsInfoStore((state) => state.elements);
    const refetchElements = useElementsInfoStore((state) => state.fetch);

    const [notInventedElements, setNotInventedElements] = useState<Element[]>([]);
    const [inventedElements, setInventedElements] = useState<Element[]>([]);

    const [elementToInvent, setElementToInvent] = useState<Element>();
    const [elementsToPick, setElementsToPick] = useState<Element[]>([]);
    const [elementsToGuess, setElementsToGuess] = useState<ElementToGuess[]>([]);

    const [suggestionsLoading, setSuggestionsLoading] = useState<'none' | 'loading' | 'loaded'>('none');
    const [recipesToTry, setRecipesToTry] = useState<string[][]>();
    const [recipesToTryAmount, setRecipesToTryAmount] = useState<number>();
    const [alreadyTriedRecipes, setAlreadyTriedRecipes] = useState<string[][]>();

    useEffect(() => {
        if (!_.isNil(elements) && !_.isEmpty(elements)) {
            let els = _.orderBy(elements, ['tier', 'name'], ['asc', 'asc']);
            const invented = _.filter(els, { invented: true });
            const notInvented = _.filter(els, { invented: false });

            setInventedElements(invented);
            setNotInventedElements(notInvented);
        }
    }, [elements]);

    useEffect(() => {
        refetchElements(connection);
    }, [refetchElements]);

    useEffect(() => {
        if (!_.isNil(elementToInvent)) {
            let lower = _.orderBy(inventedElements, ['tier', 'name'], ['asc', 'asc']);
            lower = lower.filter((e) => e.tier < elementToInvent.tier);
            setElementsToPick(lower);
        } else {
            setElementsToPick([]);
        }
    }, [elementToInvent]);

    function handleSelectElementToInvent(elementId: string | null) {
        const selected = notInventedElements.find((e) => e.address === elementId);
        if (!_.isNil(selected)) {
            setElementToInvent(selected);
        } else {
            setElementToInvent(undefined);
        }
    }

    function handleAddElementToGuess(elementId: string) {
        const selected = elementsToPick.find((e) => e.address === elementId);
        if (!_.isNil(selected) && _.isNil(elementsToGuess.find((e) => e.element.address === elementId))) {
            setElementsToGuess([...elementsToGuess, { element: selected, minAmount: 0, maxAmount: 4 }]);
        }
    }

    function handleRemoveElementFromGuess(elementId: string) {
        const filtered = elementsToGuess.filter((e) => e.element.address !== elementId);
        setElementsToGuess(filtered);
    }

    function handleSetMinAmount(elementId: string, minAmount: number) {
        const next = [];
        for (const e of elementsToGuess) {
            if (e.element.address === elementId) {
                next.push({ element: e.element, minAmount, maxAmount: e.maxAmount });
            } else {
                next.push(e);
            }
        }
        setElementsToGuess(next);
    }

    function handleSetMaxAmount(elementId: string, maxAmount: number) {
        const next = [];
        for (const e of elementsToGuess) {
            if (e.element.address === elementId) {
                next.push({ element: e.element, minAmount: e.minAmount, maxAmount });
            } else {
                next.push(e);
            }
        }
        setElementsToGuess(next);
    }

    async function handleRequestSuggetions() {
        setSuggestionsLoading('loading');
        const res = await fetch('https://elementerra.line27.de/recipes/get-available-recipes', {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
            },
            body: JSON.stringify({
                tier: elementToInvent?.tier,
                elements: elementsToGuess.map((e) => ({
                    element: e.element.name.replaceAll(' ', '').toLowerCase(),
                    minAmount: e.minAmount,
                    maxAmount: e.maxAmount,
                })),
            }),
        });
        const body = await res.json();

        setRecipesToTry(body.possibilities);
        setRecipesToTryAmount(body.numberOfPossibilies);
        setAlreadyTriedRecipes(body.alreadyTried);
        setSuggestionsLoading('loaded');
    }

    return (
        <>
            <Header />
            <br />

            {_.isNil(elementToInvent) ? (
                <Box sx={{ flexGrow: 1 }}>
                    <div style={{ width: '100%', marginBottom: '2rem', display: 'flex', justifyContent: 'center' }}>
                        <h4>Select Element you want to invent:</h4>
                    </div>

                    <Grid container spacing={1} gap={1.5} justifyContent={'center'}>
                        {notInventedElements.map((e) => (
                            <ElementCard key={e.address} element={e} onClick={handleSelectElementToInvent} />
                        ))}
                    </Grid>
                </Box>
            ) : (
                <>
                    <div
                        style={{
                            width: '100%',
                            padding: '0 2rem',
                            marginBottom: '2rem',
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <p>
                                We will invent{' '}
                                <strong>
                                    {elementToInvent.name} T{elementToInvent.tier}
                                </strong>{' '}
                            </p>
                            <Button onClick={() => handleSelectElementToInvent(null)} style={{ maxHeight: '40px' }}>
                                <Delete />
                            </Button>
                        </div>

                        <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <p>Next: select Elements to add to recipe</p>
                        </div>
                    </div>

                    <Grid container spacing={1} gap={1.5} justifyContent={'center'}>
                        {elementsToPick.map((e) => (
                            <ElementCard key={e.address} element={e} onClick={handleAddElementToGuess} />
                        ))}
                    </Grid>

                    <br />

                    <TableContainer component={Paper}>
                        <Table sx={{ minWidth: 600 }}>
                            <TableHead>
                                <TableCell>Element</TableCell>
                                <TableCell>Tier</TableCell>
                                <TableCell>Minimum</TableCell>
                                <TableCell>Maximum</TableCell>
                                <TableCell></TableCell>
                            </TableHead>
                            <TableBody>
                                {elementsToGuess.map((e) => (
                                    <ElementToGuessTableRow
                                        key={e.element.address}
                                        element={e}
                                        minAmount={e.minAmount}
                                        maxAmount={e.maxAmount}
                                        onRemove={handleRemoveElementFromGuess}
                                        onSetMinAmount={handleSetMinAmount}
                                        onSetMaxAmount={handleSetMaxAmount}
                                    />
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <div
                        style={{
                            width: '100%',
                            minHeight: '4rem',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                    >
                        <Button style={{ minHeight: '3rem' }} onClick={handleRequestSuggetions}>
                            Get suggestions
                        </Button>
                    </div>

                    {suggestionsLoading === 'loading' ? (
                        <div>Loading ...</div>
                    ) : suggestionsLoading === 'loaded' ? (
                        <>
                            <TableContainer component={Paper}>
                                <Table sx={{ minWidth: 600 }}>
                                    <TableHead>
                                        <TableCell>Not tried Reciepes</TableCell>
                                        <TableCell>Count: {recipesToTryAmount}</TableCell>
                                        <TableCell></TableCell>
                                        <TableCell></TableCell>
                                        <TableCell></TableCell>
                                    </TableHead>
                                    <TableBody>
                                        {recipesToTry?.map((e, i) => (
                                            <TableRow key={i}>
                                                <TableCell></TableCell>
                                                <TableCell>{e[0]}</TableCell>
                                                <TableCell>{e[1]}</TableCell>
                                                <TableCell>{e[2]}</TableCell>
                                                <TableCell>{e[3]}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            <TableContainer component={Paper}>
                                <Table sx={{ minWidth: 600 }}>
                                    <TableHead>
                                        <TableCell>Already tried Reciepes</TableCell>
                                        <TableCell></TableCell>
                                        <TableCell></TableCell>
                                        <TableCell></TableCell>
                                        <TableCell></TableCell>
                                    </TableHead>
                                    <TableBody>
                                        {alreadyTriedRecipes?.map((e, i) => (
                                            <TableRow key={i}>
                                                <TableCell></TableCell>
                                                <TableCell>{e[0]}</TableCell>
                                                <TableCell>{e[1]}</TableCell>
                                                <TableCell>{e[2]}</TableCell>
                                                <TableCell>{e[3]}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>{' '}
                        </>
                    ) : (
                        <></>
                    )}
                </>
            )}

            <div style={{ height: '4rem' }}></div>
        </>
    );
}

type ElementCardProps = {
    element: Element;
    onClick: (elementId: string) => void;
};

function ElementCard(props: ElementCardProps) {
    return (
        <Paper
            sx={{
                width: '100px',
                height: '100px',
                border: '1px solid rgba(100, 100, 100, 0.7)',
                opacity: '0.8',
                ':hover': {
                    opacity: 1,
                },
            }}
            onClick={() => props.onClick?.(props.element.address)}
        >
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                }}
            >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div>
                        {props.element.name} T{props.element.tier}
                    </div>
                    <Image src={props.element.url} width={40} height={40} alt={`picture of ${props.element.name}`} />
                </div>
            </div>
        </Paper>
    );
}

type ElementToGuessTableRowProps = {
    element: ElementToGuess;
    minAmount: number;
    maxAmount: number;
    onRemove: (elementId: string) => void;
    onSetMinAmount: (elementId: string, minAmount: number) => void;
    onSetMaxAmount: (elementId: string, maxAmount: number) => void;
};

function ElementToGuessTableRow(props: ElementToGuessTableRowProps) {
    return (
        <TableRow>
            <TableCell>{props.element.element.name}</TableCell>
            <TableCell>{props.element.element.tier}</TableCell>
            <TableCell>
                <TextField
                    type="number"
                    value={props.minAmount}
                    onChange={(event) =>
                        props.onSetMinAmount(props.element.element.address, parseInt(event.target.value, 10))
                    }
                />
            </TableCell>
            <TableCell>
                <TextField
                    type="number"
                    value={props.maxAmount}
                    onChange={(event) =>
                        props.onSetMaxAmount(props.element.element.address, parseInt(event.target.value, 10))
                    }
                />
            </TableCell>
            <TableCell>
                <Button onClick={() => props.onRemove(props.element.element.address)}>
                    <Delete />
                </Button>
            </TableCell>
        </TableRow>
    );
}
