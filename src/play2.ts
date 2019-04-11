import {createStore, AnyAction, applyMiddleware} from 'redux';
import {defineReducer, on, redyMiddleware, Thunk, wrapDispatch, action, effect} from './redy2';

type State = {count: number};
type MyThunk<R = void> = Thunk<State, R, number[]>;

const Increment = (n: number) => action(n);

const Increment2 = (n: number) =>
  action(n).effect<MyThunk>(async (d, state) => {
    console.log('increment2!!!', state().count);
  });

const IncrementAsync = (n: number, ms: number) =>
  effect<MyThunk<number[]>>(async (dispatch, getState) => {
    setTimeout(() => {
      console.log('async fire', getState().count);
      dispatch(Increment, n);
    }, ms);
    return [99, 98];
  });

const initialState = {count: 0};

const reducer = defineReducer(initialState, [
  on(Increment, ({count}, n) => ({
    count: count + n,
  })),

  on(Increment2, ({count}, n) => ({
    count: count + n,
  })),

  on(IncrementAsync, ({count}) => ({
    count,
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

console.log('initial state', store.getState());

const dispatch = wrapDispatch(store.dispatch);

console.log(dispatch(Increment, 1));

console.log(dispatch(IncrementAsync, 100, 1000));

console.log('check promise', typeof dispatch(Increment, 3).promise);
dispatch(IncrementAsync, 50, 300).promise.then(ar => console.log('show===================', ar[0]));

console.log(dispatch(Increment, 3));

console.log(store.dispatch({type: 'HOGE'}));

console.log(store.getState());
console.log(store.getState());
