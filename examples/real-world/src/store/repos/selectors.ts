import {State} from '../../state';
import {Repo, User} from '../../lib/models';
import {Pagination} from '../../lib/pagination';
import {githubResources} from '../../lib/normalized-resources';
import {getUser} from '../users/selectors';

export const getRepo = (state: State, fullName: string): Repo | null => {
  return githubResources.getValue(state.repos, fullName);
};

export const getStargazersPagination = (
  state: State,
  fullName: string,
): Pagination<string> | null => {
  return githubResources.getValue(state.stargazers, fullName);
};

export const getStargazers = (state: State, fullName: string): User[] => {
  const pg = getStargazersPagination(state, fullName);
  if (pg == null) {
    return [];
  }

  return pg.ids.map(login => getUser(state, login)!);
};
