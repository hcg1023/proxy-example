interface IPerson {
  name: string
  age: number
}

class Person implements IPerson {
  constructor(public name: string, public age: number) {}
}

// 对象代理，通过一个新对象，对源对象的操作进行劫持
export class ProxyPerson implements IPerson {
  private _person: Person;
  constructor(name: string, age: number) {
    this._person = new Person(name, age);
  }

  get name() {
    return this._person.name;
  }
  set name(value) {
    this._person.name = value;
  }

  get age() {
    return this._person.age;
  }
  set age(value) {
    if (value < 0) {
      throw new Error(`年龄不能小于0`);
    }
    this._person.age = value;
  }
}
