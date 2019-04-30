import React from 'react';
import ReactDOM from 'react-dom';
import {createStore, applyMiddleware, Dispatch} from 'redux';
import {Provider, connect} from 'react-redux';
import logger from 'redux-logger';
import {action, effect, defineReducer, on, redyMiddleware, Thunk} from 'redy';

type State = {count: number};

const Increment = action('INCREMENT', (n: number) => n);

const Decrement = action('DECREMENT', (n: number) => n);

const IncrementAsync = effect(
  'INCREMENT_ASYNC',
  ({n, ms}: {n: number; ms: number}): Thunk<State> => async (dispatch, state) => {
    console.log('increment async', state().count);
    setTimeout(() => dispatch(Increment(n)), ms);
  },
);

const reducer = defineReducer({count: 0}, [
  on(Increment, ({count}, n) => ({count: count + n})),
  on(Decrement, ({count}, n) => ({count: count - n})),
]);

const store = createStore(reducer, applyMiddleware(logger, redyMiddleware()));

type Props = {
  count: number;
  dispatch: Dispatch;
};

const Counter = ({count, dispatch}: Props) => {
  return (
    <div>
      <h1>count: {count}</h1>
      <button onClick={() => dispatch(Increment(3))}>Increment 3</button>
      <button onClick={() => dispatch(Decrement(2))}>Decrement 2</button>
      <button onClick={() => dispatch(IncrementAsync({n: 10, ms: 800}))}>Increment Async</button>
    </div>
  );
};

const ConnectedCounter = connect((state: State) => state)(Counter);

ReactDOM.render(
  <Provider store={store}>
    <ConnectedCounter />
  </Provider>,
  document.getElementById('root'),
);
