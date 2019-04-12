export type User = Readonly<{
  login: string;
  avatarUrl: string;
  name: string;
}>;

export type RepoWithoutOwner = Readonly<{
  name: string;
  fullName: string;
  description: string | null;
  htmlUrl: string;
}>;

export type Repo = Readonly<{owner: string}> & RepoWithoutOwner;

export type RepoWithOwner = Readonly<{
  repo: Repo;
  owner: User;
}>;

export type UsersAndRepos = Readonly<{
  users: {[login: string]: User};
  repos: {[fullName: string]: Repo};
}>;

export type StarredRepos = Readonly<{
  login: string;
  repoFullNames: string[];
  entities: UsersAndRepos;
  nextPageUrl: string | null;
}>;

export type Stargazers = Readonly<{
  repoFullName: string;
  logins: string[];
  entities: UsersAndRepos;
  nextPageUrl: string | null;
}>;
