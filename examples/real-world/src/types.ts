import {Thunk as RedyThunk} from 'redy';
import {History} from 'history';
import {State} from './state';

export type ThunkContext = Readonly<{
  history: History;
}>;

export type Thunk<R = void> = RedyThunk<State, R, ThunkContext>;
