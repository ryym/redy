import {defineReducer, on, onAny} from 'redy';
import {UsersState, StarredState} from '../../state';
import {
  FetchRepoOk,
  FetchUserOk,
  FetchStarred,
  FetchStarredOk,
  FetchStargazersOk,
} from '../../actions';
import {startFetch, finishFetch} from '../../lib/pagination';
import {githubResources as resources} from '../../lib/normalized-resources';

export const usersReducer = defineReducer<UsersState>(resources.init(), [
  on(FetchUserOk, (users, user) => resources.add(users, user.login, user)),

  on(FetchRepoOk, (users, {owner}) => resources.add(users, owner.login, owner)),

  onAny([FetchStarredOk, FetchStargazersOk], (users, {entities}) =>
    resources.merge(users, entities.users),
  ),
]);

export const starredReducer = defineReducer<StarredState>(resources.init(), [
  on(FetchStarred, (starred, {login}) => resources.update(starred, login, startFetch)),

  on(FetchStarredOk, (starred, {login, repoFullNames, nextPageUrl}) =>
    resources.update(starred, login, pg => finishFetch(pg!, repoFullNames, nextPageUrl)),
  ),
]);
