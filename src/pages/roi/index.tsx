import Link from 'next/link';
import { Box, Grid, Paper } from '@mui/material';
import Image from 'next/image';

import { Header } from '../../app/components/Header';
import { CRYSTALS_IMAGES, RABBITS_ELE_PER_HOUR, RABBIT_IMAGE } from '../../lib/constants';

// get ELE prices
// get crystal prices by level
// get rabbits prices by level
export default function RoiPage() {
    return (
        <>
            <Header />

            <Box sx={{ flexGrow: 1, marginTop: '2rem' }}>
                <Grid container spacing={2} gap={2} justifyContent={'space-evenly'}>
                    <Link href={'/roi/rabbits'}>
                        <Paper
                            sx={{
                                width: '220px',
                                height: '220px',
                                padding: '.5rem',
                                opacity: '0.8',
                                ':hover': {
                                    opacity: 1,
                                },
                                justifyContent: 'center',
                            }}
                        >
                            <div
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                }}
                            >
                                <p>Rabbits ROI Table</p>
                                <Image
                                    src={RABBIT_IMAGE}
                                    width={140}
                                    height={140}
                                    alt={`picture of level 10 crystal`}
                                />
                            </div>
                        </Paper>
                    </Link>

                    <Link href={'/roi/crystals'}>
                        <Paper
                            sx={{
                                width: '220px',
                                height: '220px',
                                padding: '.5rem',
                                opacity: '0.8',
                                ':hover': {
                                    opacity: 1,
                                },
                                justifyContent: 'center',
                            }}
                        >
                            <div
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                }}
                            >
                                <p>Crystals ROI Table</p>
                                <Image
                                    src={CRYSTALS_IMAGES[10]}
                                    width={140}
                                    height={140}
                                    alt={`picture of level 10 crystal`}
                                />
                            </div>
                        </Paper>
                    </Link>
                </Grid>
            </Box>
        </>
    );
}
