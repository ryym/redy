import {History} from 'history';
import {defineEffects, handle} from 'redy';
import {Effect} from './type';
import {Search} from '../../actions';

export const updatePath = (history: History): Effect<typeof Search> => {
  return path => {
    console.log('UPDATE PATH', path);
    history.push(`/${path}`);
  };
};

export const routerEffects = (history: History) =>
  defineEffects([handle(Search, updatePath(history))]);
