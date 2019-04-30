import {createStore, applyMiddleware} from 'redux';
import {createLogger} from 'redux-logger';
import {action, effect, actionEffect, defineReducer, on, redyMiddleware, Thunk} from './redy';

type State = {count: number};

type MyThunk<R = void> = Thunk<State, R>;

const Increment = action('INCREMENT', (n: number) => n);
const Decrement = action('DECREMENT', (n: number) => n);

const IncrementAsync = effect(
  'INCREMENT_ASYNC',
  (n: number): MyThunk => async (dispatch, state) => {
    console.log('increment async', state());
    setTimeout(() => {
      dispatch(Increment(n));
    }, 500);
  },
);

const DecrementWithEffect = actionEffect('DECREMENT_WITH_EFFECT', (n: number) => [
  n,
  <MyThunk<boolean>>(async (dispatch, state) => {
    console.log('hogehoge', dispatch, state());
    return true;
  }),
]);

const reducer = defineReducer({count: 0}, [
  on(Increment, ({count}, n) => ({count: count + n})),
  on(Decrement, ({count}, n) => ({count: count - n})),
  on(DecrementWithEffect, ({count}, n) => ({count: count - n})),
  //   on(IncrementAsync, s => s), // This becomes compile error properly.
]);

const store = createStore(
  reducer,
  applyMiddleware(
    createLogger({colors: false, timestamp: false, collapsed: true}),
    redyMiddleware(),
  ),
);

store.dispatch(Increment(10));
store.dispatch(Decrement(3));
store.dispatch(IncrementAsync(5));
store.dispatch(Decrement(1));
store.dispatch(DecrementWithEffect(1));
