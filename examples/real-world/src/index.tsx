import React from 'react';
import {render} from 'react-dom';
import {Provider} from 'react-redux';
import {createBrowserHistory} from 'history';
import {configureStore} from './store';
import {App} from './components/App';

import './lib/api';

const history = createBrowserHistory();
const store = configureStore(history);

render(
  <Provider store={store}>
    <App history={history} />
  </Provider>,
  document.getElementById('root'),
);
