import { hasOwn } from '../utils';

type ValidateSymbol = [(value: any) => boolean, string];

export function createValidatedObject<T extends object>(
  obj: T,
  symbols: Record<keyof T, ValidateSymbol>,
) {
  return new Proxy(obj, {
    set(target, property, value, receiver) {
      if (hasOwn(symbols, property)) {
        const [validateFn, type] = (symbols as any)[property] || [];
        if (validateFn) {
          const isValid = validateFn(value);
          if (!isValid) {
            console.warn(`property: '${property as string}' is not a ${type}`);
            return false;
          }
        }
      }
      return Reflect.set(target, property, value, receiver);
    },
  });
}

function validateFnCreator(type: string): ValidateSymbol {
  return [
    (value: unknown) =>
      Object.prototype.toString.call(value).slice(8, -1).toLocaleLowerCase() === type,
    type,
  ];
}
export const isString = validateFnCreator('string');
export const isNumber = validateFnCreator('number');
export const isBoolean = validateFnCreator('boolean');
export const isObject = validateFnCreator('object');
export const isArray = validateFnCreator('array');
export const isFunction = validateFnCreator('function');
