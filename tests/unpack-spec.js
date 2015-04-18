describe('unpack', function() {
    it('should be a function on an object', function() {
        expect({}.unpack).toEqual(jasmine.any(Function))
    })

    it('should return an object when called', function() {
        expect({}.unpack()).toEqual(jasmine.any(Object))
    })

    it('should enumerate object values', function() {
        var testObj = {
            a: 1,
            b: 2,
            c: 3
        }
        expect(testObj.unpack()).toEqual({
            '0': 1,
            '1': 2,
            '2': 3
        })
    })
})