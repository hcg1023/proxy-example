import { describe, test, expect, vi, Mock } from 'vitest';
import { oc } from './index';

describe('test oc', () => {
  test('oc value is function', () => {
    const mockFn = vi.fn(() => 'mock') as Mock<any, any> & { flag: number };
    mockFn.flag = 1;

    const obj = {
      mockFn,
    };

    expect(oc(obj).mockFn()!()).toBe('mock');
    expect(oc(obj).mockFn()!.flag).toBe(1);
    expect(oc(obj).mockFn.flag()).toBe(undefined); // undefined
    // expect(oc(obj).mockFn.flag()).toBe(1) // 1
  });

  test('oc call function', () => {
    expect(oc(undefined as any).xx()).toBe(undefined);

    const mockFn = vi.fn() as Mock<any, any> & { flag: number };
    mockFn.flag = 1;

    expect(oc(mockFn).flag()).toBe(undefined);
    // expect(oc(mockFn).flag()).toBe(1)
  });
});
