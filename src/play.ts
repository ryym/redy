import {createStore, AnyAction, applyMiddleware} from 'redux';
import {defineReducer, on, redyMiddleware, Thunk, wrapDispatch} from './redy';

const Increment = (n: number) => n;

const IncrementAsync = (n: number, ms: number): Thunk<{count: number}, number[]> => async (
  dispatch,
  getState,
) => {
  setTimeout(() => {
    console.log('async fire', getState().count);
    dispatch(Increment, n);
  }, ms);
  return [99, 98];
};

const initialState = {count: 0};

const reducer = defineReducer(initialState, [
  on(Increment, ({count}, n) => ({
    count: count + n,
  })),
]);

const logger = (store: any) => (next: any) => (action: any) => {
  console.group(action.type);
  console.info('dispatching', action);
  let result = next(action);
  console.log('next state', store.getState());
  console.groupEnd();
  return result;
};

const store = createStore(reducer, applyMiddleware(logger, redyMiddleware()));

console.log(store.getState());

const dispatch = wrapDispatch(store.dispatch);

console.log(dispatch(Increment, 1));

console.log(dispatch(IncrementAsync, 100, 1000));

dispatch(Increment, 3).promise.then(n => console.log('show-------------', n));
dispatch(IncrementAsync, 50, 300).promise.then(ar => console.log('show===================', ar[0]));

// console.log(dispatch(Increment, 3));

// console.log(store.dispatch({type: 'HOGE'}));

// console.log(store.getState());
// console.log(store.getState());
