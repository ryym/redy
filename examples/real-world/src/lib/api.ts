import './normalizers';
import {User, RepoWithoutOwner, RepoWithOwner, StarredRepos, Stargazers} from './models';
import {
  normalizeKey,
  normalizeUser,
  normalizeRepo,
  normalizeRepos,
  normalizeUsers,
} from './normalizers';

type ApiResponse<T> = {
  data: T;
  nextPageUrl: string | null;
};

type RepoResponse = RepoWithoutOwner & {owner: User};

const API_ROOT = 'https://api.github.com';

const url = (...paths: string[]) => `${API_ROOT}/${paths.join('/')}`;

export const fetchUser = async (login: string): Promise<User> => {
  const res = await fetchData<User>(url('users', login));
  return normalizeUser(res.data);
};

export const fetchRepo = async (fullName: string): Promise<RepoWithOwner> => {
  const res = await fetchData<RepoResponse>(url('repos', fullName));
  return normalizeRepo(res.data);
};

export const fetchStarred = async (
  login: string,
  nextPageUrl?: string | null,
): Promise<StarredRepos> => {
  const res = await fetchData(nextPageUrl || url('users', login, 'starred'));
  const data = normalizeRepos(res.data);
  return {
    login: normalizeKey(login),
    repoFullNames: data.result,
    entities: data.entities,
    nextPageUrl: res.nextPageUrl,
  };
};

export const fetchStargazers = async (
  fullName: string,
  nextPageUrl?: string | null,
): Promise<Stargazers> => {
  const res = await fetchData(nextPageUrl || url('repos', fullName, 'stargazers'));
  const data = normalizeUsers(res.data);
  return {
    repoFullName: normalizeKey(fullName),
    logins: data.result,
    entities: data.entities,
    nextPageUrl: res.nextPageUrl,
  };
};

const fetchData = async <D = any>(url: string): Promise<ApiResponse<D>> => {
  const res = await fetch(url);
  if (!res.ok) {
    console.error(res);
    throw new Error(`failed to fetch ${url}`);
  }

  const data = (await res.json()) as D;
  const nextPageUrl = getNextPageUrl(res);
  return {data, nextPageUrl};
};

const getNextPageUrl = (res: Response) => {
  const link = res.headers.get('link');
  if (!link) {
    return null;
  }
  const nextLink = link.split(',').find(s => s.indexOf('rel="next"') > -1);
  if (!nextLink) {
    return null;
  }
  return nextLink.split(';')[0].slice(1, -1);
};
