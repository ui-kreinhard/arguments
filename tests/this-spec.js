describe('this tests', function() {
   it('should be accessable', function() {
       var a = 123
       function showMe() {
           return a;
       }
       expect(showMe.bind(this)()).toBe(123)
   })
})
