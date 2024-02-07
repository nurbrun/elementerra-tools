import { create } from 'zustand';
import _ from 'lodash';

import { RAW_RABBIT_LEVEL_INFO } from '../../lib/constants';
import { Element } from './shopElements';

export type RabbitLevelInfo = {
    elementToBurn: string | null;
    bonus: number;
    eleToBurn: number;
    tier: number;
    reward?: number;
    eleToBurnSum: number;
    elePerHour: number;
};

type RabbitLevelInfoState = {
    rabbitLevelInfo: RabbitLevelInfo[];
    fetch: (elements: Element[]) => Promise<void>;
};

export const useRabbitLevelInfoStore = create<RabbitLevelInfoState>((set) => ({
    rabbitLevelInfo: [],
    fetch: async (elements: Element[]) => {
        const rawRabbitLevelInfo = _.clone(RAW_RABBIT_LEVEL_INFO);
        rawRabbitLevelInfo.sort((a, b) => a.level - b.level);

        const res = [];

        let eleToBurnRunning = 0;
        let elePerHourRunning = 0;

        for (const rawInfo of rawRabbitLevelInfo) {
            const eleToBurnSum = rawInfo.eleToBurn + eleToBurnRunning;
            let elementCost = 0;
            if (!_.isNil(rawInfo.elementToBurn)) {
                elementCost =
                    elements.find((e) => e.name.toLowerCase() === rawInfo.elementToBurn?.toLowerCase())?.price || 0;
            }

            res.push({
                ...rawInfo,
                ...{
                    eleToBurnSum,
                    elePerHour: rawInfo.bonus + elePerHourRunning,
                    totalEleToBurn: eleToBurnSum + elementCost,
                },
            });
            
            eleToBurnRunning += rawInfo.eleToBurn;
            elePerHourRunning += rawInfo.bonus;
        }
        set({
            rabbitLevelInfo: res,
        });
    },
}));
