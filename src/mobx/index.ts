type Effect = () => void;
let activeEffect: Effect | null = null;

const isIntegerKey = (key: unknown) =>
  typeof key === 'string' && key !== 'NaN' && key[0] !== '-' && '' + parseInt(key, 10) === key;

export function autorun(fn: () => void) {
  const effect = () => {
    activeEffect = effect;
    fn();
    activeEffect = null;
  };
  effect();
}

type Key = string | symbol;

const reactiveMap = new WeakMap<object, Map<Key, Set<Effect>>>();
function tack(target: object, key: Key) {
  if (!activeEffect) {
    return;
  }
  let eventListMap = reactiveMap.get(target);
  if (!eventListMap) {
    eventListMap = new Map();
    reactiveMap.set(target, eventListMap);
  }
  // 采用Set结构，确保函数唯一
  let effectsList = eventListMap.get(key);
  if (!effectsList) {
    effectsList = new Set();
    eventListMap.set(key, effectsList);
  }
  effectsList.add(activeEffect);
}
function trigger(target: object, key: Key) {
  const eventListMap = reactiveMap.get(target);
  if (!eventListMap) {
    return;
  }

  const effectsList = eventListMap.get(key);
  if (effectsList) {
    effectsList.forEach((callback) => {
      callback.apply(null);
    });
  }
}

// 创建一个响应式对象
export function observable<T extends object>(obj: T): T {
  return new Proxy(obj, {
    // 获取
    get(target, key, receiver) {
      const value = Reflect.get(target, key, receiver);
      tack(target, key);
      // 获取的时候，如果是引用类型，就递归调用
      if (typeof value === 'object' && value !== null) {
        return observable(value);
      }
      return value;
    },
    // 修改
    set(target, key, value, receiver) {
      const oldValue = Reflect.get(target, key);
      // 数组新增元素
      const isArrayAddItem =
        Array.isArray(target) && isIntegerKey(key) ? Number(key) >= target.length : false;
      const result = Reflect.set(target, key, value, receiver);
      if (result) {
        // ADD
        if (isArrayAddItem) {
          trigger(target, 'length');
        }
        // 设置成功,并且值不一致时，进行发布
        if (oldValue !== value) {
          trigger(target, key);
        }
      }
      return result;
    },
    // 删除
    deleteProperty(target, key) {
      const result = Reflect.deleteProperty(target, key);
      // 删除成功
      if (result) {
        trigger(target, key);
      }
      return result;
    },
  });
}

const arr = []
arr.push(1)
const oldLength = arr.length
arr[arr.length] = 1
arr.length = oldLength
