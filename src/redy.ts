import {
  Middleware,
  MiddlewareAPI,
  Action,
  AnyAction,
  Dispatch as ReduxDispatch,
  Reducer,
} from 'redux';

export type ActionCreator<A extends any[], P> = {
  (...args: A): P;
};

export type RedyAction<A extends any[], P> = {
  type: string;
  payload: P;
  promise: Promise<Resolved<P>>;
  meta: {
    redy: boolean;
    creator: ActionCreator<A, P>;
    args: A;
    [key: string]: any;
    [key: number]: any;
  };
};

export type Dispatch = <A extends any[], P>(
  action: ActionCreator<A, P>,
  ...args: A
) => RedyAction<A, P>;

export type Thunk<S, R = void, C = undefined> = (
  dispatch: Dispatch,
  getState: () => S,
  context?: C,
) => Promise<R>;

export type Resolved<P> = P extends Thunk<any, infer R> ? R : P;

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

export const isThunk = (payload: any): payload is Thunk<any, any, any> =>
  typeof payload === 'function';

export const toAction = <A extends any[], P>(
  creator: ActionCreator<A, P>,
  ...args: A
): RedyAction<A, P> => {
  const payload = creator(...args);

  let promise = isThunk(payload)
    ? Promise.reject('Please use redyMiddleware. Otherwise thunk actions have no effects.')
    : Promise.resolve(payload as Resolved<P>);

  return {
    type: creator.name,
    payload,
    promise,
    meta: {redy: true, creator, args},
  };
};

export const wrapDispatch = (dispatch: ReduxDispatch): Dispatch => {
  return (creator, ...args) => dispatch(toAction(creator, ...args));
};

export const isRedyAction = (action: AnyAction): action is RedyAction<any, any> => {
  return action.meta && action.meta.redy;
};

export const redyMiddleware = <C>(context?: C): Middleware<{}, any, ReduxDispatch> => {
  return <S>({dispatch, getState}: MiddlewareAPI<ReduxDispatch, S>) => {
    const wrappedDispatch = wrapDispatch(dispatch);
    return next => action => {
      if (action == null || !isRedyAction(action)) {
        return next(action);
      }

      if (isThunk(action.payload)) {
        const promise = action.payload(wrappedDispatch, getState, context);
        return {
          ...action,
          promise: action.promise.catch(() => {}).then(() => promise),
        };
      } else {
        return next(action);
      }
    };
  };
};
