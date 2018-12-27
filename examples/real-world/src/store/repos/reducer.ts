import {defineReducer, on} from 'redy';
import {ReposState, StargazersState} from '../../state';
import {FetchRepoOk, FetchStarredOk, FetchStargazers, FetchStargazersOk} from '../../actions';
import {Pagination, newPagination, startFetch, finishFetch} from '../../lib/pagination';
import {normalizeKey} from '../../lib/normalizers';

export const reposReducer = defineReducer<ReposState>({}, [
  on(FetchRepoOk, (repos, {repo}) => ({
    ...repos,
    [repo.fullName]: repo,
  })),

  on(FetchStarredOk, (repos, {entities}) => ({
    ...repos,
    ...entities.repos,
  })),
]);

export const stargazersReducer = defineReducer<StargazersState>({}, [
  on(FetchStargazers, (stargazers, {fullName}) => {
    fullName = normalizeKey(fullName);
    return {
      ...stargazers,
      [fullName]: startFetch(stargazers[fullName]),
    };
  }),

  on(FetchStargazersOk, (stargazers, {repoFullName, logins, nextPageUrl}) => {
    repoFullName = normalizeKey(repoFullName);
    return {
      ...stargazers,
      [repoFullName]: finishFetch(stargazers[repoFullName], logins, nextPageUrl),
    };
  }),
]);
