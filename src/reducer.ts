import {Reducer} from 'redux';
import {ActionCreator} from './action';

export type StateUpdater<S, P> = (state: S, payload: P) => S;

export type ReducerDef<S, P> = {
  actionTypes: string[];
  updater: StateUpdater<S, P>;
};

export type AnyActionCreator<P = any> = ActionCreator<any, any, P, any>;

export const on = <S, P>(
  creator: AnyActionCreator<P>,
  updater: StateUpdater<S, P>,
): ReducerDef<S, P> => {
  return {actionTypes: [creator.actionType], updater};
};

export function onAny<S, P1, P2>(
  creators: [AnyActionCreator<P1>, AnyActionCreator<P2>],
  updater: StateUpdater<S, P1 | P2>,
): ReducerDef<S, P1 | P2>;

export function onAny<S, P1, P2, P3>(
  creators: [AnyActionCreator<P1>, AnyActionCreator<P2>, AnyActionCreator<P3>],
  updater: StateUpdater<S, P1 | P2 | P3>,
): ReducerDef<S, P1 | P2 | P3>;

export function onAny(creators: any, updater: any) {
  return {actionTypes: creators.map((c: any) => c.actionType), updater};
}

export const defineReducer = <S>(
  initialState: S,
  definitions: ReducerDef<S, any>[],
): Reducer<S> => {
  const handlers: {[key: string]: StateUpdater<S, any>} = {};

  definitions.forEach(({actionTypes, updater}) => {
    actionTypes.forEach(type => {
      handlers[type] = updater;
    });
  });

  return (state = initialState, action) => {
    const handler = handlers[action.type];
    return handler == null ? state : handler(state, action.payload);
  };
};
