import {action} from 'redy';

export const InputQuery = (query: string) => action(query);

export const Search = (path: string) =>
  action(path).effect(async (_dispatch, _getState, {history}) => {
    history.push(`/${path}`);
  });
