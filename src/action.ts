import {AnyAction, Dispatch} from 'redux';

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

export const isRedyAction = (action: AnyAction): action is RedyAction<any, any, any> => {
  return action.meta && action.meta.redy;
};
