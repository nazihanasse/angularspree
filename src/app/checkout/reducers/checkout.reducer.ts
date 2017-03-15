import { LineItem } from './../../core/models/line_item';
import { CheckoutActions } from './../actions/checkout.actions';
import { CheckoutState, CheckoutStateRecord } from './checkout.state';
import { Action, ActionReducer } from '@ngrx/store';


export const initialState: CheckoutState = new CheckoutStateRecord() as CheckoutState;

export const checkoutReducer: ActionReducer<CheckoutState> =
  (state: CheckoutState = initialState, { type, payload }: Action): CheckoutState => {

    let _lineItems, _lineItemEntities, _lineItemIds, _lineItem, _lineItemEntity, _lineItemId;

    switch (type) {

      case CheckoutActions.FETCH_CURRENT_ORDER_SUCCESS:
        const _orderNumber = payload.number;
        let _totalCartItems = 0;
        _lineItems = payload.line_items;
        _lineItemIds = _lineItems.map(lineItem => lineItem.id);
        _lineItems.forEach((lineItem) => {
          _totalCartItems += lineItem.quantity;
        });


        _lineItemEntities = _lineItems.reduce((lineItems: { [id: number]: LineItem }, lineItem: LineItem) => {
          return Object.assign(lineItems, {
            [lineItem.id]: lineItem
          });
        }, { });

        return state.merge({
          orderNumber: _orderNumber,
          lineItemIds: _lineItemIds,
          lineItemEntities: _lineItemEntities,
          totalCartItems: _totalCartItems
        }) as CheckoutState;

      case CheckoutActions.ADD_TO_CART_SUCCESS:
        _lineItem = payload;
        _lineItemId = _lineItem.id;

        // return the same state if the item is already included.
        if (state.lineItemIds.includes(_lineItemId)) {
          return state;
        }

        _totalCartItems = state.totalCartItems + _lineItem.quantity;
        _lineItemEntity = { [_lineItemId]: _lineItem };
        _lineItemIds = state.lineItemIds.push(_lineItemId);

        return state.merge({
          lineItemIds: _lineItemIds,
          lineItemEntities: state.lineItemEntities.merge(_lineItemEntity),
          totalCartItems: _totalCartItems
        }) as CheckoutState;

      case CheckoutActions.REMOVE_LINE_ITEM_SUCCESS:
        _lineItemId = payload.id;
        const _quantity = payload.quantity;
        const index = state.lineItemIds.indexOf(_lineItemId);
        if (index >= 0) {
          _lineItemIds = state.lineItemIds.splice(index, 1);
          _lineItemEntities = state.lineItemEntities.delete(_lineItemId);
          _totalCartItems = state.totalCartItems - _quantity;
        }

        return state.merge({
          lineItemIds: _lineItemIds,
          lineItemEntities: _lineItemEntities,
          totalCartItems: _totalCartItems
        }) as CheckoutState;

      // case CheckoutActions.CHANGE_LINE_ITEM_QUANTITY:
      //   const quantity = payload.quantity;
      //   lineItemId = payload.lineItemId;
      //   _lineItemEntities = state.lineItemEntities;
      //   _lineItemEntities[lineItemId][quantity] = quantity;

      //   return state.merge({
      //     lineItemEntities: _lineItemEntities
      //   }) as CheckoutState;

      default:
        return state;
    }
  };