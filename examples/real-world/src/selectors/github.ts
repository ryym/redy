import {State} from '../state';
import {User, Repo, RepoWithOwner} from '../lib/models';
import {Pagination} from '../lib/pagination';
import {githubResources} from '../lib/normalized-resources';

export const getUser = (state: State, login: string): User | null => {
  return githubResources.getValue(state.users, login);
};

export const getRepo = (state: State, fullName: string): Repo | null => {
  return githubResources.getValue(state.repos, fullName);
};

export const getStarredRepos = (state: State, login: string): RepoWithOwner[] => {
  const pg = getStarredPagination(state, login);
  if (pg == null) {
    return [];
  }

  return pg.ids.map(fullName => {
    const repo = getRepo(state, fullName)!;
    const owner = getUser(state, repo.owner)!;
    return {repo, owner};
  });
};

export const getStarredPagination = (state: State, login: string): Pagination<string> | null => {
  return githubResources.getValue(state.starred, login);
};

export const getStargazers = (state: State, fullName: string): User[] => {
  const pg = getStargazersPagination(state, fullName);
  if (pg == null) {
    return [];
  }

  return pg.ids.map(login => getUser(state, login)!);
};

export const getStargazersPagination = (
  state: State,
  fullName: string,
): Pagination<string> | null => {
  return githubResources.getValue(state.stargazers, fullName);
};
