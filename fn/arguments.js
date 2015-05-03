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


/**
 * Inverse function to pack
 *
 * @returns {{}}
 */
Object.prototype.unpack = function() {
    var ret = {}
    Object.values(this).forEach(function(value, i) {
        ret['' + i] = value
    })
    return ret
}


/**
 * Returns an object of an argument object with the appropiate keys
 *
 * E.g. {0: 'aaa', 1: 'bbb'} , parameters are a,b
 *
 * -> {a: 'aaa', b: 'bbb'}
 *
 * @returns {{}}
 */
Object.prototype.pack = function(args, that) {

    var newKeys = args || arguments.callee.caller.getParamNames()
    var ret = {}
    Object.values(that || this).forEach(function(value,i) {
        ret[newKeys[i]] = value
    })
    return ret
};

/**
 * Returns a function which will perform a pack
 *
 * @param args
 * @param that
 * @returns {Function}
 */
Object.prototype.fpack = function(args, that) {
    var that = that || this
    var args = args || arguments.callee.caller.getParamNames()
    return function() {
        return this.pack(args, that)
    }
}

/**
 * Packs all arguments and performs a defaultTo Operation on it
 * @param defaultValue
 * @returns {*}
 */
Object.prototype.packAndDefaultTo = function(defaultValue) {
    return arguments.fpack(arguments.callee.caller.getParamNames(), this).defaultTo(defaultValue)
}

/**
 * Packs all arguments and performs a defaultTo Operation on it and calls it
 * @param defaultValue
 * @returns {*}
 */
Object.prototype.cpackAndDefaultTo = function(defaultValue) {
    return arguments.fpack(arguments.callee.caller.getParamNames(), this).defaultTo(defaultValue) ()
}

/**
 * All functions from the source object are converted to curvyfied orderd versions
 * @returns {{}}
 */
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


/**
 * All functions from the source object are converted to curvyfied versions
 * @returns {{}}
 */
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

// hide object defined properties so it doesn't break for(var .. in...) loops
for(var i in ['unpack', 'pack', 'fpack', 'cpackAndDefaultTo', 'curvifyOrdered', 'curvify']) {
    Object.defineProperty(Object.prototype, i, { enumerable: false });
}


Function.prototype.wrap = function (fn) {
    var original = this;

    return function () {
        var args = Array.prototype.slice.call (arguments);
        args.unshift (original);

        return fn.apply (this, args);
    };
};

/**
 * Returns a prefilled function.
 * The parameters of the target function are mapped from the given object.
 * The order of the keys doesn't matter
 *
 * @param source
 * @returns {Function}
 */
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

/**
 * Performs a fillFromObject operation and calls the resulting function immediate
 * @param source
 * @returns {*}
 */
Function.prototype.cfillFromObject = function(source) {
    return this.fillFromObject(source) ();
}


Function.prototype.defaultTo = function(defaultValue, deep, mergeStrategy) {
    var fn = this;
    deep = deep || false;
    mergeStrategy = mergeStrategy || false;

    return fn.wrap(function(originalFunction, args) {
        var ret = originalFunction.call(this, args);
        var merged = Object.merge(ret, defaultValue, deep, mergeStrategy);
        return merged || defaultValue;
    });
};

/**
 * Performs a defaultTo operation and calls resulting method immediate
 *
 * @param defaultTo
 * @param deep
 * @param mergeStrategy
 * @returns {*}
 */
Function.prototype.cdefaultTo = function(defaultTo, deep, mergeStrategy) {
    return this.defaultTo(defaultTo, deep, mergeStrategy) ();
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

