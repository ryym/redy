import React from 'react';
import {render} from 'react-dom';
import {createBrowserHistory} from 'history';
import {App} from './components/App';

const history = createBrowserHistory();

render(<App history={history} />, document.getElementById('root'));
