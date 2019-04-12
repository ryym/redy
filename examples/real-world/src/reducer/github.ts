import {defineReducer, on, onAny} from 'redy';
import {
  FetchUserOk,
  FetchRepoOk,
  FetchStarred,
  FetchStarredOk,
  FetchStargazers,
  FetchStargazersOk,
} from '../actions';
import {UsersState, ReposState, StarredState, StargazersState} from '../state';
import {githubResources as resources} from '../lib/normalized-resources';
import {startFetch, finishFetch} from '../lib/pagination';

export const reduceUsers = defineReducer<UsersState>(resources.init(), [
  on(FetchUserOk, (users, user) => {
    return resources.add(users, user.login, user);
  }),

  on(FetchRepoOk, (users, {owner}) => {
    return resources.add(users, owner.login, owner);
  }),

  onAny([FetchStarredOk, FetchStargazersOk], (users, {entities}) => {
    return resources.merge(users, entities.users);
  }),
]);

export const reduceRepos = defineReducer<ReposState>(resources.init(), [
  on(FetchRepoOk, (repos, {repo}) => {
    return resources.add(repos, repo.fullName, repo);
  }),

  on(FetchStarredOk, (repos, {entities}) => {
    return resources.merge(repos, entities.repos);
  }),
]);

export const reduceStarred = defineReducer<StarredState>(resources.init(), [
  on(FetchStarred, (starred, login) => {
    return resources.update(starred, login, startFetch);
  }),

  on(FetchStarredOk, (starred, {login, repoFullNames, nextPageUrl}) => {
    return resources.update(starred, login, pg => finishFetch(pg!, repoFullNames, nextPageUrl));
  }),
]);

export const reduceStargazers = defineReducer<StargazersState>(resources.init(), [
  on(FetchStargazers, (stargazers, fullName) => {
    return resources.update(stargazers, fullName, startFetch);
  }),

  on(FetchStargazersOk, (stargazers, {repoFullName, logins, nextPageUrl}) => {
    return resources.update(stargazers, repoFullName, pg => finishFetch(pg!, logins, nextPageUrl));
  }),
]);
