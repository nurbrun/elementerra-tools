import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { Stakable } from '../../pages';
import { calculatePrice } from '../../lib/utils';

type Props = {
    readonly rabbits: Stakable[];
    readonly eleSolPrice: number;
};

function viewRabbitRow(stakable: Stakable, eleSolPrice: number) {
    return (
        <TableRow key={stakable.nft.id}>
            <TableCell>{stakable.nft.content?.metadata?.name}</TableCell>
            <TableCell>{stakable.level}</TableCell>
            <TableCell>{stakable.elePerHour} ELE/h</TableCell>
            <TableCell>{calculatePrice(stakable.elePerHour, eleSolPrice)} SOL/h</TableCell>
        </TableRow>
    );
}

export function RabbitsTable(props: Props) {
    return (
        <TableContainer component={Paper}>
            <Table sx={{ minWidth: 600 }} aria-label="ELE production table">
                <TableHead>
                    <TableRow>
                        <TableCell>Rabbit</TableCell>
                        <TableCell>LvL</TableCell>
                        <TableCell>ELE/h</TableCell>
                        <TableCell>SOL/h</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>{props.rabbits.map((rabbit) => viewRabbitRow(rabbit, props.eleSolPrice))}</TableBody>
            </Table>
        </TableContainer>
    );
}
