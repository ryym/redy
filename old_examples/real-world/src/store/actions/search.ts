import {Thunk} from '../types';

export const InputQuery = (query: string) => query;

export const Search = (path: string): Thunk => async (dispatch, getState, {history}) => {
  history.push(`/${path}`);
};
