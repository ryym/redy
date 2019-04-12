import React from 'react';
import {connect} from 'redy';
import {State} from '../state';
import {WithDispatch} from '../store';
import {InputQuery, Search} from '../actions';

const GITHUB_REPO = 'https://github.com/ryym/redy';

const KEY_CODE_ENTER = 13;

export type Props = Readonly<{
  query: string;
}>;

export const ExploreView = ({query, dispatch}: WithDispatch<Props>) => {
  const search = () => dispatch(Search, query);

  return (
    <div>
      <h1>Explore GitHub users and repos</h1>
      <div>
        <p>Type a username or repo full name and hit 'Go':</p>
        <input
          value={query}
          size={45}
          onChange={event => dispatch(InputQuery, event.target.value)}
          onKeyUp={event => (event.keyCode === KEY_CODE_ENTER ? search() : null)}
        />
        <button onClick={search}>Go!</button>
      </div>
      <p>
        Code on{' '}
        <a href={GITHUB_REPO} target="_blank">
          Github
        </a>
        .
      </p>
      {/* TODO: Show error messages */}
    </div>
  );
};

export const mapStateToProps = (state: State): Props => ({
  query: state.query,
});

export const Explore = connect(mapStateToProps)(ExploreView);
