import {Dispatch, Middleware, MiddlewareAPI} from 'redux';
import {isRedyAction} from './action';

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
