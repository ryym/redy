import React from 'react';
import ReactDOM from 'react-dom';
import {createStore, applyMiddleware} from 'redux';
import {
  action,
  effect,
  defineReducer,
  on,
  redyMiddleware,
  Dispatch,
  Thunk,
  connect,
  Provider,
} from 'redy';

type State = {count: number};

const Increment = (n: number) => action(n);

const Decrement = (n: number) =>
  action(n).effect(async () => {
    console.log('DECREMENT!!!', n);
  });

const IncrementAsync = ({n, ms}: {n: number; ms: number}) =>
  effect<Thunk<State>>(async dispatch => {
    setTimeout(() => dispatch(Increment, n), ms);
  });

const reducer = defineReducer({count: 0}, [
  on(Increment, ({count}, n) => ({count: count + n})),
  on(Decrement, ({count}, n) => ({count: count - n})),
]);

const store = createStore(reducer, applyMiddleware(redyMiddleware()));

type Props = {
  count: number;
  dispatch: Dispatch;
};

const Counter = ({count, dispatch}: Props) => {
  return (
    <div>
      <h1>count: {count}</h1>
      <button onClick={() => dispatch(Increment, 3)}>Increment 3</button>
      <button onClick={() => dispatch(Decrement, 2)}>Decrement 2</button>
      <button onClick={() => dispatch(IncrementAsync, {n: 10, ms: 800})}>Increment Async</button>
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
