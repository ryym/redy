import {defineActions, effect} from 'redy';
import {Thunk} from '../types';

export const $search = defineActions('search', {
  InputQuery: (query: string) => query,

  Search: effect(
    (path: string): Thunk => async (dispatch, _getState, {history}) => {
      history.push(`/${path}`);
      dispatch($search.SearchDone(path));
    },
  ),

  SearchDone: (query: string) => query,
});
