import {State} from '../../state';
import {Repo, User} from '../../lib/models';
import {Pagination} from '../../lib/pagination';
import {normalizeKey} from '../../lib/normalizers';
import {getUser} from '../users/selectors';

export const getRepo = (state: State, fullName: string): Repo | null => {
  return state.repos[normalizeKey(fullName)] || null;
};

export const getStargazersPagination = (
  state: State,
  fullName: string,
): Pagination<string> | null => {
  return state.stargazers[normalizeKey(fullName)] || null;
};

export const getStargazers = (state: State, fullName: string): User[] => {
  const pg = getStargazersPagination(state, fullName);
  if (pg == null) {
    return [];
  }

  return pg.ids.map(login => getUser(state, login)!);
};
