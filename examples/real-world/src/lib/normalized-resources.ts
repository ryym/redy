import {normalizeKey} from './normalizers';

// GitHub's API may return results with uppercase letters while the query
// doesn't contain any. For example, "someuser" could result in "SomeUser"
// leading to a frozen UI as it wouldn't find "someuser" in the entities.
//
// So we need to store users and repositories case insensitively.
// But it is bug-prone if you need to convert a user/repository name everytime
// you read/write it. However also implementing a custom map class is not a good idea
// because Redux encourages storing state as a plain object and many plugins assumes that.
//
// So, we use custom type `MapRef` to:
// - store values in a plain object
// - prevent direct access to that plain object in compile time
//   (to do so, you need to enable `strict` option in TypeScript)
//
// This allows us to:
// - use plain object for Redux state
// - unify accesses to resources and normalize resource names automatically

export type MapRef<V> = {_resource_map_ref_: null};

class ResourceAccessor {
  constructor(private normalizeKey: (key: string) => string) {}

  init = <V>(): MapRef<V> => {
    const key = '_resource_map_ref_';

    // Without this TypeScript cannot confirm that the key exists.
    const map = {[key]: null};

    Object.defineProperty(map, key, {
      value: null,
      writable: false,
      enumerable: false,
    });
    return map;
  };

  getValue = <V>(ref: MapRef<V>, key: string): V | null => {
    return (ref as any)[this.normalizeKey(key)];
  };

  add = <V>(ref: MapRef<V>, key: string, value: V): MapRef<V> => ({
    ...ref,
    [this.normalizeKey(key)]: value,
  });

  update = <V>(ref: MapRef<V>, key: string, f: (v: V | null) => V) => {
    return this.add(ref, key, f(this.getValue(ref, key)));
  };

  merge = <V>(ref: MapRef<V>, other: {[key: string]: V}) => ({...ref, ...other});
}

export const githubResources = new ResourceAccessor(normalizeKey);
