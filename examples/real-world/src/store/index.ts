import {History} from 'history';
import {Store as ReduxStore, Dispatch, createStore, applyMiddleware} from 'redux';
import logger from 'redux-logger';
import {State} from '../state';
import {createReducer} from './reducer';
import {createEffectMiddleware} from './effects';

export type WithDispatch<P extends {}> = P & {dispatch: Dispatch};

export type Store = ReduxStore<State>;

export const configureStore = (history: History): Store => {
  return createStore(createReducer(), {}, applyMiddleware(logger, createEffectMiddleware(history)));
};
