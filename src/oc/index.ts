import { Defined, TSOCType } from './type';

export function oc<T>(data?: T): TSOCType<T> {
  return new Proxy(
    // 创建一个函数的proxy对象，同时将oc传入的值作为返回值，当oc传入的值为null或undefined的时候，采用函数调用时传入的值
    ((defaultValue?: Defined<T>) => (data == null ? defaultValue : data)) as TSOCType<T>,
    // 代理函数对象的get方法，js万物皆对象，所以函数也是一个对象，也有自己的属性
    {
      // target是函数本身，即上方的函数，调用函数，取到函数的返回值
      get: (target, key) => {
        const obj: any = target();
        // 返回由oc函数包裹的值，当函数返回值为对象时，从对象中取key，非对象时即为undefined
        // return oc(typeof obj === 'object' ? obj[key] : undefined);
        // 这里会引发一个问题，如果我的obj本身就是一个函数，那么此处oc将会传入undefined，导致无法取到函数内的属性，原因大家都很清楚：typeof的返回值，会将函数返回为function，解决方案也很容易：
        return oc(typeof obj === 'object' || typeof obj === 'function' ? obj[key] : undefined);
      },
    },
  );
}
