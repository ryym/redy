import React from 'react';
import {Link} from 'react-router-dom';
import {User} from '../lib/models';

export type Props = Readonly<{
  user: User;
}>;

export const UserItem = ({user}: Props) => {
  const {login, avatarUrl, name} = user;

  return (
    <div className="User">
      <Link to={`/${login}`}>
        <img src={avatarUrl} alt={login} width="72" height="72" />
        <h3>
          {login} {name && <span>({name})</span>}
        </h3>
      </Link>
    </div>
  );
};
