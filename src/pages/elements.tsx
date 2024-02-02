import { Metaplex, PublicKey } from '@metaplex-foundation/js';
import {
    Box,
    Button,
    Checkbox,
    FormControl,
    FormControlLabel,
    FormGroup,
    FormLabel,
    InputLabel,
    MenuItem,
    Modal,
    Paper,
    Radio,
    RadioGroup,
    Select,
    SelectChangeEvent,
    TextField,
    Typography,
} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import { Connection } from '@solana/web3.js';
import { encode as encodeb58 } from 'bs58';
import { Helius } from 'helius-sdk';
import _, { add } from 'lodash';
import Image from 'next/image';
import { ChangeEvent, useCallback, useEffect, useState } from 'react';
import { stringSimilarity } from 'string-similarity-js';

import { Header } from '../app/components/Header';
import { BASE_ELEMENTS, BASE_ELEMENTS_PRICES } from '../lib/constants/elements';
import { ELEMENTERRA_PROGRAM_ID } from './_app';
import styles from '../styles/Elements.module.css';
import style from 'styled-jsx/style';
import { ElementCard, ElementModalCard } from '../app/components/ElementCard';

const connection = new Connection(process.env.NEXT_PUBLIC_SOLANA_RPC_ENDPOINT!);
const metaplex = Metaplex.make(connection);
const helius = new Helius(process.env.NEXT_PUBLIC_HELIUS_API_KEY!);
export const PADDING_ADDRESS = '11111111111111111111111111111111';

export type RecipeTuple = [string, string, string, string];

export type Element = {
    address: string;
    name: string;
    inventorAddress: string;
    invented: boolean;
    tier: number;
    recipe: RecipeTuple;
    url: string;
    price?: number;
};

export type ExtendedRecipe = Record<string, { element: Element; amount: number }>;

type Ordering = 'tier:asc' | 'tier:desc' | 'price:asc' | 'price:desc' | 'name:asc' | 'name:desc';

type Filter = 'all' | 'invented' | 'not invented';

type Props = {};

export default function Elments() {
    const [elementsRecord, setElementsRecord] = useState<Record<string, Element>>({});
    const [elementsDisplay, setElementsDisplay] = useState<Element[]>([]);

    const [ordering, setOrdering] = useState<Ordering>('tier:asc');

    const [search, setSearch] = useState<string>('');

    const [inventedFilter, setInventedFilter] = useState<Filter>('all');

    const [tierFilters, setTierFilters] = useState<Set<number>>(new Set());

    const [openedElement, setOpenedElement] = useState<Element | undefined>();
    const [openedElementAddress, setOpenedElementAddress] = useState<string | null>(null);
    const [openedElementRecipe, setOpenedElementRecipe] = useState<ExtendedRecipe[]>([]);

    const fetchElements = useCallback(async () => {
        const assets = await connection.getProgramAccounts(new PublicKey(ELEMENTERRA_PROGRAM_ID), {
            filters: [{ memcmp: { offset: 0, bytes: 'Qhcg1qqD1g9' } }],
        });

        const prices = _.clone(BASE_ELEMENTS_PRICES);

        function getPrice(address: string): number | undefined {
            const foundPrice = prices[address];
            if (!_.isNil(foundPrice)) {
                return foundPrice;
            }
        }

        const elements: Element[] = assets
            .map((e) => {
                const buf = e.account.data;

                const address = e.pubkey.toString();

                // const unkonwn1Hex = buf.subarray(0, 10).toString('hex'); // 0 - 9
                // const unkonwn2Hex = buf.subarray(10, 42).toString('hex'); // 10 - 41
                const inventorAddress = encodeb58(buf.subarray(42, 42 + 32)); // 42 - 73
                const invented = inventorAddress !== PADDING_ADDRESS || _.has(BASE_ELEMENTS_PRICES, address);

                const tier = buf.subarray(74, 74 + 1).readInt8(0); // 74

                const ingredient1 = encodeb58(buf.subarray(94, 94 + 32)); // 126 - 157
                const ingredient2 = encodeb58(buf.subarray(126, 126 + 32)); // 126 - 157
                const ingredient3 = encodeb58(buf.subarray(158, 158 + 32)); // 158 - 189
                const ingredient4 = encodeb58(buf.subarray(190, 190 + 32)); // 190 - 221
                const recipe: RecipeTuple = [ingredient1, ingredient2, ingredient3, ingredient4];

                // const unkonwn3Hex = buf.subarray(222, 226).toString('hex'); // 222 - 225
                const nameRaw = buf
                    .subarray(226, 226 + 16)
                    .filter((n) => n > 31 && n != 33) // not ASCII control character and not "!" character
                    .toString()
                    .trimEnd(); // 226 - ?

                const name = nameRaw.replaceAll(/([a-zA-Z])([A-Z])/g, '$1 $2');
                const nameKebab = nameRaw.replaceAll(/([a-zA-Z0-9])([A-Z])/g, '$1-$2').toLowerCase();
                const url = `https://elementerra-mainnet.s3.us-east-1.amazonaws.com/transparent/${nameKebab}.png`;

                return {
                    address,
                    name,
                    inventorAddress,
                    invented,
                    tier,
                    recipe,
                    url,
                };
            })
            .sort((a: Element, b: Element) => a.tier - b.tier)
            .map((e: Element) => {
                let price = 0;
                const foundPrice = getPrice(e.address);
                if (!_.isNil(foundPrice)) {
                    price = foundPrice;
                } else {
                    price = _.sum(e.recipe.map((i) => getPrice(i)));
                    prices[e.address] = price;
                }

                return {
                    ...e,
                    price,
                };
            });

        setElementsRecord(Object.fromEntries(elements.map((e) => [e.address, e])));
        setElementsDisplay(elements);
    }, []);

    useEffect(() => {
        const elements = Object.values(elementsRecord);

        // inventedFilter
        let filtered;
        if (inventedFilter === 'invented') {
            filtered = _.filter(elements, { invented: true });
        } else if (inventedFilter === 'not invented') {
            filtered = _.filter(elements, { invented: false });
        } else {
            filtered = _.clone(elements);
        }

        // tierFilters
        if (!_.isEmpty(tierFilters)) {
            filtered = filtered.filter((e) => Array.from(tierFilters).includes(e.tier));
        }

        // search
        if (!_.isNil(search) || !_.isEmpty(search)) {
            filtered = _.sortBy(filtered, (a: Element) => {
                return stringSimilarity(a.name.toLowerCase(), search.toLowerCase()) * -1;
            });
        }

        // ordering
        const field = ordering.split(':')[0];
        const order = ordering.split(':')[1];

        if (order !== 'asc' && order !== 'desc') {
            throw new Error(`Unkown order: "${order}"`);
        }

        filtered = _.orderBy(filtered, [field, 'name'], [order, 'asc']);

        if (field === 'price') {
            const parts = _.partition(filtered, field);
            filtered = [...parts[0], ...parts[1]];
        }

        setElementsDisplay(filtered);
    }, [inventedFilter, tierFilters, search, ordering, elementsRecord]);

    useEffect(() => {
        if (_.isNil(openedElementAddress) || _.isEmpty(openedElementAddress)) {
            setOpenedElement(undefined);
            return;
        }

        const element = elementsRecord[openedElementAddress];
        const receipes: string[][] = [element.recipe];
        const extendedRecipes: ExtendedRecipe[] = [];

        let sanityCheck = 0;

        while (true) {
            const lastRecipe = _.last(receipes)!;
            let nextLevel: string[] = [];
            const extendedNextLevel: ExtendedRecipe = {};

            for (const item of lastRecipe) {
                const extendedItem = elementsRecord[item];
                if (!_.isNil(extendedItem)) {
                    const elementName = extendedItem.name;
                    if (!_.has(extendedNextLevel, elementName)) {
                        extendedNextLevel[elementName] = {
                            element: extendedItem,
                            amount: 1,
                        };
                    } else {
                        extendedNextLevel[elementName].amount += 1;
                    }

                    nextLevel = [...nextLevel, ...extendedItem.recipe.filter((e) => e !== PADDING_ADDRESS)];
                }
            }

            extendedRecipes.push(extendedNextLevel);

            if (_.isEmpty(nextLevel)) {
                break;
            }

            receipes.push(nextLevel);

            sanityCheck++;
            if (sanityCheck > 20) {
                break;
            }
        }

        setOpenedElementRecipe(extendedRecipes);
        setOpenedElement(elementsRecord[openedElementAddress]);
    }, [openedElementAddress, elementsRecord]);

    useEffect(() => {
        fetchElements();
    }, [fetchElements]);

    function handleOrderingChange(event: SelectChangeEvent<Ordering>) {
        event.preventDefault();
        const ordering = event.target.value;
        setOrdering(ordering as Ordering);
    }

    function handleFilterChange(event: SelectChangeEvent<Filter>) {
        event.preventDefault();
        const filter = event.target.value;
        setInventedFilter(filter as Filter);
    }

    function handleTierFilterSelect(event: any) {
        const checked = event.target.checked;
        const tier = parseInt(event.target.value, 10);
        let tiersToFilter = _.clone(tierFilters);
        if (checked) {
            tiersToFilter.add(tier);
        } else {
            tiersToFilter.delete(tier);
        }
        setTierFilters(tiersToFilter);
    }

    function handleSearchInput(event: ChangeEvent<HTMLInputElement>) {
        event.preventDefault();
        const query = event.target.value;
        setSearch(query);
    }

    function handleOpenElement(elementId: string) {
        setOpenedElementAddress(elementId);
    }

    function handleCloseElement() {
        setOpenedElementAddress(null);
    }

    return (
        <>
            <Header />

            <Box sx={{ padding: '1rem 4rem' }}>
                <TextField
                    type="search"
                    fullWidth
                    label="Search"
                    id="searchField"
                    variant="outlined"
                    onChange={handleSearchInput}
                />
            </Box>

            <Box sx={{ padding: '1rem 4rem', gap: '1rem', display: 'flex' }}>
                <FormControl sx={{ minWidth: '150px' }}>
                    <InputLabel id="orderByLabel">Ordering</InputLabel>
                    <Select
                        labelId="orderByLabel"
                        aria-label="Ordering"
                        id="orderBy"
                        value={ordering}
                        label="Ordering"
                        onChange={handleOrderingChange}
                    >
                        <MenuItem value={'tier:asc'}>Tier ascending</MenuItem>
                        <MenuItem value={'tier:desc'}>Tier descending</MenuItem>
                        <MenuItem value={'price:asc'}>Price ascending</MenuItem>
                        <MenuItem value={'price:desc'}>Price descending</MenuItem>
                        <MenuItem value={'name:asc'}>Name ascending</MenuItem>
                        <MenuItem value={'name:desc'}>Name descending</MenuItem>
                    </Select>
                </FormControl>
                <FormControl sx={{ minWidth: '150px' }}>
                    <InputLabel id="inventedFilterLabel">Invented</InputLabel>
                    <Select
                        labelId="inventedFilterLabel"
                        aria-label="Invented"
                        id="inventedFilter"
                        value={inventedFilter}
                        label="Invented"
                        onChange={handleFilterChange}
                    >
                        <MenuItem value={'all'}>All</MenuItem>
                        <MenuItem value={'invented'}>Invented</MenuItem>
                        <MenuItem value={'not invented'}>Not Invented</MenuItem>
                    </Select>
                </FormControl>
                <FormControl sx={{ minWidth: '150px' }}>
                    <FormGroup aria-label="position" row onChange={handleTierFilterSelect}>
                        <FormControlLabel value="0" control={<Checkbox />} label="Tier 0" labelPlacement="start" />
                        <FormControlLabel value="1" control={<Checkbox />} label="Tier 1" labelPlacement="start" />
                        <FormControlLabel value="2" control={<Checkbox />} label="Tier 2" labelPlacement="start" />
                        <FormControlLabel value="3" control={<Checkbox />} label="Tier 3" labelPlacement="start" />
                        <FormControlLabel value="4" control={<Checkbox />} label="Tier 4" labelPlacement="start" />
                        <FormControlLabel value="5" control={<Checkbox />} label="Tier 5" labelPlacement="start" />
                        <FormControlLabel value="6" control={<Checkbox />} label="Tier 6" labelPlacement="start" />
                        <FormControlLabel value="7" control={<Checkbox />} label="Tier 7" labelPlacement="start" />
                    </FormGroup>
                </FormControl>
            </Box>

            <br />

            <Box sx={{ flexGrow: 1 }}>
                <Grid container spacing={2} gap={2} justifyContent={'center'}>
                    {elementsDisplay.map((e) => (
                        <ElementCard key={e.address} element={e} onOpen={handleOpenElement} />
                    ))}
                </Grid>
            </Box>

            <ElementModalCard
                element={openedElement}
                extendedRecipes={openedElementRecipe}
                onClose={handleCloseElement}
            />
        </>
    );
}
