import { describe, test, expect, vi } from 'vitest';
import { createValidatedObject, isBoolean, isNumber, isString } from './index';

describe('validated object', () => {
  test('validate', () => {
    const symbols = {
      name: isString,
      age: isNumber,
      sex: isString,
      isAdmin: isBoolean,
    };

    const obj = createValidatedObject(
      {
        name: '张三',
        age: 15,
        sex: '男',
        isAdmin: false,
      },
      symbols,
    );

    obj.name = '李四';
    expect(obj.name).toBe('李四');

    expect(obj.age).toBe(15);
    obj.age = 20;
    expect(obj.age).toBe(20);
  });

  test('set a not valid value', () => {
    const symbols = {
      age: isNumber,
    };

    const obj = createValidatedObject(
      {
        age: 15,
      },
      symbols,
    );

    const warn = vi.spyOn(console, 'warn');
    expect(() => ((obj as any).age = '1')).toThrowError();
    expect(warn.mock.calls.length).toBe(1);
    expect(warn.mock.calls[0][0]).toBe(`property: 'age' is not a number`);
  });
});
