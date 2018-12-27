import {defineReducer, on, onAny} from 'redy';
import {UsersState, StarredState} from '../../state';
import {
  FetchRepoOk,
  FetchUserOk,
  FetchStarred,
  FetchStarredOk,
  FetchStargazersOk,
} from '../../actions';
import {Pagination, newPagination, startFetch, finishFetch} from '../../lib/pagination';
import {normalizeKey} from '../../lib/normalizers';

export const usersReducer = defineReducer<UsersState>({}, [
  on(FetchUserOk, (users, user) => ({
    ...users,
    [user.login]: user,
  })),

  on(FetchRepoOk, (users, {owner}) => ({
    ...users,
    [owner.login]: owner,
  })),

  onAny([FetchStarredOk, FetchStargazersOk], (users, {entities}) => ({
    ...users,
    ...entities.users,
  })),
]);

export const starredReducer = defineReducer<StarredState>({}, [
  on(FetchStarred, (starred, {login}) => {
    login = normalizeKey(login);
    return {
      ...starred,
      [login]: startFetch(starred[login]),
    };
  }),

  on(FetchStarredOk, (starred, {login, repoFullNames, nextPageUrl}) => {
    login = normalizeKey(login);
    return {
      ...starred,
      [login]: finishFetch(starred[login], repoFullNames, nextPageUrl),
    };
  }),
]);
