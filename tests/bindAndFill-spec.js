require('../fn/prefill')

describe('bindAndFill', function() {

   it('should return a function', function() {
        expect(Function.prototype.bindAndFill(this)).toEqual(jasmine.any(Function))
    })

    describe('beahviour', function() {
        it('should return the return value', function() {
            function test() {
                return 1
            }

            expect(test.bindAndFill(this) ()).toBe(1)
        })

        it('should fill from the context', function() {
            function test(a) {
                return a;
            }
            this.a = 1;
            expect(test.bindAndFill(this) ()).toBe(1);
        })

        it('should work with arguments', function() {
            function test2(a,c) {
                return arguments.pack();
            }

            function test(a,b,c) {
                return test2.bindAndFill(arguments.pack()) ()
            }

            var ret = test(1,2,3);
            expect(ret.a).toBe(1)
        })

        it('can work with arguments and this combined', function() {
            function test2(a, b, c) {
                return arguments.pack();
            }

            function test(a,c) {
                this.b = 2
                ctx = Object.merge(this, arguments.pack())
                return test2.bindAndFill(ctx) ()
            }


            var ret = test(1,3);
            expect(ret.a).toBe(1)
            expect(ret.b).toBe(2)
            expect(ret.c).toBe(3)
        })
    })
})
