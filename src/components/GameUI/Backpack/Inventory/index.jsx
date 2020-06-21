import React from 'react';
import PropTypes from 'prop-types';
import { DrizzleContext } from 'drizzle-react';

import Util from '../../../Util';
import InventoryProto from '../../../../protobuf/inventory_pb';

import s from './index.less';

const INVENTORY_CACHE_DURATION = 1000 * 60 * 30; // 30 min in ms

class Inventory extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            inventory: null,
        };
    }

    async componentDidMount() {
        if (!this.props.account) {
            console.log('Inventory: No account');
            return
        }

        let inv = Util.TimedLocalStorage.loadArrayBuffer("INV-" + this.props.account);
        if (inv === false) inv = null;
        else {
            try {
                inv = InventoryProto.Inventory.deserializeBinary(inv);
                this.setState({ inventory: inv });
                console.log('Loaded Inventory From Cache');
            } catch (e) {
                console.log(e);
            }
        }

        try {
            inv = await Util.PostAPI.inventory.read(this.props.account).promise
        } catch (e) {
            console.log(e);
            return
        }

        console.log('[Backpack] Inventory Updated:', inv);
        window.inventory = inv;
        this.setState({ inventory:inv });

        Util.TimedLocalStorage.saveArrayBuffer("INV-" + this.props.account,
            inv.serializeBinary(), INVENTORY_CACHE_DURATION);
        console.log('Saved Inventory To Cache');
    }

    getTypeName(itemTypeNum) {
        const itemTypes = InventoryProto.ItemType;
        let name = '';

        Object.keys(itemTypes).forEach(key => {
            if (itemTypes[key] === itemTypeNum) {
                name = key;
            }
        })

        return name;
    }

    render() {
        const inv = this.state.inventory;
        const items = inv && inv.getItemsList().map(item => {
            const name = this.getTypeName(item.getType());
            const bg = 'url("/img/Game/icons/' + name.toLowerCase() + '.svg")';

            return <div class={ s.item } key={ item.getType() }>
                <div class={ s.background } style={{ backgroundImage: bg }} />
                <div class={ s.name }>{ name }</div>
                <div class={ s.quantity }>{ item.getQuantity() }</div>
            </div>
        });

        return <div class={ s.inventory }>
            { items }
        </div>;
    }
}

Inventory.propTypes = {
    account: PropTypes.string.isRequired,
};

export default (params) => (
    <DrizzleContext.Consumer>
        { drizzleContext => {
            let account = null;
            try {
                account = drizzleContext.drizzleState.accounts[0];
            } catch (e) {}

            if (account == null || account === '') {
                return null;
            }

            return <Inventory { ...params }
                account={ account } />
        }}
    </DrizzleContext.Consumer>
);
