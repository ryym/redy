import React from 'react';
import ReactDOM from 'react-dom';
import {createStore, applyMiddleware, Dispatch} from 'redux';
import {Provider, connect} from 'react-redux';
import logger from 'redux-logger';
import {defineActions, effect, defineReducer, on, redyMiddleware, Thunk} from 'redy';

type State = {count: number};

const actions = defineActions('counter', {
  Increment: (n: number) => n,

  Decrement: (n: number) => n,

  IncrementAsync: effect(
    ({n, ms}: {n: number; ms: number}): Thunk<State> => async (dispatch, state) => {
      console.log('increment async', state().count);
      setTimeout(() => dispatch(actions.Increment(n)), ms);
    },
  ),
});

const reducer = defineReducer({count: 0}, [
  on(actions.Increment, ({count}, n) => ({count: count + n})),
  on(actions.Decrement, ({count}, n) => ({count: count - n})),
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
      <button onClick={() => dispatch(actions.Increment(3))}>Increment 3</button>
      <button onClick={() => dispatch(actions.Decrement(2))}>Decrement 2</button>
      <button onClick={() => dispatch(actions.IncrementAsync({n: 10, ms: 800}))}>
        Increment Async
      </button>
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
