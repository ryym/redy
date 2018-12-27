import {defineEffects, handle} from 'redy';
import {Effect} from './type';
import {
  FetchUser,
  FetchUserOk,
  FetchRepo,
  FetchRepoOk,
  FetchStarred,
  FetchStarredOk,
  FetchStargazers,
  FetchStargazersOk,
} from '../../actions';
import {getUser, getRepo} from '../selectors';
import * as api from '../../lib/api';

export const fetchUser = (
  d = {
    fetchUser: api.fetchUser,
  },
): Effect<typeof FetchUser> => async ({login}, dispatch, getState) => {
  if (getUser(getState(), login) == null) {
    const user = await d.fetchUser(login);
    dispatch(FetchUserOk(user));
  }
};

export const fetchRepo = (
  d = {
    fetchRepo: api.fetchRepo,
  },
): Effect<typeof FetchRepo> => async ({fullName}, dispatch, getState) => {
  if (getRepo(getState(), fullName) == null) {
    const repo = await d.fetchRepo(fullName);
    dispatch(FetchRepoOk(repo));
  }
};

export const fetchStarred = (
  d = {
    fetchStarred: api.fetchStarred,
  },
): Effect<typeof FetchStarred> => async ({login, nextPageUrl}, dispatch) => {
  const result = await d.fetchStarred(login, nextPageUrl);
  console.log('STARRED', result);
  dispatch(FetchStarredOk(result));
};

export const fetchStargazers = (
  d = {
    fetchStargazers: api.fetchStargazers,
  },
): Effect<typeof FetchStargazers> => async ({fullName, nextPageUrl}, dispatch) => {
  const result = await d.fetchStargazers(fullName, nextPageUrl);
  dispatch(FetchStargazersOk(result));
};

export const githubEffects = () => {
  return defineEffects([
    handle(FetchUser, fetchUser()),
    handle(FetchRepo, fetchRepo()),
    handle(FetchStarred, fetchStarred()),
    handle(FetchStargazers, fetchStargazers()),
  ]);
};
