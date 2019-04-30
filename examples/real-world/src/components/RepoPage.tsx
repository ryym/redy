import React from 'react';
import {connect} from 'react-redux';
import {match as Match} from 'react-router-dom';
import {State} from '../state';
import {WithDispatch} from '../store';
import {FetchRepo, FetchStargazers} from '../actions';
import {RepoWithOwner, User} from '../lib/models';
import {Pagination, newPagination} from '../lib/pagination';
import {getRepo, getUser, getStargazers, getStargazersPagination} from '../selectors';

import {List} from './List';
import {UserItem} from './UserItem';
import {RepoItem} from './RepoItem';

export type Props = Readonly<{
  fullName: string;
  repoWithOwner: RepoWithOwner | null;
  stargazers: User[];
  pagination: Pagination<string>;
}>;

export type WrapperProps = Readonly<{
  match: Match<{login: string; name: string}>;
}>;

export class RepoPageView extends React.Component<WithDispatch<Props>> {
  componentDidMount() {
    const {fullName, dispatch} = this.props;
    dispatch(FetchRepo(fullName));
    dispatch(FetchStargazers({fullName}));
  }

  render() {
    const {fullName, repoWithOwner, stargazers, pagination, dispatch} = this.props;

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
        <List<User>
          items={stargazers}
          isFetching={pagination.isFetching}
          nextPageUrl={pagination.nextPageUrl}
          onLoadMoreClick={url => dispatch(FetchStargazers({fullName, nextPageUrl: url}))}
          loadingLabel={`Loading stargazers of ${fullName}...`}
        >
          {user => <UserItem key={user.login} user={user} />}
        </List>
      </div>
    );
  }
}

export const mapStateToProps = (state: State, {match}: WrapperProps) => {
  const {login, name} = match.params;
  const fullName = `${login}/${name}`;
  const stargazers = getStargazers(state, fullName);
  const pagination = getStargazersPagination(state, fullName);
  const repo = getRepo(state, fullName);
  const repoWithOwner =
    repo == null
      ? null
      : {
          repo,
          owner: getUser(state, repo.owner)!,
        };

  return {
    fullName,
    repoWithOwner,
    stargazers,
    pagination: pagination || newPagination(),
  };
};

export const RepoPage = connect(mapStateToProps)(RepoPageView);
