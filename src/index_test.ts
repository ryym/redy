import {combineReducers, createStore, applyMiddleware} from 'redux';
import {defineActions, effect, defineReducer, on, redyMiddleware} from './';

it('works with Redux', async () => {
  type Product = string;
  type State = {
    products: Product[];
  };

  // Define actions.
  const $products = defineActions('products', {
    Replace: (products: Product[]) => products,

    Add: (product: Product) => product,

    Fetch: effect((count: number) => dispatch => {
      return new Promise(resolve =>
        setTimeout(() => {
          const products = [...new Array(count)].map((_, i) => `product${i}`);
          dispatch($products.Replace(products));
          resolve();
        }),
      );
    }),
  });

  // Define reducer.
  const initialProducts: Product[] = [];
  const reduceProducts = defineReducer<Product[]>(initialProducts, [
    on($products.Replace, (_, products) => products),
    on($products.Add, (products, product) => [...products, product]),
  ]);

  // Create store.
  const reducer = combineReducers({products: reduceProducts});
  const store = createStore(reducer, applyMiddleware(redyMiddleware()));

  expect(store.getState()).toEqual({products: []});

  await store.dispatch($products.Fetch(2)).promise();
  expect(store.getState()).toEqual({products: ['product0', 'product1']});

  store.dispatch($products.Add('gameboy'));
  expect(store.getState()).toEqual({products: ['product0', 'product1', 'gameboy']});
});
