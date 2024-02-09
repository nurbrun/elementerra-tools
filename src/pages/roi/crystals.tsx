import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import _ from 'lodash';
import { useEffect, useState } from 'react';
import { Header } from '../../app/components/Header';
import { useCrystalPricesStore, useEleSolPriceStore } from '../../app/stores/prices';
import { CRYSTALS_ELE_PER_HOUR } from '../../lib/constants';
import { calculatePrice } from '../../lib/utils/price';

export default function RoiCrystalsPage() {
    const [loading, setLoading] = useState(true);

    const refreshEleSolPrice = useEleSolPriceStore((state) => state.fetch);

    const crystalPrices = useCrystalPricesStore((state) => state.prices);
    const fetchCrystalPrices = useCrystalPricesStore((state) => state.fetch);

    useEffect(() => {
        if (!_.isEmpty(Object.keys(crystalPrices))) {
            setLoading(false);
        }
    }, [crystalPrices]);

    useEffect(() => {
        refreshEleSolPrice();
        fetchCrystalPrices();
    }, [fetchCrystalPrices, refreshEleSolPrice]);

    return (
        <>
            <Header />
            {loading ? (
                <h3>Loading ...</h3>
            ) : (
                <TableContainer component={Paper}>
                    <Table sx={{ minWidth: 600 }} aria-label="ELE production table">
                        <TableHead>
                            <TableRow>
                                <TableCell>Crystal LvL</TableCell>
                                <TableCell>ELE/h</TableCell>
                                <TableCell>SOL/d</TableCell>
                                <TableCell>FP in SOL</TableCell>
                                <TableCell>ROI in Days</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {Object.entries(crystalPrices).map(([level, price]) => (
                                <ViewCrystalRoiRow key={level} level={level} price={price} />
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </>
    );
}

type RowProps = {
    level: string;
    price: number | null;
};

function ViewCrystalRoiRow(props: RowProps) {
    const eleSolPrice = useEleSolPriceStore((state) => state.price);

    const [solPerDay, setSolPerDay] = useState(0);
    const [fpInSol, setFpInSol] = useState<number>();
    const [roi, setRoi] = useState<number>();

    useEffect(() => {
        const perDay = calculatePrice(eleSolPrice, CRYSTALS_ELE_PER_HOUR[props.level] * 24);
        setSolPerDay(perDay);

        if (!_.isNil(props.price) && !_.isNil(eleSolPrice)) {
            const fp = calculatePrice(1, props.price);

            setFpInSol(fp);
            setRoi(_.round(fp / perDay, 2));
        }
    }, [props.price, props.level, eleSolPrice]);

    return (
        <TableRow key={props.level}>
            <TableCell>{props.level}</TableCell>
            <TableCell>{CRYSTALS_ELE_PER_HOUR[props.level]} ELE/h</TableCell>
            <TableCell>{solPerDay} SOL/d</TableCell>
            <TableCell>{fpInSol ? fpInSol + ' SOL' : 'unknown'}</TableCell>
            <TableCell>{roi ? roi + ' days' : 'unknown'}</TableCell>
        </TableRow>
    );
}
