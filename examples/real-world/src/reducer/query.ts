import {defineReducer, onAny} from 'redy';
import {$search} from '../actions/search';
import {$github} from '../actions/github';

export const reduceQuery = defineReducer('', [
  onAny([$search.InputQuery, $search.SearchDone], (_, query) => query),

  onAny([$github.FetchUserBegun, $github.FetchStarredBegun], (_, login) => login),

  onAny([$github.FetchRepoBegun, $github.FetchStargazersBegun], (_, fullName) => fullName),
]);
