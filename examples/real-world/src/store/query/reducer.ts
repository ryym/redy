import {defineReducer, on, onAny} from 'redy';
import {InputQuery, Search, FetchUser, FetchRepo} from '../../actions';

export const queryReducer = defineReducer('', [
  onAny([InputQuery, Search], (_, query) => query),

  on(FetchUser, (_, {login}) => login),

  on(FetchRepo, (_, {fullName}) => fullName),
]);
