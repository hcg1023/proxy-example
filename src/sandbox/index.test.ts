import { describe, test, expect, vi } from 'vitest';
import { createSandBoxFunction } from './index';

describe('test sandbox', () => {
  test('测试沙盒访问值', () => {
    test('沙盒函数返回值, 确保沙盒中的return生效', () => {
      const fn = createSandBoxFunction(`return 1`);
      expect(() => fn()).toBe(1);
    });

    test('沙盒访问全局变量', () => {
      const fn = createSandBoxFunction(`
                return console
            `);
      // 全局console有值
      expect(console).toBeDefined();
      // 但是函数内访问为undefined
      expect(() => fn()).toBe(undefined);
    });
  });

  test('测试沙盒设置变量值', () => {
    const log = vi.fn();

    createSandBoxFunction(
      `
            globalThis.a = 123;
            log(globalThis.a);
            log(a);
        `,
      {
        log,
      },
    )();

    expect(log.mock.calls.length).toBe(2);
    expect(log.mock.calls[0]).toEqual([123]);
    expect(log.mock.calls[1]).toEqual([123]);
  });

  test('测试沙盒设置contextObject值', () => {
    const log = vi.fn();
    const contextObject: Record<string, any> = {
      log,
      flag: 1,
    };

    createSandBoxFunction(
      `
            flag = 3;
            log(flag)
        `,
      contextObject,
    )();

    expect(log.mock.calls.length).toBe(1);
    expect(log.mock.calls[0]).toEqual([3]);
    expect(contextObject.flag).toBe(3);

    createSandBoxFunction(
      `
            log(flag);
            flag = 5;
        `,
      contextObject,
    )();
    expect(log.mock.calls.length).toBe(2);
    expect(log.mock.calls[1]).toEqual([3]);
    expect(contextObject.flag).toBe(5);
  });

  test('测试删除共享变量的值', () => {
    const warn = vi.spyOn(console, 'warn');

    const contextObject: Record<string, any> = {
      flag: 1,
    };

    createSandBoxFunction(
      `
            delete window.flag;
        `,
      contextObject,
    )();
    expect(warn.mock.calls.length).toBe(1);
    expect(warn.mock.calls[0]).toEqual([`context object property: 'flag' can't delete`]);
  });
});
