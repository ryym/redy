import {Reducer} from 'redux';
import {AnyActionCreator} from './actionCreator';

export type StateUpdater<S, P> = (state: S, payload: P) => S;

export type UpdaterMapping<S, P> = {
  actionTypes: string[];
  updater: StateUpdater<S, P>;
};

export function on<S, P>(
  creator: AnyActionCreator<P>,
  updater: StateUpdater<S, P>,
): UpdaterMapping<S, P> {
  return {actionTypes: [creator.actionType], updater};
}

export type Payloads<Cs extends AnyActionCreator<any>[]> = Cs extends AnyActionCreator<infer P>[]
  ? P
  : never;

export function onAny<S, Cs extends AnyActionCreator<any>[]>(
  creators: Cs,
  updater: StateUpdater<S, Payloads<Cs>>,
): UpdaterMapping<S, Payloads<Cs>>;

export function onAny(creators: any, updater: any) {
  return {actionTypes: creators.map((c: any) => c.actionType), updater};
}

export function defineReducer<S>(
  initialState: S,
  definitions: UpdaterMapping<S, any>[],
): Reducer<S> {
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
}
