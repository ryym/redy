import {action, actionEffect} from 'redy';
import * as api from '../lib/api';
import {Thunk} from '../types';
import {User, StarredRepos, Stargazers, RepoWithOwner} from '../lib/models';
import {getUser, getRepo, getStarredPagination, getStargazersPagination} from '../selectors';

export const FetchUser = actionEffect('FetchUser', (login: string) => [
  login,
  (async (dispatch, getState) => {
    if (getUser(getState(), login) == null) {
      const user = await api.fetchUser(login);
      dispatch(FetchUserOk(user));
    }
  }) as Thunk,
]);

export const FetchUserOk = action('FetchUserOk', (user: User) => user);

export const FetchRepo = actionEffect('FetchRepo', (fullName: string) => [
  fullName,
  (async (dispatch, getState) => {
    if (getRepo(getState(), fullName) == null) {
      const repo = await api.fetchRepo(fullName);
      dispatch(FetchRepoOk(repo));
    }
  }) as Thunk,
]);

export const FetchRepoOk = action('FetchRepoOk', (repo: RepoWithOwner) => repo);

export type FetchStarredParams = {
  login: string;
  nextPageUrl?: string;
};

export const FetchStarred = actionEffect(
  'FetchStarred',
  ({login, nextPageUrl}: FetchStarredParams) => [
    login,
    (async (dispatch, getState) => {
      const pg = getStarredPagination(getState(), login);
      if (!pg || pg.pageCount === 0 || nextPageUrl) {
        const result = await api.fetchStarred(login, nextPageUrl);
        dispatch(FetchStarredOk(result));
      }
    }) as Thunk,
  ],
);

export const FetchStarredOk = action('FetchStarredOk', (result: StarredRepos) => result);

export type FetchStargazersParams = {
  fullName: string;
  nextPageUrl?: string;
};

export const FetchStargazers = actionEffect(
  'FetchStargazers',
  ({fullName, nextPageUrl}: FetchStargazersParams) => [
    fullName,
    (async (dispatch, getState) => {
      const pg = getStargazersPagination(getState(), fullName);
      if (!pg || pg.pageCount === 0 || nextPageUrl) {
        const result = await api.fetchStargazers(fullName, nextPageUrl);
        dispatch(FetchStargazersOk(result));
      }
    }) as Thunk,
  ],
);

export const FetchStargazersOk = action('FetchStargazersOk', (result: Stargazers) => result);
