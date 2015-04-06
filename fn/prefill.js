require('sugar')


Function.prototype.getParamNames = function () {
    var func = this;
    var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
    var ARGUMENT_NAMES = /([^\s,]+)/g;
    var fnStr = func.toString().replace(STRIP_COMMENTS, '');
    var result = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(ARGUMENT_NAMES);
    if (result === null)
        result = [];
    return result;
}

prefillManual = function prefillManual(origFunction, outerArguments, outerParameterNames, ctx) {
    var argumentsArray = []
    var innerParameterNames = origFunction.getParamNames()
    ctx = ctx || this;

    innerParameterNames.forEach(function(value) {
        var indexOfParameter = (outerParameterNames.indexOf(value));
        argumentsArray.push(outerArguments['' + indexOfParameter])
    })

    return origFunction.apply(ctx, argumentsArray)
}

Function.prototype.prefill = function(ctx) {
    var outerParams = arguments.callee.caller.getParamNames()
    var callerArguments = arguments.callee.caller.arguments

    return prefillManual.fill(this, callerArguments, outerParams, ctx)
}

Function.prototype.cprefill = function(ctx) {
    var outerParams = arguments.callee.caller.getParamNames()
    var callerArguments = arguments.callee.caller.arguments

    return prefillManual(this, callerArguments, outerParams, ctx)
}