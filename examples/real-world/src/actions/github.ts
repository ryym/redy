import {action, effect} from 'redy';
import * as api from '../lib/api';
import {Thunk} from '../types';
import {User, StarredRepos, Stargazers, RepoWithOwner} from '../lib/models';
import {getUser, getRepo, getStarredPagination, getStargazersPagination} from '../selectors';

export const FetchUser = (login: string) =>
  action(login).effect<Thunk>(async (dispatch, getState) => {
    if (getUser(getState(), login) == null) {
      const user = await api.fetchUser(login);
      dispatch(FetchUserOk, user);
    }
  });

export const FetchUserOk = (user: User) => action(user);

export const FetchRepo = (fullName: string) =>
  action(fullName).effect<Thunk>(async (dispatch, getState) => {
    if (getRepo(getState(), fullName) == null) {
      const repo = await api.fetchRepo(fullName);
      dispatch(FetchRepoOk, repo);
    }
  });

export const FetchRepoOk = (repo: RepoWithOwner) => action(repo);

export type FetchStarredParams = {
  login: string;
  nextPageUrl?: string;
};

export const FetchStarred = ({login, nextPageUrl}: FetchStarredParams) =>
  action(login).effect<Thunk>(async (dispatch, getState) => {
    const pg = getStarredPagination(getState(), login);
    if (!pg || pg.pageCount === 0 || nextPageUrl) {
      const result = await api.fetchStarred(login, nextPageUrl);
      dispatch(FetchStarredOk, result);
    }
  });

export const FetchStarredOk = (result: StarredRepos) => action(result);

export type FetchStargazersParams = {
  fullName: string;
  nextPageUrl?: string;
};

export const FetchStargazers = ({fullName, nextPageUrl}: FetchStargazersParams) =>
  action(fullName).effect<Thunk>(async (dispatch, getState) => {
    const pg = getStargazersPagination(getState(), fullName);
    if (!pg || pg.pageCount === 0 || nextPageUrl) {
      const result = await api.fetchStargazers(fullName, nextPageUrl);
      dispatch(FetchStargazersOk, result);
    }
  });

export const FetchStargazersOk = (result: Stargazers) => action(result);
