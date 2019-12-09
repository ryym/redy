import {defineReducer, on, onAny} from 'redy';
import {searchAction} from '../actions/search';
import {githubAction} from '../actions/github';

export const reduceQuery = defineReducer('', [
  onAny([searchAction.InputQuery, searchAction.SearchDone], (_, query) => query),

  on(githubAction.FetchUserBegun, (_, login) => login),

  on(githubAction.FetchRepoBegun, (_, fullName) => fullName),
]);
