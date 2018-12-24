import {Middleware, Reducer, AnyAction, Store, Dispatch} from 'redux';

type RedyAction<P> = {
  type: Symbol;
  payload?: P;
  meta: {redy: boolean; [key: string]: any; [key: number]: any};
};

export interface ActionCreator<A extends any[], T> {
  (...args: A): RedyAction<T>;
  redyType: Symbol;
}

export const action = <A extends any[], T>(
  name: string,
  f: (...args: A) => T,
): ActionCreator<A, T> => {
  const redyType = Symbol(name);
  const creator = (...args: A) => ({
    type: redyType,
    payload: f(...args),
    meta: {redy: true},
  });

  Object.defineProperty(creator, 'name', {value: `redyAction_${name}`});
  return Object.assign(creator, {redyType});
};

export type StateUpdater<S, T> = (state: S, args: T) => S;

export type ReducerDef<S, T> = {
  creator: ActionCreator<any, T>;
  updater: StateUpdater<S, T>;
};

export const on = <S, T>(
  creator: ActionCreator<any, T>,
  updater: StateUpdater<S, T>,
): ReducerDef<S, T> => {
  return {creator, updater};
};

// XXX: Unfortunately TS 3.2 does not support Symbol index type.
// https://github.com/Microsoft/TypeScript/issues/1863
class CreatorMap<V> {
  private map: {[key: string]: V} = {};

  setValue(creator: ActionCreator<any, any>, value: V) {
    this.map[creator.redyType as any] = value;
  }

  getValue(actionType: Symbol): V | undefined {
    return this.map[actionType as any];
  }

  append(other: CreatorMap<V>): CreatorMap<V> {
    this.map = {...this.map, ...other.map};
    return this;
  }
}

export const defineReducer = <S>(
  initialState: S,
  definitions: ReducerDef<S, any>[],
): Reducer<S> => {
  const handlers = new CreatorMap<StateUpdater<S, any>>();

  definitions.forEach(({creator, updater}) => {
    handlers.setValue(creator, updater);
  });

  return (state = initialState, action) => {
    const handler = handlers.getValue(action.type);
    return handler == null ? state : handler(state, action.payload);
  };
};

export const isRedyAction = (action: AnyAction): action is RedyAction<any> => {
  return action.meta && action.meta.redy;
};

export type EffectRunner<S, T, R = any> = (payload: T, dispatch: Dispatch, getState: () => S) => R;

export type Effect<S, A, R = void> = A extends ActionCreator<any, infer P>
  ? EffectRunner<S, P, R>
  : EffectRunner<S, any, R>;

export type EffectDef<S, T> = {
  creator: ActionCreator<any, T>;
  runner: EffectRunner<S, T>;
};

export type EffectDefs<S> = CreatorMap<EffectRunner<S, any>>;

export const handle = <S, T>(
  creator: ActionCreator<any, T>,
  runner: EffectRunner<S, T>,
): EffectDef<S, T> => {
  return {creator, runner};
};

export const defineEffects = <S>(definitions: EffectDef<S, any>[]): EffectDefs<S> => {
  const runners = new CreatorMap<EffectRunner<S, any>>();
  definitions.forEach(({creator, runner}) => {
    runners.setValue(creator, runner);
  });
  return runners;
};

const mergeEffectDefs = <S>(defGroups: EffectDefs<S>[]): EffectDefs<S> => {
  return defGroups.reduce(
    (def, group) => def.append(group),
    new CreatorMap<EffectRunner<S, any>>(),
  );
};

export const effectMiddleware = <S>(...defGroups: EffectDefs<S>[]): Middleware<{}, S, Dispatch> => {
  const runners = mergeEffectDefs(defGroups);
  return ({dispatch, getState}) => next => action => {
    if (action != null && isRedyAction(action)) {
      const result = next(action);
      const runner = runners.getValue(action.type);
      const effect = runner ? runner(action.payload, dispatch, getState) : null;
      return {result, effect};
    }
    return next(action);
  };
};
