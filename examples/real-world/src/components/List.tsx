import React from 'react';

export type Props<I> = {
  children: (item: I) => any;
  items: I[];
  isFetching: boolean;
  nextPageUrl: string | null;
  onLoadMoreClick: (url: string) => void;
  loadingLabel: string;
};

// Note about `<I extends any>`:
// This is necessary to prevent TypeScript from parsing `<I>` as JSX.
// https://github.com/Microsoft/TypeScript/issues/4922
export const List = <I extends any>(props: Props<I>) => {
  if (props.items.length === 0) {
    if (props.isFetching) {
      return (
        <h2>
          <i>{props.loadingLabel}</i>
        </h2>
      );
    } else {
      return (
        <h1>
          <i>Nothing here!</i>
        </h1>
      );
    }
  }

  const {nextPageUrl} = props;
  return (
    <div>
      {props.items.map(props.children)}
      {nextPageUrl && (
        <button
          style={{fontSize: '150%'}}
          onClick={() => props.onLoadMoreClick(nextPageUrl)}
          disabled={props.isFetching}
        >
          {props.isFetching ? 'Loading...' : 'Load More'}
        </button>
      )}
    </div>
  );
};
