import {defineReducer, on} from 'redy';
import {ReposState, StargazersState} from '../../state';
import {FetchRepoOk, FetchStarredOk, FetchStargazersStart, FetchStargazersOk} from '../../actions';
import {startFetch, finishFetch} from '../../lib/pagination';
import {githubResources as resources} from '../../lib/normalized-resources';

export const reposReducer = defineReducer<ReposState>(resources.init(), [
  on(FetchRepoOk, (repos, {repo}) => resources.add(repos, repo.fullName, repo)),

  on(FetchStarredOk, (repos, {entities}) => resources.merge(repos, entities.repos)),
]);

export const stargazersReducer = defineReducer<StargazersState>(resources.init(), [
  on(FetchStargazersStart, (stargazers, fullName) =>
    resources.update(stargazers, fullName, startFetch),
  ),

  on(FetchStargazersOk, (stargazers, {repoFullName, logins, nextPageUrl}) =>
    resources.update(stargazers, repoFullName, pg => finishFetch(pg!, logins, nextPageUrl)),
  ),
]);
