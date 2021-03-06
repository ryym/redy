import {defineActions, effect} from 'redy';
import * as api from '../lib/api';
import {Thunk} from '../types';
import {User, StarredRepos, Stargazers, RepoWithOwner} from '../lib/models';
import {getUser, getRepo, getStarredPagination, getStargazersPagination} from '../selectors';

export type FetchStarredParams = {
  login: string;
  nextPageUrl?: string;
};

export type FetchStargazersParams = {
  fullName: string;
  nextPageUrl?: string;
};

export const $github = defineActions('github', {
  FetchUser: effect(
    (login: string): Thunk => async (dispatch, getState) => {
      if (getUser(getState(), login) == null) {
        dispatch($github.FetchUserBegun(login));
        const user = await api.fetchUser(login);
        dispatch($github.FetchUserDone(user));
      }
    },
  ),

  FetchUserBegun: (login: string) => login,

  FetchUserDone: (user: User) => user,

  FetchRepo: effect(
    (fullName: string): Thunk => async (dispatch, getState) => {
      if (getRepo(getState(), fullName) == null) {
        dispatch($github.FetchRepoBegun(fullName));
        const repo = await api.fetchRepo(fullName);
        dispatch($github.FetchRepoDone(repo));
      }
    },
  ),

  FetchRepoBegun: (fullName: string) => fullName,

  FetchRepoDone: (repo: RepoWithOwner) => repo,

  FetchStarred: effect(
    ({login, nextPageUrl}: FetchStarredParams): Thunk => async (dispatch, getState) => {
      const pg = getStarredPagination(getState(), login);
      if (!pg || pg.pageCount === 0 || nextPageUrl) {
        dispatch($github.FetchStarredBegun(login));
        const result = await api.fetchStarred(login, nextPageUrl);
        dispatch($github.FetchStarredDone(result));
      }
    },
  ),

  FetchStarredBegun: (login: string) => login,

  FetchStarredDone: (result: StarredRepos) => result,

  FetchStargazers: effect(
    ({fullName, nextPageUrl}: FetchStargazersParams): Thunk => async (dispatch, getState) => {
      const pg = getStargazersPagination(getState(), fullName);
      if (!pg || pg.pageCount === 0 || nextPageUrl) {
        dispatch($github.FetchStargazersBegun(fullName));
        const result = await api.fetchStargazers(fullName, nextPageUrl);
        dispatch($github.FetchStargazersDone(result));
      }
    },
  ),

  FetchStargazersBegun: (fullName: string) => fullName,

  FetchStargazersDone: (result: Stargazers) => result,
});
