import {defineReducer, on, onAny} from 'redy';
import {$github} from '../actions/github';
import {UsersState, ReposState, StarredState, StargazersState} from '../state';
import {githubResources as resources} from '../lib/normalized-resources';
import {startFetch, finishFetch} from '../lib/pagination';

export const reduceUsers = defineReducer<UsersState>(resources.init(), [
  on($github.FetchUserDone, (users, user) => {
    return resources.add(users, user.login, user);
  }),

  on($github.FetchRepoDone, (users, {owner}) => {
    return resources.add(users, owner.login, owner);
  }),

  onAny([$github.FetchStarredDone, $github.FetchStargazersDone], (users, {entities}) => {
    return resources.merge(users, entities.users);
  }),
]);

export const reduceRepos = defineReducer<ReposState>(resources.init(), [
  on($github.FetchRepoDone, (repos, {repo}) => {
    return resources.add(repos, repo.fullName, repo);
  }),

  on($github.FetchStarredDone, (repos, {entities}) => {
    return resources.merge(repos, entities.repos);
  }),
]);

export const reduceStarred = defineReducer<StarredState>(resources.init(), [
  on($github.FetchStarredBegun, (starred, login) => {
    return resources.update(starred, login, startFetch);
  }),

  on($github.FetchStarredDone, (starred, {login, repoFullNames, nextPageUrl}) => {
    return resources.update(starred, login, pg => finishFetch(pg!, repoFullNames, nextPageUrl));
  }),
]);

export const reduceStargazers = defineReducer<StargazersState>(resources.init(), [
  on($github.FetchStargazersBegun, (stargazers, fullName) => {
    return resources.update(stargazers, fullName, startFetch);
  }),

  on($github.FetchStargazersDone, (stargazers, {repoFullName, logins, nextPageUrl}) => {
    return resources.update(stargazers, repoFullName, pg => finishFetch(pg!, logins, nextPageUrl));
  }),
]);
