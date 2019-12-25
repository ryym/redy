import React from 'react';

export type Props = Readonly<{
  children: unknown[];
  isFetching: boolean;
  nextPageUrl: string | null;
  onLoadMoreClick: (url: string) => void;
  loadingLabel: string;
}>;

export const List = ({children, isFetching, nextPageUrl, onLoadMoreClick, loadingLabel}: Props) => {
  if (children.length === 0) {
    if (isFetching) {
      return (
        <h2>
          <i>{loadingLabel}</i>
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

  return (
    <div>
      {children}
      {nextPageUrl && (
        <button
          style={{fontSize: '150%'}}
          onClick={() => onLoadMoreClick(nextPageUrl)}
          disabled={isFetching}
        >
          {isFetching ? 'Loading...' : 'Load More'}
        </button>
      )}
    </div>
  );
};
