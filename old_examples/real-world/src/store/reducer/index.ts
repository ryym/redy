import {Reducer, combineReducers} from 'redux';
import {State} from '../state';
import {reduceQuery} from './query';
import {reduceUsers, reduceRepos, reduceStarred, reduceStargazers} from './github';

export const createReducer = (): Reducer<State> => {
  return combineReducers({
    query: reduceQuery,
    users: reduceUsers,
    repos: reduceRepos,
    starred: reduceStarred,
    stargazers: reduceStargazers,
  });
};
