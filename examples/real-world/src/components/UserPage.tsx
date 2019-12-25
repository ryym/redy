import React, {useEffect} from 'react';
import {match as Match} from 'react-router-dom';
import {State} from '../state';
import {$github} from '../actions/github';
import {RepoWithOwner} from '../lib/models';
import {newPagination} from '../lib/pagination';
import {getUser, getStarredRepos, getStarredPagination} from '../selectors';
import {List} from './List';
import {UserItem} from './UserItem';
import {RepoItem} from './RepoItem';
import {connect} from '../connect';

export type Props = Readonly<{
  match: Match<{login: string}>;
}>;

export const mapStateToProps = (state: State, {match}: Props) => {
  const {login} = match.params;
  const starredRepos = getStarredRepos(state, login);
  const pagination = getStarredPagination(state, login);
  return {
    login,
    user: getUser(state, login),
    starredRepos,
    pagination: pagination || newPagination(),
  };
};

export const UserPage = connect(
  mapStateToProps,

  function UserPage({login, user, starredRepos, pagination, dispatch}) {
    useEffect(() => {
      dispatch($github.FetchUser(login));
      dispatch($github.FetchStarred({login}));
    }, [dispatch, login]);

    if (user == null) {
      return (
        <h1>
          <i>
            Loading {login}
            {"'s profile..."}
          </i>
        </h1>
      );
    }

    return (
      <div>
        <UserItem user={user} />
        <hr />
        <List<RepoWithOwner>
          items={starredRepos}
          isFetching={pagination.isFetching}
          nextPageUrl={pagination.nextPageUrl}
          onLoadMoreClick={url => dispatch($github.FetchStarred({login, nextPageUrl: url}))}
          loadingLabel={`Loading ${login}'s starred...'`}
        >
          {({repo, owner}) => <RepoItem key={repo.fullName} repo={repo} owner={owner} />}
        </List>
      </div>
    );
  },
);
