import { hasOwn } from '../utils';

function createSandBox(contextObject: Record<string, any> = {}) {
  return new Proxy(
    {},
    {
      get(target, key, receiver) {
        if (hasOwn(contextObject, key)) {
          return Reflect.get(contextObject, key);
        }
        if (['window', 'self', 'globalThis'].includes(key as string)) {
          return receiver;
        }
        return Reflect.get(target, key, receiver);
      },
      set(target, key, value, receiver) {
        if (hasOwn(contextObject, key)) {
          return Reflect.set(contextObject, key, value);
        }
        return Reflect.set(target, key, value, receiver);
      },
      deleteProperty(target, key) {
        if (hasOwn(contextObject, key)) {
          console.warn(`context object property: '${key as string}' can't delete`);
          return false;
        }
        return Reflect.deleteProperty(target, key);
      },
      // 关键代码，限制with中获取任何变量都从当前Proxy中进行，而不是访问上层作用域
      has(_target, _key) {
        return true;
      },
    },
  );
}

// 运行沙盒代码
export function createSandBoxFunction(funcStr: string, contextObject?: Record<string, any>) {
  const code = 'with (sandbox) {' + funcStr + '}';
  const fn = new Function('sandbox', code);

  return function () {
    const sandboxProxy = createSandBox(contextObject);
    return fn(sandboxProxy);
  };
}
