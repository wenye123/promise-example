export type IPromiseExecutor = (resolve: IPromiseResove, reject: IPromiseReject) => any;
export type IPromiseResolveFn = (res: any) => any;
export type IPromiseRejectFn = (reason: any) => any;
export type IPromiseResove = (res: any) => void;
export type IPromiseReject = (reason: any) => void;
export type IPromiseFinallyCb = () => any;
export type IPromiseState = "pending" | "resolved" | "rejected";
export interface IPromiseTask {
  resolveCb: IPromiseResolveFn | undefined;
  rejectCb: IPromiseRejectFn | undefined;
  resolve: IPromiseResove;
  reject: IPromiseReject;
}

export class Promise {
  private tasks: IPromiseTask[] = [];
  private value: any = null;
  private state: IPromiseState = "pending";

  /** 构造函数 */
  constructor(executor: IPromiseExecutor) {
    try {
      executor(this.resolve, this.reject);
    } catch (e) {
      this.reject(e);
    }
  }

  /** 采用箭头函数是为了绑定this */
  private resolve = (ret: any) => {
    if (this.state === "pending") {
      // resolve的值为promise实例或thenable
      if (ret && (typeof ret === "object" || typeof ret === "function")) {
        const then = ret.then;
        if (typeof then === "function") {
          then.call(ret, this.resolve, this.reject);
          return;
        }
      }
      // resolve的值为非IPromise实例
      this.value = ret;
      this.state = "resolved";
      this.execute();
    }
  };

  /** 采用箭头函数是为了绑定this */
  private reject = (reason: any) => {
    if (this.state === "pending") {
      this.value = reason;
      this.state = "rejected";
      this.execute();
    }
  };

  /** 处理任务，在一个promise周期中可能会调用两次 */
  private handleTask(task: IPromiseTask) {
    // 尚未resolve/reject时推入任务数组
    if (this.state === "pending") {
      this.tasks.push(task);
      return;
    }
    // resolve/reject时执行cb回调
    let cb = this.state === "resolved" ? task.resolveCb : task.rejectCb;
    if (cb === undefined) {
      cb = this.state === "resolved" ? task.resolve : task.reject;
      cb(this.value);
      return;
    }
    try {
      const ret = cb(this.value);
      task.resolve(ret);
    } catch (err) {
      task.reject(err);
    }
  }

  /** 循环执行promise的回调 */
  private execute() {
    setTimeout(() => {
      this.tasks.forEach(task => {
        this.handleTask(task);
      });
    }, 0);
  }

  /******************* 静态方法 ***********************/

  /** 生成一个resolve的promsie实例 */
  static resolve(ret: any) {
    if (ret instanceof Promise) return ret;
    return new Promise((resolve, reject) => {
      // thenable
      if (ret && (typeof ret === "object" || typeof ret === "function")) {
        setTimeout(() => {
          (ret as Promise).then(resolve, reject);
        });
      } else {
        resolve(ret);
      }
    });
  }

  /** 生成一个reject的promise实例 */
  static reject(reason: any) {
    return new Promise((resolve, reject) => {
      reject(reason);
    });
  }

  /** 所有promsie resolve 或有一个reject 就返回 */
  static all(promises: any[]) {
    return new Promise((resolve, reject) => {
      let index = 0;
      const ret: any[] = [];
      if (promises.length === 0) {
        resolve(ret);
      } else {
        for (let i = 0; i < promises.length; i++) {
          Promise.resolve(promises[i]).then(
            r => {
              ret[i] = r;
              if (++index === promises.length) resolve(ret);
            },
            e => {
              reject(e);
              return;
            },
          );
        }
      }
    });
  }

  /** 只要其中一个promise返回则返回 */
  static race(promises: any[]) {
    return new Promise((resolve, reject) => {
      if (promises.length === 0) {
        return;
      } else {
        for (let i = 0; i < promises.length; i++) {
          Promise.resolve(promises[i]).then(
            r => {
              resolve(r);
              return;
            },
            e => {
              reject(e);
              return;
            },
          );
        }
      }
    });
  }

  /******************* 原型方法 ***********************/

  then(resolveCb?: IPromiseResolveFn, rejectCb?: IPromiseRejectFn) {
    return new Promise((resolve, reject) => {
      this.handleTask({
        resolveCb,
        rejectCb,
        resolve,
        reject,
      });
    });
  }

  catch(rejectCb?: IPromiseRejectFn) {
    return this.then(undefined, rejectCb);
  }

  /** finally之后还可以继续then，并将值原封传递 */
  finally(cb: IPromiseFinallyCb) {
    return this.then(
      val => {
        return Promise.resolve(cb()).then(() => {
          return val;
        });
      },
      err => {
        return Promise.resolve(cb()).then(() => {
          throw err;
        });
      },
    );
  }
}

/** 测试出口 */
// (Promise as any).defer = (Promise as any).deferred = function() {
//   const dfd: any = {};
//   dfd.promise = new Promise((resolve, reject) => {
//     dfd.resolve = resolve;
//     dfd.reject = reject;
//   });
//   return dfd;
// };
// module.exports = Promise;
