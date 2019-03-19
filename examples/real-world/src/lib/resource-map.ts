// export class ResourceMap<V> {
//   constructor(private map: Content<V> = {}) {}

//   add(key: string, value: V): ResourceMap<V> {
//     this.map = {
//       ...this.map,
//       [key]: value,
//     };
//     return this;
//   }

//   merge(other: Content<V>): ResourceMap<V> {
//     this.map = {
//       ...this.map,
//       ...other,
//     };
//     return this;
//   }

//   content(): Content<V> {
//     return this.map;
//   }
// }

type MapRef<V> = {_resource_map_ref_: null};

export interface ResourceMap<V> {
  init(): MapRef<V>;
  getValue<V>(key: string, ref: MapRef<V>): V | null;
  add<V>(key: string, value: V, ref: MapRef<V>): MapRef<V>;
  merge<V>(other: {[key: string]: V}, ref: MapRef<V>): MapRef<V>;
}

// XXX: selector でも必要。 normalizeKey と composable にするのはむずそう
// (グローバルにするしかない)
export const makeResourceWrapper = <V>(normalizeKey: (key: string) => string): ResourceMap<V> => {
  return {
    init: () => ({_resource_map_ref_: null}),

    getValue: (key, ref) => (ref as any)[normalizeKey(key)],

    add: (key, value, ref) => ({
      ...ref,
      [normalizeKey(key)]: value,
    }),

    merge: (other, ref) => ({...ref, ...other}),
  };
};
