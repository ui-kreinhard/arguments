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

Object.prototype.unpack = function() {
    var ret = {}
    Object.values(this).forEach(function(value, i) {
        ret['' + i] = value
    })
    return ret
}

Object.prototype.pack = function(args, that) {

    var newKeys = args || arguments.callee.caller.getParamNames()
    var ret = {}
    Object.values(that || this).forEach(function(value,i) {
        ret[newKeys[i]] = value
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

Object.prototype.packAndDefaultTo = function(defaultValue) {
    return arguments.fpack(arguments.callee.caller.getParamNames(), this).defaultTo(defaultValue)
}

Function.prototype.fillFromObject = function(source) {
    var parameterNames = this.getParamNames()
    var origFunction = this

    var args = [];
    parameterNames.forEach(function(parameterName) {
        args.push(source[parameterName])
    })
    return function() {
        var slicedArgs = [].slice.call(arguments);
        var i = 0;
        var mappedArgs = args.map(function(storedValue) {
            return storedValue || slicedArgs[i++]
        })
        return origFunction.apply(this, mappedArgs);
    };
}

Object.prototype.cpackAndDefaultTo = function(defaultValue) {
    return arguments.fpack(arguments.callee.caller.getParamNames(), this).defaultTo(defaultValue) ()
}


Function.prototype.curvy = function curvy(context) {
    var origFunction = this;
    var currentArg = 0;
    var settedArgs = [];
    var args = this.getParamNames();
    var retObj = {};
    var resetChain = function () {
        args.forEach(function(argName) {
            retObj[argName] = function (argName,  argValue) {
                var argumentsArray = Array.prototype.slice.call(Array.prototype.slice.call(arguments,1, arguments.length));
                if(argumentsArray.length > 1) {
                    argValue = argumentsArray;
                }
                settedArgs.push(argValue);

                retObj[argName] = function () {
                    resetChain();
                    currentArg = 0;
                    settedArgs = [];
                    throw new Error(argName + ' already set');
                };
                currentArg++;
                if (currentArg >= args.length) {
                    resetChain();
                    var ret = origFunction.apply(context || this, settedArgs);
                    currentArg = 0;
                    settedArgs = [];
                    return ret;
                } else {
                    return retObj;
                }
            }.fill(argName);
        })
    }.bind(this);
    resetChain();
    return retObj;
}


Function.prototype.curvyOrdered = function (context) {
    var origFunction = this;
    var args = this.getParamNames();
    var retArray = [];
    var currentArg = 0;
    var settedArgs = []
    args.forEach(function(argName) {
        var retObj = {};
        retObj[argName] = function (argName, argValue) {
            var argumentsArray = Array.prototype.slice.call(Array.prototype.slice.call(arguments,1, arguments.length));
            if(argumentsArray.length > 1) {
                argValue = argumentsArray;
            }
            settedArgs.push(argValue);
            currentArg++;
            if (currentArg >= args.length) {
                var ret = origFunction.apply(context || this, settedArgs);
                currentArg = 0;
                settedArgs = []
                return ret;
            } else {
                return retArray[currentArg];
            }
        }.fill(argName);
        retArray.push(retObj);
    });
    return retArray[0];
}

Object.prototype.curvifyOrdered = function () {
    var members = Object.keys(this);
    var ret = {};
    members.forEach(function (key) {
        if (Object.isFunction(this[key])) {
            Object.merge(ret, this[key].curvyOrdered(this));
        }
    }.bind(this));
    return ret;
};

Object.prototype.curvify = function() {
    var members = Object.keys(this);
    var ret = {};
    members.forEach(function (key) {
        if (Object.isFunction(this[key])) {
            Object.merge(ret, this[key].curvy(this));
        }
    }.bind(this));
    return ret;
}