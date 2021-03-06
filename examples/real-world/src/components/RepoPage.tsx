import React, {useEffect} from 'react';
import {match as Match} from 'react-router-dom';
import {State} from '../state';
import {$github} from '../actions/github';
import {newPagination} from '../lib/pagination';
import {getRepo, getUser, getStargazers, getStargazersPagination} from '../selectors';
import {connect} from '../connect';
import {List} from './List';
import {UserItem} from './UserItem';
import {RepoItem} from './RepoItem';

export type Props = Readonly<{
  match: Match<{login: string; name: string}>;
}>;

export const mapStateToProps = (state: State, {match}: Props) => {
  const {login, name} = match.params;
  const fullName = `${login}/${name}`;
  const stargazers = getStargazers(state, fullName);
  const pagination = getStargazersPagination(state, fullName);
  const repo = getRepo(state, fullName);
  const repoWithOwner = repo == null ? null : {repo, owner: getUser(state, repo.owner)!};

  return {
    fullName,
    repoWithOwner,
    stargazers,
    pagination: pagination || newPagination(),
  };
};

export const RepoPage = connect(
  mapStateToProps,

  function RepoPage({dispatch, fullName, repoWithOwner, stargazers, pagination}) {
    useEffect(() => {
      dispatch($github.FetchRepo(fullName));
      dispatch($github.FetchStargazers({fullName}));
    }, [dispatch, fullName]);

    if (repoWithOwner == null) {
      return (
        <h1>
          <i>Loading {fullName} details...</i>
        </h1>
      );
    }

    const {repo, owner} = repoWithOwner;
    return (
      <div>
        <RepoItem repo={repo} owner={owner} />
        <hr />
        <List
          isFetching={pagination.isFetching}
          nextPageUrl={pagination.nextPageUrl}
          onLoadMoreClick={url => dispatch($github.FetchStargazers({fullName, nextPageUrl: url}))}
          loadingLabel={`Loading stargazers of ${fullName}...`}
        >
          {stargazers.map(user => (
            <UserItem key={user.login} user={user} />
          ))}
        </List>
      </div>
    );
  },
);
