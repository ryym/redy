import {action, actionEffect} from 'redy';
import {Thunk} from '../types';

export const InputQuery = action('InputQuery', (query: string) => query);

export const Search = actionEffect('Search', (path: string) => [
  path,
  (async (_dispatch, _getState, {history}) => {
    history.push(`/${path}`);
  }) as Thunk,
]);
