import * as api from '../../lib/api';
import {Thunk} from '../types';
import {User, StarredRepos, Stargazers, RepoWithOwner} from '../../lib/models';
import {getUser, getRepo, getStarredPagination, getStargazersPagination} from '../selectors';

export const FetchUser = (login: string): Thunk => async (dispatch, getState) => {
  if (getUser(getState(), login) == null) {
    const user = await api.fetchUser(login);
    dispatch(FetchUserOk, user);
  }
};

export const FetchUserOk = (user: User) => user;

export const FetchRepo = (fullName: string): Thunk => async (dispatch, getState) => {
  if (getRepo(getState(), fullName) == null) {
    const repo = await api.fetchRepo(fullName);
    dispatch(FetchRepoOk, repo);
  }
};

export const FetchRepoOk = (repo: RepoWithOwner) => repo;

export type FetchStarredParams = {
  login: string;
  nextPageUrl: string;
};

export const FetchStarred = ({login, nextPageUrl}: FetchStarredParams): Thunk => async (
  dispatch,
  getState,
) => {
  const pg = getStarredPagination(getState(), login);
  if (!pg || pg.pageCount === 0 || nextPageUrl) {
    dispatch(FetchStarredStart, login);
    const result = await api.fetchStarred(login, nextPageUrl);
    dispatch(FetchStarredOk, result);
  }
};

export const FetchStarredStart = (login: string) => login;
export const FetchStarredOk = (result: StarredRepos) => result;

export type FetchStargazersParams = {
  fullName: string;
  nextPageUrl: string;
};

type Effect<R = void> = RedyEffect<R, State, Ctx>;

export const FetchStargazers = (fullName: string) =>
  action<Thunk>(fullName, async (dispatch, getState) => {
    const pg = getStargazersPagination(getState(), fullName);
    if (!pg || pg.pageCount === 0 || nextPageUrl) {
      dispatch(FetchStargazersStart, fullName);
      const result = await api.fetchStargazers(fullName, nextPageUrl);
      dispatch(FetchStargazersOk, result);
    }
  });

export const FetchStargazers = (fullName: string) =>
  action(fullName).effect<Thunk>(async (dispatch, getState) => {
    const pg = getStargazersPagination(getState(), fullName);
    if (!pg || pg.pageCount === 0 || nextPageUrl) {
      dispatch(FetchStargazersStart, fullName);
      const result = await api.fetchStargazers(fullName, nextPageUrl);
      dispatch(FetchStargazersOk, result);
    }
  });

export const FetchStargazers = (fullName: string) =>
  action(fullName).with({
    effect: async (dispatch, getState) => {
      dispatch(FetchStargazersOk, result);
    },
  });

export const FetchStargazers = (fullName: string) =>
  action(fullName, [
    effect(async (dispatch, getState) => {
      dispatch(FetchStargazersOk, result);
    }),
  ]);

effectOf<Thunk>(FetchStargazers, async (dispatch, getState) => {
  dispatch(FetchStargazersOk, result);
});

export const FetchStargazersOk = (result: Stargazers) => action(result);

export const FetchStargazers = ({fullName, nextPageUrl}: FetchStargazersParams): Thunk => async (
  dispatch,
  getState,
) => {
  const pg = getStargazersPagination(getState(), fullName);
  if (!pg || pg.pageCount === 0 || nextPageUrl) {
    dispatch(FetchStargazersStart, fullName);
    const result = await api.fetchStargazers(fullName, nextPageUrl);
    dispatch(FetchStargazersOk, result);
  }
};

export const FetchStargazersStart = (fullName: string) => fullName;
export const FetchStargazersOk = (result: Stargazers) => result;
