import React from 'react';
import {connect} from 'react-redux';
import {match as Match} from 'react-router-dom';
import {State} from '../state';
import {WithDispatch} from '../store';
import {FetchUser, FetchStarred} from '../actions';
import {User, RepoWithOwner} from '../lib/models';
import {Pagination, newPagination} from '../lib/pagination';
import {getUser, getStarredRepos, getStarredPagination} from '../store/selectors';
import {List} from './List';
import {UserItem} from './UserItem';
import {RepoItem} from './RepoItem';

export type Props = Readonly<{
  login: string;
  user: User | null;
  starredRepos: RepoWithOwner[];
  pagination: Pagination<string>;
}>;

export type WrapperProps = Readonly<{
  match: Match<{login: string}>;
}>;

export type AllProps = WithDispatch<Props>;

export class UserPageView extends React.Component<AllProps> {
  componentDidMount() {
    this.loadUserData();
  }

  componentDidUpdate(prev: AllProps) {
    if (prev.login !== this.props.login) {
      this.loadUserData();
    }
  }

  // XXX: 既にデータがあるのに読み込んじゃう
  loadUserData() {
    const {login, dispatch} = this.props;
    dispatch(FetchUser(login));
    dispatch(FetchStarred(login));
  }

  render() {
    const {login, user, starredRepos, pagination, dispatch} = this.props;

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
          onLoadMoreClick={url => dispatch(FetchStarred(login, url))}
          loadingLabel={`Loading ${login}'s starred...'`}
        >
          {({repo, owner}) => <RepoItem key={repo.fullName} repo={repo} owner={owner} />}
        </List>
      </div>
    );
  }
}

export const mapStateToProps = (state: State, {match}: WrapperProps) => {
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

export const UserPage = connect(mapStateToProps)(UserPageView);
