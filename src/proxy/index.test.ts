import { describe, test, expect } from 'vitest';

describe('Proxy', () => {
  class People {
    _name: string = 'people';

    get name() {
      return this._name;
    }
  }

  test('Proxy get function', () => {
    const people = new People();

    let proxyPeople = new Proxy(people, {
      get: function (target, prop, _receiver) {
        return (target as any)[prop];
      },
    });

    let man = Object.create(proxyPeople);
    man._name = 'man';
    expect(man._name).toBe('man');
    // expect(man.name).toBe('man')
    expect(man.name).toBe('people');
  });

  test('proxy and reflect', () => {
    const people = new People();

    let proxyPeople = new Proxy(people, {
      get: function (target, prop, receiver) {
        return Reflect.get(target, prop, receiver);
      },
    });

    let man = Object.create(proxyPeople);
    man._name = 'man';
    expect(man._name).toBe('man');
    expect(man.name).toBe('man');
  });
});
