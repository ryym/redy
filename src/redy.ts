import {AnyAction, Reducer, Dispatch, Middleware, MiddlewareAPI} from 'redux';

export type Thunk<S, R = void, C = undefined> = (
  dispatch: Dispatch,
  getState: () => S,
  context: C,
) => Promise<R>;

export type RedyAction<T, P, E> = {
  type: T;
  payload: P;
  promise: RedyActionPromise<E>;
  meta: {
    redy: boolean;
    thunk: E;
    [key: string]: any;
    [key: number]: any;
  };
};

export type RedyActionPromise<E> = E extends Thunk<any, infer R> ? Promise<R> : undefined;

export interface ActionCreator<T, A extends any[], R, E> {
  (...args: A): RedyAction<T, R, E>;
  readonly actionType: T;
}

export const action = <T, A extends any[], R>(
  type: T,
  create: (...args: A) => R,
): ActionCreator<T, A, R, undefined> => {
  const f = (...args: A): RedyAction<T, R, undefined> => ({
    type,
    payload: create(...args),
    promise: undefined,
    meta: {redy: true, thunk: undefined},
  });
  return Object.assign(f, {actionType: type});
};

export const effect = <T, A extends any[], E extends Thunk<any, any, any>>(
  type: T,
  createThunk: (...args: A) => E,
): ActionCreator<T, A, never, E> => {
  const f = (...args: A): RedyAction<T, never, E> => {
    const warningPromise = Promise.reject(
      '[redy] Please use redyMiddleware. Otherwise thunk has no effects.',
    ) as unknown;
    return {
      type,
      payload: undefined as never,
      promise: warningPromise as RedyActionPromise<E>,
      meta: {redy: true, thunk: createThunk(...args)},
    };
  };
  return Object.assign(f, {actionType: type});
};

export const actionEffect = <T, A extends any[], R, E extends Thunk<any, any, any>>(
  type: T,
  createBoth: (...args: A) => [R, E],
): ActionCreator<T, A, R, E> => {
  const f = (...args: A): RedyAction<T, R, E> => {
    const warningPromise = Promise.reject(
      '[redy] Please use redyMiddleware. Otherwise thunk has no effects.',
    ) as unknown;
    const [payload, thunk] = createBoth(...args);
    return {
      type,
      payload,
      promise: warningPromise as RedyActionPromise<E>,
      meta: {redy: true, thunk},
    };
  };
  return Object.assign(f, {actionType: type});
};

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
  return {actionTypes: creators.map((c: any) => c.type), updater};
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

export const isRedyAction = (action: AnyAction): action is RedyAction<any, any, any> => {
  return action.meta && action.meta.redy;
};

export const redyMiddleware = <C>(context?: C): Middleware<{}, any, Dispatch> => {
  return <S>({dispatch, getState}: MiddlewareAPI<Dispatch, S>) => {
    return next => action => {
      if (action == null || !isRedyAction(action)) {
        return next(action);
      }

      const {thunk} = action.meta;
      const nextResult = next(action);

      if (thunk == null) {
        return nextResult;
      }

      // Clear initial rejection which notifies user who forgot to use redyMiddleware.
      action.promise!.catch(() => {});

      const promise = thunk(dispatch, getState, context);
      return {...action, promise};
    };
  };
};
