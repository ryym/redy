import React from 'react';
import ReactDOM from 'react-dom';
import {createStore, applyMiddleware} from 'redux';
import {defineReducer, on, redyMiddleware, Dispatch, Thunk, connect, Provider} from 'redy';

const Increment = (n: number) => n;

const Decrement = (n: number) => n;

const IncrementAsync = (ms: number): Thunk<number> => async dispatch => {
  setTimeout(() => dispatch(Increment, 10), ms);
};

const reducer = defineReducer(0, [
  on(Increment, (cnt, n) => cnt + n),
  on(Decrement, (cnt, n) => cnt - n),
]);

const store = createStore(reducer, applyMiddleware(redyMiddleware()));

type Props = {
  count: number;
  dispatch: Dispatch;
};

const Counter = function(props: Props) {
  return (
    <div>
      <h1>count: {props.count}</h1>
      <button onClick={() => props.dispatch(Increment, 3)}>Increment 3</button>
      <button onClick={() => props.dispatch(Decrement, 2)}>Decrement 2</button>
      <button onClick={() => props.dispatch(IncrementAsync, 800)}>Increment Async</button>
    </div>
  );
};

const ConnectedCounter = connect((n: number) => ({count: n}))(Counter);

ReactDOM.render(
  <Provider store={store}>
    <ConnectedCounter />
  </Provider>,
  document.getElementById('root'),
);
