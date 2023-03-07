# Proxy
## Proxy是什么

引用MDN的介绍：
Proxy 对象用于创建一个对象的代理，从而实现基本操作的拦截和自定义（如属性查找、赋值、枚举、函数调用等）。

## Proxy可以做什么事情
当我们需要在对象的一些值获取或修改的时候，进行一系列的干预，或者其他处理时，可以采用Proxy（如获取时进行记录，修改时进行数据验证等）

## 没有Proxy之前，我们如果想对对象的值进行干预，该如何实现

### 通过新对象的方式
```ts
class Person {  
  constructor(public name: string, public age: number) {}  
}  
  
// 对象代理，通过一个新对象，对源对象的操作进行劫持  
export class ProxyPerson {  
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
    }    this._person.age = value;  
  }  
}
```

### Object.defineProperty
自然是说`Object.defineProperty(obj, key, descriptor)`以及`Object.defineProperties(obj, props)`了，我们以`Object.defineProperty`为例
| 参数                   | 描述          |
|:---------------------|:------------|
| obj: object          | 定义属性的对象     |
| prop: string\|symbol | 定义或修改的属性名称  |
| descriptor: object          | 定义或修改属性的描述符对象 |  
```ts
for (let key in obj) {
	Obejct.defineProperty(obj, key, descriptor)
}
```
| 描述符          | 描述                              | 默认值       |
|:-------------|:--------------------------------|:----------|
| value        | 属性对应的值,与get,set互斥                          | undefined |
| get          | getter函数,与writable,value互斥                        | undefined |
| set          | setter函数,与writable,value互斥                        | undefined |
| configurable | <div>属性可被删除<br></div>属性的描述符可被改变 | false     |
| enumerable   | 属性可以被枚举(for in... Object.keys)  | false     |
| writable     | value可以被改变,与get,set互斥                      | false     |  
可以通过`Object.getOwnPropertyDescriptor(obj, property)`或`Object.getOwnPropertyDescriptors(obj)`方法来获取描述符对象
## 有Proxy之后，如何实现
```ts
const newObj = new Proxy(obj, handler)
```
| 处理方法                                                                                                                                                                                                                                                            | 描述                                                                                                                      |
|:----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|:------------------------------------------------------------------------------------------------------------------------|
| apply(target, thisArg, args): any | 拦截函数的调用                                                                                                                 |
| construct(target, args): object                                                                                                                                                                                                                                 | 拦截new操作符调用(拦截的对象必须是合法的，即可以被new target的，即构造函数)                                                                           |
| defineProperty(target, property, descriptor): boolean                                                                                                                                                                                                           | 拦截的就是Object.defineProperty方法                                                                                            |
| deleteProperty(target, property): boolean                                                                                                                                                                                                                       | 拦截delete操作符                                                                                                             |
| get(target, property, receiver): any                                                                                                                                                                                                                            | 拦截对象的读取属性操作                                                                                                             |
| getOwnPropertyDescriptor(target, property): object\|undefined                                                                                                                                                                                                    | 拦截的是Object.getOwnPropertyDescriptor方法                                                                                   |
| getPrototypeOf(target): object\|undefined                                                                                                                                                                                                                        | 拦截的是Object.getPrototypeOf方法(包括instanceof，\_\_proto\_\_，isPrototyoeOf等)                                                      |
| has(target, property): boolean                                                                                                                                                                                                                                  | 拦截in操作符                                                                                                                 |
| isExtensible(target): boolean                                                                                                                                                                                                                                   | 拦截的是Object.isExtensible方法(判断一个对象是否是可扩展的是否可以在它上面添加新的属性,可通过freeze(冻结),preventExtensions(不可扩展),seal(不可新增和删除)等方式将对象更改为不可扩展) |
| preventExtensions(target): boolean                                                                                                                                                                                                                              | 拦截 Object.preventExtensions方法                                                                                           |
| ownKeys(target): (string\|symbol)\[\]                                                                                                                                                                                                                              | 拦截Object.keys,Object.getOwnPropertyNames等方法                                                                             |
| set(target, property, value, receiver): boolean                                                                                                                                                                                                                 | 拦截对象设置属性值的操作                                                                                                            |
| setPrototypeOf(target, prototype): boolean                                                                                                                                                                                                                      | 拦截 Object.setPrototypeOf方法                                                                                              |  
## Proxy.revocable可撤销的代理
**`Proxy.revocable()`** 方法可以用来创建一个可撤销的代理对象。
```ts
const revocable = Proxy.revocable(target, handler);

var revocable = Proxy.revocable({}, {
  get(target, name) {
    return name;
  }
});
var proxy = revocable.proxy;
proxy.foo;              // "foo"

revocable.revoke();

console.log(proxy.foo); // 抛出 TypeError
proxy.foo = 1           // 还是 TypeError
delete proxy.foo;       // 又是 TypeError
typeof proxy            // "object"，因为 typeof 不属于可代理操作
```
## Proxy与Object.defineProperty的区别
1. Proxy针对整个对象，而`Object.defineProperty`针对对象的某个属性
2. Proxy的代理监测更加全面，有13种方式，如ownKeys、deleteProperty、has 等是 Object.defineProperty 不具备的。
3. Proxy返回一个新的对象，不会直接操作源对象，而`Object.defineProperty`是针对源对象进行修改
4. `Object.defineProperty`兼容性较好，最低支持IE9![](https://image.haochenguang.cn/notes/20230304235005.png)
5. Proxy的兼容性稍差，完全不支持IE，但是在IE逐步淘汰的当下，已经不在是问题![](https://image.haochenguang.cn/notes/20230304235050.png)
6. `Object.defineProperty`无法监测到对象属性的添加，也无法监听到数组新增和长度的变化
7. `Object.defineProperty`无法监听`Map,Set,WeakMap,WeakSet`等数据结构的变化
8. 若对象内部属性要全部递归代理，Proxy可以只在调用的时候递归，而`Object.definePropery`需要一次完成所有递归，性能比Proxy差。
## Reflect
MDN说：**Reflect** 是一个内置的对象，它提供拦截 JavaScript 操作的方法。这些方法与 [proxy handler (en-US)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy/Proxy "Currently only available in English (US)") 的方法相同。`Reflect` 不是一个函数对象，因此它是不可构造的。
### 为什么要使用Reflect
我们在使用Proxy的时候，通常会配合Reflect来使用，这是为什么呢？
我们看一个简单的示例
```ts
class People {  
    _name: string = 'people'  
  
    get name() {  
        return this._name  
    }  
}  
  
test('Proxy get function', () => {  
    const people = new People()  
  
    let proxyPeople = new Proxy(people, {  
        get: function (target, prop, _receiver) {  
            return target[prop]  
        }  
    })  
  
    let man = Object.create(proxyPeople)  
    man._name = 'man'  
    expect(man._name).toBe('man')  
    expect(man.name).toBe('man')  // AssertionError: expected 'people' to be 'man' 
    // expect(man.name).toBe('people')  
})  
  
test('proxy and reflect', () => {  
    const people = new People()  
  
    let proxyPeople = new Proxy(people, {  
        get: function (target, prop, receiver) {  
            return Reflect.get(target, prop, receiver)  
        }    
	})  
  
    let man = Object.create(proxyPeople)  
    man._name = 'man'  
    expect(man._name).toBe('man')  
    expect(man.name).toBe('man')  
})
```
我们看到，用`Reflect.get`得出来的结果是`man`。它们两个主要的区别就是`get name(){}`方法中的`this`不同：

1.  如果是用`target[key]`的，它回过去读`People`里面的`get name()``this`是指向了当前`People`。
2.  如果用`Reflect.get(target,property,receiver)`，主要注意第三个参数（如果`target`对象中指定了`getter`，`receiver`则为`getter`调用时的`this`值），它表示方法的调用者，它可以让`this`指向调用者，此时 `get name()` 里面的`this`，指向了`Man`。
3.  如果`Reflect.get`不传第三个参数，那么它和`target[key]`结果就是一样的

同时，除了Reflect.get外，set也会有类似的问题，当然，像has，deleteProperty等方法，Reflect提供给了我们一个非常简便的，无需关注内部实现的方式，并且会明确的给我们一个处理结果，这是它相较我们自行处理的优势所在

### 总结
为了确保对象中的this指向，同时简化处理逻辑，所以大部分符合标准的情况下，我们都建议使用Reflect来对对象进行操作

## Proxy in 企企
在企企的项目中，对于Proxy的应用还是有很多的，比如我们常用的oc函数，mobx等，以及平台内部处理的一些逻辑
示例文件：`packages/common-solution/src/queries/components/query-solution/impl.tsx`
![](https://image.haochenguang.cn/notes/20230307153529.png)
示例文件：`packages/common-solution/src/queries/components/query-solution/models/QueryItemProxy.ts`
![](https://image.haochenguang.cn/notes/20230307154217.png)

## ts-optional（oc函数）源码解析
```ts
export function oc(data) {
	return new Proxy(
	// 创建一个函数的proxy对象，同时将oc传入的值作为返回值，当oc传入的值为null或undefined的时候，采用函数调用时传入的值
		defaultValue => (data == null ? defaultValue : data),
		{
			// 代理函数对象的get方法，js万物皆对象，所以函数也是一个对象，也有自己的属性
			get: (target, key) => {
				// target是函数本身，即上方的函数，调用函数，取到函数的返回值
				const obj = target();
				// 返回由oc函数包裹的值，当函数返回值为对象时，从对象中取key，非对象时即为undefined
				return oc(typeof obj === 'object' ? obj[key] : undefined);
				// 这里会引发一个问题，如果我的obj本身就是一个函数，那么此处oc将会传入undefined，导致无法取到函数内的属性，原因大家都很清楚：typeof的返回值，会将函数返回为function，解决方案也很容易：
				// oc(typeof obj === 'object' || typeof obj === 'function' ? obj[key] : undefined)
			},
		},
	);

}
```
## 基于Proxy的表单校验方式
我们不仅可以在set函数中进行检测数据的正确性，也可以将不正确的数据转换为正确的，如 '1' => 1
```ts
// index.ts
import {hasOwn} from "../utils";  
  
type ValidateSymbol = [(value: any) => boolean, string]  
  
export function createValidatedObject<T extends object>(obj: T, symbols: Record<keyof T, ValidateSymbol>) {  
    return new Proxy(obj, {  
        set(target, property, value, receiver) {  
            if (hasOwn(symbols, property)) {  
                const [validateFn, type] = ((symbols as any)[property] || [])  
                if (validateFn) {  
                    const isValid = validateFn(value)  
                    if (!isValid) {  
                        console.warn(`property: '${property as string}' is not a ${type}`)  
                        return false  
                    }  
                }  
            }  
            return Reflect.set(target, property, value, receiver)  
        }  
    })  
}  
  
  
  
function validateFnCreator(type: string): ValidateSymbol {  
    return [(value: unknown) => Object.prototype.toString.call(value).slice(8, -1).toLocaleLowerCase() === type, type]  
}  
export const isString = validateFnCreator('string')  
export const isNumber = validateFnCreator('number')  
export const isBoolean = validateFnCreator('boolean')  
export const isObject = validateFnCreator('object')  
export const isArray = validateFnCreator('array')  
export const isFunction = validateFnCreator('function')

// test.ts
import {describe, test, expect, vi} from "vitest";  
import {createValidatedObject, isBoolean, isNumber, isString} from "./index";  
  
describe('validated object', () => {  
    test('validate', () => {  
  
        const symbols = {  
            name: isString,  
            age: isNumber,  
            sex: isString,  
            isAdmin: isBoolean  
        }  
  
        const obj = createValidatedObject({  
            name: '张三',  
            age: 15,  
            sex: '男',  
            isAdmin: false,  
        }, symbols)  
  
        obj.name = '李四'  
        expect(obj.name).toBe('李四')  
  
        expect(obj.age).toBe(15)  
        obj.age = 20  
        expect(obj.age).toBe(20)  
    })  
  
  
    test('set a not valid value', () => {  
  
        const symbols = {  
            age: isNumber,  
        }  
        const obj = createValidatedObject({  
            age: 15,  
        }, symbols)  
  
        const warn = vi.spyOn(console, 'warn')  
        expect(() => ((obj as any).age = '1')).toThrowError()  
        expect(warn.mock.calls.length).toBe(1)  
        expect(warn.mock.calls[0][0]).toBe(`property: 'age' is not a number`)  
    })  
})
```
## 基于Proxy的js运行沙盒
```ts
// index.ts
function hasOwn(obj: Record<string, any>, key: string | symbol) {  
    return Object.hasOwnProperty.call(obj, key)  
}  
  
function createSandBox(contextObject: Record<string, any> = {}) {  
    return new Proxy({}, {  
        get(target, key, receiver) {  
            if (hasOwn(contextObject, key)) {  
                return Reflect.get(contextObject, key)  
            }  
            if (['window', 'self', 'globalThis'].includes(key as string)) {  
                return receiver  
            }  
            return Reflect.get(target, key, receiver)  
        },  
        set(target, key, value, receiver) {  
            if (hasOwn(contextObject, key)) {  
                return Reflect.set(contextObject, key, value)  
            }  
            return Reflect.set(target, key, value, receiver)  
        },  
        deleteProperty(target, key) {  
            if (hasOwn(contextObject, key)) {  
                console.warn(`context object property: '${key as string}' can't delete`)  
                return false  
            }  
            return Reflect.deleteProperty(target, key)  
        },  
        // 关键代码，限制with中获取任何变量都从当前Proxy中进行，而不是访问上层作用域  
        has(_target, _key) {  
            return true  
        }  
    })  
}  
  
// 运行沙盒代码  
export function createSandBoxFunction(funcStr: string, contextObject?: Record<string, any>) {  
    const code = 'with (sandbox) {' + funcStr + '}'  
    const fn = new Function('sandbox', code)  
  
    return function () {  
        const sandboxProxy = createSandBox(contextObject)  
        return fn(sandboxProxy)  
    }  
}


// test.ts
import {describe, test, expect, vi} from "vitest";  
import {createSandBoxFunction} from "./index";  
  
describe('test sandbox', () => {  
    test('测试沙盒访问值', () => {  
        test('沙盒函数返回值, 确保沙盒中的return生效', () => {  
            const fn = createSandBoxFunction(`return 1`)  
            expect(() => fn()).toBe(1)  
        })  
  
        test('沙盒访问全局变量', () => {  
            const fn = createSandBoxFunction(`  
                return console            `)  
            // 全局console有值  
            expect(console).toBeDefined()  
            // 但是函数内访问为undefined  
            expect(() => fn()).toBe(undefined)  
        })  
    })  
  
  
    test('测试沙盒设置变量值', () => {  
        const log = vi.fn()  
  
        createSandBoxFunction(`  
            globalThis.a = 123;            log(globalThis.a);            log(a);        `, {  
            log  
        })()  
  
  
        expect(log.mock.calls.length).toBe(2)  
        expect(log.mock.calls[0]).toEqual([123])  
        expect(log.mock.calls[1]).toEqual([123])  
    })  
  
    test('测试沙盒设置contextObject值', () => {  
        const log = vi.fn()  
        const contextObject: Record<string, any> = {  
            log,  
            flag: 1  
        }  
  
        createSandBoxFunction(`  
            flag = 3;            log(flag)        `, contextObject)()  
  
        expect(log.mock.calls.length).toBe(1)  
        expect(log.mock.calls[0]).toEqual([3])  
        expect(contextObject.flag).toBe(3)  
  
        createSandBoxFunction(`  
            log(flag);            flag = 5;        `, contextObject)()  
        expect(log.mock.calls.length).toBe(2)  
        expect(log.mock.calls[1]).toEqual([3])  
        expect(contextObject.flag).toBe(5)  
    })  
  
    test('测试删除共享变量的值', () => {  
        const warn = vi.spyOn(console, 'warn')  
  
        const contextObject: Record<string, any> = {  
            flag: 1  
        }  
  
        createSandBoxFunction(`  
            delete window.flag;        `, contextObject)()  
        expect(warn.mock.calls.length).toBe(1)  
        expect(warn.mock.calls[0]).toEqual([`context object property: 'flag' can't delete`])  
    })  
})
```
拓展阅读：
[说说微前端JS沙箱实现的几种方式 - 掘金](https://juejin.cn/post/6981374562877308936)
[微前端qiankun沙箱源码解读 - 掘金](https://juejin.cn/post/6981756262304186405)

## 实现一个简易的数据响应式
```ts
// index.ts
type Effect = () => void  
let activeEffect: Effect | null = null  
  
const isIntegerKey = (key: unknown) =>  
    typeof key === 'string' &&  
    key !== 'NaN' &&  
    key[0] !== '-' &&  
    '' + parseInt(key, 10) === key  
  
  
export function autorun(fn: () => void) {  
    const effect = () => {  
        activeEffect = effect  
        fn()  
        activeEffect = null  
    }  
    effect()  
}  
  
type Key = string | symbol  
  
const reactiveMap = new WeakMap<object, Map<Key, Set<Effect>>>()  
function tack(target: object, key: Key) {  
    if (!activeEffect) {  
        return  
    }  
    let eventListMap = reactiveMap.get(target)  
    if (!eventListMap) {  
        eventListMap = new Map()  
        reactiveMap.set(target, eventListMap)  
    }    // 采用Set结构，确保函数唯一  
    let effectsList = eventListMap.get(key)  
    if (!effectsList) {  
        effectsList = new Set()  
        eventListMap.set(key, effectsList)  
    }    effectsList.add(activeEffect)  
}  
function trigger(target: object, key: Key) {  
    const eventListMap = reactiveMap.get(target)  
    if (!eventListMap) {  
        return  
    }  
  
    const effectsList = eventListMap.get(key)  
    if (effectsList) {  
        effectsList.forEach(callback => {  
            callback.apply(null)  
        })  
    }}  
  
// 创建一个响应式对象  
export function observable<T extends object>(obj: T): T {  
    return new Proxy(obj, {  
        // 获取  
        get(target, key, receiver) {  
            const value = Reflect.get(target, key, receiver)  
            tack(target, key)  
            // 获取的时候，如果是引用类型，就递归调用  
            if (typeof value === 'object' && value !== null) {  
                return observable(value)  
            }  
            return value  
        },  
        // 修改  
        set(target, key, value, receiver) {  
            const oldValue = Reflect.get(target, key)  
            // 数组新增元素  
            const isArrayAddItem = Array.isArray(target) && isIntegerKey(key) ? Number(key) >= target.length : false  
            const result = Reflect.set(target, key, value, receiver)  
            if (result) {  
                // ADD  
                if (isArrayAddItem) {  
                    trigger(target, 'length')  
                }  
                // 设置成功,并且值不一致时，进行发布  
                if (oldValue !== value) {  
                    trigger(target, key)  
                }  
            }  
            return result  
        },  
        // 删除  
        deleteProperty(target, key) {  
            const result = Reflect.deleteProperty(target, key)  
            // 删除成功  
            if (result) {  
                trigger(target, key)  
            }  
            return result  
        }  
    })  
}


// test.ts
import {describe, test, vi, expect} from "vitest";  
import {autorun, observable} from "./index";  
  
describe('simple mobx', () => {  
    test('reactive object', () => {  
        const reactiveObject = observable({  
            name: 'reactive'  
        })  
  
        let result = ''  
        const mockFn = vi.fn(() => {  
            result = reactiveObject.name  
        })  
        autorun(mockFn)  
        expect(result).toBe('reactive')  
        reactiveObject.name = 'mobx'  
        expect(result).toBe('mobx')  
        expect(mockFn.mock.calls.length).toBe(2)  
    })  
  
    test('reactive array', () => {  
        const reactiveArray = observable([1])  
  
        let lastItem  
        const mockFn = vi.fn(() => {  
            lastItem = reactiveArray[reactiveArray.length - 1]  
        })  
        autorun(mockFn)  
        expect(lastItem).toBe(1)  
        reactiveArray.push(2)  
        expect(lastItem).toBe(2)  
    })  
})
```