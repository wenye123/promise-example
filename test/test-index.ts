import { Promise } from "../src/index";
import { assert } from "chai";

function getPromise(str: string, ms: number = 50) {
  return new Promise(resolve => {
    setTimeout(function() {
      resolve(str);
    }, ms);
  });
}

describe("Promise", function() {
  it("resolve val", function(done) {
    new Promise((resolve, reject) => {
      resolve("wenye1");
      resolve("wenye2");
    }).then(r => {
      assert.strictEqual(r, "wenye1");
      done();
    });
  });

  it("resolve thenable", function(done) {
    new Promise((resolve, reject) => {
      resolve({
        then(resolve: any, reject: any) {
          resolve("wenye");
        },
      });
    }).then(r => {
      assert.strictEqual(r, "wenye");
      done();
    });
  });

  it("resolve promise", function(done) {
    new Promise((resolve, reject) => {
      resolve(getPromise("wenye"));
    }).then(r => {
      assert.strictEqual(r, "wenye");
      done();
    });
  });

  it("throw err", function(done) {
    new Promise((resolve, reject) => {
      throw new Error("err");
    }).then(
      r => {},
      e => {
        assert.strictEqual(e.message, "err");
        done();
      },
    );
  });

  it("reject", function(done) {
    new Promise((resolve, reject) => {
      reject("err1");
      reject("err2");
    }).then(
      r => {},
      e => {
        assert.strictEqual(e, "err1");
        done();
      },
    );
  });

  it("Promise.then() no resolve cb", function(done) {
    new Promise((resolve, reject) => {
      resolve("wenye");
    })
      .then()
      .then(r => {
        assert.strictEqual(r, "wenye");
        done();
      });
  });

  it("Promise.then() no reject cb", function(done) {
    new Promise((resolve, reject) => {
      reject("err");
    })
      .then()
      .then(
        r => {},
        e => {
          assert.strictEqual(e, "err");
          done();
        },
      );
  });

  it("Promise.then() err", function(done) {
    getPromise("wenye")
      .then(r => {
        assert.strictEqual(r, "wenye");
        throw new Error("err");
      })
      .then(
        r => {},
        e => {
          assert.strictEqual(e.message, "err");
          done();
        },
      );
  });

  it("Promise.then() return val", function(done) {
    getPromise("wenye")
      .then(r => {
        return "wenye";
      })
      .then(r => {
        assert.strictEqual(r, "wenye");
        done();
      });
  });

  it("Promise.then() return thenable", function(done) {
    getPromise("wenye")
      .then(r => {
        return {
          then(resolve: any, reject: any) {
            resolve("wenye");
          },
        };
      })
      .then(r => {
        assert.strictEqual(r, "wenye");
        done();
      });
  });

  it("Promise.then() return promise", function(done) {
    getPromise("wenye")
      .then(r => {
        return getPromise("wenye");
      })
      .then(r => {
        assert.strictEqual(r, "wenye");
        done();
      });
  });

  it("Promise.resolve() val", function(done) {
    Promise.resolve("wenye").then(r => {
      assert.strictEqual(r, "wenye");
      done();
    });
  });

  it("Promise.resolve() thenable", function(done) {
    Promise.resolve({
      then(resolve: any, reject: any) {
        resolve("wenye");
      },
    }).then(r => {
      assert.strictEqual(r, "wenye");
      done();
    });
  });

  it("Promise.resolve() promise", function(done) {
    Promise.resolve(getPromise("wenye")).then(r => {
      assert.strictEqual(r, "wenye");
      done();
    });
  });

  it("Promise.reject()", function(done) {
    Promise.reject("err").then(
      r => {},
      e => {
        assert.strictEqual(e, "err");
        done();
      },
    );
  });

  it("Promsie.prototype.catch() err", function(done) {
    new Promise((resolve, reject) => {
      throw "err";
    }).catch(e => {
      assert.strictEqual(e, "err");
      done();
    });
  });

  it("Promsie.prototype.catch() reject", function(done) {
    new Promise((resolve, reject) => {
      reject("err");
    }).catch(e => {
      assert.strictEqual(e, "err");
      done();
    });
  });

  it("Promsie.prototype.finally() resolve", function(done) {
    let i = 0;
    new Promise((resolve, reject) => {
      resolve("wenye");
    })
      .finally(() => {
        i++;
      })
      .then(r => {
        assert.strictEqual(i, 1);
        assert.strictEqual(r, "wenye");
        done();
      });
  });

  it("Promsie.prototype.finally() reject", function(done) {
    let i = 0;
    new Promise((resolve, reject) => {
      reject("err");
    })
      .finally(() => {
        i++;
      })
      .then(
        r => {},
        e => {
          assert.strictEqual(i, 1);
          assert.strictEqual(e, "err");
          done();
        },
      );
  });

  it("Promise.all() empty", function(done) {
    Promise.all([]).then(arr => {
      assert.sameMembers(arr, []);
      done();
    });
  });

  it("Promise.all()", function(done) {
    Promise.all([getPromise("wenye"), "yiye", getPromise("erye")]).then(arr => {
      assert.sameMembers(arr, ["wenye", "yiye", "erye"]);
      done();
    });
  });

  it("Promise.all() reject", function(done) {
    let count = 0;
    Promise.all([
      new Promise((resolve, reject) => {
        setTimeout(() => {
          count++;
          resolve("wenye");
        });
      }),
      new Promise((resolve, reject) => {
        count++;
        reject("err");
      }),
    ]).then(
      r => {},
      e => {
        assert.strictEqual(e, "err");
        assert.strictEqual(count, 1);
        done();
      },
    );
  });

  it("Promise.race() empty", function(done) {
    Promise.race([]).then(r => {
      assert.strictEqual(r, undefined);
      done(new Error("不该执行"));
    });
    setTimeout(done, 100);
  });

  it("Promise.race()", function(done) {
    Promise.race([getPromise("wenye", 20), getPromise("yiye", 10)]).then(r => {
      assert.strictEqual(r, "yiye");
      done();
    });
  });

  it("Promise.race() reject", function(done) {
    let count = 0;
    Promise.race([
      new Promise((resolve, reject) => {
        setTimeout(() => {
          count++;
          resolve("wenye");
        });
      }),
      new Promise((resolve, reject) => {
        count++;
        reject("err");
      }),
    ]).then(
      r => {},
      e => {
        assert.strictEqual(e, "err");
        assert.strictEqual(count, 1);
        done();
      },
    );
  });
});
