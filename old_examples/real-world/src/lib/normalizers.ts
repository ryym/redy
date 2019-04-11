import {camelizeKeys} from 'humps';
import {Schema, schema, normalize} from 'normalizr';
import {User, RepoWithOwner, UsersAndRepos} from './models';

export type Normalized<ID, E = {}> = {
  result: ID;
  entities: E;
};

// GitHub's API may return results with uppercase letters while the query
// doesn't contain any. For example, "someuser" could result in "SomeUser"
// leading to a frozen UI as it wouldn't find "someuser" in the entities.
// That's why we're forcing lower cases down there.
export const normalizeKey = (key: string): string => key.toLowerCase();

const userSchema = new schema.Entity(
  'users',
  {},
  {
    idAttribute: (user: any) => normalizeKey(user.login),
  },
);

const repoSchema = new schema.Entity(
  'repos',
  {owner: userSchema},
  {
    idAttribute: (repo: any) => normalizeKey(repo.fullName),
  },
);

const userListSchema = new schema.Array(userSchema);

const repoListSchema = new schema.Array(repoSchema);

const normalizer = <ID, R>(schema: Schema) => (json: {}): Normalized<ID, R> => {
  return normalize(camelizeKeys(json), schema) as Normalized<ID, R>;
};

export const normalizeUser = (json: {login: string}): User => {
  json.login = normalizeKey(json.login);
  return camelizeKeys(json) as User;
};

export const normalizeRepo = (json: {}): RepoWithOwner => {
  const result = normalizer<string, UsersAndRepos>(repoSchema)(camelizeKeys(json));
  const repo = result.entities.repos[result.result];
  return {
    repo,
    owner: result.entities.users[repo.owner],
  };
};

export const normalizeUsers = normalizer<string[], UsersAndRepos>(userListSchema);

export const normalizeRepos = normalizer<string[], UsersAndRepos>(repoListSchema);
