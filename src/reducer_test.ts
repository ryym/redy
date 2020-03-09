import {combineReducers} from 'redux';
import {defineActions} from './actionDefiner';
import {defineReducer, on, onAny} from './reducer';

it('accepts empty definition', () => {
  const reduce = defineReducer(0, []);
  expect(reduce(undefined, {type: '_'})).toEqual(0);
});

it('creates reducer function', () => {
  const $counter = defineActions('counter', {
    Increment: (n: number) => n,
    Double: () => {},
  });

  const reduce = defineReducer(0, [
    on($counter.Increment, (cnt, n) => cnt + n),
    on($counter.Double, cnt => cnt * 2),
  ]);

  expect(reduce(2, $counter.Increment(3))).toEqual(5);
  expect(reduce(7, $counter.Double())).toEqual(14);

  const $unknown = defineActions('somewhere', {
    UnknownAction: (n: number) => n,
  });
  expect(reduce(10, $unknown.UnknownAction(5))).toEqual(10);
});

it('handles multiple actions by same function', () => {
  type Hi = {
    name: string;
    hi: number;
  };
  type Hello = {
    name: string;
    hello: number;
  };

  const $greet = defineActions('greet', {
    Hi: (hi: Hi) => hi,
    Hello: (hello: Hello) => hello,
    GoodBye: () => {},
  });

  const reduce = defineReducer('', [
    onAny([$greet.Hi, $greet.Hello], (me, greet) => {
      return `Hi ${greet.name}, I am ${me}!`;
    }),
    on($greet.GoodBye, () => 'See you again!'),
  ]);

  expect(reduce('', $greet.GoodBye())).toEqual('See you again!');
  expect(reduce('Alice', $greet.Hi({name: 'Bob', hi: 0}))).toEqual('Hi Bob, I am Alice!');
  expect(reduce('Alice', $greet.Hello({name: 'Bob', hello: 0}))).toEqual('Hi Bob, I am Alice!');
});

it('is combinable', () => {
  const reduceN = defineReducer(0, []);
  const reduceS = defineReducer('', []);
  const reduce = combineReducers({n: reduceN, s: reduceS});

  expect(reduce(undefined, {type: '_'})).toEqual({n: 0, s: ''});
});
