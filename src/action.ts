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

export const isRedyAction = (action: AnyAction): action is RedyAction<any, any, any> => {
  return action.meta && action.meta.redy;
};

export type AnyThunkCreator = (...args: any[]) => Thunk<any, any, any>;

export type EffectCreator<F extends AnyThunkCreator> = {
  readonly isEffectCreator: boolean;
  readonly f: F;
};

export function effect<F extends AnyThunkCreator>(f: F): EffectCreator<F> {
  return {f, isEffectCreator: true};
}

export interface ActionDefs {
  [name: string]: ((...args: any[]) => any) | EffectCreator<AnyThunkCreator>;
}

export type ActionCreators<D extends ActionDefs> = {
  [P in keyof D]: D[P] extends (...args: infer A) => infer R
    ? ActionCreator<string, A, R, undefined>
    : D[P] extends EffectCreator<infer F>
    ? F extends (...args: infer A) => infer E
      ? ActionCreator<string, A, never, E>
      : never
    : never
};
export function defineActions<D extends ActionDefs>(namespace: string, defs: D): ActionCreators<D> {
  const actions: any = {};
  Object.keys(defs).forEach((name: keyof D) => {
    const creator = defs[name] as any;
    const typeName = `${namespace}/${name}`;
    if (creator.isEffectCreator) {
      const f = (...args: any[]): RedyAction<string, never, any> => {
        const warningPromise = Promise.reject(
          '[redy] Please use redyMiddleware. Otherwise thunk has no effects.',
        );
        return {
          type: typeName,
          payload: undefined as never,
          promise: warningPromise,
          meta: {redy: true, thunk: creator.f(...args)},
        };
      };
      Object.assign(f, {actionType: typeName});
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
