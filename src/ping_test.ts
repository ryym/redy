import {ping} from './ping';

describe('ping', () => {
  it('responds', () => {
    expect(ping('alice')).toBe('Hello, alice');
  });
});
