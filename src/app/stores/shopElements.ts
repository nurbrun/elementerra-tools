import { PublicKey } from '@metaplex-foundation/js';
import { Connection } from '@solana/web3.js';
import _ from 'lodash';
import { create } from 'zustand';
import { encode as encodeb58 } from 'bs58';

import { BASE_ELEMENTS_PRICES } from '../../lib/constants/elements';
import { ELEMENTERRA_PROGRAM_ID } from '../../pages/_app';

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
    forgedCount: number;
    remaningCount: number;
    chestsAvailable: boolean;
};

type ElementsInfoState = {
    elements: Element[];
    elementsRecord: Record<string, Element>;
    fetch: (connection: Connection) => Promise<void>;
};

export const useElementsInfoStore = create<ElementsInfoState>((set) => ({
    elements: [],
    elementsRecord: {},
    fetch: async (connection: Connection) => {
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

                // const padding1 = buf.subarray(75, 75 + 1).toString('hex') // 75 - 76
                const forgedCount = buf.subarray(76, 76 + 2).readInt16LE(); // 76 - 77
                const remaningCount = buf.subarray(84, 84 + 2).readInt16LE(); // 84 - 85
                const chestsAvailable = remaningCount != 0;

                // const unkonwn3Hex = buf.subarray(78, 78 + 16).toString('hex');

                const ingredient1 = encodeb58(buf.subarray(94, 94 + 32)); // 94 - 125
                const ingredient2 = encodeb58(buf.subarray(126, 126 + 32)); // 126 - 157
                const ingredient3 = encodeb58(buf.subarray(158, 158 + 32)); // 158 - 189
                const ingredient4 = encodeb58(buf.subarray(190, 190 + 32)); // 190 - 221
                const recipe: RecipeTuple = [ingredient1, ingredient2, ingredient3, ingredient4];

                // const unkonwn4Hex = buf.subarray(222, 226).toString('hex'); // 222 - 225

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
                    forgedCount,
                    remaningCount,
                    chestsAvailable,
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

        set({ elementsRecord: Object.fromEntries(elements.map((e) => [e.address, e])), elements });
    },
}));
