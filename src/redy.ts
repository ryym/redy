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
  payload: {
    args: A;
    creator: (...args: A) => P;
  };
  meta: {redy: boolean; [key: string]: any; [key: number]: any};
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

export type DispatchResult<P, R> = {
  type: string;
  payload: P;
  promise: Promise<R>;
};

export type Dispatch = <A extends any[], P>(
  action: ActionCreator<A, P>,
  ...args: A
) => P extends Thunk<any, infer R> ? DispatchResult<P, R> : DispatchResult<P, P>;

export const makeRedyAction = <A extends any[], P>(
  creator: ActionCreator<A, P>,
  ...args: A
): RedyAction<A, P> => {
  return {
    type: creator.name,
    payload: {args, creator},

    meta: {redy: true},
  };
};

export const wrapDispatch = (dispatch: ReduxDispatch): Dispatch => {
  return (creator, ...args) => {
    const action = makeRedyAction(creator, ...args);

    // XXX: We cannot statically type this return type.
    return dispatch(action) as any;
  };
};

export const isRedyAction = (action: AnyAction): action is RedyAction<any, any> => {
  return action.meta && action.meta.redy;
};

export const redyMiddleware = (/* context */): Middleware<{}, any, ReduxDispatch> => {
  return <S>({dispatch, getState}: MiddlewareAPI<ReduxDispatch, S>) => {
    const wrappedDispatch = wrapDispatch(dispatch);
    return next => action => {
      if (action == null || !isRedyAction(action)) {
        return next(action);
      }

      const {creator, args} = action.payload;
      const actualPayload = creator(...args);

      if (typeof actualPayload === 'function') {
        const promise = actualPayload(wrappedDispatch, getState, undefined);
        return {
          type: action.type,
          payload: actualPayload,
          promise,
        };
      } else {
        return next({
          type: action.type,
          payload: actualPayload,
          promise: Promise.resolve(actualPayload),
        });
      }
    };
  };
};

export type Thunk<S, R = void, C = undefined> = (
  dispatch: Dispatch,
  getState: () => S,
  context?: C,
) => Promise<R>;
