require('../fn/arguments.js')
describe('object prototype pollution', function() {
    it('should be a clean object', function() {
        for(var i in {})  {
            expect(true).toBe(false);
            break;
        }
    })
})
