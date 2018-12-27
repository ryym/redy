import {State} from '../../state';
import {User, RepoWithOwner} from '../../lib/models';
import {Pagination} from '../../lib/pagination';
import {normalizeKey} from '../../lib/normalizers';
import {getRepo} from '../repos/selectors';

export const getUser = (state: State, login: string): User | null => {
  return state.users[normalizeKey(login)] || null;
};

export const getStarredPagination = (state: State, login: string): Pagination<string> | null => {
  return state.starred[normalizeKey(login)] || null;
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
