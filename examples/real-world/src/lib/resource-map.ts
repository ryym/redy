type Content<V> = {[key: string]: V};

export class ResourceMap<V> {
  constructor(private map: Content<V> = {}) {}

  add(key: string, value: V): ResourceMap<V> {
    this.map = {
      ...this.map,
      [key]: value,
    };
    return this;
  }

  merge(other: Content<V>): ResourceMap<V> {
    this.map = {
      ...this.map,
      ...other,
    };
    return this;
  }

  content(): Content<V> {
    return this.map;
  }
}
