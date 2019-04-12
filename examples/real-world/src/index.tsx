import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'redy';
import {createBrowserHistory} from 'history';
import {configureStore} from './store';
import {App} from './components/App';

const history = createBrowserHistory();
const store = configureStore(history);

ReactDOM.render(
  <Provider store={store}>
    <App history={history} />
  </Provider>,
  document.getElementById('root'),
);
