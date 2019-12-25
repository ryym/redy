import React from 'react';
import {Router, Route} from 'react-router-dom';
import {History} from 'history';
import {Explore} from './Explore';
import {UserPage} from './UserPage';
import {RepoPage} from './RepoPage';

export type Props = Readonly<{
  history: History;
}>;

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
