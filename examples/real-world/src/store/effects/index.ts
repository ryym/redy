import {History} from 'history';
import {effectMiddleware} from 'redy';
import {routerEffects} from './router';
import {githubEffects} from './github';

export const createEffectMiddleware = (history: History) => {
  return effectMiddleware(routerEffects(history), githubEffects());
};
