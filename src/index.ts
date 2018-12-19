import {Middleware, Reducer, AnyAction, Store, Dispatch} from 'redux';

type RedyAction<P> = {
  type: string;
  payload?: P;
  meta: {redy: boolean; [key: string]: any; [key: number]: any};
};

type AnyPayloadAction<P> = AnyAction & {payload?: P};

export type Command<A extends any[], T> = (...args: A) => T;

export type StateUpdater<S, T> = (state: S, args: T) => S;

export type ReducerDef<S, T> = {
  command: Command<any, T>;
  update: StateUpdater<S, T>;
};

export const on = <S, T>(
  command: Command<any, T>,
  update: StateUpdater<S, T>,
): ReducerDef<S, T> => {
  return {command, update};
};

export const defineReducer = <S>(initialState: S, mappings: ReducerDef<S, any>[]): Reducer<S> => {
  const handlers: {[key: string]: StateUpdater<S, any>} = {};

  mappings.forEach(({command, update}) => {
    handlers[command.name] = update;
  });

  return (state = initialState, action) => {
    const handler = handlers[action.type];
    return handler ? handler(state, action.payload) : state;
  };
};

export type DispatchCmd = <A extends any[], T>(command: Command<A, T>, ...args: A) => unknown;

export const isRedyAction = (action: AnyAction): action is RedyAction<any> => {
  return action.meta && action.meta.redy;
};

export const wrapDispatcher = <S>(dispatch: Dispatch): DispatchCmd => (command, ...args) => {
  const payload = command(...args);
  return dispatch({type: command.name, payload, meta: {redy: true}});
};

export type EffectRunner<S, T> = (payload: T, dispatch: DispatchCmd, getState: () => S) => any;

export type EffectDef<S, T> = {
  command: Command<any, T>;
  run: EffectRunner<S, T>;
};

export type EffectDefs<S> = {
  [key: string]: EffectRunner<S, any>;
};

export const handle = <S, T>(
  command: Command<any, T>,
  run: EffectRunner<S, T>,
): EffectDef<S, T> => {
  return {command, run};
};

export const defineEffects = <S>(definitions: EffectDef<S, any>[]): EffectDefs<S> => {
  const runners: EffectDefs<S> = {};
  definitions.forEach(({command, run}) => {
    runners[command.name] = run;
  });
  return runners;
};

const mergeEffectDefs = <S>(defGroups: EffectDefs<S>[]): EffectDefs<S> => {
  let runners: EffectDefs<S> = {};
  defGroups.forEach(def => {
    runners = {...runners, ...def};
  });
  return runners;
};

export const effectMiddleware = <S>(...defGroups: EffectDefs<S>[]): Middleware<{}, S, Dispatch> => {
  const runners = mergeEffectDefs(defGroups);
  return ({dispatch, getState}) => {
    const dispatchCmd = wrapDispatcher(dispatch);
    return next => action => {
      if (action != null && isRedyAction(action)) {
        const result = next(action);
        const runner = runners[action.type];
        const effectResult = runner ? runner(action.payload, dispatchCmd, getState) : null;
        return {result, effectResult};
      }
      return next(action);
    };
  };
};
