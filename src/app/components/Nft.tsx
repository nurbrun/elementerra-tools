import { DAS } from 'helius-sdk';

import styles from './Nft.module.css';
import { Stakable } from '../../pages';

type Props = {
    readonly key: String;
    readonly stakable: Stakable;
};

export function Nft(props: Props) {
    return (
        <>
            <div className={styles.nftPreview}>
                <strong>{props.stakable.nft.content?.metadata?.name}</strong>

                <img
                    src={props.stakable.nft?.content?.links?.image}
                    alt="The downloaded illustration of the provided NFT address."
                />
            </div>
        </>
    );
}
