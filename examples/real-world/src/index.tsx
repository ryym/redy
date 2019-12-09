import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {createBrowserHistory} from 'history';
import {configureStore} from './store';
import {App} from './components/App';

const history = createBrowserHistory();
const store = configureStore(history);

import {configureStore as configureStore2} from './store/index';
import {githubAction} from './store/github/actions';

// const store2 = configureStore2(history);
// console.log(store2);
// store2.dispatch(githubAction.FetchUser('ryym'));

ReactDOM.render(
  <Provider store={store}>
    <App history={history} />
  </Provider>,
  document.getElementById('root'),
);
