require('../fn/arguments.js')
describe('default to', function() {
    function defaultTest(a) {
        if (a===0) {
            return null;
        }
        if (a===1) {
            return undefined;
        }
        return a;
    }

    describe('simple usage', function() {
        var defaulted = defaultTest.defaultTo('default');

        it('should be defined', function() {
            expect(Function.prototype.defaultTo).toBeDefined();
        });

        it('should return default when original function returns undefined', function() {
            expect(defaulted(1)).toBe('default');
        });

        it('should return default when original function returns undefined', function() {
            expect(defaulted(2)).toBe(2);
        });

        it('should return default when null is returned', function() {
            expect(defaulted(0)).toBe('default');
        });
    });

    describe('usage with objects', function() {
        function returnObj() {
            return {
                a: 1,
                c: '2'
            };
        }
        it('should fill missing attributes in return', function() {

            expect(returnObj.defaultTo({ a: 42, b: 23, c: 3.14}) ()).toEqual({a: 1, b: 23, c: '2'});
        });

        it('should work with complex objects as default', function () {
            var defaulted = defaultTest.defaultTo({ a: 42, b: 23, c: 3.14});
            expect(defaulted(1)).toEqual({ a: 42, b: 23, c: 3.14});
        });

        it('can be used for simplify defaulting arguments', function() {
            function a(b,c,d) {
                return arguments.packAndDefaultTo({b: 1,c: 2, d:3});
            }

            expect( a(4,5) ()).toEqual({b:4,c:5,d:3})
        });
    });


});