import { Box, Modal, Paper, Typography } from '@mui/material';
import _ from 'lodash';
import Image from 'next/image';

import { Element } from '../stores/shopElements';
import { calculatePrice } from '../../lib/utils';
import { ExtendedRecipe } from '../../pages/elements';
import styles from '../../styles/Elements.module.css';

type Props = {
    readonly key?: string;
    readonly element: Element;
    readonly eleSolPrice: number;
    readonly eleUsdcPrice: number;
    readonly onOpen?: (elementId: string) => void;
};

export function ElementCard(props: Props) {
    return (
        <Paper
            sx={{
                width: '220px',
                height: '220px',
                padding: '.5rem',
                opacity: '0.8',
                ':hover': {
                    opacity: 1,
                },
            }}
            className={props.element.chestsAvailable ? styles.Active : ''}
            onClick={() => props.onOpen?.(props.element.address)}
        >
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    padding: '.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                        <p>
                            <strong style={{ whiteSpace: 'nowrap' }}>{props.element.name} </strong>T{props.element.tier}
                        </p>
                        <p>{props.element.invented ? 'invented' : 'not invented'}</p>
                        {viewChestsCount(props.element)}
                    </div>
                    <Image
                        className={!props.element.invented ? styles.Uninvented : ''}
                        src={props.element.url}
                        width={80}
                        height={80}
                        alt={`picture of ${props.element.name}`}
                    />
                </div>

                <div className={styles.PriceContainer}>
                    <p className={styles.Price}>{props.element.price ? `${props.element.price} ELE` : 'unkown'}</p>
                    <p className={styles.Price}>
                        {props.element.price
                            ? `${calculatePrice(props.eleSolPrice, props.element.price)} SOL`
                            : 'unkown'}
                    </p>
                    <p className={styles.Price}>
                        {props.element.price
                            ? `${calculatePrice(props.eleUsdcPrice, props.element.price)} USDC`
                            : 'unkown'}
                    </p>
                </div>
            </div>
        </Paper>
    );
}

function viewChestsCount(element?: void | Element | undefined) {
    if (element?.chestsAvailable) {
        const total = element.forgedCount + element.remaningCount;
        return (
            <div>
                {element.forgedCount}/{total}
            </div>
        );
    }
}

type ElementModalCard = {
    readonly element?: Element | void;
    readonly extendedRecipes: ExtendedRecipe[];
    readonly eleSolPrice: number;
    readonly eleUsdcPrice: number;
    readonly onClose: () => void;
};

function viewExtendedRecipeItem(element: Element, amount: number) {
    return (
        <p key={element.address} style={{ whiteSpace: 'nowrap' }}>
            {amount} x {element.name}
        </p>
    );
}

function viewExtendedRecipe(extendedRecipe: ExtendedRecipe, index: number) {
    return (
        <div key={index} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
            {index ? 'or' : ''}
            <Paper
                sx={{
                    width: '100%',
                    padding: '1rem',
                    display: 'flex',
                    gap: '1rem',
                    justifyContent: 'space-between',
                }}
            >
                {Object.values(extendedRecipe).map(({ element, amount }) => viewExtendedRecipeItem(element, amount))}
            </Paper>
        </div>
    );
}

export function ElementModalCard(props: ElementModalCard) {
    return (
        <Modal
            open={!_.isNil(props.element)}
            onClose={props.onClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box
                sx={{
                    position: 'absolute' as 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    minWidth: 400,
                    bgcolor: 'background.paper',
                    border: '2px solid #000',
                    boxShadow: 24,
                    p: 4,
                }}
            >
                <div
                    style={{
                        width: '100%',
                        height: '100%',
                        padding: '.5rem',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                    }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <div>
                            <Typography id="modal-modal-title" variant="h6" component="h2">
                                {props.element?.name} <small>- T{props.element?.tier}</small>
                            </Typography>

                            <p>{props.element?.invented ? 'invented' : 'not invented'}</p>
                            {viewChestsCount(props.element)}
                        </div>
                        <Image
                            className={!props.element?.invented ? styles.Uninvented : ''}
                            src={props.element?.url || ''}
                            width={80}
                            height={80}
                            alt={`picture of ${props.element?.name}`}
                        />
                    </div>

                    <div className={styles.PriceContainer}>
                        <p className={styles.Price}>
                            {props.element?.price ? `${props.element?.price} ELE` : 'unkown'}
                        </p>
                        <p className={styles.Price}>
                            {props.element?.price
                                ? `${calculatePrice(props.eleSolPrice, props.element?.price)} SOL`
                                : 'unkown'}
                        </p>
                        <p className={styles.Price}>
                            {props.element?.price
                                ? `${calculatePrice(props.eleUsdcPrice, props.element?.price)} USDC`
                                : 'unkown'}
                        </p>
                    </div>
                </div>

                <br />
                <p>Recipe and Breakdown:</p>
                <div>{props.extendedRecipes?.map(viewExtendedRecipe)}</div>
            </Box>
        </Modal>
    );
}
