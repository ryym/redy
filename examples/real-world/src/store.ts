import {History} from 'history';
import {Store as ReduxStore, createStore, applyMiddleware} from 'redux';
import {redyMiddleware, Dispatch} from 'redy';
import logger from 'redux-logger';
import {createReducer} from './reducer';
import {State} from './state';

export type WithDispatch<P extends {}> = P & {dispatch: Dispatch};

export type Store = ReduxStore<State>;

export const configureStore = (history: History): Store => {
  const middlewares = applyMiddleware(logger, redyMiddleware({history}));
  return createStore(createReducer(), {}, middlewares);
};
