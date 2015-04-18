require('../fn/arguments.js')

describe('curvyOrdered',function() {
    var anyFn = jasmine.any(Function)
    function t(a,b) {

    }

    it('should defined in the function prototype', function() {
        expect(Function.prototype.curvyOrdered).toEqual(anyFn)
    })

    it('should expose only first parameter', function() {
        expect(t.curvyOrdered().a).toEqual(anyFn)
        expect(t.curvyOrdered().b).not.toEqual(anyFn)
    })

    it('should expose second parameter, when first set', function() {
        var t1 = t.curvyOrdered()
        expect(t1.a().b).toEqual(anyFn);
    })

    describe('behaviour', function() {
        function and(a,b,c) {
            return a && b && c
        }
        it('should call function when params are filled', function() {
            expect(and.curvyOrdered().a(true).b(true).c(true)).toBe(true)
        })

        it('should not allow setting param twice', function() {
            expect(and.curvyOrdered().a(true).a).not.toEqual(anyFn)
        })

        it('should pass more than one arguments as array', function() {
            function t2(a,b) {
                return a.concat(b);
            }
            expect(t2.curvyOrdered().a(1,2,3).b(4)).toEqual([1,2,3,4])
        })
    })
})
