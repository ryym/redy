import {Reducer, combineReducers} from 'redux';
import {State} from '../state';
import {queryReducer} from './query/reducer';
import {usersReducer, starredReducer} from './users/reducer';
import {reposReducer, stargazersReducer} from './repos/reducer';

export const createReducer = (): Reducer<State> => {
  return combineReducers({
    query: queryReducer,
    users: usersReducer,
    repos: reposReducer,
    starred: starredReducer,
    stargazers: stargazersReducer,
  });
};
