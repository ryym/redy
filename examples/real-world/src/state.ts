import {User, Repo} from './lib/models';
import {Pagination} from './lib/pagination';
import {MapRef} from './lib/normalized-resources';

export type State = Readonly<{
  query: string;
  users: UsersState;
  repos: ReposState;
  starred: StarredState;
  stargazers: StargazersState;
}>;

export type UsersState = MapRef<User>;

export type ReposState = MapRef<Repo>;

export type StarredState = MapRef<Pagination<string>>;

export type StargazersState = MapRef<Pagination<string>>;
