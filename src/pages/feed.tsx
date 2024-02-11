import { Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Divider, Paper } from '@mui/material';
import _ from 'lodash';
import { useEffect, useMemo, useState } from 'react';
import io, { Socket } from 'socket.io-client';
import { Header } from '../app/components/Header';

type FeedEvent = {
    timestamp: number;
    playerAddress: string;
    event: string;
};

const MAX_QUEUE_LENGTH = 100;
const socket = io(process.env.NEXT_PUBLIC_WEB_SOCKET_HOST!);

export default function FeedPage() {
    const [messages, setMessages] = useState<Record<string, FeedEvent>>({});

    useEffect(() => {
        socket.on('connect', function () {
            console.log('Connected');
        });
        socket.on('disconnect', function () {
            console.log('Disconnected');
        });

        socket.on('events', (message: FeedEvent | FeedEvent[]) => {
            if (_.isArray(message)) {
                message.forEach((m) => handleUpdateMessages(m));
            } else {
                handleUpdateMessages(message);
            }
        });
    }, []);

    function handleUpdateMessages(message: FeedEvent) {
        const hash = `${message.timestamp}${message.playerAddress}${message.event}`;

        setMessages((state) => ({
            ...state,
            [hash]: message,
        }));
    }

    return (
        <>
            <Header />

            <h2>Feed (WIP)</h2>

            <Paper sx={{ width: '90%', margin: '1rem auto' }}>
                <Box>
                    <nav aria-label="secondary mailbox folders">
                        <List>
                            {_.isEmpty(messages) ? (
                                <div>Waiting for events ...</div>
                            ) : (
                                _.orderBy(Object.values(messages), 'timestamp', 'desc').map((message, i) => (
                                    <ListItem key={i}>
                                        <ListItemText>{new Date(message.timestamp * 1000).toISOString()}</ListItemText>
                                        <ListItemText>{message.playerAddress}</ListItemText>
                                        <ListItemText>{message.event}</ListItemText>
                                    </ListItem>
                                ))
                            )}
                        </List>
                    </nav>
                </Box>
            </Paper>
        </>
    );
}
