import {action} from 'redy';
import {User, RepoWithOwner, StarredRepos, Stargazers} from './lib/models';

export const InputQuery = action('INPUT_QUERY', (q: string) => q);

export const Search = action('SEARCH', (path: string) => path);

export const FetchUser = action('FETCH_USER', (login: string) => ({login}));

// export const FetchUserStart = action('FETCH_USER_START', (login: string) => ({login}));

export const FetchUserOk = action('FETCH_USER_OK', (user: User) => user);

export const FetchRepo = action('FETCH_REPO', (fullName: string) => ({fullName}));

export const FetchRepoOk = action('FETCH_REPO_OK', (repo: RepoWithOwner) => repo);

export const FetchStarred = action('FETCH_STARRED', (login: string, nextPageUrl?: string) => ({
  login,
  nextPageUrl,
}));

export const FetchStarredOk = action('FETCH_STARRED_OK', (result: StarredRepos) => result);

export const FetchStargazers = action(
  'FETCH_STARGAZERS',
  (fullName: string, nextPageUrl?: string) => ({fullName, nextPageUrl}),
);

export const FetchStargazersStart = action(
  'FETCH_STARGAZERS_START',
  (fullName: string) => fullName,
);

export const FetchStargazersOk = action('FETCH_STARGAZERS_OK', (result: Stargazers) => result);
