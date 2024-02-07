import { create } from 'zustand';
import _ from 'lodash';

import { CRYSTALS_ELE_PER_HOUR } from '../../lib/constants';

type PriceStore = {
    price: number;
    fetch: () => Promise<void>;
};

export const useEleSolPriceStore = create<PriceStore>((set) => ({
    price: 0,
    fetch: async () => {
        const res = await fetch('https://price.jup.ag/v4/price?ids=ELE&vsToken=SOL');
        const body = await res.json();
        set({ price: body.data.ELE.price });
    },
}));

export const useEleUsdcPriceStore = create<PriceStore>((set) => ({
    price: 0,
    fetch: async () => {
        const res = await fetch('https://price.jup.ag/v4/price?ids=ELE&vsToken=USDC');
        const body = await res.json();
        set({ price: body.data.ELE.price });
    },
}));

type PricesStore = {
    prices: Record<string, number | null>;
    fetch: () => Promise<void>;
};

async function fetchCrystalPrice(level: number | string, limit?: number) {
    let params = `?attributes=[[{"traitType":"level", "value":"${level}"}]]&listingAggMode=true`;
    if (!_.isNil(limit)) {
        params = params + `&limit=${limit}`;
    }
    const res = await fetch('https://api-mainnet.magiceden.dev/v2/collections/elementerra_crystals/listings' + params);
    return res.json();
}

export const useCrystalPricesStore = create<PricesStore>((set, get) => ({
    prices: {},
    fetch: async () => {
        const crystalLevels = Object.keys(CRYSTALS_ELE_PER_HOUR);
        const prices: Record<string, number | null> = Object.fromEntries(crystalLevels.map((level) => [level, null]));

        for (const level of crystalLevels) {
            const res = await fetchCrystalPrice(level, 1);
            const first: any = _.first(res);
            prices[level] = first?.price;
        }
        set({ prices });
    },
}));

export const useRabbitPriceStore = create<PriceStore>((set, get) => ({
    price: 0,
    fetch: async () => {
        const res = await fetch(
            'https://api-mainnet.magiceden.dev/v2/collections/elementerra_rabbits/listings?limit=1'
        );
        const body = await res.json();
        const first: any = _.first(body);
        set({ price: first?.price });
    },
}));
