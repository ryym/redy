import React from 'react';
import {Router, Route} from 'react-router-dom';
import {History} from 'history';
import {UserPage} from './UserPage';
import {RepoPage} from './RepoPage';

export type Props = {
  history: History;
};

export const App = ({history}: Props) => {
  return (
    <Router history={history}>
      <div>
        <h1>App</h1>
        <Route path="/:login" component={UserPage} />
        <Route path="/:login/:name" component={RepoPage} />
      </div>
    </Router>
  );
};
