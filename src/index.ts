export type IPromiseExecFn = (resolve: IPromiseResove, reject: IPromiseReject) => any;
export type IPromiseResolveFn = (res: any) => any;
export type IPromiseRejectFn = (reason: any) => any;
export type IPromiseResove = (res: any) => void;
export type IPromiseReject = (reason: any) => void;
export type IIPromiseState = "pending" | "resolved" | "rejected";
export interface IPromiseTask {
  resolveCb: IPromiseResolveFn | undefined;
  rejectCb: IPromiseRejectFn | undefined;
  resolve: IPromiseResove;
  reject: IPromiseReject;
}

export class Promise {
  private tasks: IPromiseTask[] = [];
  private value: any = null;
  private state: IIPromiseState = "pending";

  /** 构造函数 */
  constructor(execFn: IPromiseExecFn) {
    try {
      execFn(this.resolve, this.reject);
    } catch (e) {
      this.reject(e);
    }
  }

  /** 采用箭头函数是为了绑定this */
  private resolve = (ret: any) => {
    if (this.state === "pending") {
      // resolve的值为IPromise实例
      if (ret && (typeof ret === "object" || typeof ret === "function")) {
        // 为了兼容其他IPromise实现
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

  /** 收集then任务并返回新的Promise */
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

  /** 处理任务 */
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
