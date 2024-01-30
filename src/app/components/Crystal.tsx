import { DAS } from 'helius-sdk';

import styles from './Nft.module.css';

type Props = {
    readonly key: String;
    readonly nft: DAS.GetAssetResponse;
};

export function Crystal(props: Props) {
    return (
        <>
            <div>
                <h1>{props.nft.content?.metadata?.name}</h1>

                {/* <img src={props.nft?.json?.image} alt="The downloaded illustration of the provided NFT address." /> */}
            </div>
        </>
    );
}
