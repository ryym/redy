import {defineReducer, onAny} from 'redy';
import {searchAction} from '../actions/search';
import {githubAction} from '../actions/github';

export const reduceQuery = defineReducer('', [
  onAny([searchAction.InputQuery, searchAction.SearchDone], (_, query) => query),

  onAny([githubAction.FetchUserBegun, githubAction.FetchStarredBegun], (_, login) => login),

  onAny(
    [githubAction.FetchRepoBegun, githubAction.FetchStargazersBegun],
    (_, fullName) => fullName,
  ),
]);
