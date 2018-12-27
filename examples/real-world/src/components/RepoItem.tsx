import React from 'react';
import {Link} from 'react-router-dom';
import {Repo, User} from '../lib/models';

export type Props = Readonly<{
  repo: Repo;
  owner: User;
}>;

export const RepoItem = ({repo, owner}: Props) => {
  const {login} = owner;
  const {name, description} = repo;

  return (
    <div className="Repo">
      <h3>
        <Link to={`/${login}/${name}`}>{name}</Link>
        {' by '}
        <Link to={`/${login}`}>{login}</Link>
      </h3>
      {description && <p>{description}</p>}
    </div>
  );
};
