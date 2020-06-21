import React from 'react';

import PresentsConfig from '../../../../../config/presents.json';
import Go from '../../../Go';

import s from './index.less';

const DONATE_NFTS_URL = "https://flowerpatch.app/account/0x2bEa56e7d81369A97fe09219b2734956BE995880"

class PresentDropDistribution extends React.PureComponent {
    constructor(props) {
        super(props);
    }

    render() {
        const distribution = PresentsConfig.prizeDistribution.map(obj =>
            <div key={ obj.kind } class={ s.drop }>
                <div class={ s.kind }>{ obj.prettyKind }</div>
                <div class={ s.rate }>{ obj.chance + '%' }</div>
            </div>
        );

        return <div class={ s.dropRate }>
            <div class={ s.heading }>
                Present Drop Rates:
            </div>

            <div class={ s.rates }>
                { distribution }
            </div>

            <div class={ s.supportedProjects }>
                * NFT drops are from our partners:
                { ' ' }
                { PresentsConfig.supportedProjects.join(', ') }
            </div>

            <div class={ s.addYourOwn }>
                ** You can donate <i>supported</i> NFTs to
                <Go to={ DONATE_NFTS_URL }
                    data-category="PresentDropDistribution"
                    data-action="Donate NFTs">
                    { ' our dropper ' }
                </Go>
                to have them appear in presents for others 💖
            </div>
        </div>;
    }
}

export default PresentDropDistribution;
