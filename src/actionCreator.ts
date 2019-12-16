import {AnyAction, Dispatch} from 'redux';

// Types and utility functions about Redux action and action creator.

export type Thunk<S, R = void, C = undefined> = (
  dispatch: Dispatch,
  getState: () => S,
  context: C,
) => Promise<R>;

export type RedyAction<T, P, E> = {
  type: T;
  payload: P;
  promise: RedyActionPromiseAccessor<E>;
  meta: {
    [key: string]: any;
    [key: number]: any;
  };
};

export type RedyActionPromiseAccessor<E> = E extends Thunk<any, infer R>
  ? () => Promise<R>
  : undefined;

export const ACTION_META_KEY = Symbol('redy-action-meta');

export interface RedyActionMeta<E> {
  readonly args: any[] | undefined;
  readonly thunk: E | undefined;
}

export function isRedyAction(action: AnyAction): action is RedyAction<any, any, any> {
  return action.meta && action.meta[ACTION_META_KEY] != null;
}

export function extractMetaFromAction<E>(action: RedyAction<any, any, E>): RedyActionMeta<E> {
  if (!isRedyAction(action)) {
    throw new Error('The given action is not created by Redy');
  }
  return (action.meta as any)[ACTION_META_KEY] as RedyActionMeta<E>;
}

export type AnyActionCreator<P = any> =
  | ActionCreator<any, any, P>
  | EffectCreator<any, any, any, any>;

export interface ActionCreator<T, A extends any[], R> {
  readonly actionType: T;
  (...args: A): RedyAction<T, R, undefined>;
}

export interface EffectCreator<T, A extends any[], E, D> {
  readonly actionType: T;
  (...args: A): RedyAction<T, never, E>;
  run(...args: A): E;
  using(dep: D): (...args: A) => E;
}
