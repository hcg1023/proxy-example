import { describe, test, vi, expect } from 'vitest';
import { autorun, observable } from './index';

describe('simple mobx', () => {
  test('reactive object', () => {
    const reactiveObject = observable({
      name: 'reactive',
    });

    let result = '';
    const mockFn = vi.fn(() => {
      result = reactiveObject.name;
    });
    autorun(mockFn);
    expect(result).toBe('reactive');
    reactiveObject.name = 'mobx';
    expect(result).toBe('mobx');
    expect(mockFn.mock.calls.length).toBe(2);
  });

  test('reactive array', () => {
    const reactiveArray = observable([1]);

    let lastItem;
    const mockFn = vi.fn(() => {
      lastItem = reactiveArray[reactiveArray.length - 1];
    });
    autorun(mockFn);
    expect(lastItem).toBe(1);
    reactiveArray.push(2);
    expect(lastItem).toBe(2);
  });
});
