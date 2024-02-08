import { create } from 'zustand';
import _ from 'lodash';

import { RAW_RABBIT_LEVEL_INFO } from '../../lib/constants';
import { Element } from './shopElements';

export type RabbitLevelInfo = {
    bonus: number;
    tier: number;
    reward?: number;
    elePerHour: number;
    elementToBurn: string | null;
    eleToBurn: number;
    levelCost: number | null;
    totalLevelCost: number | null;
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

        let totalLevelCost = 0;
        let elePerHourRunning = 0;

        let missingInfo = false;

        for (const rawInfo of rawRabbitLevelInfo) {
            let elementCost;
            let levelCost = null;

            if (!_.isNil(rawInfo.elementToBurn)) {
                elementCost = elements.find(
                    (e) => e.name.toLowerCase() === rawInfo.elementToBurn?.toLowerCase()
                )?.price;
            } else {
                elementCost = 0;
            }

            if (elementCost !== undefined) {
                levelCost = rawInfo.eleToBurn + elementCost;
                totalLevelCost += levelCost;
            } else {
                missingInfo = true;
            }

            elePerHourRunning += rawInfo.bonus;

            if (missingInfo) {
                res.push({
                    ...rawInfo,
                    ...{
                        elePerHour: elePerHourRunning,
                        levelCost: null,
                        totalLevelCost: null,
                    },
                });
            } else {
                res.push({
                    ...rawInfo,
                    ...{
                        elePerHour: elePerHourRunning,
                        levelCost,
                        totalLevelCost,
                    },
                });
            }
        }

        set({
            rabbitLevelInfo: res,
        });
    },
}));
