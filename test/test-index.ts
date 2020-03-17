import { Promise } from "../src/index";
import { assert } from "chai";

function getPromise(str: string) {
  return new Promise(resolve => {
    setTimeout(function() {
      resolve(str);
    }, 50);
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

  it("reject", function(done) {
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
});
