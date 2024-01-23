import assert from 'power-assert';
import { createSandbox } from 'sinon';
import { asyncMap, asyncMapPromise } from '../src/util';

/* global describe, it, beforeEach, afterEach */
describe('asyncMap', () => {
    const sandbox = createSandbox();
    let myFunc;
    let myCallback;

    beforeEach(function() {
        myFunc = sandbox.spy();
        myCallback = sandbox.spy();
    });

    afterEach(function() {
        sandbox.restore();
    });

    it('should not call function or callback if empty object', () => {
        asyncMap({}, {}, myFunc, myCallback);
        assert(myFunc.notCalled);
        assert(myCallback.notCalled);
    });

    it('should call callback once when no errors', () => {
        asyncMap({ key1: [], key2: [] }, {}, myFunc, myCallback);
        assert.equal(myCallback.callCount, 1);
    });

    it('should call function once per array item', () => {
        let callCount = 0;
        const myFunc = (a, b) => {
            callCount++;
            b();
        };

        asyncMap({ key1: [1, 2, 3, 4] }, {}, myFunc, myCallback);
        assert.equal(callCount, 4);
        assert(myCallback.calledOnce);
        assert.deepEqual(myCallback.args[0][0], [[]]);
    });

    it('should call function until an element returns an error array', () => {
        let callCount = 0;
        const myFunc = (a, b) => {
            callCount++;
            b(a);
        };

        asyncMap({ key1: [1, 2, [3], 4] }, {}, myFunc, myCallback);
        assert.equal(callCount, 3);
        assert(myCallback.calledOnce);
        assert.deepEqual(myCallback.args[0][0], [[3]]);
    });

    it('should call callback with array results from function call', () => {
        let callCount = 0;
        const myFunc = (a, b) => {
            callCount++;
            b(a);
        };

        asyncMap({ key1: [1, 2, [3], 4], key2: [[5]] }, {}, myFunc, myCallback);
        assert.equal(callCount, 4);
        assert(myCallback.calledOnce);
        assert.deepEqual(myCallback.args[0][0], [[3], [5]]);
    });

    it('should support `options.first` and return after first error array is found', () => {
        let callCount = 0;
        const myFunc = (a, b) => {
            callCount++;
            b(a);
        };

        asyncMap({ key1: [[], [1]], key2: [[2]], key: [[3]] }, {first: true}, myFunc, myCallback);
        assert.equal(callCount, 2);
        assert(myCallback.calledOnce);
        assert.deepEqual(myCallback.args[0][0], [1]);
    })
});

describe('asyncMapPromise', () => {
    const sandbox = createSandbox();
    let myFunc;
    let myCallback;

    beforeEach(function() {
        myFunc = sandbox.spy();
        myCallback = sandbox.spy();
    });

    afterEach(function() {
        sandbox.restore();
    });

    it('should not call function if empty object', async () => {
        await asyncMapPromise({}, {}, myFunc)
            .then(myCallback);
        assert(myFunc.notCalled);
    });

    it('should call callback once when no errors', async () => {
        await asyncMapPromise({ key1: [], key2: [] }, {}, myFunc)
            .then(myCallback);
        assert.equal(myCallback.callCount, 1);
    });

    it('should call function once per array item', async () => {

        await asyncMapPromise({ key1: [1,2,3,4] }, {}, myFunc)
            .then(myCallback);
        assert.equal(myFunc.callCount, 4);

        assert(myCallback.calledOnce);
        assert.deepEqual(myCallback.args[0][0], [null]);
    });

    it('should call function until an element returns an error array', async () => {
        let callCount = 0;
        const myFunc = (a) => {
            callCount++;
            return a;
        };

        await asyncMapPromise({ key1: [1, 2, [3], 4] }, {}, myFunc)
            .then(myCallback);
        assert.equal(callCount, 3);
        assert(myCallback.calledOnce);
        assert.deepEqual(myCallback.args[0][0], [[3]]);
    });

    it('should call callback with array results from function call', async () => {
        let callCount = 0;
        const myFunc = (a) => {
            callCount++;
            return a;
        };

        await asyncMapPromise({ key1: [1, 2, [3], 4], key2: [[5]] }, {}, myFunc)
            .then(myCallback);
        assert.equal(callCount, 4);
        assert(myCallback.calledOnce);
        assert.deepEqual(myCallback.args[0][0], [[3], [5]]);
    });

    it('should support `options.first` and return after first error array is found', async () => {
        let callCount = 0;
        const myFunc = (a) => {
            callCount++;
            return a;
        };

        await asyncMapPromise({ key1: [[], [1]], key2: [[2]], key: [[3]] }, {first: true}, myFunc)
            .then(res => {
                assert.deepEqual(res, [1]);
                assert.equal(callCount, 2);
        })
    });

});