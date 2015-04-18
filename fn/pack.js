require('./prefill.js')

Object.prototype.pack = function(args, that) {

    var newKeys = args || arguments.callee.caller.getParamNames()
    var ret = {}
    var i=0;
    Object.values(that || this).forEach(function(value) {
        ret[newKeys[i]] = value
        i++
    })
    return ret
};

Object.prototype.fpack = function(args, that) {
    var that = that || this
    var args = args || arguments.callee.caller.getParamNames()
    return function() {
        return this.pack(args, that)
    }
}

