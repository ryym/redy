import {Dispatch, Middleware, MiddlewareAPI} from 'redux';
import {isRedyAction, extractMetaFromAction} from './action';

export const redyMiddleware = <C>(context?: C): Middleware<{}, any, Dispatch> => {
  return <S>({dispatch, getState}: MiddlewareAPI<Dispatch, S>) => {
    return next => action => {
      if (action == null || !isRedyAction(action)) {
        return next(action);
      }

      const {thunk} = extractMetaFromAction(action);
      const nextResult = next(action);

      if (thunk == null) {
        return nextResult;
      }

      // Clear initial rejection which notifies user who forgot to use redyMiddleware.
      // Otherwise the promise will be reported in the console as uncaught exception.
      action.promise!().catch(() => {});

      const promise = thunk(dispatch, getState, context);
      return Object.defineProperty({...action}, 'promise', {
        value: () => promise,
        enumerable: false,
      });
    };
  };
};
