import React from 'react';
import {connect} from '../connect';
import {$search} from '../actions/search';

const GITHUB_REPO = 'https://github.com/ryym/redy';

export const Explore = connect(
  ({query}) => ({query}),

  function Explore({dispatch, query}) {
    const search = () => dispatch($search.Search(query));

    return (
      <div>
        <h1>Explore GitHub users and repos</h1>
        <div>
          <p>Type a username or repo full name and hit 'Go':</p>
          <input
            value={query}
            size={45}
            onChange={event => dispatch($search.InputQuery(event.target.value))}
            onKeyUp={event => (event.key === 'Enter' ? search() : null)}
          />
          <button onClick={search}>Go!</button>
        </div>
        <p>
          Code on{' '}
          <a href={GITHUB_REPO} target="_blank" rel="noopener noreferrer">
            Github
          </a>
          .
        </p>
        {/* TODO: Show error messages */}
      </div>
    );
  },
);
