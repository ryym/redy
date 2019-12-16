import {AnyAction} from 'redux';
import {Thunk, RedyAction, ActionCreator, EffectCreator, ACTION_META_KEY} from './actionCreator';

// `Definer` means a creator of creator here. For example,
// `action definer` is an `action creator creator`.

export type AnyThunkCreator = (...args: any[]) => Thunk<any, any, any>;

export type EffectDefiner<F extends AnyThunkCreator, D = undefined> = {
  readonly dep: () => D;
  readonly makeEffectCreator: (dep: D) => F;
};

const IS_EFFECT_DEFINER = Symbol('is-effect-definer');

function isEffectDefiner(definer: AnyActionDefiner): definer is EffectDefiner<any, any> {
  return (definer as any)[IS_EFFECT_DEFINER];
}

export function effect<F extends AnyThunkCreator>(f: F): EffectDefiner<F> {
  return effectUsing(
    () => undefined,
    () => f,
  );
}

export function effectUsing<D, F extends AnyThunkCreator>(
  dep: () => D,
  make: (dep: D) => F,
): EffectDefiner<F, D> {
  return Object.assign({dep, makeEffectCreator: make}, {[IS_EFFECT_DEFINER]: true});
}

export type ActionDefiner = (...args: any[]) => any;

export type AnyActionDefiner = ActionDefiner | EffectDefiner<AnyThunkCreator, any>;

export interface ActionDefiners {
  [name: string]: AnyActionDefiner;
}

export type ActionCreators<D extends ActionDefiners> = {
  [P in keyof D]: D[P] extends (...args: infer A) => infer R
    ? ActionCreator<string, A, R>
    : D[P] extends EffectDefiner<infer F, infer D>
    ? F extends (...args: infer A) => infer E
      ? EffectCreator<string, A, E, D>
      : never
    : never;
};

export function defineActions<D extends ActionDefiners>(
  namespace: string,
  defs: D,
): ActionCreators<D> {
  const actions: any = {};
  Object.keys(defs).forEach((name: keyof D) => {
    const definer = defs[name];
    const actionType = `${namespace}/${name}`;
    if (isEffectDefiner(definer)) {
      actions[name] = defineEffectCreator(actionType, definer);
    } else {
      actions[name] = defineActionCreator(actionType, definer as ActionDefiner);
    }
  });
  return actions as ActionCreators<D>;
}

function defineEffectCreator(
  actionType: string,
  definer: EffectDefiner<any, any>,
): EffectCreator<any, any, any, any> {
  const effectCreator = definer.makeEffectCreator(definer.dep());
  const f = (...args: any[]): RedyAction<string, never, any> => {
    // Define some properties as non-enumerable for easy comparing.
    return Object.defineProperties(
      {type: actionType, payload: undefined as never},
      {
        promise: {
          enumerable: false,
          value: () =>
            Promise.reject('[redy] Please use redyMiddleware. Otherwise thunk has no effects.'),
        },
        meta: {
          enumerable: true,
          value: {
            [ACTION_META_KEY]: Object.defineProperties(
              {args},
              {
                thunk: {
                  enumerable: false,
                  value: effectCreator(...args),
                },
              },
            ),
          },
        },
      },
    );
  };
  return Object.assign(f, {
    actionType,
    using: definer.makeEffectCreator,
    run: effectCreator,
  });
}

function defineActionCreator(
  actionType: string,
  definer: ActionDefiner,
): ActionCreator<any, any, any> {
  const f = (...args: any[]): RedyAction<string, any, undefined> => {
    const action = {
      type: actionType,
      payload: definer(...args),
      meta: {},
    };
    return Object.defineProperties(action, {
      promise: {enumerable: false, value: undefined},
    });
  };
  return Object.assign(f, {actionType});
}
