import { Metaplex } from '@metaplex-foundation/js';
import {
    Box,
    Checkbox,
    FormControl,
    FormControlLabel,
    FormGroup,
    InputLabel,
    MenuItem,
    Select,
    SelectChangeEvent,
    TextField,
} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import { Connection, clusterApiUrl } from '@solana/web3.js';
import { Helius } from 'helius-sdk';
import _ from 'lodash';
import { ChangeEvent, useEffect, useState } from 'react';
import { stringSimilarity } from 'string-similarity-js';

import { ElementCard, ElementModalCard } from '../app/components/ElementCard';
import { Header } from '../app/components/Header';
import { Element, useElementsInfoStore } from '../app/stores/shopElements';
import { getExtendedRecipe } from '../lib/utils';

const connection = new Connection(process.env.NEXT_PUBLIC_SOLANA_RPC_ENDPOINT || clusterApiUrl('mainnet-beta'));

export type ExtendedRecipe = Record<string, { element: Element; amount: number }>;

type Ordering = 'tier:asc' | 'tier:desc' | 'price:asc' | 'price:desc' | 'name:asc' | 'name:desc';

type Filter = 'all' | 'invented' | 'not invented' | 'chests available' | 'no chests available';

type Props = {};

export default function Elments() {
    const elements = useElementsInfoStore((state) => state.elements);
    const elementsRecord = useElementsInfoStore((state) => state.elementsRecord);
    const refetchElements = useElementsInfoStore((state) => state.fetch);

    const [elementsDisplay, setElementsDisplay] = useState<Element[]>([]);

    const [eleSolPrice, setEleSolPrice] = useState<number>(0);
    const [eleUsdcPrice, setEleUsdcPrice] = useState<number>(0);

    const [ordering, setOrdering] = useState<Ordering>('tier:asc');

    const [search, setSearch] = useState<string>('');

    const [inventedFilter, setInventedFilter] = useState<Filter>('all');

    const [tierFilters, setTierFilters] = useState<Set<number>>(new Set());

    const [openedElement, setOpenedElement] = useState<Element | undefined>();
    const [openedElementAddress, setOpenedElementAddress] = useState<string | null>(null);
    const [openedElementRecipe, setOpenedElementRecipe] = useState<ExtendedRecipe[]>([]);

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

    useEffect(() => {
        setElementsDisplay(_.cloneDeep(elements));
    }, [elements]);

    useEffect(() => {
        const elements = Object.values(elementsRecord);

        // inventedFilter
        let filtered;
        if (inventedFilter === 'invented') {
            filtered = _.filter(elements, { invented: true });
        } else if (inventedFilter === 'not invented') {
            filtered = _.filter(elements, { invented: false });
        } else if (inventedFilter === 'chests available') {
            filtered = _.filter(elements, { chestsAvailable: true });
        } else if (inventedFilter === 'no chests available') {
            filtered = _.filter(elements, { chestsAvailable: false });
        } else {
            filtered = _.clone(elements);
        }

        // tierFilters
        if (!_.isEmpty(tierFilters)) {
            filtered = filtered.filter((e) => Array.from(tierFilters).includes(e.tier));
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

        // search
        if (!_.isNil(search) || !_.isEmpty(search)) {
            filtered = _.sortBy(
                filtered,
                (a: Element) => stringSimilarity(a.name.toLowerCase(), search.toLowerCase()) * -1
            );
        }

        setElementsDisplay(filtered);
    }, [inventedFilter, tierFilters, search, ordering, elementsRecord]);

    useEffect(() => {
        if (_.isNil(openedElementAddress) || _.isEmpty(openedElementAddress)) {
            setOpenedElement(undefined);
            return;
        }

        const element = elementsRecord[openedElementAddress];

        const extendedRecipes = getExtendedRecipe(element, elementsRecord);

        setOpenedElementRecipe(extendedRecipes);
        setOpenedElement(elementsRecord[openedElementAddress]);
    }, [openedElementAddress, elementsRecord]);

    useEffect(() => {
        fetchEleSolPrice();
        fetchEleUsdcPrice();
        refetchElements(connection);
    }, []);

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
                    <InputLabel id="inventedFilterLabel">Filter</InputLabel>
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
                        <MenuItem value={'chests available'}>Chests Available</MenuItem>
                        <MenuItem value={'no chests available'}>No Chests Available</MenuItem>
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
                <Grid container spacing={1} gap={1.5} justifyContent={'center'}>
                    {elementsDisplay.map((e) => (
                        <ElementCard
                            key={e.address}
                            element={e}
                            eleSolPrice={eleSolPrice}
                            eleUsdcPrice={eleUsdcPrice}
                            onOpen={handleOpenElement}
                        />
                    ))}
                </Grid>
            </Box>

            <ElementModalCard
                element={openedElement}
                extendedRecipes={openedElementRecipe}
                eleSolPrice={eleSolPrice}
                eleUsdcPrice={eleUsdcPrice}
                onClose={handleCloseElement}
            />
        </>
    );
}
