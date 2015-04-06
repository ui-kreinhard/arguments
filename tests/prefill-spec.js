require('../fn/prefill.js')

describe('prefill', function() {
    it('should extend function prototype', function() {
        expect(function(){}.prefill).toBeDefined()
    })

    describe('behaviour', function() {
        xit('should return pointer to the original function', function() {
            var called = false;
            function toBeCalled() {
                called = true
            }
            var newFn = toBeCalled.prefill();
            expect(newFn).toEqual(jasmine.any(Function))
            newFn()
            expect(called).toBe(true)
        })

        it('should inject the right parameters', function() {
            function add(a,d) {
                return a+d
            }
           function outer(a,b,c,d) {
               var newFn = prefillManual(add, arguments, outer.getParamNames())
               expect(newFn).toBe(5)
           }
            outer(4,3,2,1)
        });

        it('should automagically inject the right parameters', function() {
            function add(a,d) {
                return a+d
            }
            function outer(a,b,c,d) {
                var newFn = add.prefill()
                expect(newFn()).toBe(5)
            }
            outer(4,3,2,1)
        })

        describe('more complex example', function() {
            var a, b, c, d, e;

            function interlink(provider, request, app) {
                a = provider
                b = request
                c = app
            }

            function handleRequest(request, app) {
                d = request
                e = app
            }

            function init(data, provider, request, handler, app) {
                interlink.cprefill();
                handleRequest.cprefill()
            }

            init(1,2,3,4,5)
            expect(a).toBe(2)
            expect(b).toBe(3)
            expect(c).toBe(5)
            expect(d).toBe(3)
            expect(e).toBe(5)
        })

        describe('ioc', function() {
            function registerFn(a,b,c,d, done) {
                return done.cprefill()
            }

            var injector= registerFn.fill(1,2,3,4);

            var ret;
            var add = function(a,d) {
                ret = (a+d)
            }
            injector(add)
            expect(ret).toBe(5)
            injector(function(a,c) {
                ret = a + c
            })
            expect(ret).toBe(4)
        })
    })
})