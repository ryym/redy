import {createStore, AnyAction, applyMiddleware} from 'redux';
import {action, defineReducer, on, defineEffects, handle, effectMiddleware} from './redy';

const Increment = action('INCREMENT', (n: number) => n);
const IncrementOne = action('INCREMENT_ONE', () => {});

const initialState = {count: 0};

const reducer = defineReducer(initialState, [
  on(Increment, (state, n) => ({
    count: state.count + n,
  })),

  on(IncrementOne, state => ({
    count: state.count + 1,
  })),
]);

const effects = defineEffects([
  handle(Increment, async n => {
    console.log('HELLO', n);
    return 10;
  }),
]);

const logger = (store: any) => (next: any) => (action: any) => {
  console.group(action.type);
  console.info('dispatching', action);
  let result = next(action);
  console.log('next state', store.getState());
  console.groupEnd();
  return result;
};

const store = createStore(reducer, applyMiddleware(effectMiddleware(effects), logger));

console.log(store.getState());

// const dispatchCommand = wrapDispatcher(store.dispatch);
console.log(store.dispatch(Increment(1)));

console.log(store.dispatch({type: 'HOGE'}));

console.log(store.getState());
