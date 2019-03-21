import * as React from 'react';
import {Store, Dispatch as ReduxDispatch} from 'redux';
import {
  Provider as ReduxProvider,
  ReactReduxContext,
  ConnectedComponentClass,
  connect as reduxConnect,
} from 'react-redux';
import {Dispatch, wrapDispatch} from './redy';

const RedyContext = React.createContext<Dispatch | null>(null);

export type RedyProviderProps = {
  store: Store;
  children: any;
};

export const RedyProvider = ({store, children}: RedyProviderProps) => {
  const wrappedDispatch = wrapDispatch(store.dispatch);
  return <RedyContext.Provider value={wrappedDispatch}>{children}</RedyContext.Provider>;
};

export type ProviderProps = {
  store: Store;
  children: any;
};

export const Provider = ({store, children}: ProviderProps) => {
  return (
    <ReduxProvider store={store}>
      <RedyProvider store={store}>{children}</RedyProvider>
    </ReduxProvider>
  );
};

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

export function withDispatcher<P extends {dispatch?: Dispatch}, K extends keyof P>(
  Component: React.ComponentType<P>,
): React.ComponentType<Omit<P, 'dispatch'>> {
  return (props: Omit<P, 'dispatch'>) => {
    const dispatch = React.useContext(RedyContext);
    if (dispatch == null) {
      throw new Error('Please wrap your component by Provider');
    }

    const propsWithDispatch = {...props, dispatch} as P;
    return <Component {...propsWithDispatch} />;
  };
}

// XXX: react-redux's connect is too complicated.
export function connect<P, State, OwnProps>(
  mapStateToProps: (state: State, ownProps: OwnProps) => P,
) {
  return <C extends React.ComponentType<P & {dispatch: Dispatch}>>(
    component: C,
  ): ConnectedComponentClass<C, OwnProps> => {
    return reduxConnect(mapStateToProps)(withDispatcher(component) as any) as any;
  };
}
