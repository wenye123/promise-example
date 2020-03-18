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
  it("execFn err", function(done) {
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

  it("execFn reject", function(done) {
    new Promise((resolve, reject) => {
      reject(new Error("err"));
    }).then(
      r => {},
      e => {
        assert.strictEqual(e.message, "err");
        done();
      },
    );
  });

  it("resolve & then reject", function(done) {
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

  it("return promise", function(done) {
    getPromise("wenye")
      .then(r => {
        return getPromise("yiye");
      })
      .then(r => {
        assert.strictEqual(r, "yiye");
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
        reject("wenye");
      },
    }).then(
      r => {},
      e => {
        assert.strictEqual(e, "wenye");
        done();
      },
    );
  });

  it("Promise.resolve() promise", function(done) {
    Promise.resolve(getPromise("wenye")).then(r => {
      assert.strictEqual(r, "wenye");
      done();
    });
  });

  it("Promise.reject()", function(done) {
    Promise.reject("wenye").then(
      r => {},
      e => {
        assert.strictEqual(e, "wenye");
        done();
      },
    );
  });

  it("Promsie.prototype.catch()", function(done) {
    new Promise((resolve, reject) => {
      reject("wenye");
    }).catch(e => {
      assert.strictEqual(e, "wenye");
      done();
    });
  });

  it("Promsie.prototype.finally()", function(done) {
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

  it("Promise.all()", function(done) {
    Promise.all([getPromise("wenye"), "yiye", getPromise("erye")]).then(arr => {
      assert.sameMembers(arr, ["wenye", "yiye", "erye"]);
      done();
    });
  });

  it("Promise.race()", function(done) {
    Promise.race([getPromise("wenye", 20), getPromise("yiye", 10)]).then(r => {
      assert.strictEqual(r, "yiye");
      done();
    });
  });
});
