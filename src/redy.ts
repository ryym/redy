import {
  Middleware,
  MiddlewareAPI,
  AnyAction,
  Store,
  Dispatch as ReduxDispatch,
  Reducer,
} from 'redux';

export type Thunk<S, R = void, C = undefined> = (
  dispatch: Dispatch,
  getState: () => S,
  context?: C,
) => Promise<R>;

export class Action<P, T> {
  constructor(readonly payload: P, readonly thunk: T) {}

  effect<T2 extends Thunk<any, any, any> = Thunk<{}>>(thunk: T2): Action<P, T2> {
    return new Action(this.payload, thunk);
  }
}

export const action = <P>(payload: P) => new Action(payload, undefined);

export const effect = <T extends Thunk<any, any, any> = Thunk<{}>>(thunk: T) =>
  new Action(undefined, thunk);

export type ActionCreator<A extends any[], P, T = any> = {
  (...args: A): Action<P, T>;
};

export type RedyAction<A extends any[], P, T = void> = {
  type: string;
  payload: P;
  promise: RedyActionPromise<T>;
  meta: {
    redy: boolean;
    creator: ActionCreator<A, P, T>;
    thunk: T;
    args: A;
    [key: string]: any;
    [key: number]: any;
  };
};

export type RedyActionPromise<T> = T extends Thunk<any, infer R> ? Promise<R> : undefined;

export type Dispatch = <A extends any[], P, T = void>(
  action: ActionCreator<A, P, T>,
  ...args: A
) => RedyAction<A, P, T>;

export const toAction = <A extends any[], P, T>(
  creator: ActionCreator<A, P, T>,
  ...args: A
): RedyAction<A, P, T> => {
  const {thunk, payload} = creator(...args);

  let promise =
    thunk != null
      ? Promise.reject('[redy] Please use redyMiddleware. Otherwise thunk has no effects.')
      : undefined;

  return {
    type: creator.name,
    payload,
    promise: promise as RedyActionPromise<T>,
    meta: {redy: true, creator, args, thunk},
  };
};

export const wrapDispatch = (dispatch: ReduxDispatch): Dispatch => {
  return (creator, ...args) => dispatch(toAction(creator, ...args));
};

export const dispatch = <A extends any[], P, T = void>(
  store: Store,
  creator: ActionCreator<A, P, T>,
  ...args: A
): RedyAction<A, P, T> => {
  return store.dispatch(toAction(creator, ...args));
};

export type StateUpdater<S, P> = (state: S, payload: P) => S;

export type ReducerDef<S, P> = {
  creators: ActionCreator<any, P>[];
  updater: StateUpdater<S, P>;
};

export const on = <S, P>(
  creator: ActionCreator<any, P>,
  updater: StateUpdater<S, P>,
): ReducerDef<S, P> => {
  return {creators: [creator], updater};
};

export function onAny<S, T1, T2>(
  creators: [ActionCreator<any, T1>, ActionCreator<any, T2>],
  updater: StateUpdater<S, T1 | T2>,
): ReducerDef<S, T1 | T2>;

export function onAny<S, T1, T2, T3>(
  creators: [ActionCreator<any, T1>, ActionCreator<any, T2>, ActionCreator<any, T3>],
  updater: StateUpdater<S, T1 | T2 | T3>,
): ReducerDef<S, T1 | T2 | T3>;

export function onAny<S, T1, T2, T3, T4>(
  creators: [
    ActionCreator<any, T1>,
    ActionCreator<any, T2>,
    ActionCreator<any, T3>,
    ActionCreator<any, T4>
  ],
  updater: StateUpdater<S, T1 | T2 | T3 | T4>,
): ReducerDef<S, T1 | T2 | T3 | T4>;

export function onAny(creators: any, updater: any) {
  return {creators, updater};
}

export const defineReducer = <S>(
  initialState: S,
  definitions: ReducerDef<S, any>[],
): Reducer<S> => {
  const handlers: {[key: string]: StateUpdater<S, any>} = {};

  definitions.forEach(({creators, updater}) => {
    creators.forEach(creator => {
      handlers[creator.name] = updater;
    });
  });

  return (state = initialState, action) => {
    const handler = handlers[action.type];
    return handler == null ? state : handler(state, action.payload);
  };
};

export const isRedyAction = (action: AnyAction): action is RedyAction<any, any, any> => {
  return action.meta && action.meta.redy;
};

export const redyMiddleware = <C>(context?: C): Middleware<{}, any, ReduxDispatch> => {
  return <S>({dispatch, getState}: MiddlewareAPI<ReduxDispatch, S>) => {
    const wrappedDispatch = wrapDispatch(dispatch);
    return next => action => {
      if (action == null || !isRedyAction(action)) {
        return next(action);
      }

      const {thunk} = action.meta;
      const nextResult = next(action);

      if (thunk == null) {
        return nextResult;
      }

      const promise = thunk(wrappedDispatch, getState, context);
      return {
        ...action,
        promise: action.promise!.catch(() => {}).then(() => promise),
      };
    };
  };
};
