import { describe, expect, test } from 'vitest';
import { ProxyPerson } from './index';

describe('proxy mode', () => {
  test('', () => {
    const person = new ProxyPerson('张三', 15);
    expect(() => (person.age = -1)).toThrowError(`年龄不能小于0`);
  });
});
