import {SFC} from 'react';
import {Dispatch} from 'redux';
import {connect as reduxConnect, ConnectedComponent} from 'react-redux';
import {State} from './state';

export type WithDispatch<P extends {}> = P & {dispatch: Dispatch};

export function connect<WrapperProps extends {}, Props extends {} = {}>(
  mapStateToProps: (state: State, props: WrapperProps) => Props,
  WrappedComponent: SFC<WithDispatch<Props>>,
): ConnectedComponent<SFC<WithDispatch<Props>>, WrapperProps> {
  return (reduxConnect as any)(mapStateToProps)(WrappedComponent);
}
