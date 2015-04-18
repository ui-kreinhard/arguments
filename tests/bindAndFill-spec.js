require('../fn/arguments.js')

describe('fillFromObject', function() {


    it('should return a function', function() {
        expect(Function.prototype.fillFromObject(this)).toEqual(jasmine.any(Function))
    })

    describe('beahviour', function() {
        it('should return the return value', function() {
            function test() {
                return 1
            }

            expect(test.fillFromObject(this) ()).toBe(1)
        })

        it('should fill from the context', function() {
            function test(a) {
                return a;
            }
            this.a = 1;
            expect(test.fillFromObject(this) ()).toBe(1);
        })

        it('should work with arguments', function() {
            function test2(a,c) {
                return arguments.pack();
            }

            function test(a,b,c) {
                return test2.fillFromObject(arguments.pack()) ()
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
                return test2.fillFromObject(ctx) ()
            }


            var ret = test(1,3);
            expect(ret.a).toBe(1)
            expect(ret.b).toBe(2)
            expect(ret.c).toBe(3)
        })

        describe('can be used to fill from arguments', function() {
            it('should fill', function() {
                function t(a,b,c) {
                    expect(a).toBe(1)
                    expect(b).toBe(2)
                    expect(c).toBe(3)
                }

                function t2(a,b,c,d) {
                    t.fillFromObject(arguments.pack()) ();
                }

                t2(1,2,3)
            })

            it('should combine with args.defaultsTo', function() {
                function t(a,b,c,f) {
                    expect(a).toBe(1)
                    expect(b).toBe(2)
                    expect(c).toBe(3)
                    expect(f).toBe(4)
                }

                function t2(a,b,c,d) {
                    t.fillFromObject(arguments.cpackAndDefaultTo({f: 4}) ) ();
                }

                t2(1,2,3)
            })
        })

        describe('should handle unknown vars in source', function() {
            function test(a,b,c) {
                return arguments.pack();
            }

            function test2(a,b,c,d) {
                return arguments.pack();
            }
            it('at the beginning', function() {
                var filled = test.fillFromObject({b: 2, c:3});
                expect(filled(1).a).toBe(1)
                expect(filled(1).b).toBe(2)
                expect(filled(1).c).toBe(3)
            });

            it('in the middle', function() {
                var filled = test.fillFromObject({a: 1, c:3});
                expect(filled(2).a).toBe(1)
                expect(filled(2).b).toBe(2)
                expect(filled(2).c).toBe(3)

            })
            it('multiple ones', function() {
                var filled = test2.fillFromObject({a: 1, d: 4});
                expect(filled(2,3).a).toBe(1)
                expect(filled(2,3).b).toBe(2)
                expect(filled(2,3).c).toBe(3)
                expect(filled(2,3).d).toBe(4)
            })

            it('at the end', function () {
                var filled = test.fillFromObject({a: 1, c:3});
                expect(filled(2).a).toBe(1)
                expect(filled(2).b).toBe(2)
                expect(filled(2).c).toBe(3)
            })
        })
    })
})
