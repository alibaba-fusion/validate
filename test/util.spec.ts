import { assert } from 'chai';
import { createSandbox, SinonSpy } from 'sinon';
import { asyncMap, asyncMapPromise } from '../src/util';

describe('asyncMap', () => {
    const sandbox = createSandbox();
    let myFunc: SinonSpy;
    let myCallback: SinonSpy;

    beforeEach(function () {
        myFunc = sandbox.spy();
        myCallback = sandbox.spy();
    });

    afterEach(function () {
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

        asyncMap(
            { key1: [1, 2, 3, 4] },
            {},
            (a, b) => {
                callCount++;
                b();
            },
            myCallback
        );
        assert.equal(callCount, 4);
        assert(myCallback.calledOnce);
        assert.deepEqual(myCallback.args[0][0], [[]]);
    });

    it('should call function until an element returns an error array', () => {
        let callCount = 0;

        asyncMap(
            { key1: [1, 2, [3], 4] },
            {},
            (a, b) => {
                callCount++;
                b(a as unknown[]);
            },
            myCallback
        );
        assert.equal(callCount, 3);
        assert(myCallback.calledOnce);
        assert.deepEqual(myCallback.args[0][0], [[3]]);
    });

    it('should call callback with array results from function call', () => {
        let callCount = 0;

        asyncMap(
            { key1: [1, 2, [3], 4], key2: [[5]] },
            {},
            (a, b) => {
                callCount++;
                b(a as unknown[]);
            },
            myCallback
        );
        assert.equal(callCount, 4);
        assert(myCallback.calledOnce);
        assert.deepEqual(myCallback.args[0][0], [[3], [5]]);
    });

    it('should support `options.first` and return after first error array is found', () => {
        let callCount = 0;

        asyncMap(
            { key1: [[], [1]], key2: [[2]], key: [[3]] },
            { first: true },
            (a, b) => {
                callCount++;
                b(a);
            },
            myCallback
        );
        assert.equal(callCount, 2);
        assert(myCallback.calledOnce);
        assert.deepEqual(myCallback.args[0][0], [1]);
    });
});

describe('asyncMapPromise', () => {
    const sandbox = createSandbox();
    let myFunc: SinonSpy;
    let myCallback: SinonSpy;

    beforeEach(function () {
        myFunc = sandbox.spy();
        myCallback = sandbox.spy();
    });

    afterEach(function () {
        sandbox.restore();
    });

    it('should not call function if empty object', async () => {
        await asyncMapPromise({}, {}, myFunc).then(myCallback);
        assert(myFunc.notCalled);
    });

    it('should call callback once when no errors', async () => {
        await asyncMapPromise({ key1: [], key2: [] }, {}, myFunc).then(
            myCallback
        );
        assert.equal(myCallback.callCount, 1);
    });

    it('should call function once per array item', async () => {
        await asyncMapPromise({ key1: [1, 2, 3, 4] }, {}, myFunc).then(
            myCallback
        );
        assert.equal(myFunc.callCount, 4);

        assert(myCallback.calledOnce);
        // spy return undefined at v16
        assert.deepEqual(myCallback.args[0][0], [undefined]);
    });

    it('should call function until an element returns an error array', async () => {
        let callCount = 0;

        await asyncMapPromise({ key1: [1, 2, [3], 4] }, {}, (a) => {
            callCount++;
            return a as number[];
        }).then(myCallback);
        assert.equal(callCount, 3);
        assert(myCallback.calledOnce);
        assert.deepEqual(myCallback.args[0][0], [[3]]);
    });

    it('should call callback with array results from function call', async () => {
        let callCount = 0;

        await asyncMapPromise(
            { key1: [1, 2, [3], 4], key2: [[5]] },
            {},
            (a) => {
                callCount++;
                return a as number[];
            }
        ).then(myCallback);
        assert.equal(callCount, 4);
        assert(myCallback.calledOnce);
        assert.deepEqual(myCallback.args[0][0], [[3], [5]]);
    });

    it('should support `options.first` and return after first error array is found', async () => {
        let callCount = 0;

        const res = await asyncMapPromise(
            { key1: [[], [1]], key2: [[2]], key: [[3]] },
            { first: true },
            (a: number[]) => {
                callCount++;
                return a;
            }
        );
        assert.deepEqual(res, [1]);
        assert.equal(callCount, 2);
    });
});
