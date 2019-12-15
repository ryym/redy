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

export const isRedyAction = (action: AnyAction): action is RedyAction<any, any, any> => {
  return action.meta && action.meta.redy;
};

export type AnyThunkCreator = (...args: any[]) => Thunk<any, any, any>;

export type EffectDefiner<F extends AnyThunkCreator, D = undefined> = {
  readonly isEffectDefiner: boolean;
  readonly dep: () => D;
  readonly makeEffectCreator: (dep: D) => F;
};

export function effect<F extends AnyThunkCreator>(f: F): EffectDefiner<F> {
  return {isEffectDefiner: true, dep: () => undefined, makeEffectCreator: () => f};
}

export function effectUsing<D, F extends AnyThunkCreator>(
  dep: () => D,
  make: (dep: D) => F,
): EffectDefiner<F, D> {
  return {isEffectDefiner: true, dep, makeEffectCreator: make};
}

export type ActionDefiner = ((...args: any[]) => any) | EffectDefiner<AnyThunkCreator, any>;

export interface ActionDefs {
  [name: string]: ActionDefiner;
}

export type ActionCreators<D extends ActionDefs> = {
  [P in keyof D]: D[P] extends (...args: infer A) => infer R
    ? ActionCreator<string, A, R>
    : D[P] extends EffectDefiner<infer F, infer D>
    ? F extends (...args: infer A) => infer E
      ? EffectCreator<string, A, E, D>
      : never
    : never
};

export function defineActions<D extends ActionDefs>(namespace: string, defs: D): ActionCreators<D> {
  const actions: any = {};
  Object.keys(defs).forEach((name: keyof D) => {
    const creator = defs[name] as any;
    const typeName = `${namespace}/${name}`;
    if (creator.isEffectDefiner) {
      const effectCreator = creator.makeEffectCreator(creator.dep());
      const f = (...args: any[]): RedyAction<string, never, any> => {
        const warningPromise = Promise.reject(
          '[redy] Please use redyMiddleware. Otherwise thunk has no effects.',
        );
        return {
          type: typeName,
          payload: undefined as never,
          promise: warningPromise,
          meta: {redy: true, thunk: effectCreator(...args)},
        };
      };
      Object.assign(f, {
        actionType: typeName,
        using: creator.makeEffectCreator,
        run: effectCreator,
      });
      actions[name] = f;
    } else {
      const f = (...args: any[]): RedyAction<string, any, undefined> => ({
        type: typeName,
        payload: creator(...args),
        promise: undefined,
        meta: {redy: true, thunk: undefined},
      });
      Object.assign(f, {actionType: typeName});
      actions[name] = f;
    }
  });
  return actions as any;
}
