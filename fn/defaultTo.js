require('./pack.js')
/**
 * Creates a new function with a reference to the original function as the first argument.
 *
 * @param fn
 * @returns {Function}
 * @see prototype.js wrap
 */
Function.prototype.wrap = function (fn) {
    var original = this;

    return function () {
        var args = Array.prototype.slice.call (arguments);
        args.unshift (original);

        return fn.apply (this, args);
    };
};

Function.prototype.defaultTo = function(defaultValue) {
    var fn = this;

    return fn.wrap(function(originalFunction, args) {
        var ret = originalFunction(args);
        var merged = Object.merge(ret, defaultValue, false, false);
        return merged || defaultValue;
    });
};

Object.prototype.defaultTo = function(defaultValue) {
    return arguments.fpack(arguments.callee.caller.getParamNames(), this).defaultTo(defaultValue)
}