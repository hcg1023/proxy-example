import { describe, expect, test } from 'vitest';

describe('', () => {
  const target = {} as Record<string, any>

  const revocable = Proxy.revocable(target, {
    get(_target, name) {
      return name;
    },
  });
  const proxy = revocable.proxy;

  test('测试name', () => {
    expect(proxy.foo).toBe('foo');
    console.log(proxy); // Proxy { [[Handler]]: Object; [[Target]]: Object; [[IsRevoked]]: false }
  });

  test('测试revoke', () => {
    revocable.revoke();
    // 这一句在浏览器端会log Proxy {}， 在node端不会，原因是在node端会转换为string输出在控制台，但是revoke之后的对象无法输出
    expect(() => console.log(proxy)).toThrowError(TypeError); // Cannot read property 'Symbol(nodejs.util.inspect.custom)' of null
    // Proxy { [[Handler]]: null; [[Target]]: null; [[IsRevoked]]: true }

    expect(() => console.log(proxy.foo)).toThrowError(TypeError); // 抛出 TypeError
    expect(() => (proxy.foo = 1)).toThrowError(TypeError); // 还是 TypeError
    expect(() => delete proxy.foo).toThrowError(TypeError); // 还是 TypeError
  });

  test('typeof', () => {
    expect(typeof proxy).toBe('object'); // 'object'，因为对象依然存在，只不过是[[IsRevoked]]变为了true
  });
});
