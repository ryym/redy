# Redy

[![status](https://github.com/ryym/redy/workflows/Test/badge.svg)](https://github.com/ryym/redy/actions?query=workflow%3ATest)

Redy is a yet another [Redux](https://redux.js.org/) wrapper to use Redux with ease.

Features:

- Type safe
- Less boilerplate

## What it looks like

(See the next [Overview](#overview) section for the detailed usage)

### Store

Redy changes:

- how you define action creators
- how you define a reducer

```typescript
import {createStore, applyMiddleware, Dispatch} from 'redux';
import {defineActions, effect, defineReducer, on, redyMiddleware, Thunk} from 'redy';

export type State = {count: number};

// 1. Define action creators.
export const actions = defineActions('counter', {
  Increment: (n: number) => n,

  Double: () => {},

  IncrementAsync: effect(
    ({n, ms}: {n: number; ms: number}): Thunk<State> => async (dispatch, state) => {
      console.log('increment async', state().count);
      setTimeout(() => dispatch(actions.Increment(n)), ms);
    },
  ),
});

// 2. Define a reducer.
const reducer = defineReducer({count: 0}, [
  on(actions.Increment, ({count}, n) => {
    return {count: count + n};
  }),

  on(actions.Double, ({count}) => {
    return {count: count * 2};
  }),
]);

// 3. Create a store.
export const store = createStore(reducer, applyMiddleware(redyMiddleware()));
```

### Component

It has no differences with the normal Redux usage.

```typescript
import React from 'react';
import ReactDOM from 'react-dom';
import {Provider, connect} from 'react-redux';
import {State, store, actions} from './store';

type Props = {
  count: number;
  dispatch: Dispatch;
};

const Counter = ({count, dispatch}: Props) => {
  return (
    <div>
      <h1>count: {count}</h1>
      <button onClick={() => dispatch(actions.Increment(3))}>
        Increment 3
      </button>
      <button onClick={() => dispatch(actions.Double())}>
        Double
      </button>
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
```

## Overview

### Action creators

Redy lets you define action creators as a group using `deifneActions`.

```typescript
import {defineActions} from 'redy'

const counterActions = defineActions('counter', {
  Increment: (n: number) => n,
  Double: () => {},
})

console.log(counterActions.Increment(5))
//=> { type: 'counter/Increment', payload: 5 }

console.log(counterActions.Increment.actionType)
//=> 'counter/Increment'
```

The `defineActions`  function converts each function to an action creator.
It determines the action type automatically from the function name.
Thus you don't need to define an action type explicitly.  
Also Redy recommend not defining a union type of actions.
We think a reducer function could be type safe sufficiently without a union type.

### Reducer

Redy provides `defineReducer`  and `on`  to create a reducer in type-safe manner without an action union type.

```typescript
import {defineReducer, on} from 'redy'
import {todoActions} from './actions'

const initialState = []
export const reducer = defineReducer(initialState, [
  on(todoActions.Add, (todos, { id, title }) => {
    const todo = { id, title, completed: false }
    return [...todos, todo]
  }),

  on(todoActions.Remove, (todos, id) => {
      return todos.filter(todo => todo.id !== id)
  }),

  // on(actionCreator, (state, payload) => state)
])

console.log(reducer(undefined, {type: '_init_'}))
//=> []

console.log(reducer([], todoActions.Add(1, 'Buy milk')))
//=> [{id: 1, title: 'Buy milk'}]
```

Additionally Redy provides `onAny` to handle multiple actions with a single handler.

```typescript
import {defineReducer, onAny} from 'redy'
import {actions} from './actions'

defineReducer({}, [
  onAny([actions.FetchFollowerDone, actions.FetchFolloweeDone], (users, {user}) => {
      return {...users, [user.id]: user}
  })
])
```

### Effect

[redux-thunk]: https://github.com/reduxjs/redux-thunk

Redy uses the [redux-thunk][redux-thunk] pattern for effect handling.

```typescript
import {defineActions, effect, Thunk} from 'redy'
import {User, userApi} from './user'

type State = {[id: number]: User}

const userActions = defineActions('users', {
  Fetch: effect(
    (id: number): Thunk<State> => async (dispatch, getState) => {
      const users = getState()
      if (users[id] == null) {
        const user = await userApi.findById(id)
        dispatch(userActions.FetchOk(user))
      }
    }
  ),

  FetchOk: (user: User) => user,

  // ...
})
```

### Store

The only thing you need to do is applying `redyMiddleware`.
It handles the effect actions.

```typescript
import {Store, applyMiddleware, createStore} from 'redux'
import {redyMiddleware} from 'redy'
import {reducer} from './reducer'
import {State} from './state'

export const configureStore = (): Store<State> => {
  return createStore(reducer, applyMiddleware(redyMiddleware()))
}
```
