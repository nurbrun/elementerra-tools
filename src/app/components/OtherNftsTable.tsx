import { TableContainer, Paper, Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';
import { Stakable } from '../../pages';
import _ from 'lodash';
import { calculatePrice } from '../../lib/utils';

type Props = {
    readonly otherNfts: Stakable[];
    readonly eleSolPrice: number;
};

function viewOtherNFTRow(name: string, eleProduction: number, eleSolPrice: number) {
    return (
        <TableRow key={name}>
            <TableCell>{name}</TableCell>
            <TableCell>{eleProduction}</TableCell>
            <TableCell>{calculatePrice(eleProduction, eleSolPrice)}</TableCell>
        </TableRow>
    );
}

export function OtherNftsTable(props: Props) {
    return (
        <TableContainer component={Paper}>
            <Table sx={{ minWidth: 600 }} aria-label="ELE production table">
                <TableHead>
                    <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>ELE/h</TableCell>
                        <TableCell>SOL/h</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {props.otherNfts.map((nft) =>
                        viewOtherNFTRow(
                            nft.nft.content?.metadata.name || nft.nft.content?.metadata.symbol || 'no name',
                            nft.elePerHour,
                            props.eleSolPrice
                        )
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );
}
