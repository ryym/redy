import {ACTION_META_KEY} from './actionCreator';
import {defineActions, effect, effectUsing} from './actionDefiner';

it('accepts empty definition', () => {
  const creators = defineActions('test', {});
  expect(creators).toEqual({});
});

it('creates action creators', () => {
  const creators = defineActions('test', {
    Increment: () => {},
    FetchUser: (id: number) => id,
    SearchItems: (keyword: string, score: number) => ({keyword, score}),
  });

  expect(creators.Increment()).toEqual({
    type: 'test/Increment',
    payload: undefined,
    meta: {},
  });

  expect(creators.FetchUser(34)).toEqual({
    type: 'test/FetchUser',
    payload: 34,
    meta: {},
  });

  expect(creators.SearchItems('foo', 58)).toEqual({
    type: 'test/SearchItems',
    payload: {keyword: 'foo', score: 58},
    meta: {},
  });
});

it('creates effect creators as well', () => {
  const creators = defineActions('test', {
    DoNothing: () => {},

    DoEffect: effect((_name: string) => async _dispatch => {}),

    DoEffect2: effectUsing(
      () => ({key: 'abc'}),
      ({key}) => (id: number) => async dispatch => {
        dispatch({type: 'SomeAction', key, id});
      },
    ),
  });

  expect(creators.DoNothing()).toEqual({
    type: 'test/DoNothing',
    payload: undefined,
    meta: {},
  });

  expect(creators.DoEffect('hello')).toEqual({
    type: 'test/DoEffect',
    payload: undefined,
    meta: {
      [ACTION_META_KEY]: {args: ['hello']},
    },
  });

  expect(creators.DoEffect2(6)).toEqual({
    type: 'test/DoEffect2',
    payload: undefined,
    meta: {
      [ACTION_META_KEY]: {args: [6]},
    },
  });
});

it('allows to run effect directly', async () => {
  const creators = defineActions('test', {
    Greet: effect((name: string) => async () => {
      return `Hello ${name}!`;
    }),
  });

  const result = await creators.Greet.run('Redy')();

  // Use .length to ensure the result type is inferred.
  expect([result, result.length]).toEqual(['Hello Redy!', 11]);
});

it('allows to inject dependencies for effect', async () => {
  const creators = defineActions('test', {
    FetchCurrentMonth: effectUsing(
      () => new Date(),
      current => () => async () => {
        return current.getMonth() + 1;
      },
    ),
  });

  const actualMonth = await creators.FetchCurrentMonth.run()();
  expect(actualMonth).toBeLessThan(13);

  const fakeCurrent = new Date('2045-08-16');
  const controlledMonth = await creators.FetchCurrentMonth.using(fakeCurrent)()();
  expect(controlledMonth).toEqual(8);
});
