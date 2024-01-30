import _ from 'lodash';

export function calculatePrice(quote: number, base: number) {
    return _.round(quote * base, 8);
}
