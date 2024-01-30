import { TableContainer, Paper, Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';
import { Stakable } from '../../pages';
import _ from 'lodash';
import { calculatePrice } from '../../lib/utils';

type Props = {
    readonly crystals: Stakable[];
    readonly eleSolPrice: number;
};

function viewCrystalLevelRow(level: string, crystals: Stakable[], eleSolPrice: number) {
    const amount = crystals.length;
    const eleProduction = (_.first(crystals)?.elePerHour || 0) * amount;

    return (
        <TableRow>
            <TableCell>{level}</TableCell>
            <TableCell>{amount}</TableCell>
            <TableCell>{eleProduction}</TableCell>
            <TableCell>{calculatePrice(eleProduction, eleSolPrice)}</TableCell>
        </TableRow>
    );
}

export function CrystalsTable(props: Props) {
    const crystals: Record<string, Stakable[]> = {};

    for (const c of props.crystals) {
        const crystalLevel = crystals[c.level];
        if (!_.isNil(crystalLevel)) {
            crystalLevel.push(c);
        } else {
            crystals[c.level] = [c];
        }
    }

    return (
        <TableContainer component={Paper}>
            <Table sx={{ minWidth: 600 }} aria-label="ELE production table">
                <TableHead>
                    <TableRow>
                        <TableCell>Crystal</TableCell>
                        <TableCell>Amount</TableCell>
                        <TableCell>ELE/h</TableCell>
                        <TableCell>SOL/h</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {Object.entries(crystals).map(([level, crystalLevel]) =>
                        viewCrystalLevelRow(level, crystalLevel, props.eleSolPrice)
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );
}
