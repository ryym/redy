# Redy

Yet another [Redux](https://redux.js.org/) wrapper.

- Type safe
- Less boilerplate
    - No action type constants
    - No action union types

## Counter Example

### Store

```typescript
import {createStore, applyMiddleware} from 'redux';
import {action, effect, defineReducer, on, redyMiddleware, Thunk} from 'redy';

export type State = {count: number};

export type MyThunk<R = void> = Thunk<State, R>;

// Action creators
// An action creator returns an action or effect (thunk).

export const Increment = action('INCREMENT', (n: number) => n);

export const Decrement = action('DECREMENT', (n: number) => n);

export const IncrementAsync = effect(
  'INCREEMNT_ASYNC',
  (n: number) => async dispatch => {
    setTimeout(() => dispatch(Increment, n), 1000)
  }
);

// Reducer
// We cannot use switch statements for reducers type safely because
// we don't have a union type of actions. Instead, Redy provide
// the `defineReducer` and `on` functions. They allow us to
// construct a reducer type safely without switch statements.

const initialState = {count: 0};

const reducer = defineReducer(initialState, [
  // on(actionCreator, (state, payload) => nextState)
  on(Increment, ({count}, n) => ({count: count + n})),
  on(Decrement, ({count}, n) => ({count: count - n})),
]);

// console.log(reducer({count: 7}, {type: 'INCREMENT', payload: 3}));
// => { count: 10 }

// Store
// Do not forget to use `redyMiddleware` to handle effects.

export configureStore = () => createStore(reducer, applyMiddleware(redyMiddleware));
```

### Component

```typescript
import React from 'react';
import ReactDOM from 'react-dom';
import {Dispatch} from 'redux';
import {connect, Provider} from 'react-redux';
import {configureStore, Increment, Decrement, IncrementAsync, State} from './store';

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
      <button onClick={() => dispatch(IncrementAsync(10))}>Increment Async</button>
    </div>
  );
};

const ConnectedCounter = connect((state: State) => state)(Counter);

const store = configureStore();

ReactDOM.render(
  <Provider store={store}>
    <ConnectedCounter />
  </Provider>,
  document.getElementById('root'),
);
```

You can define action creator which creates both of an action and effect as well
using `actionEffect`.

```typescript
import {actionEffect} from 'redy';

// Register a function which returns an array of the action and the thunk.
const Increment2 = actionEffect('INCREMENT2', (n: number) => [
  n,
  async (_dispatch, _getState) => {
    console.log('increment2 fired!', n);
  },
]);
```
