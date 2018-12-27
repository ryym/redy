import {User, Repo} from './lib/models';
import {Pagination} from './lib/pagination';

export type State = Readonly<{
  query: string;
  users: UsersState;
  repos: ReposState;
  starred: StarredState;
  stargazers: StargazersState;
}>;

export type UsersState = {
  [login: string]: User;
};

export type ReposState = {
  [fullName: string]: Repo;
};

export type StarredState = {
  [login: string]: Pagination<string>;
};

export type StargazersState = {
  [fullName: string]: Pagination<string>;
};
