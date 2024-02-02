import { Box, Modal, Paper, Typography } from '@mui/material';
import Image from 'next/image';

import { Element, ExtendedRecipe, PADDING_ADDRESS } from '../../pages/elements';
import styles from '../../styles/Elements.module.css';
import _ from 'lodash';
import { BASE_ELEMENTS } from '../../lib/constants/elements';
import { useEffect, useState } from 'react';

type Props = {
    readonly key: string;
    readonly element: Element;
    readonly onOpen: (elementId: string) => void;
};

export function ElementCard(props: Props) {
    return (
        <Paper
            sx={{
                width: '200px',
                height: '200px',
                padding: '.5rem',
                opacity: '0.8',
                ':hover': {
                    opacity: 1,
                },
            }}
            onClick={() => props.onOpen(props.element.address)}
        >
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                        <strong style={{ whiteSpace: 'nowrap' }}>{props.element.name}</strong>
                        <p>{props.element.invented ? 'invented' : 'not invented'}</p>
                    </div>
                    <Image
                        className={!props.element.invented ? styles.Uninvented : ''}
                        src={props.element.url}
                        width={80}
                        height={80}
                        alt={`picture of ${props.element.name}`}
                    />
                </div>
                <div>
                    <p>Price: {props.element.price ? `${props.element.price} ELE` : 'unkown'}</p>
                </div>
                <div style={{ textAlign: 'end' }}>T {props.element.tier}</div>
            </div>
        </Paper>
    );
}

type ElementModalCard = {
    readonly element?: Element | void;
    readonly extendedRecipes: ExtendedRecipe[];
    readonly onClose: () => void;
};

function viewExtendedRecipeItem(element: Element, amount: number) {
    return (
        <>
            <p style={{ whiteSpace: 'nowrap' }}>
                {amount} x {element.name}
            </p>
        </>
    );
}

function viewExtendedRecipe(extendedRecipe: ExtendedRecipe, index: number) {
    return (
        <>
            {index ? 'or' : ''}
            <Paper
                sx={{ width: '100%', padding: '1rem', display: 'flex', gap: '1rem', justifyContent: 'space-between' }}
            >
                {Object.values(extendedRecipe).map(({ element, amount }) => viewExtendedRecipeItem(element, amount))}
            </Paper>
        </>
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
                <Typography id="modal-modal-title" variant="h6" component="h2">
                    {props.element?.name} <small>- Recipe and Breakdown</small>
                </Typography>

                <br />

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
                    {props.extendedRecipes?.map(viewExtendedRecipe)}
                </div>
            </Box>
        </Modal>
    );
}
