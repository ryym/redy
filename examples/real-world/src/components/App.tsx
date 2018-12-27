import React from 'react';
import {Router, Route} from 'react-router-dom';
import {History} from 'history';
import {Explore} from './Explore';
import {UserPage} from './UserPage';
import {RepoPage} from './RepoPage';

import {fetchStarred} from '../lib/api';

export type Props = Readonly<{
  history: History;
}>;

// XXX: なぜか/RYYM -> /ryym. Chrome がやってる？？？

export const App = ({history}: Props) => {
  return (
    <Router history={history}>
      <div>
        <Explore />
        <Route exact path="/:login" component={UserPage} />
        <Route exact path="/:login/:name" component={RepoPage} />
      </div>
    </Router>
  );
};
