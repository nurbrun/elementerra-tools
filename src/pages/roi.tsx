import { useWallet } from '@solana/wallet-adapter-react';
import { Header } from '../app/components/Header';
import {
    Connection,
    Message,
    MessageV0,
    PublicKey,
    SYSVAR_RENT_PUBKEY,
    SystemProgram,
    Transaction,
    TransactionInstruction,
    TransactionMessage,
    VersionedMessage,
    VersionedTransaction,
    sendAndConfirmRawTransaction,
    sendAndConfirmTransaction,
} from '@solana/web3.js';
import _ from 'lodash';
import { ELEMENTERRA_PROGRAM_ID } from './_app';
import { associatedTokenProgram, tokenProgram } from '@metaplex-foundation/js';

const connection = new Connection(process.env.NEXT_PUBLIC_SOLANA_RPC_ENDPOINT!);

function buildLevelUpInstruction(walletAddress: PublicKey) {
    return new TransactionInstruction({
        programId: new PublicKey(ELEMENTERRA_PROGRAM_ID),
        data: Buffer.from(
            '8040c574e28177ea300fe6c3a7342cc9c20ba580c7fc7b93e73d44292615231c621f1e1a3e90fc5f2244b4e5b1260c8cc827f281012bae947fabf5ad3669a9f3318ec887215c8685712f7398acb751eeb77a417f138ce8a5fbe3dd3eda23cbd74023b4a455366acb193601000000000019360100',
            'hex'
        ),
        keys: [
            { pubkey: associatedTokenProgram.address, isSigner: false, isWritable: false }, // 1
            { pubkey: tokenProgram.address, isSigner: false, isWritable: false }, // 2
            { pubkey: SystemProgram.programId, isSigner: false, isWritable: false }, // 3
            { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false }, // 4
            { pubkey: walletAddress, isSigner: true, isWritable: true }, // 5
            {
                pubkey: new PublicKey('8ZCqJ3GXiXsmwqLnXbyBL5U7Tu59k6p4HwXc8ijfgQfU'),
                isSigner: false,
                isWritable: false,
            }, // 6
            {
                pubkey: new PublicKey('DwcKm8uveH7WPXTrkriQAd4mYfqK2JSSAaptJvxTLmwS'),
                isSigner: false,
                isWritable: false,
            }, // 7
            {
                pubkey: new PublicKey('4gC1nUpX8XVBtZnRS6qpjtMCeCAHEn1x2t4JnQSyipAU'),
                isSigner: false,
                isWritable: false,
            }, // 8
            {
                pubkey: new PublicKey('CwriW1TPBufPjFv4Zg5ivDSFwe3qPqMz1CV8B6bzjPnW'),
                isSigner: false,
                isWritable: false,
            }, // 9
            {
                pubkey: new PublicKey('HrudA4kjKgFEPYEq5WoK7Guz3swtfuBiV2LYALLfEQS'),
                isSigner: false,
                isWritable: false,
            }, // 10
            {
                pubkey: new PublicKey('DieM3wCppu9EWjCw7wC7KGFtXuFz4w3WiyJJJChvhWY2'),
                isSigner: false,
                isWritable: false,
            }, // 11
            {
                pubkey: new PublicKey('3we8ApMV7vWLGuPx4uNQEZMwSREzmk84KcN2sWozg6er'),
                isSigner: false,
                isWritable: true,
            }, // 12
            {
                pubkey: new PublicKey('CMUwyjjPfNeQNWyUwR8ov89wmufqz7hVC6sXE8nCAaaB'),
                isSigner: false,
                isWritable: true,
            }, // 13
            {
                pubkey: new PublicKey('8A9HYfj9WAMgjxARWVCJHAeq9i8vdN9cerBmqUamDj7U'),
                isSigner: false,
                isWritable: true,
            }, // 14
            { pubkey: new PublicKey('J9qdyUo7FPehYKpys5Wu2R8pgDvhAMEWwvXKLykKzwc'), isSigner: false, isWritable: true }, // 15
            {
                pubkey: new PublicKey('ATG7zghBDcY2NiJ1tZu2SfJUwze6hWPgv8LNTayMbNoC'),
                isSigner: false,
                isWritable: true,
            }, // 16
            { pubkey: new PublicKey('7E5BsszQ9LeFYyvCvnrKp7x7iaEi7mq4p5CZb2DCnmAk'), isSigner: true, isWritable: true }, // 17
            { pubkey: new PublicKey('6RmT96Pi38KvyZqGguVh9MbPq38WmkbkRp3A29urmMs'), isSigner: false, isWritable: true }, // 18
            {
                pubkey: new PublicKey('56mePgFm5bJmKLABBvezK6Pr8q5xXbcMxhGFR8Cso9uL'),
                isSigner: false,
                isWritable: false,
            }, // 19
            {
                pubkey: new PublicKey('7FDB3My3BSHJ13mtJScYXa4hu2Z6xjyDbrWcERNYhfBn'),
                isSigner: false,
                isWritable: true,
            }, // 20
            {
                pubkey: new PublicKey('3Kp5QCqse5LNVDSxsGWn2NCvEpMXCykL9pfTHJTaoUS5'),
                isSigner: false,
                isWritable: true,
            }, // 21
            {
                pubkey: new PublicKey('HqeUqdp7sARaaTWCbfwVRGiX6LxBUjaYSHTEH9An1QYs'),
                isSigner: false,
                isWritable: true,
            }, // 22
            {
                pubkey: new PublicKey('5mKidNUBYY2N22se94PvmF9YF5tUcJEgRAyNN4GiBbFY'),
                isSigner: false,
                isWritable: true,
            }, // 23
            { pubkey: walletAddress, isSigner: true, isWritable: true }, // 24
            { pubkey: walletAddress, isSigner: true, isWritable: true }, // 25
            {
                pubkey: new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s'),
                isSigner: false,
                isWritable: false,
            }, // 26
            {
                pubkey: new PublicKey('BGUMAp9Gq7iTEuizy4pqaxsTyUCBK68MDfK752saRPUY'),
                isSigner: false,
                isWritable: false,
            }, // 27
            {
                pubkey: new PublicKey('cmtDvXumGCrqC1Age74AVPhSRVXJMd8PJS91L8KbNCK'),
                isSigner: false,
                isWritable: false,
            }, // 28
            {
                pubkey: new PublicKey('noopb9bkMVfRPU8AsbpTUg8AQkHtKwMYZiFUjNRtMmV'),
                isSigner: false,
                isWritable: false,
            }, // 29
            { pubkey: SystemProgram.programId, isSigner: false, isWritable: false }, // 30
            {
                pubkey: new PublicKey('GyidLCaTxzUZaZWRMnhN3oyeudgGerUNbkVXAfvoKFys'),
                isSigner: false,
                isWritable: false,
            }, // 31
            {
                pubkey: new PublicKey('DAbAU9srHpEUogXWuhy5VZ7g8UX9STymELtndcx1xgP1'),
                isSigner: false,
                isWritable: false,
            }, // 32
            {
                pubkey: new PublicKey('3HCYqQRcQSChEuAw1ybNYHibrTNNjzbYzm56cmEmivB6'),
                isSigner: false,
                isWritable: false,
            }, // 33
            {
                pubkey: new PublicKey('64YQDFxywm5nkP52BAk84YhTNhq32FVYUESiwJrdFbjL'),
                isSigner: false,
                isWritable: false,
            }, // 34
            {
                pubkey: new PublicKey('4zxhqQW4hkj7Mp29nZiVefpwCx5xoX5pGQswvdA1CRDC'),
                isSigner: false,
                isWritable: false,
            }, // 35
            {
                pubkey: new PublicKey('EAS7dqirGP3gkm73Enf3dA6LMHxVW469KSgo2r55wjaK'),
                isSigner: false,
                isWritable: false,
            }, // 36
            {
                pubkey: new PublicKey('FoaBYbQ6Y5pZULEebMMWisRPYMG3HuB7LSsLxKLVnYWC'),
                isSigner: false,
                isWritable: false,
            }, // 37
            {
                pubkey: new PublicKey('HXuhbGKMo8JTP8AGpURo8r7JTsCY76JBGGzge6GdiC76'),
                isSigner: false,
                isWritable: false,
            }, // 38
            {
                pubkey: new PublicKey('5r1m7tPHYU1QEVgknHf9p5C32Eeap7Sh8QnbPBWA3aZ5'),
                isSigner: false,
                isWritable: false,
            }, // 39
            {
                pubkey: new PublicKey('GmgFEzx6W1vrofPgpqGWA3XSZYGedAuGrK1mvx2ieD4G'),
                isSigner: false,
                isWritable: false,
            }, // 40
            {
                pubkey: new PublicKey('71G2kM1135AenCh4jR2L3nN34YF6GR6C28R86CzsB2ND'),
                isSigner: false,
                isWritable: false,
            }, // 41
            {
                pubkey: new PublicKey('4h9jmFjgXptWNqihBpYFAfq4K4ygRmkH7CSWZiT23G6o'),
                isSigner: false,
                isWritable: false,
            }, // 42
        ],
    });
}

// get rabbits prices by level
// get crystal prices by level
// get ELE prices
export default function RoiPage() {
    const wallet = useWallet();

    async function handleLevelUp() {
        if (!wallet || !wallet.publicKey) {
            console.error('No wallet found');
            return;
        }

        const buff = Buffer.from(
            '8040c574e28177ea300fe6c3a7342cc9c20ba580c7fc7b93e73d44292615231c621f1e1a3e90fc5f2244b4e5b1260c8cc827f281012bae947fabf5ad3669a9f3318ec887215c8685712f7398acb751eeb77a417f138ce8a5fbe3dd3eda23cbd74023b4a455366acb193601000000000019360100',
            'hex'
        );
        console.log(buff.length);
        const data = Buffer.from(
            'AhjCkBp1Ixd+TUVnoaxek2sBVV35mRKFzAZGTQuJ9VrLn68AV8eDOeujX0CmakLATmDJDWqRNgK2PvLDBnWOugPARl4UfkLxVR0osyx2Ce86BvqHGDz0k+MqrdX56yzW2syrfCDMrw/I/pKNTsDto5wQ6e/rEi8hIN5JEZbSKgAOgAIAEhmE9DgP9R8G6wXibmRTi6cSnG+Iu0rOt/pxrNYvkd7lUmPu8+quwzxKUkYmEl+MB7dsacfweXb0/G+zQHyzA3K3K7a2nXC4iDfgQ4U60E/j+UBeqSC1PEQcpKoPhYzBYu+or8XuAz0aMGB7Xb4oXrkSkABzL9knKeHKy3trpVJzoARk3hjEKUBBaQ0luS/LcDIXpqoFZasNrAJMDelx3ACjjM1XyG4Sg33I2e6zoicjqx9hO4vOxajQvAChy4kO5PnTZX4kjalutureh009G03ueN+D+FDDQqGCfW/plK/zDgMGRm/lIRcy/+ytunLDm+e8jOW7xfcSayxDmzpAAAAAxhURi3ZVtsolUt6bX1xEcf3nPyDAKgebJwYh1fD6J1I2nSpU+v1lMYxpBUqg4ZWfgfPq+1JMG56M4rhVfcUfibF+IiZQT2XCzbMFUrcSBm3C1uXksuSIOweHoRk5YSEHBFG5KsXFNh9SEqQOqTbtf93f/t5CM0QnDs+6morHh+OZtUfDePhm8HZuaONqvRfyLv1EMXWMvCNj/tFG3icjE60yKLZ299PNQoSlRD8X8ZYrNuSRswpAskBYSeWXul+1tMEZUZV8b49kLEr2HNayRkD+xtx/xgfuggapnpJBDTA7rpTGJpIi2CYsCFUNAD/j6+It4Y7B4LRF+rY6Rym/I6eGKTAu8BWPx5/08GDEG4to/PqqsgkoUQW4ii9Zu+MzrM990/6c8Q+GMqKte2MuaOkqYDj+Cax6ST/XfN1G14KaLs08rSLdTRZ8fbphGfBIpnvIv1eRW6n6nZb9yY2I5B5g7lFDNfd4GmDpLrYfGyk3Hpvp9QWdNTp2Y8m5UAx/n4QuKuoEXXB4QrchWQSpx7InSlWkPRJUIdQxmaZ3TPiaLqz7iV2JjAG1A5FEegjr3IPRlncsPUpY+thjRdOAbLStWlS5qJ1xkIVGUSOvQUzSmlaREh3y5gb2zSguCQ++0V76O3pcFeMWg4UaG1k3tc9brfJuzs2HFe6gtCluZ1lKZ9b/D3svarWNp6P9EasVQL7Crxh5j2gtjrTe18Mhl1wYIifxaP4XGrkKyGRJh6gZue50XyUFuBNiHVvX3cupAgcABQIgoQcACCoeHyAhACIjCQoLDAIDGQQFAQYkGhscHQAAJSYnKCANDg8QERITFBUWFxh0gEDFdOKBd+omJ1AqKOFR7hPV+oNABJP/scRZG5W9iN9qgZiWYBXEZkWoedNbHGQouzG5MJw5zQHYsSk8DZ+1MnE5KrFiV3HbcS9zmKy3Ue63ekF/E4zopfvj3T7aI8vXQCO0pFU2astOrQEAAAAAAE6tAQABl6Gsgwsg+Ih7s/U+fSe/Y8pXkErgVN3DonVbCwV1t+UFDwsMDQ4LAAECAwQFCgYHCAk=',
            'base64'
        );
        const { message, signatures } = VersionedTransaction.deserialize(Buffer.from(data));

        // console.log(message);
        // return;
        // message.recentBlockhash = blockhash;
        const { blockhash } = await connection.getLatestBlockhash();

        const instructions = [
            new TransactionInstruction({
                programId: new PublicKey(ELEMENTERRA_PROGRAM_ID),
                data: Buffer.from(
                    '8040c574e28177ea300fe6c3a7342cc9c20ba580c7fc7b93e73d44292615231c621f1e1a3e90fc5f2244b4e5b1260c8cc827f281012bae947fabf5ad3669a9f3318ec887215c8685712f7398acb751eeb77a417f138ce8a5fbe3dd3eda23cbd74023b4a455366acb193601000000000019360100',
                    'hex'
                ),
                keys: message.compiledInstructions[1].accountKeyIndexes,
            }),
        ];

        const messageV0 = new MessageV0({
            
        })

        const lookupTableAccount = await connection.getAddressLookupTable(
            new PublicKey('BCuYkynYbCb69xfKCHz5dn7Ukyie7E4BWbSTz9jS2XKa')
        );

        if (!lookupTableAccount.value) {
            console.error('AddressLookupTableNotFound');
            return;
        }

        const messageV0 = new TransactionMessage({
            payerKey: wallet.publicKey,
            recentBlockhash: blockhash,
            instructions,
        }).compileToV0Message([lookupTableAccount.value]);

        const tx = new VersionedTransaction(messageV0);

        const signed = await wallet.sendTransaction(tx, connection, {});

        try {
            console.log(signed);
        } catch (err) {
            console.log(err);
        }
    }
    return (
        <>
            <Header />
            <h2>Roi Page</h2>
            <button onClick={handleLevelUp}>Level up</button>
        </>
    );
}
