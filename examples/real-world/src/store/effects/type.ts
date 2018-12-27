import {Effect as RedyEffect} from 'redy';
import {State} from '../../state';

export type Effect<P, R = void> = RedyEffect<State, P, R>;
