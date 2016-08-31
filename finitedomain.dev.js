'use strict';
Object.defineProperty(exports, "__esModule", {
    value: true
});
var _createClass = function() {
    function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ("value" in descriptor) descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor);
        }
    }
    return function(Constructor, protoProps, staticProps) {
        if (protoProps) defineProperties(Constructor.prototype, protoProps);
        if (staticProps) defineProperties(Constructor, staticProps);
        return Constructor;
    };
}();
var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function(obj) {
    return typeof obj;
} : function(obj) {
    return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj;
};

function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
    }
} // from: src/asmdomain.js
/* eslint eqeqeq: "off", quotes: "off" */ // eslint ought to support asmjs out-of-the-box because this is required syntax :/
/**
 * Note: this block is asm.js compliant. Mainly concerns numbered domains.
 *
 * If a browser does not support asm.js then it still works
 * as regular JS. Behavior should be equal in any case.
 */
function AsmDomainJs() /*stdlib, foreign, heap*/ {
    "use asm";
    /**
     * Add numbers between `from` and `to`, inclusive, to the domain.
     *
     * @param {$domain_num} domain
     * @param {number} from Regular decimal number, not flag!
     * @param {number} to Regular decimal number, not flag!
     * @returns {$domain_num}
     */
    function addRange(domain, from, to) {
        domain = domain | 0;
        from = from | 0;
        to = to | 0; // what we do is:
        // - create a 1
        // - move the 1 to the left, `1+to-from` times
        // - subtract 1 to get a series of `to-from` ones
        // - shift those ones `from` times to the left
        // - OR that result with the domain and return it
        return domain | createRange(from, to);
    }
    /**
     * Returns 1 if the domain contains given number and 0 otherwise.
     *
     * @param {$domain_num} domain
     * @param {number} value NOT a flag
     * @returns {number} "boolean", 0 or 1
     */
    function containsValue(domain, value) {
        domain = domain | 0;
        value = value | 0;
        return (domain & 1 << value) != 0 | 0;
    }
    /**
     * Create a new domain with given value as the only member
     *
     * @param {number} value NOT a flag
     * @returns {$domain_num} (basically the flag)
     */
    function createValue(value) {
        value = value | 0;
        return 1 << value;
    }
    /**
     * Create a domain with all numbers lo,hi (inclusive) as member.
     *
     * @param {number} lo NOT a flag
     * @param {number} hi NOT a flag
     * @returns {$domain_num}
     */
    function createRange(lo, hi) {
        lo = lo | 0;
        hi = hi | 0;
        return (1 << 1 + (hi | 0) - (lo | 0)) - 1 << lo; //var domain = 0;
        //while ((lo | 0) <= (hi | 0)) {
        //  domain = domain | (1 << lo);
        //  lo = (lo + 1) | 0;
        //}
        //return domain | 0;
    }
    /**
     * Return a domain containing all numbers from zero to the highest
     * number in given domain. In binary this means we'll set all the
     * bits of lower value than the most-significant set bit.
     *
     * @param {$domain_num} domain
     * @returns {$domain_num}
     */
    function createRangeZeroToMax(domain) {
        domain = domain | 0;
        domain = domain | domain >> 1;
        domain = domain | domain >> 2;
        domain = domain | domain >> 4;
        domain = domain | domain >> 8;
        domain = domain | domain >> 16;
        return domain | 0;
    }
    /**
     * Return -1 if domain is not solved and otherwise return
     * the value to which the domain is solved. A domain is
     * solved when it contains exactly one value.
     *
     * @param {$domain_num} domain
     * @returns {number} -1 means NO_SUCH_VALUE
     */
    function getValue(domain) {
        domain = domain | 0;
        var lo = 0;
        lo = min(domain) | 0; //    console.log('->',domain,lo,'\n  ', domain.toString(2).padStart(32, '0'),'\n  ', (1<<lo).toString(2).padStart(32, '0'))
        return ((domain | 0) == 1 << lo ? lo : -1) | 0;
    }
    /**
     * Return a domain that contains any value that is contained in
     * both domain1 and domain2. For a small domain this is the simple
     * product of `A&B`.
     *
     * @param {$domain_num} domain1
     * @param {$domain_num} domain2
     * @returns {$domain_num}
     */
    function intersection(domain1, domain2) {
        domain1 = domain1 | 0;
        domain2 = domain2 | 0;
        return domain1 & domain2;
    }
    /**
     * Check if every element in one domain does not
     * occur in the other domain and vice versa
     *
     * @param {$domain_num} domain1
     * @param {$domain_num} domain2
     * @returns {number} 0 for false or 1 for true
     */
    function sharesNoElements(domain1, domain2) { // checks whether not a single bit in set in _both_ domains
        domain1 = domain1 | 0;
        domain2 = domain2 | 0;
        return (domain1 & domain2) == 0 | 0;
    }
    /**
     * A domain is "solved" if it contains exactly one
     * value. It is not solved if it is empty.
     *
     * @param {$domain_num} domain
     * @returns {number} 0 for false or 1 for true
     */
    function isSolved(domain) {
        domain = domain | 0;
        var some = 0;
        var any = 0; // http://stackoverflow.com/questions/12483843/test-if-a-bitboard-have-only-one-bit-set-to-1
        // first check if <=1 bits were set, then make sure the domain had >=1 set.
        some = (isPopcountNotOne(domain) | 0) == 0 | 0;
        any = (domain | 0) != 0 | 0;
        return some & any; //return (((domain & (domain - 1)) == 0) & (domain > 0))|0;
    }
    /**
     * @param {$domain_num} domain
     * @param {number} value
     * @returns {number} 0 for false or 1 for true
     */
    function isValue(domain, value) {
        domain = domain | 0;
        value = value | 0;
        return (domain | 0) == 1 << value | 0;
    }
    /**
     * A domain is "determined" if it's either one value
     * (solved) or none at all (rejected).
     *
     * @param {$domain_num} domain
     * @returns {boolean}
     */
    function isUndetermined(domain) {
        domain = domain | 0;
        var some = 0;
        var any = 0; // http://stackoverflow.com/questions/12483843/test-if-a-bitboard-have-only-one-bit-set-to-1
        // first check if not just one bit was set, then make sure the domain had >=1 set.
        some = (isPopcountNotOne(domain) | 0) != 0 | 0;
        any = (domain | 0) != 0 | 0;
        return some & any; //return (domain & (domain - 1)) !== 0 && domain !== 0;
    }
    /**
     * Helper function that does a bit trick.
     *
     * @param domain
     * @returns {number}
     */
    function isPopcountNotOne(domain) {
        domain = domain | 0; // returns zero if domain had exactly one bit set, non-zero otherwise (returns other values than 1)
        return domain & domain - 1;
    }
    /**
     * Returns highest value in domain
     * Relatively expensive because there's no easy trick.
     *
     * @param {$domain_num} domain
     * @returns {number} NOT a flag
     */
    function max(domain) {
        domain = domain | 0;
        var i = 30; // fast paths: these are by far the most used case in our situation
        // (the empty domain check is "free" here)
        switch (domain | 0) {
            case 0:
                return -1; // empty domain
            case 1:
                return 0;
            case 2:
                return 1;
            case 3:
                return 1;
        } // there's no pretty way to do this
        do {
            if (domain & 1 << i) break;
            i = i - 1 | 0;
        } while ((i | 0) >= 0);
        return i | 0; // note: the 31 case is unused in our system and assumed impossible here
    }
    /**
     * Get lowest value in the domain
     *
     * This is also called a "bitscan" or "bitscan forward" because
     * in a small domain we want to know the index of the least
     * significant bit that is set. A different way of looking at
     * this is that we'd want to know the number of leading zeroes
     * ("clz") in the number because we would just need to +1 that
     * to get our desired value. There are various solutiosn to
     * this problem but some are not feasible to implement in JS
     * because we can't rely on low level optimizations. And
     * certainly we can't use the cpu machine instruction.
     *
     * Be aware that there are about a million ways to do this,
     * even to do this efficiently. Mileage under JS varies hto.
     *
     * ES6 _does_ expose `Math.clz32()` so if we can be certain
     * it is natively supported we should go with that and hope
     * it becomes a single instruction. Don't rely on a polyfill.
     *
     * @param {$domain_num} domain
     * @returns {number} NOT a flag
     */
    function min(domain) {
        domain = domain | 0; // fast paths: these are by far the most used case in our situation
        if ((domain | 0) == 1) return 0;
        if ((domain | 0) == 2) return 1;
        if ((domain | 0) == 3) return 0; // from https://graphics.stanford.edu/~seander/bithacks.html#ZerosOnRightModLookup
        // the table lookup is unfortunate. the mod is probably slow for us but hard to tell
        // the difference so let's not care for now.
        switch ((domain & -domain) % 37 | 0) {
            case 0: //return 32;
                return -1; // note: we dont use bits 31 and 32 so we can check for empty domain here "for free"
            case 1: // does not exist within 32bits
                return 0;
            case 2:
                return 1;
            case 3:
                return 26;
            case 4:
                return 2;
            case 5:
                return 23;
            case 6:
                return 27;
            case 7: // does not exist within 32bits
                return 0;
            case 8:
                return 3;
            case 9:
                return 16;
            case 10:
                return 24;
            case 11:
                return 30;
            case 12:
                return 28;
            case 13:
                return 11;
            case 14: // does not exist within 32bits
                return 0;
            case 15:
                return 13;
            case 16:
                return 4;
            case 17:
                return 7;
            case 18:
                return 17;
            case 19: // does not exist within 32bits
                return 0;
            case 20:
                return 25;
            case 21:
                return 22;
            case 22: //return 31;
                return -1; // we dont use the last bit
            case 23:
                return 15;
            case 24:
                return 29;
            case 25:
                return 10;
            case 26:
                return 12;
            case 27:
                return 6;
            case 28: // does not exist within 32bits
                return 0;
            case 29:
                return 21;
            case 30:
                return 14;
            case 31:
                return 9;
            case 32:
                return 5;
            case 33:
                return 20;
            case 34:
                return 8;
            case 35:
                return 19;
        } // case 36:
        return 18;
    }
    /**
     * Remove all values from domain that are greater
     * than or equal to given value
     *
     * @param {$domain_num} domain
     * @param {number} value NOT a flag
     * @returns {$domain_num}
     */
    function removeGte(domain, value) {
        domain = domain | 0;
        value = value | 0;
        switch (value | 0) {
            case 0:
                return 0;
            case 1:
                return domain & 0x00000001;
            case 2:
                return domain & 0x00000003;
            case 3:
                return domain & 0x00000007;
            case 4:
                return domain & 0x0000000f;
            case 5:
                return domain & 0x0000001f;
            case 6:
                return domain & 0x0000003f;
            case 7:
                return domain & 0x0000007f;
            case 8:
                return domain & 0x000000ff;
            case 9:
                return domain & 0x000001ff;
            case 10:
                return domain & 0x000003ff;
            case 11:
                return domain & 0x000007ff;
            case 12:
                return domain & 0x00000fff;
            case 13:
                return domain & 0x00001fff;
            case 14:
                return domain & 0x00003fff;
            case 15:
                return domain & 0x00007fff;
            case 16:
                return domain & 0x0000ffff;
            case 17:
                return domain & 0x0001ffff;
            case 18:
                return domain & 0x0003ffff;
            case 19:
                return domain & 0x0007ffff;
            case 20:
                return domain & 0x000fffff;
            case 21:
                return domain & 0x001fffff;
            case 22:
                return domain & 0x003fffff;
            case 23:
                return domain & 0x007fffff;
            case 24:
                return domain & 0x00ffffff;
            case 25:
                return domain & 0x01ffffff;
            case 26:
                return domain & 0x03ffffff;
            case 27:
                return domain & 0x07ffffff;
            case 28:
                return domain & 0x0fffffff;
            case 30:
                return domain | 0; // assuming domain is "valid" we can just return it now.
        }
        return domain | 0; // when value > 30
    }
    /**
     * Remove all values from domain that are lower
     * than or equal to given value
     *
     * @param {$domain_num} domain
     * @param {number} value NOT a flag
     * @returns {$domain_num}
     */
    function removeLte(domain, value) {
        domain = domain | 0;
        value = value | 0;
        switch (value | 0) {
            case 0:
                return domain & 0x7ffffffe;
            case 1:
                return domain & 0x7ffffffc;
            case 2:
                return domain & 0x7ffffff8;
            case 3:
                return domain & 0x7ffffff0;
            case 4:
                return domain & 0x7fffffe0;
            case 5:
                return domain & 0x7fffffc0;
            case 6:
                return domain & 0x7fffff80;
            case 7:
                return domain & 0x7fffff00;
            case 8:
                return domain & 0x7ffffe00;
            case 9:
                return domain & 0x7ffffc00;
            case 10:
                return domain & 0x7ffff800;
            case 11:
                return domain & 0x7ffff000;
            case 12:
                return domain & 0x7fffe000;
            case 13:
                return domain & 0x7fffc000;
            case 14:
                return domain & 0x7fff8000;
            case 15:
                return domain & 0x7fff0000;
            case 16:
                return domain & 0x7ffe0000;
            case 17:
                return domain & 0x7ffc0000;
            case 18:
                return domain & 0x7ff80000;
            case 19:
                return domain & 0x7ff00000;
            case 20:
                return domain & 0x7fe00000;
            case 21:
                return domain & 0x7fc00000;
            case 22:
                return domain & 0x7f800000;
            case 23:
                return domain & 0x7f000000;
            case 24:
                return domain & 0x7e000000;
            case 25:
                return domain & 0x7c000000;
            case 26:
                return domain & 0x78000000;
            case 27:
                return domain & 0x70000000;
            case 28:
                return domain & 0x60000000;
            case 29:
                return domain & 0x40000000;
            case 30:
                return 0; // assuming domain is "valid" this should remove all elements
        }
        return 0; // when value > 30
    }
    /**
     * @param {$domain_num} domain
     * @param {number} value NOT a flag
     * @returns {$domain_num}
     */
    function removeValue(domain, value) {
        domain = domain | 0;
        value = value | 0;
        var flag = 0;
        if ((value | 0) > 30) return domain | 0;
        flag = 1 << value;
        return (domain | flag) ^ flag;
    }
    /**
     * Return the number of elements this domain covers
     *
     * @param {$domain_num} domain
     * @returns {number}
     */
    function size(domain) {
        domain = domain | 0; // need to work on this one because it requires 64bits. should be doable, to revisit later
        //      domain = (domain - (((domain >>> 1) & 0x55555555))) | 0;
        //      domain = ((domain & 0x33333333) + ((domain >>> 2) & 0x33333333)) | 0;
        //      domain = ((+((domain + (domain >>> 4)) & 0x0F0F0F0F) * +0x01010101)|0) >>> 24;
        //      return domain;
        // hot paths; binary
        // the empty domain is "free"
        switch (domain | 0) {
            case 0:
                return 0; // empty domain
            case 1:
                return 1;
            case 2:
                return 1;
            case 3:
                return 2;
        }
        return (domain & 1) + (domain >> 1 & 1) + (domain >> 2 & 1) + (domain >> 3 & 1) + (domain >> 4 & 1) + (domain >> 5 & 1) + (domain >> 6 & 1) + (domain >> 7 & 1) + (domain >> 8 & 1) + (domain >> 9 & 1) + (domain >> 10 & 1) + (domain >> 11 & 1) + (domain >> 12 & 1) + (domain >> 13 & 1) + (domain >> 14 & 1) + (domain >> 15 & 1) + (domain >> 16 & 1) + (domain >> 17 & 1) + (domain >> 18 & 1) + (domain >> 19 & 1) + (domain >> 20 & 1) + (domain >> 21 & 1) + (domain >> 22 & 1) + (domain >> 23 & 1) + (domain >> 24 & 1) + (domain >> 25 & 1) + (domain >> 26 & 1) + (domain >> 27 & 1) + (domain >> 28 & 1) + (domain >> 29 & 1) + (domain >> 30 & 1) + (domain >> 31 & 1) | 0;
    }
    return {
        addRange: addRange,
        containsValue: containsValue,
        createRange: createRange,
        createValue: createValue,
        createRangeZeroToMax: createRangeZeroToMax,
        getValue: getValue,
        intersection: intersection,
        isSolved: isSolved,
        isUndetermined: isUndetermined,
        isValue: isValue,
        max: max,
        min: min,
        removeGte: removeGte,
        removeLte: removeLte,
        removeValue: removeValue,
        sharesNoElements: sharesNoElements,
        size: size
    };
}
var obj = AsmDomainJs();
var asmdomain_addRange = obj.addRange;
var asmdomain_containsValue = obj.containsValue;
var asmdomain_createRange = obj.createRange;
var asmdomain_createValue = obj.createValue;
var asmdomain_createRangeZeroToMax = obj.createRangeZeroToMax;
var asmdomain_getValue = obj.getValue;
var asmdomain_intersection = obj.intersection;
var asmdomain_isSolved = obj.isSolved;
var asmdomain_isUndetermined = obj.isUndetermined;
var asmdomain_isValue = obj.isValue;
var asmdomain_max = obj.max;
var asmdomain_min = obj.min;
var asmdomain_removeGte = obj.removeGte;
var asmdomain_removeLte = obj.removeLte;
var asmdomain_removeValue = obj.removeValue;
var asmdomain_sharesNoElements = obj.sharesNoElements;
var asmdomain_size = obj.size; // end of src/asmdomain.js
// from: src/config.js
/**
 * @returns {$finitedomain_config}
 */
function config_create() {
    var config = {
        _class: '$config', // doing `indexOf` for 5000+ names is _not_ fast. so use a trie
        _var_names_trie: trie_create(),
        _changedVarsTrie: undefined,
        _propagationBatch: 0,
        _propagationCycles: 0,
        _front: undefined,
        varStratConfig: config_createVarStratConfig(),
        valueStratName: 'min',
        targetedVars: 'all',
        var_dist_options: {},
        timeout_callback: undefined, // names of all vars in this search tree
        // optimizes loops because `for-in` is super slow
        all_var_names: [], // the propagators are generated from the constraints when a space
        // is created from this config. constraints are more higher level.
        all_constraints: [],
        constant_cache: {}, // <value:varIndex>, generally anonymous vars but pretty much first come first serve
        initial_domains: [], // $domain_str[] : initial domains for each var, maps 1:1 to all_var_names
        _propagators: [], // initialized later
        _varToPropagators: [], // initialized later
        _constrainedAway: []
    };
    ASSERT(!void(config._propagates = 0), 'number of propagate() calls');
    return config;
}

function config_clone(config, newDomains) {
    ASSERT(config._class === '$config', 'EXPECTING_CONFIG');
    var varStratConfig = config.varStratConfig;
    var valueStratName = config.valueStratName;
    var targetedVars = config.targetedVars;
    var var_dist_options = config.var_dist_options;
    var timeout_callback = config.timeout_callback;
    var constant_cache = config.constant_cache;
    var all_var_names = config.all_var_names;
    var all_constraints = config.all_constraints;
    var initial_domains = config.initial_domains;
    var _propagators = config._propagators;
    var _varToPropagators = config._varToPropagators;
    var _constrainedAway = config._constrainedAway;
    var _propagationBatch = config._propagationBatch;
    var _propagationCycles = config._propagationCycles;
    var clone = {
        _class: '$config',
        _var_names_trie: trie_create(all_var_names), // just create a new trie with (should be) the same names
        _changedVarsTrie: undefined,
        _propagationBatch: _propagationBatch, // track _propagationCycles at start of last propagate() call
        _propagationCycles: _propagationCycles, // current step value
        _front: undefined, // dont clone this, that's useless.
        varStratConfig: varStratConfig,
        valueStratName: valueStratName,
        targetedVars: targetedVars instanceof Array ? targetedVars.slice(0) : targetedVars,
        var_dist_options: JSON.parse(JSON.stringify(var_dist_options)), // TOFIX: clone this more efficiently
        timeout_callback: timeout_callback, // by reference because it's a function if passed on...
        constant_cache: constant_cache, // is by reference ok?
        all_var_names: all_var_names.slice(0),
        all_constraints: all_constraints.slice(0),
        initial_domains: newDomains || initial_domains, // <varName:domain>
        _propagators: _propagators && _propagators.slice(0), // in case it is initialized
        _varToPropagators: _varToPropagators && _varToPropagators.slice(0), // inited elsewhere
        _constrainedAway: _constrainedAway && _constrainedAway.slice(0)
    };
    ASSERT(!void(clone._propagates = 0), 'number of propagate() calls');
    return clone;
}
/**
 * Add an anonymous var with max allowed range
 *
 * @param {$config} config
 * @returns {number} varIndex
 */
function config_addVarAnonNothing(config) {
    return config_addVarNothing(config, true);
}
/**
 * @param {$config} config
 * @param {string|boolean} varName (If true, is anonymous)
 * @returns {number} varIndex
 */
function config_addVarNothing(config, varName) {
    return _config_addVar(config, varName, domain_toStr(domain_createRange(SUB, SUP)));
}
/**
 * @param {$config} config
 * @param {number} lo
 * @param {number} hi
 * @returns {number} varIndex
 */
function config_addVarAnonRange(config, lo, hi) {
    ASSERT(config._class === '$config', 'EXPECTING_CONFIG');
    ASSERT(typeof lo === 'number', 'A_LO_MUST_BE_NUMBER');
    ASSERT(typeof hi === 'number', 'A_HI_MUST_BE_NUMBER');
    if (lo === hi) return config_addVarAnonConstant(config, lo);
    return config_addVarRange(config, true, lo, hi);
}
/**
 * @param {$config} config
 * @param {string|boolean} varName (If true, is anonymous)
 * @param {number} lo
 * @param {number} hi
 * @returns {number} varIndex
 */
function config_addVarRange(config, varName, lo, hi) {
    ASSERT(config._class === '$config', 'EXPECTING_CONFIG');
    ASSERT(typeof varName === 'string' || varName === true, 'A_VARNAME_SHOULD_BE_STRING_OR_TRUE');
    ASSERT(typeof lo === 'number', 'A_LO_MUST_BE_NUMBER');
    ASSERT(typeof hi === 'number', 'A_HI_MUST_BE_NUMBER');
    ASSERT(lo <= hi, 'A_RANGES_SHOULD_ASCEND');
    var domain = domain_toStr(domain_createRange(lo, hi));
    return _config_addVar(config, varName, domain);
}
/**
 * @param {$config} config
 * @param {string|boolean} varName (If true, anon)
 * @param {$domain_arr} domain Small domain format not allowed here. this func is intended to be called from Solver, which only accepts arrdoms
 * @returns {number} varIndex
 */
function config_addVarDomain(config, varName, domain) {
    ASSERT(domain instanceof Array, 'DOMAIN_MUST_BE_ARRAY_HERE');
    return _config_addVar(config, varName, domain_arrToStr(domain));
}
/**
 * @param {$config} config
 * @param {number} value
 * @returns {number} varIndex
 */
function config_addVarAnonConstant(config, value) {
    ASSERT(config._class === '$config', 'EXPECTING_CONFIG');
    ASSERT(typeof value === 'number', 'A_VALUE_SHOULD_BE_NUMBER');
    if (config.constant_cache[value] !== undefined) {
        return config.constant_cache[value];
    }
    return config_addVarConstant(config, true, value);
}
/**
 * @param {$config} config
 * @param {string|boolean} varName (True means anon)
 * @param {number} value
 * @returns {number} varIndex
 */
function config_addVarConstant(config, varName, value) {
    ASSERT(config._class === '$config', 'EXPECTING_CONFIG');
    ASSERT(typeof varName === 'string' || varName === true, 'varName must be a string or true for anon');
    ASSERT(typeof value === 'number', 'A_VALUE_SHOULD_BE_NUMBER');
    var domain = domain_toStr(domain_createRange(value, value));
    return _config_addVar(config, varName, domain);
}
/**
 * @param {$config} config
 * @param {string|true} varName If true, the varname will be the same as the index it gets on all_var_names
 * @param {$domain_str} domain strdom ONLY! other methods that call this should make sure their $domain is converted to a strdom
 * @returns {number} varIndex
 */
function _config_addVar(config, varName, domain) {
    ASSERT(config._class === '$config', 'EXPECTING_CONFIG');
    ASSERT(varName === true || typeof varName === 'string', 'VAR_NAMES_SHOULD_BE_STRINGS');
    ASSERT(String(parseInt(varName, 10)) !== varName, 'DONT_USE_NUMBERS_AS_VAR_NAMES[' + varName + ']');
    ASSERT(varName && typeof varName === 'string' || varName === true, 'A_VAR_NAME_MUST_BE_STRING_OR_TRUE');
    ASSERT(varName === true || !trie_has(config._var_names_trie, varName), 'Do not declare the same varName twice');
    ASSERT_STRDOM(domain);
    ASSERT(domain, 'NON_EMPTY_DOMAIN');
    ASSERT(domain === EMPTY_STR || domain_any_min(domain) >= SUB, 'domain lo should be >= SUB', domain);
    ASSERT(domain === EMPTY_STR || domain_any_max(domain) <= SUP, 'domain hi should be <= SUP', domain);
    var allVarNames = config.all_var_names;
    var varIndex = allVarNames.length;
    var wasAnonymous = varName === true;
    if (wasAnonymous) {
        varName = String(varIndex); // this var will be assigned to this index
    } // note: 100 is an arbitrary number but since large sets are probably
    // automated it's very unlikely we'll need this check in those cases
    if (varIndex < 100 && trie_has(config._var_names_trie, varName)) {
        if (wasAnonymous) THROW('DONT_USE_NUMBERS_AS_VAR_NAMES'); // there is an assertion for this above but wont be at runtime
        THROW('Var varName already part of this config. Probably a bug?');
    }
    var solvedTo = domain_str_getValue(domain);
    if (solvedTo !== NOT_FOUND && !config.constant_cache[solvedTo]) config.constant_cache[solvedTo] = varIndex;
    config.initial_domains[varIndex] = domain;
    config.all_var_names.push(varName);
    trie_add(config._var_names_trie, varName, varIndex);
    return varIndex;
}
/**
 * Initialize the config of this space according to certain presets
 *
 * @param {$config} config
 * @param {string} varName
 */
function config_setDefaults(config, varName) {
    ASSERT(config._class === '$config', 'EXPECTING_CONFIG');
    var defs = distribution_getDefaults(varName);
    for (var key in defs) {
        config_setOption(config, key, defs[key]);
    }
}
/**
 * Create a config object for the var distribution
 *
 * @param {Object} obj
 * @property {string} [obj.type] Map to the internal names for var distribution strategies
 * @property {string} [obj.priorityList] An ordered list of var names to prioritize. Names not in the list go implicitly and unordered last.
 * @property {boolean} [obj.inverted] Should the list be interpreted inverted? Unmentioned names still go last, regardless.
 * @property {Object} [obj.fallback] Same struct as obj. If current strategy is inconclusive it can fallback to another strategy.
 * @returns {$var_strat_config}
 */
function config_createVarStratConfig(obj) {
    /**
     * @typedef {$var_strat_config}
     */
    return {
        _class: '$var_strat_config',
        type: obj && obj.type || 'naive',
        priorityByName: obj && obj.priorityList,
        _priorityByIndex: undefined,
        inverted: !!(obj && obj.inverted),
        fallback: obj && obj.fallback
    };
}
/**
 * Configure an option for the solver
 *
 * @param {$config} config
 * @param {string} optionName
 * @param {*} optionValue
 * @param {string} [optionTarget] For certain options, this is the target var name
 */
function config_setOption(config, optionName, optionValue, optionTarget) {
    ASSERT(config._class === '$config', 'EXPECTING_CONFIG');
    ASSERT(typeof optionName === 'string', 'option name is a string');
    ASSERT(optionValue !== undefined, 'should get a value');
    ASSERT(optionTarget === undefined || typeof optionTarget === 'string', 'the optional name is a string');
    switch (optionName) {
        case 'varStrategy':
            if (typeof optionValue === 'function') THROW('functions no longer supported');
            if (typeof optionValue === 'string') THROW('strings should be type property');
            if ((typeof optionValue === 'undefined' ? 'undefined' : _typeof(optionValue)) !== 'object') THROW('varStrategy should be object');
            if (optionValue.name) THROW('name should be type');
            if (optionValue.dist_name) THROW('dist_name should be type');
            var vsc = config_createVarStratConfig(optionValue);
            config.varStratConfig = vsc;
            while (vsc.fallback) {
                vsc.fallback = config_createVarStratConfig(vsc.fallback);
                vsc = vsc.fallback;
            }
            break;
        case 'valueStrategy': // determine how the next value of a variable is picked when creating a new space
            config.valueStratName = optionValue;
            break;
        case 'targeted_var_names':
            if (!optionValue || !optionValue.length) THROW('ONLY_USE_WITH_SOME_TARGET_VARS'); // omit otherwise to target all
            // which vars must be solved for this space to be solved
            // string: 'all'
            // string[]: list of vars that must be solved
            // function: callback to return list of names to be solved
            config.targetedVars = optionValue;
            break;
        case 'varStratOverrides': // An object which defines a value distributor per variable
            // which overrides the globally set value distributor.
            // See Bvar#distributionOptions (in multiverse)
            for (var key in optionValue) {
                config_setOption(config, 'varStratOverride', optionValue[key], key);
            }
            break;
        case 'varStratOverride': // specific strategy parameters for one variable
            ASSERT(typeof optionTarget === 'string', 'expecting a name');
            if (!config.var_dist_options) config.var_dist_options = {};
            ASSERT(!config.var_dist_options[optionTarget], 'should not be known yet'); // there is one test in mv that breaks this....?
            config.var_dist_options[optionTarget] = optionValue;
            break;
        case 'varValueStrat':
            ASSERT(typeof optionTarget === 'string', 'expecting a name');
            if (!config.var_dist_options[optionTarget]) config.var_dist_options[optionTarget] = {};
            config.var_dist_options[optionTarget] = optionValue;
            break;
        case 'timeout_callback': // A function that returns true if the current search should stop
            // Can be called multiple times after the search is stopped, should
            // keep returning false (or assume an uncertain outcome).
            // The function is called after the first batch of propagators is
            // called so it won't immediately stop. But it stops quickly.
            config.timeout_callback = optionValue;
            break;
        case 'var':
            return THROW('REMOVED. Replace `var` with `varStrategy`');
        case 'val':
            return THROW('REMOVED. Replace `var` with `valueStrategy`');
        default:
            THROW('unknown option');
    }
}
/**
 * This function should be removed once we can update mv
 *
 * @deprecated in favor of config_setOption
 * @param {$config} config
 * @param {Object} options
 * @property {Object} [options.varStrategy]
 * @property {string} [options.varStrategy.name]
 * @property {string[]} [options.varStrategy.list] Only if name=list
 * @property {string[]} [options.varStrategy.priorityList] Only if name=list
 * @property {boolean} [options.varStrategy.inverted] Only if name=list
 * @property {Object} [options.varStrategy.fallback] Same struct as options.varStrategy (recursive)
 */
function config_setOptions(config, options) {
    if (!options) return;
    if (options.varStrategy) config_setOption(config, 'varStrategy', options.varStrategy);
    if (options.valueStrategy) config_setOption(config, 'valueStrategy', options.valueStrategy);
    if (options.targeted_var_names) config_setOption(config, 'targeted_var_names', options.targeted_var_names);
    if (options.varStratOverrides) config_setOption(config, 'varStratOverrides', options.varStratOverrides);
    if (options.varStratOverride) config_setOption(config, 'varStratOverride', options.varStratOverride, options.varStratOverrideName);
    if (options.varValueStrat) config_setOption(config, 'varValueStrat', options.varValueStrat, options.varStratOverrideName);
    if (options.timeout_callback) config_setOption(config, 'timeout_callback', options.timeout_callback);
}
/**
 * @param {$config} config
 * @param {$propagator} propagator
 */
function config_addPropagator(config, propagator) {
    ASSERT(config._class === '$config', 'EXPECTING_CONFIG');
    ASSERT(propagator._class === '$propagator', 'EXPECTING_PROPAGATOR');
    config._propagators.push(propagator);
}
/**
 * Initialize the vardoms array on the first space node.
 *
 * @param {$config} config
 * @param {$space} space
 */
function config_generateVars(config, space) {
    ASSERT(config._class === '$config', 'EXPECTING_CONFIG');
    ASSERT(space._class === '$space', 'SPACE_SHOULD_BE_SPACE');
    var vardoms = space.vardoms;
    ASSERT(vardoms, 'expecting var domains');
    var initialDomains = config.initial_domains;
    ASSERT(initialDomains, 'config should have initial vars');
    var allVarNames = config.all_var_names;
    ASSERT(allVarNames, 'config should have a list of vars');
    for (var varIndex = 0, len = allVarNames.length; varIndex < len; varIndex++) {
        var domain = initialDomains[varIndex];
        ASSERT_STRDOM(domain);
        vardoms[varIndex] = domain_toNumstr(domain);
    }
}
/**
 * Creates a mapping from a varIndex to a set of propagatorIndexes
 * These propagators are the ones that use the varIndex
 * This is useful for quickly determining which propagators
 * need to be stepped while propagating them.
 *
 * @param {$config} config
 */
function config_populateVarPropHash(config) {
    var hash = new Array(config.all_var_names.length);
    var propagators = config._propagators;
    var initialDomains = config.initial_domains;
    for (var propagatorIndex = 0, plen = propagators.length; propagatorIndex < plen; ++propagatorIndex) {
        var propagator = propagators[propagatorIndex];
        _config_addVarConditionally(propagator.index1, initialDomains, hash, propagatorIndex);
        if (propagator.index2 >= 0) _config_addVarConditionally(propagator.index2, initialDomains, hash, propagatorIndex);
        if (propagator.index3 >= 0) _config_addVarConditionally(propagator.index3, initialDomains, hash, propagatorIndex);
    }
    config._varToPropagators = hash;
}

function _config_addVarConditionally(varIndex, initialDomains, hash, propagatorIndex) { // (at some point this could be a strings, or array, or whatever)
    ASSERT(typeof varIndex === 'number', 'must be number'); // dont bother adding props on unsolved vars because they can't affect
    // anything anymore. seems to prevent about 10% in our case so worth it.
    if (!domain_str_isSolved(initialDomains[varIndex])) {
        if (!hash[varIndex]) hash[varIndex] = [propagatorIndex];
        else if (hash[varIndex].indexOf(propagatorIndex) < 0) hash[varIndex].push(propagatorIndex);
    }
}

function config_addConstraint(config, name, varNames, param) { // should return a new var name for most props
    ASSERT(config && config._class === '$config', 'EXPECTING_CONFIG'); // if any constants were passed on, varNameToReturn should become that.
    // if the constraint has a result var, always return that regardless
    // if there are no constants and result vars, return the first var name
    var varNameToReturn = varNames[0]; // for stuff like solver.neq(['A', 'B'], 'C')
    if (varNameToReturn instanceof Array) {
        var leftNames = GET_NAMES(varNameToReturn);
        if (leftNames.length === 0) return varNames[1];
        for (var i = 0, n = leftNames.length; i < n; ++i) {
            config_addConstraint(config, name, [].concat(leftNames[i], varNames.slice(1)), param);
        }
        return undefined;
    }
    var forceBool = false;
    switch (name) { /* eslint no-fallthrough: "off" */
        case 'reifier':
            forceBool = true; // fall-through
        case 'plus':
        case 'min':
        case 'ring-mul':
        case 'ring-div':
        case 'mul':
            ASSERT(varNames.length === 3, 'MISSING_RESULT_VAR'); // note that the third value may still be "undefined"
            // fall-through
        case 'sum':
        case 'product':
            {
                var resultIsParam = name === 'product' || name === 'sum';
                var sumName = resultIsParam ? param : varNames[2];
                var sumVarIndex = void 0;
                var freshResultVar = typeof sumName === 'undefined';
                if (freshResultVar) {
                    if (forceBool) sumVarIndex = config_addVarAnonRange(config, 0, 1);
                    else sumVarIndex = config_addVarAnonNothing(config);
                    sumName = config.all_var_names[sumVarIndex];
                } else if (typeof sumName === 'number') {
                    sumVarIndex = config_addVarAnonConstant(config, sumName);
                    sumName = config.all_var_names[sumVarIndex];
                } else if (typeof sumName !== 'string') {
                    THROW('expecting result var name to be absent or a number or string: `' + sumName + '`');
                } else {
                    sumVarIndex = config.all_var_names.indexOf(sumName);
                }
                if (resultIsParam) param = sumVarIndex;
                else varNames[2] = sumName; // check all other var names, except result var, for constants
                var hasNonConstant = false;
                for (var _i = 0, _n = varNames.length - (resultIsParam ? 0 : 1); _i < _n; ++_i) {
                    if (typeof varNames[_i] === 'number') {
                        var varIndex = config_addVarAnonConstant(config, varNames[_i]);
                        varNames[_i] = config.all_var_names[varIndex];
                    } else {
                        hasNonConstant = true;
                    }
                }
                if (!hasNonConstant) THROW('E_MUST_GET_AT_LEAST_ONE_VAR_NAME');varNameToReturn = sumName;
                break;
            }
        case 'markov':
        case 'distinct':
        case 'eq':
        case 'neq':
        case 'lt':
        case 'lte':
        case 'gt':
        case 'gte':
            {
                ASSERT(name !== 'markov' || varNames.length === 1, 'MARKOV_PROP_USES_ONE_VAR'); // require at least one non-constant variable...
                var _hasNonConstant = false;
                for (var _i2 = 0, _n2 = varNames.length; _i2 < _n2; ++_i2) {
                    if (typeof varNames[_i2] === 'number') {
                        var _varIndex = config_addVarAnonConstant(config, varNames[_i2]);
                        varNames[_i2] = config.all_var_names[_varIndex];
                        varNameToReturn = varNames[_i2];
                    } else {
                        _hasNonConstant = true;
                    }
                }
                if (!_hasNonConstant) THROW('E_MUST_GET_AT_LEAST_ONE_VAR_NAME_ONLY_GOT_CONSTANTS');
                break;
            }
        default:
            THROW('UNKNOWN_PROPAGATOR ' + name);
    }
    var varIndexes = [];
    for (var _i3 = 0, _n3 = varNames.length; _i3 < _n3; ++_i3) { //console.log('testing', varNames[i], 'in', config._var_names_trie)
        var _varIndex2 = trie_get(config._var_names_trie, varNames[_i3]);
        ASSERT(_varIndex2 !== TRIE_KEY_NOT_FOUND, 'CONSTRAINT_VARS_SHOULD_BE_DECLARED');
        varIndexes[_i3] = _varIndex2;
    }
    if (name === 'sum') {
        var initialDomains = config.initial_domains; // limit result var to the min/max possible sum
        var maxDomain = initialDomains[varIndexes[0]]; // dont start with EMPTY or [0,0]!
        for (var _i4 = 1, _n4 = varIndexes.length; _i4 < _n4; ++_i4) {
            var _varIndex3 = varIndexes[_i4];
            maxDomain = domain_any_plus(maxDomain, initialDomains[_varIndex3]);
        }
        initialDomains[param] = domain_toStr(domain_any_intersection(maxDomain, initialDomains[param])); // eliminate multiple constants
        if (varIndexes.length > 1) {
            var newVarIndexes = [];
            var constants = domain_createValue(0);
            for (var _i5 = 0, _n5 = varIndexes.length; _i5 < _n5; ++_i5) {
                var _varIndex4 = varIndexes[_i5];
                var domain = initialDomains[_varIndex4];
                var value = domain_str_getValue(domain);
                if (value === NO_SUCH_VALUE) {
                    newVarIndexes.push(_varIndex4);
                } else if (value !== 0) {
                    constants = domain_any_plus(constants, domain);
                }
            }
            var cValue = domain_any_getValue(constants);
            if (cValue !== 0) {
                var _varIndex5 = config_addVarAnonConstant(config, cValue);
                newVarIndexes.push(_varIndex5);
            }
            if (!newVarIndexes.length) initialDomains[param] = domain_toStr(domain_any_intersection(ZERO, initialDomains[param]));
            varIndexes = newVarIndexes;
        }
    }
    if (!config_solvedAtCompileTime(config, name, varIndexes, param)) {
        var constraint = constraint_create(name, varIndexes, param);
        config.all_constraints.push(constraint);
    }
    return varNameToReturn;
}
/**
 * If either side of certain constraints are solved at compile time, which
 * is right now, then the constraint should not be recorded at all because
 * it will never "unsolve". This can cause vars to become rejected before
 * the search even begins and that is okay.
 *
 * @param {$config} config
 * @param {string} constraintName
 * @param {number[]} varIndexes
 * @param {*} [param] The extra parameter for constraints
 * @returns {boolean}
 */
function config_solvedAtCompileTime(config, constraintName, varIndexes, param) {
    if (constraintName === 'lte' || constraintName === 'lt') {
        return _config_solvedAtCompileTimeLtLte(config, constraintName, varIndexes);
    } else if (constraintName === 'gte' || constraintName === 'gt') {
        return _config_solvedAtCompileTimeGtGte(config, constraintName, varIndexes);
    } else if (constraintName === 'eq') {
        return _config_solvedAtCompileTimeEq(config, constraintName, varIndexes);
    } else if (constraintName === 'neq') {
        return _config_solvedAtCompileTimeNeq(config, constraintName, varIndexes);
    } else if (constraintName === 'reifier') {
        return _config_solvedAtCompileTimeReifier(config, constraintName, varIndexes, param);
    } else if (constraintName === 'sum') {
        if (!varIndexes.length) return true;
        return _config_solvedAtCompileTimeSumProduct(config, constraintName, varIndexes, param);
    } else if (constraintName === 'product') {
        return _config_solvedAtCompileTimeSumProduct(config, constraintName, varIndexes, param);
    }
    return false;
}

function _config_solvedAtCompileTimeLtLte(config, constraintName, varIndexes) {
    var initialDomains = config.initial_domains;
    var varIndexLeft = varIndexes[0];
    var varIndexRight = varIndexes[1];
    var domainLeft = initialDomains[varIndexLeft];
    var domainRight = initialDomains[varIndexRight];
    ASSERT_STRDOM(domainLeft);
    ASSERT_STRDOM(domainRight);
    ASSERT(domainLeft && domainRight, 'NON_EMPTY_DOMAINS_EXPECTED'); // empty domains should be caught by addvar/decl
    var v = domain_str_getValue(domainLeft);
    if (v !== NO_SUCH_VALUE) {
        initialDomains[varIndexRight] = domain_toStr(domain_str_removeLte(domainRight, v - (constraintName === 'lt' ? 0 : 1))); // do not add constraint; this constraint is already solved
        config._constrainedAway.push(varIndexLeft, varIndexRight);
        return true;
    }
    v = domain_str_getValue(domainRight);
    if (v !== NO_SUCH_VALUE) {
        initialDomains[varIndexLeft] = domain_toStr(domain_str_removeGte(domainLeft, v + (constraintName === 'lt' ? 0 : 1))); // do not add constraint; this constraint is already solved
        config._constrainedAway.push(varIndexLeft, varIndexRight);
        return true;
    }
    initialDomains[varIndexLeft] = domain_toStr(domain_str_removeGte(domainLeft, domain_any_max(domainRight) + (constraintName === 'lt' ? 0 : 1)));
    initialDomains[varIndexRight] = domain_toStr(domain_str_removeLte(domainRight, domain_any_min(domainLeft) - (constraintName === 'lt' ? 0 : 1)));
    return false;
}

function _config_solvedAtCompileTimeGtGte(config, constraintName, varIndexes) {
    var initialDomains = config.initial_domains;
    var varIndexLeft = varIndexes[0];
    var varIndexRight = varIndexes[1];
    var domainLeft = initialDomains[varIndexLeft];
    var domainRight = initialDomains[varIndexRight];
    ASSERT_STRDOM(domainLeft);
    ASSERT_STRDOM(domainRight);
    ASSERT(domainLeft && domainRight, 'NON_EMPTY_DOMAINS_EXPECTED'); // empty domains should be caught by addvar/decl
    var v = domain_str_getValue(domainLeft);
    if (v !== NO_SUCH_VALUE) {
        initialDomains[varIndexRight] = domain_toStr(domain_str_removeGte(domainRight, v + (constraintName === 'gt' ? 0 : 1))); // do not add constraint; this constraint is already solved
        config._constrainedAway.push(varIndexLeft, varIndexRight);
        return true;
    }
    v = domain_str_getValue(domainRight);
    if (v !== NO_SUCH_VALUE) {
        initialDomains[varIndexLeft] = domain_toStr(domain_str_removeLte(domainLeft, v - (constraintName === 'gt' ? 0 : 1))); // do not add constraint; this constraint is already solved
        config._constrainedAway.push(varIndexLeft, varIndexRight);
        return true;
    } // A > B or A >= B. smallest number in A must be larger than the smallest number in B. largest number in B must be smaller than smallest number in A
    initialDomains[varIndexLeft] = domain_toStr(domain_str_removeLte(domainLeft, domain_any_min(domainRight) - (constraintName === 'gt' ? 0 : 1)));
    initialDomains[varIndexRight] = domain_toStr(domain_str_removeGte(domainRight, domain_any_max(domainLeft) + (constraintName === 'gt' ? 0 : 1)));
    return false;
}

function _config_solvedAtCompileTimeEq(config, constraintName, varIndexes) {
    var initialDomains = config.initial_domains;
    var varIndexLeft = varIndexes[0];
    var varIndexRight = varIndexes[1];
    var a = initialDomains[varIndexLeft];
    var b = initialDomains[varIndexRight];
    var v = domain_str_getValue(a);
    if (v === NO_SUCH_VALUE) v = domain_str_getValue(b);
    if (v !== NO_SUCH_VALUE) {
        var r = domain_toStr(domain_strstr_intersection(a, b));
        initialDomains[varIndexLeft] = r;
        initialDomains[varIndexRight] = r;
        config._constrainedAway.push(varIndexLeft, varIndexRight);
        return true;
    }
    return false;
}

function _config_solvedAtCompileTimeNeq(config, constraintName, varIndexes) {
    var initialDomains = config.initial_domains;
    var varIndexLeft = varIndexes[0];
    var varIndexRight = varIndexes[1];
    var v = domain_str_getValue(initialDomains[varIndexLeft]);
    if (v !== NO_SUCH_VALUE) {
        initialDomains[varIndexRight] = domain_toStr(domain_str_removeValue(initialDomains[varIndexRight], v));
        config._constrainedAway.push(varIndexLeft, varIndexRight);
        return true;
    }
    v = domain_str_getValue(initialDomains[varIndexRight]);
    if (v !== NO_SUCH_VALUE) {
        initialDomains[varIndexLeft] = domain_toStr(domain_str_removeValue(initialDomains[varIndexLeft], v));
        config._constrainedAway.push(varIndexLeft, varIndexRight);
        return true;
    }
    return false;
}

function _config_solvedAtCompileTimeReifier(config, constraintName, varIndexes, opName) {
    var initialDomains = config.initial_domains;
    var varIndexLeft = varIndexes[0];
    var varIndexRight = varIndexes[1];
    var varIndexResult = varIndexes[2];
    var domain1 = initialDomains[varIndexLeft];
    var domain2 = initialDomains[varIndexRight];
    ASSERT_STRDOM(domain1);
    ASSERT_STRDOM(domain2);
    if (!domain1 || !domain2) THROW('E_NON_EMPTY_DOMAINS_EXPECTED'); // it's probably a bug to feed empty domains to config
    var v1 = domain_str_getValue(initialDomains[varIndexLeft]);
    var v2 = domain_str_getValue(initialDomains[varIndexRight]);
    var hasLeft = v1 !== NO_SUCH_VALUE;
    var hasRight = v2 !== NO_SUCH_VALUE;
    if (hasLeft && hasRight) { // just left or right would not force anything. but both does.
        return _config_solvedAtCompileTimeReifierBoth(config, varIndexes, opName, v1, v2);
    }
    var v3 = domain_str_getValue(initialDomains[varIndexResult]);
    var hasResult = v3 !== NO_SUCH_VALUE;
    if (hasResult) {
        if (hasLeft) { // resolve right and eliminate reifier
            return _config_solvedAtCompileTimeReifierLeft(config, opName, varIndexRight, v1, v3, domain1, domain2);
        } else if (hasRight) { // resolve right and eliminate reifier
            return _config_solvedAtCompileTimeReifierRight(config, opName, varIndexLeft, v2, v3, domain1, domain2);
        }
    }
    if (opName !== 'eq' && opName !== 'neq') { // must be lt lte gt gte. these are solved completely when either param is solved
        ASSERT(opName === 'lt' || opName === 'lte' || opName === 'gt' || opName === 'gte', 'should be lt lte gt gte now because there are no other reifiers atm');
        if (opName === 'lt') { // A < B. solved if max(A) < min(B). rejected if min(A) >= max(B)
            if (domain_any_max(domain1) < domain_any_min(domain2)) {
                initialDomains[varIndexResult] = domain_toStr(domain_str_removeValue(initialDomains[varIndexResult], 0));
                config._constrainedAway.push(varIndexLeft, varIndexRight, varIndexResult);
                return true;
            }
            if (domain_any_min(domain1) >= domain_any_max(domain2)) {
                initialDomains[varIndexResult] = domain_toStr(domain_str_removeValue(initialDomains[varIndexResult], 1));
                config._constrainedAway.push(varIndexLeft, varIndexRight, varIndexResult);
                return true;
            }
        } else if (opName === 'lte') { // A <= B. solved if max(A) <= min(B). rejected if min(A) > max(B)
            if (domain_any_max(domain1) <= domain_any_min(domain2)) {
                initialDomains[varIndexResult] = domain_toStr(domain_str_removeValue(initialDomains[varIndexResult], 0));
                config._constrainedAway.push(varIndexLeft, varIndexRight, varIndexResult);
                return true;
            }
            if (domain_any_min(domain1) > domain_any_max(domain2)) {
                initialDomains[varIndexResult] = domain_toStr(domain_str_removeValue(initialDomains[varIndexResult], 1));
                config._constrainedAway.push(varIndexLeft, varIndexRight, varIndexResult);
                return true;
            }
        } else if (opName === 'gt') { // A > B. solved if min(A) > max(B). rejected if max(A) <= min(B)
            if (domain_any_min(domain1) > domain_any_max(domain2)) {
                initialDomains[varIndexResult] = domain_toStr(domain_str_removeValue(initialDomains[varIndexResult], 0));
                config._constrainedAway.push(varIndexLeft, varIndexRight, varIndexResult);
                return true;
            }
            if (domain_any_max(domain1) <= domain_any_min(domain2)) {
                initialDomains[varIndexResult] = domain_toStr(domain_str_removeValue(initialDomains[varIndexResult], 1));
                config._constrainedAway.push(varIndexLeft, varIndexRight, varIndexResult);
                return true;
            }
        } else if (opName === 'gte') { // A > B. solved if min(A) >= max(B). rejected if max(A) < min(B)
            if (domain_any_min(domain1) >= domain_any_max(domain2)) {
                initialDomains[varIndexResult] = domain_toStr(domain_str_removeValue(initialDomains[varIndexResult], 0));
                config._constrainedAway.push(varIndexLeft, varIndexRight, varIndexResult);
                return true;
            }
            if (domain_any_max(domain1) < domain_any_min(domain2)) {
                initialDomains[varIndexResult] = domain_toStr(domain_str_removeValue(initialDomains[varIndexResult], 1));
                config._constrainedAway.push(varIndexLeft, varIndexRight, varIndexResult);
                return true;
            }
        } else {
            THROW('UNKNOWN_OP');
        }
    }
    return false;
}

function _config_solvedAtCompileTimeReifierBoth(config, varIndexes, opName, v1, v2) {
    var initialDomains = config.initial_domains;
    var varIndexResult = varIndexes[2];
    var bool = false;
    switch (opName) {
        case 'lt':
            bool = v1 < v2;
            break;
        case 'lte':
            bool = v1 <= v2;
            break;
        case 'gt':
            bool = v1 > v2;
            break;
        case 'gte':
            bool = v1 >= v2;
            break;
        case 'eq':
            bool = v1 === v2;
            break;
        case 'neq':
            bool = v1 !== v2;
            break;
        default:
            return false;
    }
    initialDomains[varIndexResult] = domain_toStr(domain_str_removeValue(initialDomains[varIndexResult], bool ? 0 : 1));
    config._constrainedAway.push(varIndexResult); // note: left and right have been solved already so no need to push those here
    return true;
}

function _config_solvedAtCompileTimeReifierLeft(config, opName, varIndexRight, value, result, domain1, domain2) {
    var initialDomains = config.initial_domains;
    var domainRight = initialDomains[varIndexRight];
    switch (opName) {
        case 'lt':
            if (result) domainRight = domain_str_removeLte(domainRight, value);
            else domainRight = domain_str_removeGte(domainRight, value + 1);
            break;
        case 'lte':
            if (result) domainRight = domain_str_removeLte(domainRight, value - 1);
            else domainRight = domain_str_removeGte(domainRight, value);
            break;
        case 'gt':
            if (result) domainRight = domain_str_removeGte(domainRight, value);
            else domainRight = domain_str_removeLte(domainRight, value - 1);
            break;
        case 'gte':
            if (result) domainRight = domain_str_removeGte(domainRight, value + 1);
            else domainRight = domain_str_removeLte(domainRight, value);
            break;
        case 'eq':
            if (result) domainRight = domain_strstr_intersection(domain1, domain2);
            else domainRight = domain_str_removeValue(domainRight, value);
            break;
        case 'neq':
            if (result) domainRight = domain_str_removeValue(domainRight, value);
            else domainRight = domain_strstr_intersection(domain1, domain2);
            break;
        default:
            return false;
    }
    initialDomains[varIndexRight] = domain_toStr(domainRight);
    config._constrainedAway.push(varIndexRight); // note: left and result have been solved already so no need to push those here
    return true;
}

function _config_solvedAtCompileTimeReifierRight(config, opName, varIndexLeft, value, result, domain1, domain2) {
    var initialDomains = config.initial_domains;
    var domainLeft = initialDomains[varIndexLeft];
    switch (opName) {
        case 'lt':
            if (result) domainLeft = domain_str_removeGte(domainLeft, value + 1);
            else domainLeft = domain_str_removeLte(domainLeft, value);
            break;
        case 'lte':
            if (result) domainLeft = domain_str_removeGte(domainLeft, value);
            else domainLeft = domain_str_removeLte(domainLeft, value);
            break;
        case 'gt':
            if (result) domainLeft = domain_str_removeLte(domainLeft, value - 1);
            else domainLeft = domain_str_removeGte(domainLeft, value);
            break;
        case 'gte':
            if (result) domainLeft = domain_str_removeLte(domainLeft, value);
            else domainLeft = domain_str_removeGte(domainLeft, value + 1);
            break;
        case 'eq':
            if (result) domainLeft = domain_strstr_intersection(domain1, domain2);
            else domainLeft = domain_str_removeValue(domainLeft, value);
            break;
        case 'neq':
            if (result) domainLeft = domain_str_removeValue(domainLeft, value);
            else domainLeft = domain_strstr_intersection(domain1, domain2);
            break;
        default:
            return false;
    }
    initialDomains[varIndexLeft] = domain_toStr(domainLeft);
    config._constrainedAway.push(varIndexLeft); // note: right and result have been solved already so no need to push those here
    return true;
}

function _config_solvedAtCompileTimeSumProduct(config, constraintName, varIndexes, resultIndex) {
    if (varIndexes.length === 1) { // both in the case of sum and product, if there is only one value in the set, the result must be that value
        // so here we do an intersect that one value with the result because that's what must happen anyways
        var domain = domain_toStr(domain_strstr_intersection(config.initial_domains[resultIndex], config.initial_domains[varIndexes[0]]));
        config.initial_domains[resultIndex] = domain;
        config.initial_domains[varIndexes[0]] = domain;
        if (domain_str_isSolved(domain)) {
            config._constrainedAway.push(varIndexes[0], resultIndex);
            return true;
        } // cant eliminate constraint; sum will compile an `eq` for it.
    }
    return false;
}
/**
 * Generate all propagators from the constraints in given config
 * Puts these back into the same config.
 *
 * @param {$config} config
 */
function config_generatePropagators(config) {
    ASSERT(config && config._class === '$config', 'EXPECTING_CONFIG');
    var constraints = config.all_constraints;
    config._propagators = [];
    for (var i = 0, n = constraints.length; i < n; ++i) {
        var constraint = constraints[i];
        if (constraint.varNames) {
            console.warn('saw constraint.varNames, converting to varIndexes, log out result and update test accordingly');
            constraint.varIndexes = constraint.varNames.map(function(name) {
                return trie_get(config._var_names_trie, name);
            });
            var p = constraint.param;
            delete constraint.param;
            delete constraint.varNames;
            constraint.param = p;
        }
        config_generatePropagator(config, constraint.name, constraint.varIndexes, constraint.param, constraint);
    }
}
/**
 * @param {$config} config
 * @param {string} name
 * @param {number[]} varIndexes
 * @param {string|undefined} param Depends on the prop; reifier=op name, product/sum=result var
 */
function config_generatePropagator(config, name, varIndexes, param, _constraint) {
    ASSERT(config && config._class === '$config', 'EXPECTING_CONFIG');
    ASSERT(typeof name === 'string', 'NAME_SHOULD_BE_STRING');
    ASSERT(varIndexes instanceof Array, 'INDEXES_SHOULD_BE_ARRAY', JSON.stringify(_constraint));
    switch (name) {
        case 'plus':
            return propagator_addPlus(config, varIndexes[0], varIndexes[1], varIndexes[2]);
        case 'min':
            return propagator_addMin(config, varIndexes[0], varIndexes[1], varIndexes[2]);
        case 'ring-mul':
            return propagator_addRingMul(config, varIndexes[0], varIndexes[1], varIndexes[2]);
        case 'ring-div':
            return propagator_addDiv(config, varIndexes[0], varIndexes[1], varIndexes[2]);
        case 'mul':
            return propagator_addMul(config, varIndexes[0], varIndexes[1], varIndexes[2]);
        case 'sum':
            return propagator_addSum(config, varIndexes.slice(0), param);
        case 'product':
            return propagator_addProduct(config, varIndexes.slice(0), param);
        case 'distinct':
            return propagator_addDistinct(config, varIndexes.slice(0));
        case 'markov':
            return propagator_addMarkov(config, varIndexes[0]);
        case 'reifier':
            return propagator_addReified(config, param, varIndexes[0], varIndexes[1], varIndexes[2]);
        case 'neq':
            return propagator_addNeq(config, varIndexes[0], varIndexes[1]);
        case 'eq':
            return propagator_addEq(config, varIndexes[0], varIndexes[1]);
        case 'gte':
            return propagator_addGte(config, varIndexes[0], varIndexes[1]);
        case 'lte':
            return propagator_addLte(config, varIndexes[0], varIndexes[1]);
        case 'gt':
            return propagator_addGt(config, varIndexes[0], varIndexes[1]);
        case 'lt':
            return propagator_addLt(config, varIndexes[0], varIndexes[1]);
        default:
            THROW('UNEXPECTED_NAME');
    }
}

function config_populateVarStrategyListHash(config) {
    var vsc = config.varStratConfig;
    while (vsc) {
        if (vsc.priorityByName) {
            var _obj = {};
            var list = vsc.priorityByName;
            for (var i = 0, len = list.length; i < len; ++i) {
                var varIndex = trie_get(config._var_names_trie, list[i]);
                ASSERT(varIndex !== TRIE_KEY_NOT_FOUND, 'VARS_IN_PRIO_LIST_SHOULD_BE_KNOWN_NOW');
                _obj[varIndex] = len - i; // never 0, offset at 1. higher value is higher prio
            }
            vsc._priorityByIndex = _obj;
        }
        vsc = vsc.fallback;
    }
}
/**
 * At the start of a search, populate this config with the dynamic data
 *
 * @param {$config} config
 * @param {$space} space
 */
function config_initForSpace(config, space) {
    if (!config._var_names_trie) {
        config._var_names_trie = trie_create(config.all_var_names);
    } // always create a new front (we may assume this is a new search)
    config._front = front_create(); // we know the max number of var names used in this search so we
    // know the number of indexes the changevars trie may need to hash
    // worst case. set the size accordingly. after some benchmarking
    // it turns out these tries use about 1.1 node per index so just
    // reserve that many cells. this saves some memcopies when growing.
    var cells = Math.ceil(config.all_var_names.length * TRIE_NODE_SIZE * 1.1);
    config._changedVarsTrie = trie_create(TRIE_EMPTY, cells);
    config._propagationBatch = 0;
    config._propagationCycles = 0;
    config_generatePropagators(config);
    config_generateVars(config, space); // after props because they may introduce new vars (TODO: refactor this...)
    config_populateVarPropHash(config);
    config_populateVarStrategyListHash(config);
    ASSERT(config._varToPropagators, 'should have generated hash');
} // end of src/config.js
// from: src/constraint.js
function constraint_create(name, varIndexes, param) {
    return {
        _class: '$constraint',
        name: name,
        varIndexes: varIndexes,
        param: param
    };
} // end of src/constraint.js
// from: src/distribution/defaults.js
var PRESETS = {
    defaults: {
        varStrategy: {
            type: 'naive'
        },
        valueStrategy: 'min'
    }, // The native distribution strategy simply steps through all
    // undetermined variables.
    naive: {
        varStrategy: {
            type: 'naive'
        },
        valueStrategy: 'min'
    }, // The "fail first" strategy branches on the variable with the
    // smallest domain size.
    fail_first: {
        varStrategy: {
            type: 'size'
        },
        valueStrategy: 'min'
    }, // The "domain splitting" strategy where each domain is roughly
    // halved in each step. The 'varname' argument can be either a
    // single var name or an array of names or an object whose
    // values are var names.
    split: {
        varStrategy: {
            type: 'size'
        },
        valueStrategy: 'splitMin'
    }
};

function distribution_getDefaults(name) {
    if (PRESETS[name]) return PRESETS[name];
    THROW('distribution.get_defaults: Unknown preset: ' + name);
} // end of src/distribution/defaults.js
// from: src/distribution/markov.js
/**
 * Given a domain, probability vector, value legend, and rng
 * function; return one of the values in the value legend
 * according to the outcome of the rng and considering the
 * prob weight of each value in the legend.
 * The rng should be normalized (returning values from 0 including
 * up to but not including 1), unless the argument says otherwise
 * (that is used for testing only, to get around rounding errors).
 *
 * @param {$domain} domain A regular domain. It's values only determine whether a legend value can be used, it may have values that can never be picked. It's only a filter mask.
 * @param {number[]} probVector List of probabilities, maps 1:1 to val_legend.
 * @param {number[]} valLegend List of values eligible for picking. Maps 1:1 to prob_vector. Only values in the current domain are actually eligible.
 * @param {Function} randomFunc
 * @param {boolean} [rngIsNormalized=true] Is 0<=rng()<1 or 0<=rng()<total_prob ? The latter is only used for testing to avoid rounding errors.
 * @return {number | undefined}
 */
function distribution_markovSampleNextFromDomain(domain, probVector, valLegend, randomFunc) {
    var rngIsNormalized = arguments.length <= 4 || arguments[4] === undefined ? true : arguments[4];
    ASSERT(!!valLegend, 'A_SHOULD_HAVE_VAL_LEGEND');
    ASSERT(probVector.length <= valLegend.length, 'A_PROB_VECTOR_SIZE_SHOULD_BE_LTE_LEGEND'); // make vector & legend for available values only
    var filteredLegend = [];
    var cumulativeFilteredProbVector = [];
    var totalProb = 0;
    for (var index = 0; index < probVector.length; index++) {
        var prob = probVector[index];
        if (prob > 0) {
            var value = valLegend[index];
            if (domain_any_containsValue(domain, value)) {
                totalProb += prob;
                cumulativeFilteredProbVector.push(totalProb);
                filteredLegend.push(value);
            }
        }
    } // no more values left to search
    if (cumulativeFilteredProbVector.length === 0) {
        return;
    } // only one value left
    if (cumulativeFilteredProbVector.length === 1) {
        return filteredLegend[0];
    } // TOFIX: could set `cumulativeFilteredProbVector[cumulativeFilteredProbVector.length-1] = 1` here...
    return _distribution_markovRoll(randomFunc, totalProb, cumulativeFilteredProbVector, filteredLegend, rngIsNormalized);
}
/**
 * @private
 * @param {Function} rng A function ("random number generator"), which is usually normalized, but in tests may not be
 * @param {number} totalProb
 * @param {number[]} cumulativeProbVector Maps 1:1 to the value legend. `[prob0, prob0+prob1, prob0+prob1+prob2, etc]`
 * @param {number[]} valueLegend
 * @param {boolean} rngIsNormalized
 * @returns {number}
 */
function _distribution_markovRoll(rng, totalProb, cumulativeProbVector, valueLegend, rngIsNormalized) {
    var rngRoll = rng();
    var probVal = rngRoll;
    if (rngIsNormalized) { // 0 <= rng < 1
        // roll should yield; 0<=value<1
        ASSERT(rngRoll >= 0, 'RNG_SHOULD_BE_NORMALIZED');
        ASSERT(rngRoll < 1, 'RNG_SHOULD_BE_NORMALIZED');
        probVal = rngRoll * totalProb;
    } // else 0 <= rng < totalProb (mostly to avoid precision problems in tests)
    ASSERT(!rngIsNormalized || rngRoll < totalProb, 'bad test: roll is higher than total prob (cannot used unnormalized roll if domain filters out options!)', rngRoll, totalProb, probVal);
    for (var index = 0; index < cumulativeProbVector.length; index++) { // note: if first element is 0.1 and roll is 0.1 this will pick the
        // SECOND item. by design. so prob domains are `[x, y)`
        var prob = cumulativeProbVector[index];
        if (prob > probVal) {
            break;
        }
    }
    return valueLegend[index];
} // end of src/distribution/markov.js
// from: src/distribution/value.js
var FIRST_CHOICE = 0;
var SECOND_CHOICE = 1;
var THIRD_CHOICE = 2;
var NO_CHOICE = undefined;
var MATH_RANDOM = Math.random;

function distribute_getNextDomainForVar(space, config, varIndex, choiceIndex) {
    ASSERT(space._class === '$space', 'SPACE_SHOULD_BE_SPACE');
    ASSERT(config._class === '$config', 'EXPECTING_CONFIG');
    ASSERT(typeof varIndex === 'number', 'VAR_INDEX_SHOULD_BE_NUMBER');
    ASSERT(domain_any_isUndetermined(space.vardoms[varIndex]), 'CALLSITE_SHOULD_PREVENT_DETERMINED'); // TODO: test
    var valueStrategy = config.valueStratName; // each var can override the value distributor
    var configVarDistOptions = config.var_dist_options;
    var varName = config.all_var_names[varIndex];
    ASSERT(typeof varName === 'string', 'VAR_NAME_SHOULD_BE_STRING');
    var valueDistributorName = configVarDistOptions[varName] && configVarDistOptions[varName].valtype;
    if (valueDistributorName) valueStrategy = valueDistributorName;
    if (typeof valueStrategy === 'function') return valueStrategy;
    return _distribute_getNextDomainForVar(valueStrategy, space, config, varIndex, choiceIndex);
}

function _distribute_getNextDomainForVar(stratName, space, config, varIndex, choiceIndex) {
    ASSERT(space._class === '$space', 'EXPECTING_SPACE');
    ASSERT(config._class === '$config', 'EXPECTING_CONFIG');
    switch (stratName) {
        case 'max':
            return distribution_valueByMax(space, varIndex, choiceIndex);
        case 'markov':
            return distribution_valueByMarkov(space, config, varIndex, choiceIndex);
        case 'mid':
            return distribution_valueByMid(space, varIndex, choiceIndex);
        case 'min':
            return distribution_valueByMin(space, varIndex, choiceIndex);
        case 'minMaxCycle':
            return distribution_valueByMinMaxCycle(space, varIndex, choiceIndex);
        case 'list':
            return distribution_valueByList(space, config, varIndex, choiceIndex);
        case 'naive':
            ASSERT_NUMSTRDOM(space.vardoms[varIndex]);
            ASSERT(space.vardoms[varIndex], 'NON_EMPTY_DOMAIN_EXPECTED');
            return domain_createValue(domain_any_min(space.vardoms[varIndex]));
        case 'splitMax':
            return distribution_valueBySplitMax(space, varIndex, choiceIndex);
        case 'splitMin':
            return distribution_valueBySplitMin(space, varIndex, choiceIndex);
        case 'throw':
            return ASSERT(false, 'not expecting to pick this distributor');
    }
    THROW('unknown next var func', stratName);
}
/**
 * Attempt to solve by setting var domain to values in the order
 * given as a list. This may also be a function which should
 * return a new domain given the space, var index, and choice index.
 *
 * @param {$space} space
 * @param {$config} config
 * @param {number} varIndex
 * @param {number} choiceIndex
 * @returns {$domain|undefined} The new domain for this var index in the next space TOFIX: support small domains
 */
function distribution_valueByList(space, config, varIndex, choiceIndex) {
    ASSERT(space._class === '$space', 'SPACE_SHOULD_BE_SPACE');
    ASSERT(config._class === '$config', 'EXPECTING_CONFIG');
    ASSERT(typeof varIndex === 'number', 'VAR_INDEX_SHOULD_BE_NUMBER');
    ASSERT(typeof choiceIndex === 'number', 'CHOICE_SHOULD_BE_NUMBER');
    var domain = space.vardoms[varIndex];
    var varName = config.all_var_names[varIndex];
    ASSERT(typeof varName === 'string', 'VAR_NAME_SHOULD_BE_STRING');
    ASSERT(domain_any_isUndetermined(domain), 'DOMAIN_SHOULD_BE_UNDETERMINED');
    var configVarDistOptions = config.var_dist_options;
    ASSERT(configVarDistOptions, 'space should have config.var_dist_options');
    ASSERT(configVarDistOptions[varName], 'there should be distribution options available for every var', varName);
    ASSERT(configVarDistOptions[varName].list, 'there should be a distribution list available for every var', varName);
    var varDistOptions = configVarDistOptions[varName];
    var listSource = varDistOptions.list;
    var fallbackDistName = varDistOptions.fallback_dist_name;
    ASSERT(fallbackDistName !== 'list', 'prevent recursion loops');
    var list = listSource;
    if (typeof listSource === 'function') { // Note: callback should return the actual list
        list = listSource(space, varName, choiceIndex);
    }
    switch (choiceIndex) {
        case FIRST_CHOICE:
            var nextValue = domain_any_getValueOfFirstContainedValueInList(domain, list);
            if (nextValue === NO_SUCH_VALUE) {
                if (fallbackDistName) {
                    return _distribute_getNextDomainForVar(fallbackDistName, space, config, varIndex, choiceIndex);
                }
                return NO_CHOICE;
            }
            return domain_createValue(nextValue);
        case SECOND_CHOICE:
            var newDomain = domain_any_removeNextFromList(domain, list); // note: d can be a new array-domain, a new small-domain, or NO_SUCH_VALUE (-1)
            if (newDomain === NO_SUCH_VALUE && fallbackDistName) {
                return _distribute_getNextDomainForVar(fallbackDistName, space, config, varIndex, choiceIndex);
            }
            return newDomain;
    }
    ASSERT(choiceIndex === THIRD_CHOICE, 'SHOULD_NOT_CALL_MORE_THAN_TRHICE');
    return NO_CHOICE;
}
/**
 * Searches through a var's values from min to max.
 * For each value in the domain it first attempts just
 * that value, then attempts the domain without this value.
 *
 * @param {$space} space
 * @param {number} varIndex
 * @param {number} choiceIndex
 * @returns {$domain|undefined} The new domain this var index should get in the next space
 */
function distribution_valueByMin(space, varIndex, choiceIndex) {
    ASSERT(space._class === '$space', 'SPACE_SHOULD_BE_SPACE');
    ASSERT(typeof varIndex === 'number', 'VAR_INDEX_SHOULD_BE_NUMBER');
    ASSERT(typeof choiceIndex === 'number', 'CHOICE_SHOULD_BE_NUMBER');
    var domain = space.vardoms[varIndex];
    ASSERT_NUMSTRDOM(domain);
    ASSERT(domain_any_isUndetermined(domain), 'DOMAIN_SHOULD_BE_UNDETERMINED');
    switch (choiceIndex) {
        case FIRST_CHOICE:
            return domain_createValue(domain_any_min(domain));
        case SECOND_CHOICE: // Cannot lead to empty domain because lo can only be SUP if
            // domain was solved and we assert it wasn't.
            // note: must use some kind of intersect here (there's a test if you mess this up :)
            // TOFIX: improve performance, this can be done more efficiently directly
            return domain_any_intersection(domain, domain_createRange(domain_any_min(domain) + 1, domain_any_max(domain)));
    }
    ASSERT(choiceIndex === THIRD_CHOICE, 'SHOULD_NOT_CALL_MORE_THAN_TRHICE');
    return NO_CHOICE;
}
/**
 * Searches through a var's values from max to min.
 * For each value in the domain it first attempts just
 * that value, then attempts the domain without this value.
 *
 * @param {$space} space
 * @param {number} varIndex
 * @param {number} choiceIndex
 * @returns {$domain|undefined} The new domain this var index should get in the next space
 */
function distribution_valueByMax(space, varIndex, choiceIndex) {
    ASSERT(space._class === '$space', 'SPACE_SHOULD_BE_SPACE');
    ASSERT(typeof varIndex === 'number', 'VAR_INDEX_SHOULD_BE_NUMBER');
    ASSERT(typeof choiceIndex === 'number', 'CHOICE_SHOULD_BE_NUMBER');
    var domain = space.vardoms[varIndex];
    ASSERT_NUMSTRDOM(domain);
    ASSERT(domain_any_isUndetermined(domain), 'DOMAIN_SHOULD_BE_UNDETERMINED');
    switch (choiceIndex) {
        case FIRST_CHOICE:
            return domain_createValue(domain_any_max(domain));
        case SECOND_CHOICE: // Cannot lead to empty domain because hi can only be SUB if
            // domain was solved and we assert it wasn't.
            // note: must use some kind of intersect here (there's a test if you mess this up :)
            // TOFIX: improve performance, this can be done more efficiently directly
            var lo = domain_any_min(domain);
            var hi = domain_any_max(domain);
            var targetDomain = domain_createRange(lo, hi - 1);
            return domain_any_intersection(domain, targetDomain);
    }
    ASSERT(choiceIndex === THIRD_CHOICE, 'SHOULD_NOT_CALL_MORE_THAN_TRHICE');
    return NO_CHOICE;
}
/**
 * Searches through a var's values by taking the middle value.
 * This version targets the value closest to `(max-min)/2`
 * For each value in the domain it first attempts just
 * that value, then attempts the domain without this value.
 *
 * @param {$space} space
 * @param {number} varIndex
 * @param {number} choiceIndex
 * @returns {$domain|undefined} The new domain this var index should get in the next space
 */
function distribution_valueByMid(space, varIndex, choiceIndex) {
    ASSERT(space._class === '$space', 'SPACE_SHOULD_BE_SPACE');
    ASSERT(typeof varIndex === 'number', 'VAR_INDEX_SHOULD_BE_NUMBER');
    ASSERT(typeof choiceIndex === 'number', 'CHOICE_SHOULD_BE_NUMBER');
    var domain = space.vardoms[varIndex];
    ASSERT_NUMSTRDOM(domain);
    ASSERT(domain_any_isUndetermined(domain), 'DOMAIN_SHOULD_BE_UNDETERMINED');
    var middle = domain_any_middleElement(domain);
    switch (choiceIndex) {
        case FIRST_CHOICE:
            return domain_createValue(middle);
        case SECOND_CHOICE:
            var lo = domain_any_min(domain);
            var hi = domain_any_max(domain);
            var domainMask = EMPTY;
            if (middle > lo) {
                domainMask = domain_any_appendRange(domainMask, lo, middle - 1);
            }
            if (middle < hi) {
                domainMask = domain_any_appendRange(domainMask, middle + 1, hi);
            } // Note: domain is not determined so the operation cannot fail
            // note: must use some kind of intersect here (there's a test if you mess this up :)
            // TOFIX: improve performance, this cant fail so constrain is not needed (but you must intersect!)
            return domain_any_intersection(domain, domainMask);
    }
    ASSERT(choiceIndex === THIRD_CHOICE, 'SHOULD_NOT_CALL_MORE_THAN_TRHICE');
    return NO_CHOICE;
}
/**
 * Search a domain by splitting it up through the (max-min)/2 middle.
 * First simply tries the lower half, then tries the upper half.
 *
 * @param {$space} space
 * @param {number} varIndex
 * @param {number} choiceIndex
 * @returns {$domain|undefined} The new domain this var index should get in the next space
 */
function distribution_valueBySplitMin(space, varIndex, choiceIndex) {
    ASSERT(space._class === '$space', 'SPACE_SHOULD_BE_SPACE');
    ASSERT(typeof varIndex === 'number', 'VAR_INDEX_SHOULD_BE_NUMBER');
    ASSERT(typeof choiceIndex === 'number', 'CHOICE_SHOULD_BE_NUMBER');
    var domain = space.vardoms[varIndex];
    ASSERT_NUMSTRDOM(domain);
    ASSERT(domain_any_isUndetermined(domain), 'DOMAIN_SHOULD_BE_UNDETERMINED');
    var min = domain_any_min(domain);
    var max = domain_any_max(domain);
    var mmhalf = min + Math.floor((max - min) / 2);
    switch (choiceIndex) {
        case FIRST_CHOICE:
            { // Note: domain is not determined so the operation cannot fail
                // Note: this must do some form of intersect, though maybe not constrain
                // TOFIX: can do this more optimal if coding it out explicitly
                return domain_any_intersection(domain, domain_createRange(min, mmhalf));
            }
        case SECOND_CHOICE:
            { // Note: domain is not determined so the operation cannot fail
                // Note: this must do some form of intersect, though maybe not constrain
                // TOFIX: can do this more optimal if coding it out explicitly
                return domain_any_intersection(domain, domain_createRange(mmhalf + 1, max));
            }
    }
    ASSERT(choiceIndex === THIRD_CHOICE, 'SHOULD_NOT_CALL_MORE_THAN_TRHICE');
    return NO_CHOICE;
}
/**
 * Search a domain by splitting it up through the (max-min)/2 middle.
 * First simply tries the upper half, then tries the lower half.
 *
 * @param {$space} space
 * @param {number} varIndex
 * @param {number} choiceIndex
 * @returns {$domain|undefined} The new domain this var index should get in the next space
 */
function distribution_valueBySplitMax(space, varIndex, choiceIndex) {
    ASSERT(space._class === '$space', 'SPACE_SHOULD_BE_SPACE');
    ASSERT(typeof varIndex === 'number', 'VAR_INDEX_SHOULD_BE_NUMBER');
    ASSERT(typeof choiceIndex === 'number', 'CHOICE_SHOULD_BE_NUMBER');
    var domain = space.vardoms[varIndex];
    ASSERT_NUMSTRDOM(domain);
    ASSERT(domain_any_isUndetermined(domain), 'DOMAIN_SHOULD_BE_UNDETERMINED');
    var min = domain_any_min(domain);
    var max = domain_any_max(domain);
    var mmhalf = min + Math.floor((max - min) / 2);
    switch (choiceIndex) {
        case FIRST_CHOICE:
            { // Note: domain is not determined so the operation cannot fail
                // Note: this must do some form of intersect, though maybe not constrain
                // TOFIX: can do this more optimal if coding it out explicitly
                return domain_any_intersection(domain, domain_createRange(mmhalf + 1, max));
            }
        case SECOND_CHOICE:
            { // Note: domain is not determined so the operation cannot fail
                // Note: this must do some form of intersect, though maybe not constrain
                // TOFIX: can do this more optimal if coding it out explicitly
                return domain_any_intersection(domain, domain_createRange(min, mmhalf));
            }
    }
    ASSERT(choiceIndex === THIRD_CHOICE, 'SHOULD_NOT_CALL_MORE_THAN_TRHICE');
    return NO_CHOICE;
}
/**
 * Applies distribution_valueByMin and distribution_valueByMax alternatingly
 * depending on the position of the given var in the list of vars.
 *
 * @param {$space} space
 * @param {number} varIndex
 * @param {number} choiceIndex
 * @returns {$domain|undefined} The new domain this var index should get in the next space
 */
function distribution_valueByMinMaxCycle(space, varIndex, choiceIndex) {
    if (_isEven(varIndex)) {
        return distribution_valueByMin(space, varIndex, choiceIndex);
    } else {
        return distribution_valueByMax(space, varIndex, choiceIndex);
    }
}
/**
 * @param {number} n
 * @returns {boolean}
 */
function _isEven(n) {
    return n % 2 === 0;
}
/**
 * Search a domain by applying a markov chain to determine an optimal value
 * checking path.
 *
 * @param {$space} space
 * @param {$config} config
 * @param {number} varIndex
 * @param {number} choiceIndex
 * @returns {$domain|undefined} The new domain this var index should get in the next space
 */
function distribution_valueByMarkov(space, config, varIndex, choiceIndex) {
    ASSERT(space._class === '$space', 'SPACE_SHOULD_BE_SPACE');
    ASSERT(typeof varIndex === 'number', 'VAR_INDEX_SHOULD_BE_NUMBER');
    ASSERT(typeof choiceIndex === 'number', 'CHOICE_SHOULD_BE_NUMBER');
    var domain = space.vardoms[varIndex];
    ASSERT_NUMSTRDOM(domain);
    ASSERT(domain_any_isUndetermined(domain), 'DOMAIN_SHOULD_BE_UNDETERMINED');
    switch (choiceIndex) {
        case FIRST_CHOICE:
            { // THIS IS AN EXPENSIVE STEP!
                var varName = config.all_var_names[varIndex];ASSERT(typeof varName === 'string', 'VAR_NAME_SHOULD_BE_STRING');
                var configVarDistOptions = config.var_dist_options;ASSERT(configVarDistOptions, 'space should have config.var_dist_options');
                var distOptions = configVarDistOptions[varName];ASSERT(distOptions, 'markov vars should have  distribution options');
                var expandVectorsWith = distOptions.expandVectorsWith;ASSERT(distOptions.matrix, 'there should be a matrix available for every var');ASSERT(distOptions.legend || expandVectorsWith != null, 'every var should have a legend or expandVectorsWith set');
                var random = distOptions.random || MATH_RANDOM;ASSERT(typeof random === 'function', 'RNG_SHOULD_BE_FUNCTION'); // note: expandVectorsWith can be 0, so check with null
                var values = markov_createLegend(expandVectorsWith != null, distOptions.legend, domain);
                var valueCount = values.length;
                if (!valueCount) {
                    return NO_CHOICE;
                }
                var probabilities = markov_createProbVector(space, distOptions.matrix, expandVectorsWith, valueCount);
                var value = distribution_markovSampleNextFromDomain(domain, probabilities, values, random);
                if (value == null) {
                    return NO_CHOICE;
                }
                ASSERT(domain_any_containsValue(domain, value), 'markov picks a value from the existing domain so no need for a constrain below');space._markov_last_value = value;
                return domain_createValue(value);
            }
        case SECOND_CHOICE:
            {
                ASSERT(space._markov_last_value != null, 'should have cached previous value');
                var lastValue = space._markov_last_value;
                var lo = domain_any_min(domain);
                var hi = domain_any_max(domain);
                var domainMask = EMPTY;
                if (lastValue > lo) {
                    domainMask = domain_any_appendRange(domainMask, lo, lastValue - 1);
                }
                if (lastValue < hi) {
                    domainMask = domain_any_appendRange(domainMask, lastValue + 1, hi);
                } // Note: domain is not determined so the operation cannot fail
                // note: must use some kind of intersect here (there's a test if you mess this up :)
                // TOFIX: improve performance, needs domain_remove but _not_ the inline version because that's sub-optimal
                var newDomain = domain_any_intersection(domain, domainMask);
                if (domain_any_isRejected(newDomain)) return NO_CHOICE;
                return newDomain;
            }
    }
    ASSERT(choiceIndex === THIRD_CHOICE, 'SHOULD_NOT_CALL_MORE_THAN_TRHICE');
    return NO_CHOICE;
} // end of src/distribution/value.js
// from: src/distribution/var.js
var BETTER = 1;
var SAME = 2;
var WORSE = 3;
/**
 * Given a list of variables return the next var to consider based on the
 * current var distribution configuration and an optional filter condition.
 *
 * @param {$space} space
 * @param {$config} config
 * @returns {number}
 */
function distribution_getNextVarIndex(space, config) {
    var varStratConfig = config.varStratConfig;
    var isBetterVarFunc = distribution_getFunc(varStratConfig.type);
    return _distribution_varFindBest(space, config, isBetterVarFunc, varStratConfig);
}
/**
 * @param {string} distName
 * @returns {Function|undefined}
 */
function distribution_getFunc(distName) {
    switch (distName) {
        case 'naive':
            return null;
        case 'size':
            return distribution_varByMinSize;
        case 'min':
            return distribution_varByMin;
        case 'max':
            return distribution_varByMax;
        case 'markov':
            return distribution_varByMarkov;
        case 'list':
            return distribution_varByList;
        case 'throw':
            return THROW('not expecting to pick this distributor');
    }
    return THROW('unknown next var func', distName);
}
/**
 * Return the best varIndex according to a fitness function
 *
 * @param {$space} space
 * @param {$config} config
 * @param {Function($space, currentIndex, bestIndex, Function)} [fitnessFunc] Given two var indexes returns true iif the first var is better than the second var
 * @param {Object} varStratConfig
 * @returns {number} The varIndex of the next var or NO_SUCH_VALUE
 */
function _distribution_varFindBest(space, config, fitnessFunc, varStratConfig) {
    var bestVarIndex = NO_SUCH_VALUE;
    var buf = config._front.buffer;
    var nodeIndex = space.frontNodeIndex;
    for (var i = 0, len = _front_getSizeOf(buf, nodeIndex); i < len; i++) {
        var varIndex = _front_getCell(buf, nodeIndex, i);
        ASSERT(typeof varIndex === 'number', 'VAR_INDEX_SHOULD_BE_NUMBER');
        ASSERT(space.vardoms[varIndex] !== undefined, 'expecting each varIndex to have an domain', varIndex);
        if (bestVarIndex === NO_SUCH_VALUE || fitnessFunc && BETTER === fitnessFunc(space, config, varIndex, bestVarIndex, varStratConfig)) {
            bestVarIndex = varIndex;
        }
    }
    return bestVarIndex;
} //#####
// preset fitness functions
//#####
function distribution_varByMinSize(space, config, varIndex1, varIndex2) {
    ASSERT(space._class === '$space', 'SPACE_SHOULD_BE_SPACE');
    ASSERT(typeof varIndex1 === 'number', 'INDEX_SHOULD_BE_NUMBER');
    ASSERT(typeof varIndex2 === 'number', 'INDEX_SHOULD_BE_NUMBER');
    var n = domain_any_size(space.vardoms[varIndex1]) - domain_any_size(space.vardoms[varIndex2]);
    if (n < 0) return BETTER;
    if (n > 0) return WORSE;
    return SAME;
}

function distribution_varByMin(space, config, varIndex1, varIndex2) {
    ASSERT(space._class === '$space', 'SPACE_SHOULD_BE_SPACE');
    ASSERT(typeof varIndex1 === 'number', 'INDEX_SHOULD_BE_NUMBER');
    ASSERT(typeof varIndex2 === 'number', 'INDEX_SHOULD_BE_NUMBER');
    ASSERT_NUMSTRDOM(space.vardoms[varIndex1]);
    ASSERT_NUMSTRDOM(space.vardoms[varIndex2]);
    ASSERT(space.vardoms[varIndex1] && space.vardoms[varIndex2], 'EXPECTING_NON_EMPTY');
    var n = domain_any_min(space.vardoms[varIndex1]) - domain_any_min(space.vardoms[varIndex2]);
    if (n < 0) return BETTER;
    if (n > 0) return WORSE;
    return SAME;
}

function distribution_varByMax(space, config, varIndex1, varIndex2) {
    ASSERT(space._class === '$space', 'SPACE_SHOULD_BE_SPACE');
    ASSERT(typeof varIndex1 === 'number', 'INDEX_SHOULD_BE_NUMBER');
    ASSERT(typeof varIndex2 === 'number', 'INDEX_SHOULD_BE_NUMBER');
    var n = domain_any_max(space.vardoms[varIndex1]) - domain_any_max(space.vardoms[varIndex2]);
    if (n > 0) return BETTER;
    if (n < 0) return WORSE;
    return SAME;
}

function distribution_varByMarkov(space, config, varIndex1, varIndex2, varStratConfig) {
    ASSERT(space._class === '$space', 'SPACE_SHOULD_BE_SPACE');
    ASSERT(typeof varIndex1 === 'number', 'INDEX_SHOULD_BE_NUMBER');
    ASSERT(typeof varIndex2 === 'number', 'INDEX_SHOULD_BE_NUMBER');
    var distOptions = config.var_dist_options; // v1 is only, but if so always, better than v2 if v1 is a markov var
    var varName1 = config.all_var_names[varIndex1];
    ASSERT(typeof varName1 === 'string', 'VAR_NAME_SHOULD_BE_STRING');
    if (distOptions[varName1] && distOptions[varName1].valtype === 'markov') {
        return BETTER;
    }
    var varName2 = config.all_var_names[varIndex2];
    ASSERT(typeof varName2 === 'string', 'VAR_NAME_SHOULD_BE_STRING');
    if (distOptions[varName2] && distOptions[varName2].valtype === 'markov') {
        return WORSE;
    }
    return distribution_varFallback(space, config, varIndex1, varIndex2, varStratConfig.fallback);
}

function distribution_varByList(space, config, varIndex1, varIndex2, varStratConfig) {
    ASSERT(space._class === '$space', 'SPACE_SHOULD_BE_SPACE');
    ASSERT(typeof varIndex1 === 'number', 'INDEX_SHOULD_BE_NUMBER');
    ASSERT(typeof varIndex2 === 'number', 'INDEX_SHOULD_BE_NUMBER'); // note: config._priorityByIndex is compiled by Solver#prepare from given priorityByName
    // if in the list, lowest prio can be 1. if not in the list, prio will be undefined
    var hash = varStratConfig._priorityByIndex; // if v1 or v2 is not in the list they will end up as undefined
    var p1 = hash[varIndex1];
    var p2 = hash[varIndex2];
    ASSERT(p1 !== 0, 'SHOULD_NOT_USE_INDEX_ZERO');
    ASSERT(p2 !== 0, 'SHOULD_NOT_USE_INDEX_ZERO');
    if (!p1 && !p2) { // neither has a priority
        return distribution_varFallback(space, config, varIndex1, varIndex2, varStratConfig.fallback);
    } // invert this operation? ("deprioritizing").
    var inverted = varStratConfig.inverted; // if inverted being on the list makes it worse than not.
    if (!p2) {
        if (inverted) return WORSE;
        return BETTER;
    }
    if (!p1) {
        if (inverted) return BETTER;
        return WORSE;
    } // the higher the p, the higher the prio. (the input array is compiled that way)
    // if inverted then low p is higher prio
    if (p1 > p2) {
        if (inverted) return WORSE;
        return BETTER;
    }
    ASSERT(p1 < p2, 'A_CANNOT_GET_SAME_INDEX_FOR_DIFFERENT_NAME');
    if (inverted) return BETTER;
    return WORSE;
}

function distribution_varFallback(space, config, varIndex1, varIndex2, fallbackConfig) {
    ASSERT(space._class === '$space', 'SPACE_SHOULD_BE_SPACE');
    ASSERT(typeof varIndex1 === 'number', 'INDEX_SHOULD_BE_NUMBER');
    ASSERT(typeof varIndex2 === 'number', 'INDEX_SHOULD_BE_NUMBER');
    if (!fallbackConfig) {
        return SAME;
    }
    var distName = fallbackConfig.type;
    switch (distName) {
        case 'size':
            return distribution_varByMinSize(space, config, varIndex1, varIndex2);
        case 'min':
            return distribution_varByMin(space, config, varIndex1, varIndex2);
        case 'max':
            return distribution_varByMax(space, config, varIndex1, varIndex2);
        case 'markov':
            return distribution_varByMarkov(space, config, varIndex1, varIndex2, fallbackConfig);
        case 'list':
            return distribution_varByList(space, config, varIndex1, varIndex2, fallbackConfig);
        case 'throw':
            return THROW('nope');
    }
    return THROW('Unknown var dist fallback name: ' + distName);
}

function distribution_varThrow(s) {
    return THROW(s);
} // end of src/distribution/var.js
// from: src/domain.js
var PREV_CHANGED = true;
var FORCE_ARRAY = 1;
var FORCE_STRING = 2; // CSIS form = Canonical Sorted Interval Sequeunce form.
// Basically means the ranges in the domain are ordered
// ascending and no ranges overlap. We call this "simplified"
//let FIRST_RANGE = 0;
var STR_FIRST_RANGE_LO = 0; // first and second char of a string
var STR_FIRST_RANGE_HI = 2; // third and fourth char of a string
var ARR_FIRST_RANGE_LO = 0;
var ARR_FIRST_RANGE_HI = 1; // Cache static Math functions
var MIN = Math.min;
var MAX = Math.max;
var FLOOR = Math.floor;
var CEIL = Math.ceil;
var ZERO = 1 << 0;
var ONE = 1 << 1;
var BOOL = ZERO | ONE;
var TWO = 1 << 2;
var THREE = 1 << 3;
var FOUR = 1 << 4;
var FIVE = 1 << 5;
var SIX = 1 << 6;
var SEVEN = 1 << 7;
var EIGHT = 1 << 8;
var NINE = 1 << 9;
var TEN = 1 << 10;
var ELEVEN = 1 << 11;
var TWELVE = 1 << 12;
var THIRTEEN = 1 << 13;
var FOURTEEN = 1 << 14;
var FIFTEEN = 1 << 15;
var SIXTEEN = 1 << 16;
var SEVENTEEN = 1 << 17;
var EIGHTEEN = 1 << 18;
var NINETEEN = 1 << 19;
var TWENTY = 1 << 20;
var TWENTYONE = 1 << 21;
var TWENTYTWO = 1 << 22;
var TWENTYTHREE = 1 << 23;
var TWENTYFOUR = 1 << 24;
var TWENTYFIVE = 1 << 25;
var TWENTYSIX = 1 << 26;
var TWENTYSEVEN = 1 << 27;
var TWENTYEIGHT = 1 << 28;
var TWENTYNINE = 1 << 29;
var THIRTY = 1 << 30;
var NUM_TO_FLAG = [ZERO, ONE, TWO, THREE, FOUR, FIVE, SIX, SEVEN, EIGHT, NINE, TEN, ELEVEN, TWELVE, THIRTEEN, FOURTEEN, FIFTEEN, SIXTEEN, SEVENTEEN, EIGHTEEN, NINETEEN, TWENTY, TWENTYONE, TWENTYTWO, TWENTYTHREE, TWENTYFOUR, TWENTYFIVE, TWENTYSIX, TWENTYSEVEN, TWENTYEIGHT, TWENTYNINE, THIRTY];
var FLAG_TO_NUM = {};
FLAG_TO_NUM[ZERO] = 0;
FLAG_TO_NUM[ONE] = 1;
FLAG_TO_NUM[TWO] = 2;
FLAG_TO_NUM[THREE] = 3;
FLAG_TO_NUM[FOUR] = 4;
FLAG_TO_NUM[FIVE] = 5;
FLAG_TO_NUM[SIX] = 6;
FLAG_TO_NUM[SEVEN] = 7;
FLAG_TO_NUM[EIGHT] = 8;
FLAG_TO_NUM[NINE] = 9;
FLAG_TO_NUM[TEN] = 10;
FLAG_TO_NUM[ELEVEN] = 11;
FLAG_TO_NUM[TWELVE] = 12;
FLAG_TO_NUM[THIRTEEN] = 13;
FLAG_TO_NUM[FOURTEEN] = 14;
FLAG_TO_NUM[FIFTEEN] = 15;
FLAG_TO_NUM[SIXTEEN] = 16;
FLAG_TO_NUM[SEVENTEEN] = 17;
FLAG_TO_NUM[EIGHTEEN] = 18;
FLAG_TO_NUM[NINETEEN] = 19;
FLAG_TO_NUM[TWENTY] = 20;
FLAG_TO_NUM[TWENTYONE] = 21;
FLAG_TO_NUM[TWENTYTWO] = 22;
FLAG_TO_NUM[TWENTYTHREE] = 23;
FLAG_TO_NUM[TWENTYFOUR] = 24;
FLAG_TO_NUM[TWENTYFIVE] = 25;
FLAG_TO_NUM[TWENTYSIX] = 26;
FLAG_TO_NUM[TWENTYSEVEN] = 27;
FLAG_TO_NUM[TWENTYEIGHT] = 28;
FLAG_TO_NUM[TWENTYNINE] = 29;
FLAG_TO_NUM[THIRTY] = 30; // size of values and ranges in a string domain
var STR_VALUE_SIZE = 2;
var STR_RANGE_SIZE = 4;
/**
 * Append given range to the end of given domain. Does not
 * check if the range belongs there! Dumbly appends.
 *
 * @param {$domain} domain
 * @param {number} lo
 * @param {number} hi
 * @returns {$domain}
 */
function domain_any_appendRange(domain, lo, hi) {
    ASSERT_NUMSTRDOM(domain);
    if (typeof domain === 'number') {
        if (hi <= SMALL_MAX_NUM) return asmdomain_addRange(domain, lo, hi);
        domain = domain_numToStr(domain);
    }
    return domain_str_addRange(domain, lo, hi);
}
/**
 * Append given range to the end of given domain. Does not
 * check if the range belongs there! Dumbly appends.
 *
 * @param {$domain_str} domain
 * @param {number} lo
 * @param {number} hi
 * @returns {$domain_str}
 */
function domain_str_addRange(domain, lo, hi) {
    ASSERT_STRDOM(domain);
    return domain + domain_str_encodeRange(lo, hi);
}
/**
 * returns whether domain covers given value
 *
 * @param {$domain} domain
 * @param {number} value
 * @returns {boolean}
 */
function domain_any_containsValue(domain, value) {
    ASSERT_NUMSTRDOM(domain);
    if (typeof domain === 'number') return asmdomain_containsValue(domain, value) === 1;
    return domain_str_containsValue(domain, value);
}
/**
 * returns whether domain covers given value
 * for array domains
 *
 * @param {$domain_str} domain
 * @param {number} value
 * @returns {boolean}
 */
function domain_str_containsValue(domain, value) {
    ASSERT(typeof value === 'number', 'A_VALUE_SHOULD_BE_NUMBER');
    ASSERT_STRDOM(domain);
    return domain_str_rangeIndexOf(domain, value) !== NOT_FOUND;
}
/**
 * return the range index in given domain that covers given
 * value, or if the domain does not cover it at all
 *
 * @param {$domain_str} domain
 * @param {number} value
 * @returns {number} >=0 actual index on strdom or NOT_FOUND
 */
function domain_str_rangeIndexOf(domain, value) {
    ASSERT_STRDOM(domain);
    var len = domain.length;
    for (var index = 0; index < len; index += STR_RANGE_SIZE) {
        var lo = domain_str_decodeValue(domain, index);
        if (lo <= value) {
            var hi = domain_str_decodeValue(domain, index + STR_VALUE_SIZE);
            if (hi >= value) { // value is lo<=value<=hi
                return index;
            }
        } else { // value is between previous range and this one, aka: not found. proceed with next item in list
            break;
        }
    }
    return NOT_FOUND;
}
/**
 * @param {$domain} domain
 * @param {number} value
 * @returns {boolean}
 */
function domain_any_isValue(domain, value) {
    ASSERT_NUMSTRDOM(domain);
    ASSERT(value >= 0, 'DOMAINS_ONLY_CONTAIN_UINTS');
    if (typeof domain === 'number') return asmdomain_isValue(domain, value) === 1;
    return domain_str_isValue(domain, value);
}
/**
 * @param {$domain_str} domain
 * @param {number} value
 * @returns {boolean}
 */
function domain_str_isValue(domain, value) {
    ASSERT_STRDOM(domain);
    return domain.length === STR_RANGE_SIZE && (domain_str_decodeValue(domain, STR_FIRST_RANGE_LO) | domain_str_decodeValue(domain, STR_FIRST_RANGE_HI)) === value;
}
/**
 * @param {$domain} domain
 * @returns {number}
 */
function domain_any_getValue(domain) {
    ASSERT_NUMSTRDOM(domain);
    if (typeof domain === 'number') return asmdomain_getValue(domain);
    return domain_str_getValue(domain);
}
/**
 * @param {$domain_str} domain
 * @returns {number}
 */
function domain_str_getValue(domain) {
    ASSERT_STRDOM(domain);
    if (domain.length !== STR_RANGE_SIZE) return NO_SUCH_VALUE;
    var lo = domain_str_decodeValue(domain, STR_FIRST_RANGE_LO);
    var hi = domain_str_decodeValue(domain, STR_FIRST_RANGE_HI);
    if (lo === hi) return lo;
    return NO_SUCH_VALUE;
}

function domain_arr_getValue(domain) {
    ASSERT_ARRDOM(domain);
    if (domain.length === ARR_RANGE_SIZE && domain[0] === domain[1]) return domain[0];
    return NO_SUCH_VALUE;
}
/**
 * @param {$domain_str} domain
 * @param {number} index
 * @returns {number}
 */
function domain_str_decodeValue(domain, index) {
    ASSERT_STRDOM(domain);
    return domain.charCodeAt(index) << 16 | domain.charCodeAt(index + 1);
}
/**
 * @param {number} value
 * @returns {string}
 */
function domain_str_encodeValue(value) {
    return String.fromCharCode(value >>> 16 & 0xffff, value & 0xffff);
}
/**
 * @param {number} lo
 * @param {number} hi
 * @returns {$domain_str} One range is still a valid domain
 */
function domain_str_encodeRange(lo, hi) {
    return String.fromCharCode(lo >>> 16 & 0xffff, lo & 0xffff, hi >>> 16 & 0xffff, hi & 0xffff);
}
/**
 * list of possible values to domain
 * returns a CSIS domain
 *
 * @param {number[]} list
 * @param {boolean} [clone=true]
 * @param {boolean} [sort=true]
 * @param {boolean} [_forceArray=false] Force creation of an array. Probably to convert a number for certain operations
 * @returns {$domain_str}
 */
function _domain_fromList(list) {
    var clone = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];
    var sort = arguments.length <= 2 || arguments[2] === undefined ? true : arguments[2];
    var _forceArray = arguments.length <= 3 || arguments[3] === undefined ? false : arguments[3]; // FIXME: force array
    if (!list.length) return EMPTY;
    if (sort) { // note: the list must be sorted for the algorithm below to work...
        if (clone) { // clone before sorting?
            list = list.slice(0);
        }
        list.sort(function(a, b) {
            return a - b;
        }); // note: default sort is lexicographic!
    }
    if (!_forceArray && list[0] >= 0 && list[list.length - 1] <= SMALL_MAX_NUM) { // create a number.
        var last = 0; // do confirm whether the list is ordered
        var d = 0;
        for (var i = 0; i < list.length; ++i) {
            var value = list[i];
            ASSERT(value >= last && (last = value) >= 0, 'LIST_SHOULD_BE_ORDERED_BY_NOW');
            d |= NUM_TO_FLAG[value];
        }
        return d;
    }
    var domain = EMPTY_STR;
    var hi = void 0;
    var lo = void 0;
    for (var index = 0; index < list.length; index++) {
        var _value = list[index];
        ASSERT(_value >= SUB, 'A_OOB_INDICATES_BUG');
        ASSERT(_value <= SUP, 'A_OOB_INDICATES_BUG');
        if (index === 0) {
            lo = _value;
            hi = _value;
        } else {
            ASSERT(_value >= hi, 'LIST_SHOULD_BE_ORDERED_BY_NOW'); // imo it should not even contain dupe elements... but that may happen anyways
            if (_value > hi + 1) {
                domain += domain_str_encodeRange(lo, hi);
                lo = _value;
            }
            hi = _value;
        }
    }
    return domain + domain_str_encodeRange(lo, hi);
}
/**
 * domain to list of possible values
 *
 * @param {$domain} domain
 * @returns {number[]}
 */
function domain_any_toList(domain) {
    ASSERT_NUMSTRDOM(domain);
    if (typeof domain === 'number') return domain_num_toList(domain);
    return domain_str_toList(domain);
}
/**
 * domain to list of possible values
 *
 * @param {$domain_num} domain
 * @returns {number[]}
 */
function domain_num_toList(domain) {
    ASSERT_NUMDOM(domain);
    var list = [];
    for (var i = 0; i < 16; ++i) {
        if ((domain & NUM_TO_FLAG[i]) > 0) list.push(i);
    }
    return list;
}
/**
 * domain to list of possible values
 *
 * @param {$domain_str} domain
 * @returns {number[]}
 */
function domain_str_toList(domain) {
    ASSERT_STRDOM(domain);
    var list = [];
    for (var i = 0, len = domain.length; i < len; i += STR_RANGE_SIZE) {
        for (var n = domain_str_decodeValue(domain, i), m = domain_str_decodeValue(domain, i + STR_VALUE_SIZE); n <= m; ++n) {
            list.push(n);
        }
    }
    return list;
}
/**
 * Given a list and domain, search items in the list in the domain and remove
 * the first element found this way, then return a deep clone of that result
 * Given domain is not harmed in this process.
 * If no items from list can be found, this function returns the empty domain.
 *
 * @param {$domain} domain
 * @param {number[]} list
 * @returns {$domain|number} NO_SUCH_VALUE (-1) means the result is empty, non-zero means new small domain
 */
function domain_any_removeNextFromList(domain, list) {
    ASSERT_NUMSTRDOM(domain);
    if (typeof domain === 'number') return domain_num_removeNextFromList(domain, list);
    return domain_str_removeNextFromList(domain, list);
}
/**
 * Given a list and domain, search items in the list in the domain and remove
 * the first element found this way, then return a deep clone of that result
 * Given domain is not harmed in this process.
 * If no items from list can be found, this function returns the empty domain.
 *
 * @param {$domain_num} domain
 * @param {number[]} list
 * @returns {$domain|number} NO_SUCH_VALUE (-1) means the result is empty, non-zero means new small domain
 */
function domain_num_removeNextFromList(domain, list) {
    ASSERT_NUMDOM(domain);
    ASSERT(list, 'A_EXPECTING_LIST');
    for (var i = 0; i < list.length; ++i) {
        var value = list[i];
        ASSERT(value >= SUB && value <= SUP, 'A_OOB_INDICATES_BUG');
        if (value < SMALL_MAX_NUM) { // 1<<100 = 16. non-small-domain numbers are valid here. so check.
            var flag = 1 << value;
            if (domain & flag) return domain ^ flag; // if the bit is set; unset it
        }
    }
    return NO_SUCH_VALUE;
}
/**
 * Given a list and domain, search items in the list in the domain and remove
 * the first element found this way, then return a deep clone of that result
 * Given domain is not harmed in this process.
 * If no items from list can be found, this function returns the empty domain.
 *
 * @param {$domain_str} domain
 * @param {number[]} list
 * @returns {$domain|number} NO_SUCH_VALUE (-1) means the result is empty
 */
function domain_str_removeNextFromList(domain, list) {
    ASSERT_STRDOM(domain);
    var r = _domain_str_removeNextFromList(domain, list); // replace empty string
    ASSERT(r || r === EMPTY_STR, 'if it returns falsy it should be the empty string and not some other falsy');
    return r || EMPTY; // replace '' with 0
}
/**
 * See main function. This function may return the empty string as an empty domain.
 *
 * @param {$domain_str} domain
 * @param {number[]} list
 * @returns {$domain|number} NO_SUCH_VALUE (-1) means the result is empty
 */
function _domain_str_removeNextFromList(domain, list) {
    ASSERT_STRDOM(domain);
    ASSERT(list, 'A_EXPECTING_LIST');
    var len = domain.length;
    for (var i = 0; i < list.length; i++) {
        var value = list[i];
        ASSERT(value >= SUB && value <= SUP, 'A_OOB_INDICATES_BUG');
        for (var index = 0; index < len; index += STR_RANGE_SIZE) {
            var lo = domain_str_decodeValue(domain, index);
            if (lo <= value) {
                var hi = domain_str_decodeValue(domain, index + STR_VALUE_SIZE);
                if (hi >= value) { // value is lo<=value<=hi
                    var before = domain.slice(0, index);
                    var after = domain.slice(index + STR_RANGE_SIZE);
                    if (hi === value) { // TODO: check numbered domain edge case. its not trivial, maybe we can cheese it by checking the return value (but only here)
                        if (lo === value) { // lo=hi=value; drop this range completely
                            return before + after; // TODO: i dont think this is correct yet for empty strings but maybe?
                        }
                        return before + domain_str_encodeRange(lo, hi - 1) + after;
                    } else if (lo === value) {
                        return before + domain_str_encodeRange(lo + 1, hi) + after;
                    } else { // we get new two ranges...
                        return before + domain_str_encodeRange(lo, value - 1) + domain_str_encodeRange(value + 1, hi) + after;
                    }
                }
            } else { // value is between previous range and this one, aka: not found. proceed with next item in list
                break;
            }
        }
    }
    return NO_SUCH_VALUE;
}
/**
 * @param {$domain} domain
 * @param {number[]} list
 * @returns {number} Can return NO_SUCH_VALUE
 */
function domain_any_getValueOfFirstContainedValueInList(domain, list) {
    ASSERT_NUMSTRDOM(domain);
    if (typeof domain === 'number') return domain_num_getValueOfFirstContainedValueInList(domain, list);
    return domain_str_getValueOfFirstContainedValueInList(domain, list);
}
/**
 * @param {$domain_num} domain
 * @param {number[]} list
 * @returns {number} Can return NO_SUCH_VALUE
 */
function domain_num_getValueOfFirstContainedValueInList(domain, list) {
    ASSERT_NUMDOM(domain);
    ASSERT(list, 'EXPECTING_LIST');
    for (var i = 0; i < list.length; ++i) {
        var value = list[i];
        ASSERT(value >= SUB && value <= SUP, 'A_OOB_INDICATES_BUG'); // internally all domains elements should be sound; SUB>=n>=SUP
        // 1<<100 = 16 and large numbers are valid here so do check
        if (value <= SMALL_MAX_NUM && (domain & 1 << value) > 0) return value;
    }
    return NO_SUCH_VALUE;
}
/**
 * @param {$domain_str} domain
 * @param {number[]} list
 * @returns {number} Can return NO_SUCH_VALUE
 */
function domain_str_getValueOfFirstContainedValueInList(domain, list) {
    ASSERT_STRDOM(domain);
    ASSERT(list, 'EXPECTING_LIST');
    for (var i = 0; i < list.length; i++) {
        var value = list[i];
        ASSERT(value >= SUB && value <= SUP, 'A_OOB_INDICATES_BUG'); // internally all domains elements should be sound; SUB>=n>=SUP
        if (domain_str_containsValue(domain, value)) {
            return value;
        }
    }
    return NO_SUCH_VALUE;
}
/**
 * The complement of a domain is such that domain U domain' = [SUB, SUP].
 * Assumes domain is in CSIS form
 * Returns a domain that covers any range in (SUB...SUP) that was not covered by given domain
 *
 * @param {$domain} domain
 * @returns {$domain}
 */
function domain_any_complement(domain) {
    ASSERT_NUMSTRDOM(domain); // for simplicity sake, convert them back to arrays
    // TODO: i think we could just bitwise invert, convert to domain, swap out last element with SUP
    if (typeof domain === 'number') domain = domain_numToStr(domain);
    if (!domain) THROW('EMPTY_DOMAIN_PROBABLY_BUG');
    var end = SUB;
    var result = EMPTY_STR;
    for (var i = 0, len = domain.length; i < len; i += STR_RANGE_SIZE) {
        var lo = domain_str_decodeValue(domain, i);
        ASSERT(!end || end < lo, 'domain is supposed to be csis, so ranges dont overlap nor touch');
        if (lo > SUB) { // prevent [SUB,SUB] if first range starts at SUB; that'd be bad
            result += domain_str_encodeRange(end, lo - 1);
        }
        end = domain_str_decodeValue(domain, i + STR_VALUE_SIZE) + 1;
    }
    if (end <= SUP) { // <= so SUP is inclusive...
        result += domain_str_encodeRange(end, SUP);
    }
    return domain_toNumstr(result); // TODO: test edge case where the inverted domain is actually a small domain
}
/**
 * All ranges will be ordered ascending and overlapping ranges are merged
 * This function first checks whether simplification is needed at all
 *
 * @param {$domain_str|string} domain
 * @returns {$domain_str} ironically, not optimized to a number if possible
 */
function domain_str_simplify(domain) {
    ASSERT_STRDOM(domain);
    if (!domain) return EMPTY_STR; // keep return type consistent, dont return EMPTY
    if (domain.length === STR_RANGE_SIZE) return domain; // order ranges, then merge overlapping ranges (TODO: can we squash this step together?)
    domain = _domain_str_quickSortRanges(domain);
    domain = _domain_str_mergeOverlappingRanges(domain);
    return domain;
}
/**
 * Sort all ranges in this pseudo-strdom from lo to hi. Domain
 * may already be csis but we're not sure. This function call
 * is part of the process of ensuring that.
 *
 * @param {$domain_str|string} domain MAY not be CSIS yet (that's probably why this function is called in the first place)
 * @returns {$domain_str|string} ranges in this string will be ordered but may still overlap
 */
function _domain_str_quickSortRanges(domain) {
    ASSERT_STRDOM(domain);
    if (!domain) return EMPTY_STR; // keep return type consistent, dont return EMPTY
    var len = domain.length;
    if (len <= STR_RANGE_SIZE) return domain; // TODO: right now we convert to actual values and concat with "direct" string access. would it be faster to use slices? and would it be faster to do string comparisons with the slices and no decoding?
    var pivotIndex = 0; // TODO: i think we'd be better off with a different pivot? middle probably performs better
    var pivotLo = domain_str_decodeValue(domain, pivotIndex);
    var pivotHi = domain_str_decodeValue(domain, pivotIndex + STR_VALUE_SIZE);
    var left = EMPTY_STR;
    var right = EMPTY_STR;
    for (var i = STR_RANGE_SIZE; i < len; i += STR_RANGE_SIZE) {
        var lo = domain_str_decodeValue(domain, i); // TODO: if we change assumptions elsewhere we could drop the `hi` stuff from this function altogether
        if (lo < pivotLo || lo === pivotLo && domain_str_decodeValue(domain, i + STR_VALUE_SIZE) < pivotHi) {
            left += domain[i] + domain[i + 1] + domain[i + 2] + domain[i + 3];
        } else {
            right += domain[i] + domain[i + 1] + domain[i + 2] + domain[i + 3];
        }
    }
    return '' + _domain_str_quickSortRanges(left) + // sort left part, without pivot
        domain[pivotIndex] + // include pivot (4 chars)
        domain[pivotIndex + 1] + domain[pivotIndex + STR_VALUE_SIZE] + domain[pivotIndex + STR_VALUE_SIZE + 1] + _domain_str_quickSortRanges(right) // sort right part, without pivot
    ;
}
/**
 * @param {$domain_str|string} domain May already be csis but at least all ranges should be ordered and are lo<=hi
 * @returns {$domain_str}
 */
function _domain_str_mergeOverlappingRanges(domain) {
    ASSERT_STRDOM(domain);
    if (!domain) return EMPTY_STR; // prefer strings for return type consistency
    // assumes domain is sorted
    // assumes all ranges are "sound" (lo<=hi)
    var len = domain.length;
    if (len === STR_RANGE_SIZE) return domain;
    var newDomain = domain[STR_FIRST_RANGE_LO] + domain[STR_FIRST_RANGE_LO + 1]; // just copy the first two characters...
    var lasthi = domain_str_decodeValue(domain, STR_FIRST_RANGE_HI);
    var lasthindex = STR_FIRST_RANGE_HI;
    for (var i = STR_RANGE_SIZE; i < len; i += STR_RANGE_SIZE) {
        var lo = domain_str_decodeValue(domain, i);
        var hi = domain_str_decodeValue(domain, i + STR_VALUE_SIZE);
        ASSERT(lo <= hi, 'ranges should be ascending'); // either:
        // - lo <= lasthi, hi <= lasthi: last range consumes current range (drop it)
        // - lo <= lasthi+1: replace lasthi, last range is extended by current range
        // - lo >= lasthi+2: flush lasthi, replace lastlo and lasthi, current range becomes last range
        //if (lo <= lasthi && hi <= lasthi) {}
        //else
        if (lo <= lasthi + 1) {
            if (hi > lasthi) {
                lasthi = hi;
                lasthindex = i + STR_VALUE_SIZE;
            }
        } else {
            ASSERT(lo >= lasthi + 2, 'should be this now');
            newDomain += domain[lasthindex] + domain[lasthindex + 1] + domain[i] + domain[i + 1];
            lasthi = hi;
            lasthindex = i + STR_VALUE_SIZE;
        }
    }
    return newDomain + domain[lasthindex] + domain[lasthindex + 1];
}
/**
 * Check if given domain is in simplified, CSIS form
 *
 * @param {$domain_str} domain
 * @returns {boolean}
 */
function domain_str_isSimplified(domain) {
    ASSERT_STRDOM(domain);
    if (domain.length === STR_RANGE_SIZE) {
        ASSERT(domain_str_decodeValue(domain, STR_FIRST_RANGE_LO) >= SUB, 'A_RANGES_SHOULD_BE_GTE_SUB');
        ASSERT(domain_str_decodeValue(domain, STR_FIRST_RANGE_HI) <= SUP, 'A_RANGES_SHOULD_BE_LTE_SUP');
        ASSERT(domain_str_decodeValue(domain, STR_FIRST_RANGE_LO) <= domain_str_decodeValue(domain, STR_FIRST_RANGE_HI), 'A_RANGES_SHOULD_ASCEND');
        return true;
    }
    if (domain === EMPTY_STR) {
        return true;
    }
    var phi = SUB;
    for (var index = 0, len = domain.length; index < len; index += STR_RANGE_SIZE) {
        var lo = domain_str_decodeValue(domain, index);
        var hi = domain_str_decodeValue(domain, index + STR_VALUE_SIZE);
        ASSERT(lo >= SUB, 'A_RANGES_SHOULD_BE_GTE_SUB');
        ASSERT(hi <= SUP, 'A_RANGES_SHOULD_BE_LTE_SUP');
        ASSERT(lo <= hi, 'A_RANGES_SHOULD_ASCEND'); // we need to simplify if the lo of the next range <= hi of the previous range
        // TODO: i think it used or intended to optimize this by continueing to process this from the current domain, rather than the start.
        //       this function could return the offset to continue at... or -1 to signal "true"
        if (lo <= phi + 1) {
            return false;
        }
        phi = hi;
    }
    return true;
}
/**
 * Intersect two $domains.
 * Intersection means the result only contains the values
 * that are contained in BOTH domains.
 *
 * @param {$domain} domain1
 * @param {$domain} domain2
 * @returns {$domain}
 */
function domain_any_intersection(domain1, domain2) {
    ASSERT_NUMSTRDOM(domain1);
    ASSERT_NUMSTRDOM(domain2);
    if (domain1 === domain2) return domain1;
    var isNum1 = typeof domain1 === 'number';
    var isNum2 = typeof domain2 === 'number';
    if (isNum1 && isNum2) return asmdomain_intersection(domain1, domain2);
    if (isNum1) return domain_numstr_intersection(domain1, domain2);
    if (isNum2) return domain_numstr_intersection(domain2, domain1); // swapped!
    return domain_strstr_intersection(domain1, domain2);
}
/**
 * Intersect the domain assuming domain1 is a numbered (small)
 * domain and domain2 is an array domain. The result will always
 * be a small domain and that's what this function intends to
 * optimize.
 *
 * @param {$domain_num} domain_num
 * @param {$domain_str} domain_str
 * @returns {$domain_num} Always a numdom because we already know numbers higher than max_small cant occur in _both_ domains
 */
function domain_numstr_intersection(domain_num, domain_str) {
    ASSERT_NUMDOM(domain_num);
    ASSERT_STRDOM(domain_str);
    var domain = EMPTY;
    for (var i = 0, len = domain_str.length; i < len; i += STR_RANGE_SIZE) {
        var lo = domain_str_decodeValue(domain_str, i);
        if (lo > SMALL_MAX_NUM) break;
        var hi = domain_str_decodeValue(domain_str, i + STR_VALUE_SIZE);
        for (var j = lo, m = MIN(SMALL_MAX_NUM, hi); j <= m; ++j) {
            var flag = NUM_TO_FLAG[j];
            if (domain_num & flag) domain |= flag; // could be: domain |= domain1 & NUMBER[j]; but this reads better?
        }
    }
    return domain;
}
/**
 * Intersect two strdoms.
 * Intersection means the result only contains the values
 * that are contained in BOTH domains.
 *
 * @param {$domain_str} domain1
 * @param {$domain_str} domain2
 * @returns {$domain} can return a numdom
 */
function domain_strstr_intersection(domain1, domain2) {
    ASSERT_STRDOM(domain1);
    ASSERT_STRDOM(domain2);
    var newDomain = _domain_strstr_intersection(domain1, domain2);
    return domain_toNumstr(newDomain);
}
/**
 * Recursively calls itself
 *
 * @param {$domain_str} domain1
 * @param {$domain_str} domain2
 * @returns {$domain_str} always a strdom
 */
function _domain_strstr_intersection(domain1, domain2) {
    ASSERT_STRDOM(domain1);
    ASSERT_STRDOM(domain2);
    var newDomain = EMPTY_STR;
    var len1 = domain1.length;
    var len2 = domain2.length;
    if (len1 + len2 === 0) return newDomain;
    var index1 = 0;
    var index2 = 0;
    var lo1 = domain_str_decodeValue(domain1, STR_FIRST_RANGE_LO);
    var hi1 = domain_str_decodeValue(domain1, STR_FIRST_RANGE_HI);
    var lo2 = domain_str_decodeValue(domain2, STR_FIRST_RANGE_LO);
    var hi2 = domain_str_decodeValue(domain2, STR_FIRST_RANGE_HI);
    while (true) {
        if (hi1 < lo2) {
            index1 += STR_RANGE_SIZE;
            if (index1 >= len1) break;
            lo1 = domain_str_decodeValue(domain1, index1);
            hi1 = domain_str_decodeValue(domain1, index1 + STR_VALUE_SIZE);
        } else if (hi2 < lo1) {
            index2 += STR_RANGE_SIZE;
            if (index2 >= len2) break;
            lo2 = domain_str_decodeValue(domain2, index2);
            hi2 = domain_str_decodeValue(domain2, index2 + STR_VALUE_SIZE);
        } else {
            ASSERT(lo1 <= lo2 && lo2 <= hi1 || lo2 <= lo1 && lo1 <= hi2, '_domain_strstr_intersection: both ranges must overlap at least for some element because neither ends before the other [' + lo1 + ',' + hi1 + ' - ' + lo2 + ',' + hi2 + ']');
            var mh = MIN(hi1, hi2);
            newDomain += domain_str_encodeRange(MAX(lo1, lo2), mh); // put all ranges after the one we just added...
            mh += 2; // last added range + 1 position gap
            lo1 = lo2 = mh;
            ASSERT(hi1 < mh || hi2 < mh, 'at least one range should be moved forward now');
            if (hi1 < mh) {
                index1 += STR_RANGE_SIZE;
                if (index1 >= len1) break;
                lo1 = domain_str_decodeValue(domain1, index1);
                hi1 = domain_str_decodeValue(domain1, index1 + STR_VALUE_SIZE);
            }
            if (hi2 < mh) {
                index2 += STR_RANGE_SIZE;
                if (index2 >= len2) break;
                lo2 = domain_str_decodeValue(domain2, index2);
                hi2 = domain_str_decodeValue(domain2, index2 + STR_VALUE_SIZE);
            }
        }
    }
    return newDomain;
}

function domainany__debug(domain) {
    if (typeof domain === 'number') return 'numdom([' + domain_numToArr(domain) + '])';
    if (typeof domain === 'string') return 'strdom([' + domain_strToArr(domain) + '])';
    if (domain instanceof Array) return 'arrdom([' + domain + '])';
    return '???dom(' + domain + ')';
}
/**
 * deep comparison of two $domains
 *
 * @param {$domain} domain1
 * @param {$domain} domain2
 * @returns {boolean}
 */
function domain_any_isEqual(domain1, domain2) {
    ASSERT_NUMSTRDOM(domain1);
    ASSERT_NUMSTRDOM(domain2); // whether domain is a string or a number, we can === it
    return domain1 === domain2;
}
/**
 * The idea behind this function - which is primarily
 * intended for domain_plus and domain_minus and probably applies
 * to nothing else - is that when adding two intervals,
 * both intervals expand by the other's amount. This means
 * that when given two segmented domains, each continuous
 * range expands by at least the interval of the smallest
 * range of the other segmented domain. When such an expansion
 * occurs, any gaps between subdomains that are <= the smallest
 * range's interval width get filled up, which we can exploit
 * to reduce the number of segments in a domain. Reducing the
 * number of domain segments helps reduce the N^2 complexity of
 * the subsequent domain consistent interval addition method.
 *
 * @param {$domain_str} domain1
 * @param {$domain_str} domain2
 * @returns {$domain_str[]}
 */
function domain_str_closeGaps(domain1, domain2) {
    ASSERT_STRDOM(domain1);
    ASSERT_STRDOM(domain2);
    if (domain1 && domain2) {
        var change = void 0;
        do {
            change = 0;
            if (domain1.length > STR_RANGE_SIZE) {
                var smallestRangeSize = domain_str_smallestRangeSize(domain2);
                var domain = _domain_str_closeGaps(domain1, smallestRangeSize);
                change += domain1.length - domain.length;
                domain1 = domain;
            }
            if (domain2.length > STR_RANGE_SIZE) {
                var _smallestRangeSize = domain_str_smallestRangeSize(domain1);
                var _domain = _domain_str_closeGaps(domain2, _smallestRangeSize);
                change += domain2.length - _domain.length;
                domain2 = _domain;
            }
        } while (change !== 0);
    } // TODO: we could return a concatted string and prefix the split, instead of this temporary array...
    return [domain1, domain2];
}
/**
 * Closes all the gaps between the intervals according to
 * the given gap value. All gaps less than this gap are closed.
 * Domain is not harmed
 *
 * @param {$domain_str} domain
 * @param {number} gap
 * @returns {$domain_str} (min/max won't be eliminated and input should be a "large" domain)
 */
function _domain_str_closeGaps(domain, gap) {
    ASSERT_STRDOM(domain);
    var newDomain = domain[STR_FIRST_RANGE_LO] + domain[STR_FIRST_RANGE_LO + 1];
    var lasthi = domain_str_decodeValue(domain, STR_FIRST_RANGE_HI);
    var lasthindex = STR_FIRST_RANGE_HI;
    for (var i = STR_RANGE_SIZE, len = domain.length; i < len; i += STR_RANGE_SIZE) {
        var lo = domain_str_decodeValue(domain, i);
        var hi = domain_str_decodeValue(domain, i + STR_VALUE_SIZE);
        if (lo - lasthi > gap) {
            newDomain += domain[lasthindex] + domain[lasthindex + 1] + domain[i] + domain[i + 1];
        }
        lasthi = hi;
        lasthindex = i + STR_VALUE_SIZE;
    }
    newDomain += domain[lasthindex] + domain[lasthindex + 1];
    return newDomain;
}
/**
 * @param {$domain_str} domain
 * @returns {number}
 */
function domain_str_smallestRangeSize(domain) {
    ASSERT_STRDOM(domain);
    var min_width = SUP;
    for (var i = 0, len = domain.length; i < len; i += STR_RANGE_SIZE) {
        var lo = domain_str_decodeValue(domain, i);
        var hi = domain_str_decodeValue(domain, i + STR_VALUE_SIZE);
        var width = 1 + hi - lo;
        if (width < min_width) {
            min_width = width;
        }
    }
    return min_width;
}
/**
 * Note that this one isn't domain consistent.
 *
 * @param {$domain} domain1
 * @param {$domain} domain2
 * @returns {$domain}
 */
function domain_any_mul(domain1, domain2) {
    ASSERT_NUMSTRDOM(domain1);
    ASSERT_NUMSTRDOM(domain2); // for simplicity sake, convert them back to arrays
    if (typeof domain1 === 'number') domain1 = domain_numToStr(domain1);
    if (typeof domain2 === 'number') domain2 = domain_numToStr(domain2); // TODO domain_mulNum
    return domain_strstr_mul(domain1, domain2);
}
/**
 * Note that this one isn't domain consistent.
 *
 * @param {$domain_str} domain1
 * @param {$domain_str} domain2
 * @returns {$domain_str} a strdom can never become a numdom when multiplying (can only grow or become zero)
 */
function domain_strstr_mul(domain1, domain2) {
    ASSERT_STRDOM(domain1);
    ASSERT_STRDOM(domain2);
    var result = EMPTY_STR;
    for (var i = 0, leni = domain1.length; i < leni; i += STR_RANGE_SIZE) {
        var loi = domain_str_decodeValue(domain1, i);
        var hii = domain_str_decodeValue(domain1, i + STR_VALUE_SIZE);
        for (var j = 0, lenj = domain2.length; j < lenj; j += STR_RANGE_SIZE) {
            var loj = domain_str_decodeValue(domain2, j);
            var hij = domain_str_decodeValue(domain2, j + STR_VALUE_SIZE);
            result += domain_str_encodeRange(MIN(SUP, loi * loj), MIN(SUP, hii * hij));
        }
    } // TODO: is it worth doing this step immediately?
    return domain_toNumstr(domain_str_simplify(result));
}
/**
 * Divide one range by another
 * Result has any integer values that are equal or between
 * the real results. This means fractions are floored/ceiled.
 * This is an expensive operation.
 * Zero is a special case.
 *
 * Does not harm input domains
 *
 * @param {$domain} domain1
 * @param {$domain} domain2
 * @param {boolean} [floorFractions=true] Include the floored lo of the resulting ranges?
 *         For example, <5,5>/<2,2> is <2.5,2.5>. If this flag is true, it will include
 *         <2,2>, otherwise it will not include anything for that division.
 * @returns {$domain}
 */
function domain_any_divby(domain1, domain2) {
    var floorFractions = arguments.length <= 2 || arguments[2] === undefined ? true : arguments[2];
    ASSERT_NUMSTRDOM(domain1);
    ASSERT_NUMSTRDOM(domain2); // for simplicity sake, convert them back to arrays
    if (typeof domain1 === 'number') domain1 = domain_numToStr(domain1);
    if (typeof domain2 === 'number') domain2 = domain_numToStr(domain2); // TODO: domain_divByNum
    return domain_strstr_divby(domain1, domain2, floorFractions);
}
/**
 * Divide one range by another
 * Result has any integer values that are equal or between
 * the real results. This means fractions are floored/ceiled.
 * This is an expensive operation.
 * Zero is a special case.
 *
 * Does not harm input domains
 *
 * @param {$domain_str} domain1
 * @param {$domain_str} domain2
 * @param {boolean} [floorFractions=true] Include the floored lo of the resulting ranges?
 *         For example, <5,5>/<2,2> is <2.5,2.5>. If this flag is true, it will include
 *         <2,2>, otherwise it will not include anything for that division.
 * @returns {$domain} strdom could become numdom after a div
 */
function domain_strstr_divby(domain1, domain2) {
    var floorFractions = arguments.length <= 2 || arguments[2] === undefined ? true : arguments[2];
    ASSERT_STRDOM(domain1);
    ASSERT_STRDOM(domain2);
    var result = EMPTY_STR;
    for (var i = 0, leni = domain1.length; i < leni; i += STR_RANGE_SIZE) {
        var loi = domain_str_decodeValue(domain1, i);
        var hii = domain_str_decodeValue(domain1, i + STR_VALUE_SIZE);
        for (var j = 0, lenj = domain2.length; j < lenj; j += STR_RANGE_SIZE) {
            var loj = domain_str_decodeValue(domain2, j);
            var hij = domain_str_decodeValue(domain2, j + STR_VALUE_SIZE); // cannot /0
            // we ignore it right now. should we...
            // - add a 0 or SUB or SUP for it
            // - throw an error / issue a warning for it
            if (hij > 0) {
                var lo = loi / hij;
                var hi = loj > 0 ? hii / loj : SUP;
                ASSERT(hi >= 0, 'hi could only be sub zero when domains allow negative numbers', hi); // we cant use fractions, so we'll only include any values in the
                // resulting domains that are _above_ the lo and _below_ the hi.
                var left = CEIL(MAX(0, lo));
                var right = FLOOR(hi); // if the fraction is within the same integer this could result in
                // lo>hi so we must prevent this case
                if (left <= right) {
                    result += domain_str_encodeRange(left, right);
                } else {
                    ASSERT(FLOOR(lo) === FLOOR(hi), 'left>right when fraction is in same int, which can happen', lo, hi);
                    if (floorFractions) { // only use the floored value
                        // note: this is a choice. not both floor/ceil because then 5/2=2.5 becomes [2,3]. should be [2,2] or [3,3]
                        result += domain_str_encodeRange(right, right);
                    }
                }
            }
        }
    }
    return domain_toNumstr(domain_str_simplify(result));
}
/**
 * Return the number of elements this domain covers
 *
 * @param {$domain} domain
 * @returns {number}
 */
function domain_any_size(domain) {
    ASSERT_NUMSTRDOM(domain);
    if (typeof domain === 'number') return asmdomain_size(domain);
    return domain_str_size(domain);
}
/**
 * Return the number of elements this domain covers
 *
 * @param {$domain_str} domain
 * @returns {number}
 */
function domain_str_size(domain) {
    ASSERT_STRDOM(domain);
    ASSERT(domain && domain.length, 'A_EXPECTING_NON_EMPTY_DOMAINS');
    var count = 0;
    for (var i = 0, len = domain.length; i < len; i += STR_RANGE_SIZE) { // TODO: add test to confirm this still works fine if SUB is negative
        count += 1 + domain_str_decodeValue(domain, i + STR_VALUE_SIZE) - domain_str_decodeValue(domain, i);
    }
    return count;
}
/**
 * Get the middle element of all elements in domain.
 * Not hi-lo/2 but the (size/2)th element.
 * For domains with an even number of elements it
 * will take the first value _above_ the middle,
 * in other words; index=ceil(count/2).
 *
 * @param {$domain} domain
 * @returns {number} can return
 */
function domain_any_middleElement(domain) {
    ASSERT_NUMSTRDOM(domain); // for simplicity sake, convert them back to arrays
    if (typeof domain === 'number') domain = domain_numToStr(domain); // TODO: domain_middleElementNum(domain);
    return domain_str_middleElement(domain);
}
/**
 * Get the middle element of all elements in domain.
 * Not hi-lo/2 but the (size/2)th element.
 * For domains with an even number of elements it
 * will take the first value _above_ the middle,
 * in other words; index=ceil(count/2).
 *
 * @param {$domain_str} domain
 * @returns {number}
 */
function domain_str_middleElement(domain) {
    ASSERT_STRDOM(domain);
    if (!domain) return NO_SUCH_VALUE;
    var size = domain_str_size(domain);
    var targetValue = FLOOR(size / 2);
    var lo = void 0;
    var hi = void 0;
    for (var i = 0, len = domain.length; i < len; i += STR_RANGE_SIZE) {
        lo = domain_str_decodeValue(domain, i);
        hi = domain_str_decodeValue(domain, i + STR_VALUE_SIZE);
        var count = 1 + hi - lo;
        if (targetValue < count) {
            break;
        }
        targetValue -= count;
    } // `targetValue` should be the `nth` element in the current range (`lo-hi`)
    // so we can use `lo` and add the remainder of `targetValue` to get the mid value
    return lo + targetValue;
}
/**
 * Get lowest value in the domain
 * Only use if callsite doesn't need to cache first range (because array access)
 *
 * @param {$domain} domain
 * @returns {number}
 */
function domain_any_min(domain) {
    ASSERT_NUMSTRDOM(domain);
    if (typeof domain === 'number') return asmdomain_min(domain);
    return domain_str_min(domain);
}
/**
 * Get lowest value in the domain
 * Only use if callsite doesn't use first range again
 *
 * @param {$domain_str} domain
 * @returns {number} can be NO_SUCH_VALUE
 */
function domain_str_min(domain) {
    ASSERT_STRDOM(domain);
    if (!domain) return NO_SUCH_VALUE;
    return domain_str_decodeValue(domain, STR_FIRST_RANGE_LO);
}
/**
 * Only use if callsite doesn't use last range again
 *
 * @param {$domain} domain
 * @returns {number} can be NO_SUCH_VALUE
 */
function domain_any_max(domain) {
    ASSERT_NUMSTRDOM(domain);
    if (typeof domain === 'number') return asmdomain_max(domain);
    return domain_str_max(domain);
}
/**
 * Returns highest value in domain
 * Only use if callsite doesn't use last range again
 *
 * @param {$domain_str} domain
 * @returns {number}
 */
function domain_str_max(domain) {
    ASSERT_STRDOM(domain);
    if (!domain) return NO_SUCH_VALUE; // last encoded value in the string should be the hi of the last range. so max is last value
    return domain_str_decodeValue(domain, domain.length - STR_VALUE_SIZE);
}
/**
 * Returns highest value in domain
 * Only use if callsite doesn't use last range again
 *
 * @param {$domain_arr} domain
 * @returns {number}
 */
function domain_arr_max(domain) {
    ASSERT_ARRDOM(domain);
    var len = domain.length;
    if (len === 0) return NO_SUCH_VALUE;
    return domain[len - 1];
}
/**
 * A domain is "solved" if it covers exactly one value. It is not solved if it is empty.
 *
 * @param {$domain} domain
 * @returns {boolean}
 */
function domain_any_isSolved(domain) {
    ASSERT_NUMSTRDOM(domain);
    if (typeof domain === 'number') return asmdomain_isSolved(domain) === 1;
    return domain_str_isSolved(domain);
}
/**
 * A domain is "solved" if it covers exactly one value. It is not solved if it is empty.
 *
 * @param {$domain_str} domain
 * @returns {boolean}
 */
function domain_str_isSolved(domain) {
    ASSERT_STRDOM(domain); // TODO: could do this by comparing strings, no need to convert
    return domain.length === STR_RANGE_SIZE && domain_str_decodeValue(domain, STR_FIRST_RANGE_LO) === domain_str_decodeValue(domain, STR_FIRST_RANGE_HI);
}
/**
 * A domain is "determined" if it's either one value (solved) or none at all (rejected)
 * This is the most called function of the library. 3x more than the number two.
 *
 * @param {$domain} domain
 * @returns {boolean}
 */
function domain_any_isUndetermined(domain) {
    ASSERT_NUMSTRDOM(domain);
    if (typeof domain === 'number') return asmdomain_isUndetermined(domain) === 1;
    return domain_str_isUndetermined(domain);
}
/**
 * A domain is "determined" if it's either one value (solved) or none at all (rejected)
 * This is the most called function of the library. 3x more than the number two.
 *
 * @param {$domain_str} domain
 * @returns {boolean}
 */
function domain_str_isUndetermined(domain) {
    ASSERT_STRDOM(domain); // TODO: could do this by comparing strings, no need to convert
    return domain.length > STR_RANGE_SIZE || domain_str_decodeValue(domain, STR_FIRST_RANGE_LO) !== domain_str_decodeValue(domain, STR_FIRST_RANGE_HI);
}
/**
 * A domain is "rejected" if it covers no values. This means every given
 * value would break at least one constraint so none could be used.
 *
 * Note: this is the (shared) second most called function of the library
 * (by a third of most, but still significantly more than the rest)
 *
 * @param {$domain} domain
 * @returns {boolean}
 */
function domain_any_isRejected(domain) {
    if (typeof domain === 'string') return domain === EMPTY_STR;
    if (typeof domain === 'number') return domain === EMPTY;
    ASSERT(domain instanceof Array, 'SHOULD_BE_ARRAY_NOW');
    return domain.length === 0;
}
/**
 * Remove all values from domain that are greater
 * than or equal to given value
 *
 * @param {$domain} domain
 * @param {number} value
 * @returns {$domain}
 */
function domain_any_removeGte(domain, value) {
    ASSERT_NUMSTRDOM(domain);
    ASSERT(typeof value === 'number' && value >= 0, 'VALUE_SHOULD_BE_VALID_DOMAIN_ELEMENT'); // so cannot be negative
    if (typeof domain === 'number') return asmdomain_removeGte(domain, value);
    return domain_str_removeGte(domain, value);
}
/**
 * Remove any value from domain that is bigger than or equal to given value.
 * Since domains are assumed to be in CSIS form, we can start from the back and
 * search for the first range that is smaller or contains given value. Prune
 * any range that follows it and trim the found range if it contains the value.
 * Returns whether the domain was changed somehow.
 *
 * @param {$domain_str} domain_str
 * @param {number} value
 * @returns {$domain}
 */
function domain_str_removeGte(domain_str, value) {
    ASSERT_STRDOM(domain_str);
    for (var i = 0, len = domain_str.length; i < len; i += STR_RANGE_SIZE) {
        var lo = domain_str_decodeValue(domain_str, i);
        var hi = domain_str_decodeValue(domain_str, i + STR_VALUE_SIZE); // case: v=5
        // 012 456 // => 012 4
        // 012 45  // => 012 4
        // 012 567 // => 012
        // 012 5   // => 012
        // 012 678 // => 012
        // 012     // => NONE
        // 678     // => empty
        // TODO: if we know the returned domain is a small domain we should prevent the slice at all.
        if (lo > value) { // 67 9    -> empty
            // 012 789 -> 012
            var newDomain = domain_str.slice(0, i);
            return domain_toNumstr(newDomain);
        }
        if (lo === value) { // 567 9   -> empty
            // 012 567 -> 012
            // 012 5   -> 012
            var _newDomain = domain_str.slice(0, i);
            return domain_toNumstr(_newDomain);
        }
        if (value <= hi) { // 012 456 -> 012 4
            // 012 45  -> 012 4
            var _newDomain2 = domain_str.slice(0, i + STR_VALUE_SIZE) + domain_str_encodeValue(value - 1);
            if (value - 1 <= SMALL_MAX_NUM) return domain_strToNum(_newDomain2, i + STR_RANGE_SIZE);
            return _newDomain2;
        }
    }
    return domain_str; // 012 -> 012
}
/**
 * Remove all values from domain that are lower
 * than or equal to given value
 *
 * @param {$domain} domain
 * @param {number} value
 * @returns {$domain}
 */
function domain_any_removeLte(domain, value) {
    ASSERT_NUMSTRDOM(domain);
    ASSERT(typeof value === 'number' && value >= 0, 'VALUE_SHOULD_BE_VALID_DOMAIN_ELEMENT'); // so cannot be negative
    if (typeof domain === 'number') return asmdomain_removeLte(domain, value);
    return domain_str_removeLte(domain, value);
}
/**
 * Remove any value from domain that is lesser than or equal to given value.
 * Since domains are assumed to be in CSIS form, we can start from the front and
 * search for the first range that is smaller or contains given value. Prune
 * any range that preceeds it and trim the found range if it contains the value.
 * Returns whether the domain was changed somehow
 * Does not harm domain
 *
 * @param {$domain_str} domain_str
 * @param {number} value
 * @returns {$domain}
 */
function domain_str_removeLte(domain_str, value) {
    ASSERT_STRDOM(domain_str);
    for (var i = 0, len = domain_str.length; i < len; i += STR_RANGE_SIZE) {
        var lo = domain_str_decodeValue(domain_str, i);
        var hi = domain_str_decodeValue(domain_str, i + STR_VALUE_SIZE); // case: v=5
        // 456 89 => 6 89
        // 45 89  => 89
        // 56 89  => 6 89
        // 5  89  => 5 89
        // 6788   => 67 9
        // 789    => NONE
        // 012    => empty
        if (lo > value) {
            if (!i) return domain_str; // 678 -> 678
            // 234 678 -> 678
            var newDomain = domain_str.slice(i);
            return domain_toNumstr(newDomain);
        }
        if (hi === value) { // 45 89  => 89, 5  89  => 5 89
            var _newDomain3 = domain_str.slice(i + STR_RANGE_SIZE);
            return domain_toNumstr(_newDomain3);
        }
        if (value <= hi) { // 456 89 => 6 89, 56 89 => 6 89
            var _newDomain4 = domain_str_encodeValue(value + 1) + domain_str.slice(i + STR_VALUE_SIZE);
            return domain_toNumstr(_newDomain4);
        }
    }
    return EMPTY; // 012 -> empty
}
/**
 * Remove given value from given domain and return
 * the new domain that doesn't contain it.
 *
 * @param {$domain} domain
 * @param {number} value
 * @returns {$domain}
 */
function domain_any_removeValue(domain, value) {
    ASSERT_NUMSTRDOM(domain);
    ASSERT(typeof value === 'number' && value >= 0, 'VALUE_SHOULD_BE_VALID_DOMAIN_ELEMENT'); // so cannot be negative
    if (typeof domain === 'number') return asmdomain_removeValue(domain, value);
    return domain_str_removeValue(domain, value);
}
/**
 * @param {$domain_str} domain
 * @param {number} value
 * @returns {$domain}
 */
function domain_str_removeValue(domain, value) {
    ASSERT_STRDOM(domain);
    for (var i = 0, len = domain.length; i < len; i += STR_RANGE_SIZE) {
        var lo = domain_str_decodeValue(domain, i);
        var hi = domain_str_decodeValue(domain, i + STR_VALUE_SIZE);
        if (value === lo) {
            var newDomain = domain.slice(0, i);
            if (value !== hi) newDomain += domain_str_encodeRange(value + 1, hi);
            return domain_toNumstr(newDomain + domain.slice(i + STR_RANGE_SIZE));
        }
        if (value === hi) { // note: we already checked value==lo so no need to do that again
            var _newDomain5 = domain.slice(0, i) + domain_str_encodeRange(lo, value - 1) + domain.slice(i + STR_RANGE_SIZE);
            return domain_toNumstr(_newDomain5);
        }
        if (value < lo) { // value sits between prev range (if not start) and current range so domain
            // does not have it at all. return the input domain to indicate "no change"
            return domain;
        }
        if (value < hi) { // split up range to remove the value. we already confirmed that range
            // does not start or end at value, so just split it
            var _newDomain6 = domain.slice(0, i) + domain_str_encodeRange(lo, value - 1) + domain_str_encodeRange(value + 1, hi) + domain.slice(i + STR_RANGE_SIZE);
            return domain_toNumstr(_newDomain6);
        }
    } // value must be higher than the max of domain because domain does not contain it
    // return domain to indicate no change
    ASSERT(domain_any_isRejected(domain) || domain_any_max(domain) < value, 'MAX_DOMAIN_SHOULD_BE_UNDER_VALUE'); // "no change"
    return domain;
}
/**
 * Check if every element in one domain not
 * occur in the other domain and vice versa
 *
 * @param {$domain} domain1
 * @param {$domain} domain2
 * @returns {boolean}
 */
function domain_any_sharesNoElements(domain1, domain2) {
    ASSERT_NUMSTRDOM(domain1);
    ASSERT_NUMSTRDOM(domain2);
    var isNum1 = typeof domain1 === 'number';
    var isNum2 = typeof domain2 === 'number';
    if (isNum1 && isNum2) return asmdomain_sharesNoElements(domain1, domain2) === 1;
    if (isNum1) return domain_numstr_sharesNoElements(domain1, domain2);
    if (isNum2) return domain_numstr_sharesNoElements(domain2, domain1);
    return domain_strstr_sharesNoElements(domain1, domain2);
}
/**
 * Check if every element in one domain not
 * occur in the other domain and vice versa
 *
 * @param {$domain_num} domain_num
 * @param {$domain_str} domain_str
 * @returns {boolean}
 */
function domain_numstr_sharesNoElements(domain_num, domain_str) {
    ASSERT_NUMDOM(domain_num);
    ASSERT_STRDOM(domain_str);
    var strIndex = 0;
    var strlen = domain_str.length;
    for (var numIndex = 0; numIndex <= SMALL_MAX_NUM; ++numIndex) {
        if (domain_num & 1 << numIndex) { // find numIndex (as value) in domain_str. return true when
            // found. return false if number above small_max_num is found
            while (strIndex < strlen) {
                var lo = domain_str_decodeValue(domain_str, strIndex);
                var hi = domain_str_decodeValue(domain_str, strIndex + STR_VALUE_SIZE); // there is overlap if numIndex is within current range so return false
                if (numIndex >= lo && numIndex <= hi) return false; // the next value in domain_num can not be smaller and the previous
                // domain_str range was below that value and the next range is beyond
                // the small domain max so there can be no more matching values
                if (lo > SMALL_MAX_NUM) return true; // this range is bigger than target value so the value doesnt
                // exist; skip to next value
                if (lo > numIndex) break;
                strIndex += STR_RANGE_SIZE;
            }
            if (strIndex >= strlen) return true;
        }
    } // checked all values in domain_num (can code reach here?
    // i think it'll always return early in the inner loop?)
    return true;
}
/**
 * Check if every element in one domain not
 * occur in the other domain and vice versa
 *
 * @param {$domain_str} domain1
 * @param {$domain_str} domain2
 * @returns {boolean}
 */
function domain_strstr_sharesNoElements(domain1, domain2) {
    ASSERT_STRDOM(domain1);
    ASSERT_STRDOM(domain2);
    var len1 = domain1.length;
    var len2 = domain2.length;
    var index1 = 0;
    var index2 = 0;
    var lo1 = domain_str_decodeValue(domain1, STR_FIRST_RANGE_LO);
    var hi1 = domain_str_decodeValue(domain1, STR_FIRST_RANGE_HI);
    var lo2 = domain_str_decodeValue(domain2, STR_FIRST_RANGE_LO);
    var hi2 = domain_str_decodeValue(domain2, STR_FIRST_RANGE_HI);
    while (true) {
        if (hi1 < lo2) {
            index1 += STR_RANGE_SIZE;
            if (index1 >= len1) break;
            lo1 = domain_str_decodeValue(domain1, index1);
            hi1 = domain_str_decodeValue(domain1, index1 + STR_VALUE_SIZE);
        } else if (hi2 < lo1) {
            index2 += STR_RANGE_SIZE;
            if (index2 >= len2) break;
            lo2 = domain_str_decodeValue(domain2, index2);
            hi2 = domain_str_decodeValue(domain2, index2 + STR_VALUE_SIZE);
        } else {
            ASSERT(lo1 <= lo2 && lo2 <= hi1 || lo2 <= lo1 && lo1 <= hi2, 'domain_strstr_sharesNoElements: both ranges must overlap at least for some element because neither ends before the other [' + lo1 + ',' + hi1 + ' - ' + lo2 + ',' + hi2 + ']');
            return false;
        }
    } // no overlaps found
    return true;
}
/**
 * @param {number} value
 * @returns {$domain}
 */
function domain_createValue(value) {
    ASSERT(value >= SUB, 'domain_createValue: value should be within valid range');
    ASSERT(value <= SUP, 'domain_createValue: value should be within valid range');
    if (value <= SMALL_MAX_NUM) return asmdomain_createValue(value);
    return domain_str_encodeRange(value, value);
}
/**
 * @param {number} lo
 * @param {number} hi
 * @returns {$domain}
 */
function domain_createRange(lo, hi) {
    ASSERT(lo >= SUB && hi <= SUP && lo <= hi, 'expecting sanitized inputs');
    if (hi <= SMALL_MAX_NUM) return asmdomain_createRange(lo, hi);
    return domain_str_encodeRange(lo, hi);
}
/**
 * @param {$domain} domain
 * @param {number} [force] Always return in array or string form?
 * @returns {$domain}
 */
function domain_any_clone(domain, force) {
    ASSERT_ANYDOM(domain);
    if (force === FORCE_ARRAY) return domain_toArr(domain, true);
    if (force === FORCE_STRING) return domain_toStr(domain);
    return domain; // TODO: eliminate this function. domains are strings and numbers now. array cases should be consolidated to config explicitly.
}
/**
 * Get a domain representation in array form
 *
 * @param {$domain} domain
 * @param {boolean} [clone] If input is array, slice the array? (other cases will always return a fresh array)
 * @returns {$domain_arr} (small domains will also be arrays)
 */
function domain_toArr(domain, clone) {
    if (typeof domain === 'number') return domain_numToArr(domain);
    if (typeof domain === 'string') return domain_strToArr(domain);
    ASSERT(domain instanceof Array, 'can only be array now');
    if (clone) return domain.slice(0);
    return domain;
}
/**
 * Get a domain representation in string form
 *
 * @param {$domain} domain
 * @returns {$domain_str} (small domains will also be strings)
 */
function domain_toStr(domain) {
    if (typeof domain === 'number') return domain_numToStr(domain);
    if (typeof domain === 'string') return domain;
    ASSERT(domain instanceof Array, 'can only be array now');
    return domain_arrToStr(domain);
}
/**
 * Create an array domain from a numbered domain (bit wise flags)
 *
 * @param {$domain_num} domain
 * @returns {$domain_arr}
 */
function domain_numToArr(domain) {
    ASSERT_NUMDOM(domain);
    if (domain === EMPTY) return [];
    var arr = [];
    var lo = -1;
    var hi = -1;
    if (ZERO & domain) {
        lo = 0;
        hi = 0;
    }
    if (ONE & domain) {
        if (lo !== 0) { // lo is either 0 or nothing
            lo = 1;
        }
        hi = 1; // there cannot be a gap yet
    }
    if (TWO & domain) {
        if (hi === 0) {
            arr.push(0, 0);
            lo = 2;
        } else if (hi !== 1) { // if hi isnt 0 and hi isnt 1 then hi isnt set and so lo isnt set
            lo = 2;
        }
        hi = 2;
    }
    if (THREE & domain) {
        if (hi < 0) { // this is the LSB that is set
            lo = 3;
        } else if (hi !== 2) { // there's a gap so push prev range now
            arr.push(lo, hi);
            lo = 3;
        }
        hi = 3;
    } // is the fifth bit or higher even set at all? for ~85% that is not the case at this point
    if (domain >= FOUR) {
        for (var i = 4; i <= SMALL_MAX_NUM; ++i) {
            if (NUM_TO_FLAG[i] & domain) {
                if (hi < 0) { // this is the LSB that is set
                    lo = i;
                } else if (hi !== i - 1) { // there's a gap so push prev range now
                    arr.push(lo, hi);
                    lo = i;
                }
                hi = i;
            }
        }
    } // since the domain wasn't empty (checked at start) there
    // must now be an unpushed lo/hi pair left to push...
    arr.push(lo, hi);
    return arr;
}
/**
 * Explicitly create an strdom from a numdom
 *
 * @param {$domain_num} domain
 * @returns {$domain_str}
 */
function domain_numToStr(domain) {
    ASSERT_NUMDOM(domain);
    if (domain === EMPTY) return EMPTY_STR;
    var str = EMPTY_STR;
    var lo = -1;
    var hi = -1;
    if (ZERO & domain) {
        lo = 0;
        hi = 0;
    }
    if (ONE & domain) {
        if (lo !== 0) { // lo is either 0 or nothing
            lo = 1;
        }
        hi = 1; // there cannot be a gap yet
    }
    if (TWO & domain) {
        if (hi === 0) {
            str = domain_str_encodeRange(0, 0);
            lo = 2;
        } else if (hi !== 1) { // if hi isnt 0 and hi isnt 1 then hi isnt set and so lo isnt set
            lo = 2;
        }
        hi = 2;
    }
    if (THREE & domain) {
        if (hi < 0) { // this is the LSB that is set
            lo = 3;
        } else if (hi !== 2) { // there's a gap so push prev range now
            str += domain_str_encodeRange(lo, hi);
            lo = 3;
        }
        hi = 3;
    } // is the fifth bit or higher even set at all? for ~85% that is not the case at this point
    if (domain >= FOUR) {
        for (var i = 4; i <= SMALL_MAX_NUM; ++i) {
            if (NUM_TO_FLAG[i] & domain) {
                if (hi < 0) { // this is the LSB that is set
                    lo = i;
                } else if (hi !== i - 1) { // there's a gap so push prev range now
                    str += domain_str_encodeRange(lo, hi);
                    lo = i;
                }
                hi = i;
            }
        }
    } // since the domain wasn't empty (checked at start) there
    // must now be an unpushed lo/hi pair left to push...
    str += domain_str_encodeRange(lo, hi);
    return str;
}
/**
 * Create an array domain from a string domain
 *
 * @param {$domain_str} domain
 * @returns {$domain_arr}
 */
function domain_strToArr(domain) {
    ASSERT_STRDOM(domain);
    if (domain === EMPTY) return [];
    var arr = [];
    for (var i = 0, len = domain.length; i < len; i += STR_RANGE_SIZE) {
        var lo = domain_str_decodeValue(domain, i);
        var hi = domain_str_decodeValue(domain, i + STR_VALUE_SIZE);
        arr.push(lo, hi);
    }
    return arr;
}
/**
 * Convert an array domain to number domain
 *
 * @param {$domain_arr} domain_arr
 * @returns {$domain_num}
 */
function domain_arrToNumstr(domain_arr) {
    ASSERT_ARRDOM(domain_arr);
    var len = domain_arr.length;
    if (len === 0) return EMPTY;
    ASSERT(typeof domain_arr[domain_arr.length - 1] === 'number');
    var max = domain_arr_max(domain_arr);
    if (max <= SMALL_MAX_NUM) return _domain_arrToNum(domain_arr, len);
    return domain_arrToStr(domain_arr);
}
/**
 * Convert an arrdom to a strdom
 *
 * @param {$domain_arr} domain_arr
 * @returns {$domain_str}
 */
function domain_arrToStr(domain_arr) {
    ASSERT_ARRDOM(domain_arr);
    var str = EMPTY_STR;
    for (var i = 0, len = domain_arr.length; i < len; i += ARR_RANGE_SIZE) {
        var lo = domain_arr[i];
        var hi = domain_arr[i + 1];
        ASSERT(typeof lo === 'number');
        ASSERT(typeof hi === 'number');
        str += domain_str_encodeRange(lo, hi);
    }
    return str;
}
/**
 * Accept a domain and if it is an array, try to reduce it
 * to a number. Either returns the original input or a
 * numeric representation if the domain fits in a number.
 * Pretty much a noop for numbers since they can't grow to
 * array domains, and by design so.
 *
 * @param {$domain} domain
 * @returns {$domain}
 */
function domain_arrToNum(domain) {
    ASSERT_ARRDOM(domain);
    var len = domain.length;
    if (len === 0) return 0;
    ASSERT(domain_any_min(domain) >= SUB, 'SHOULD_BE_VALID_DOMAIN'); // no need to check in dist
    if (domain_any_max(domain) > SMALL_MAX_NUM) return domain;
    return _domain_arrToNum(domain, len);
}
/**
 * Same as domain_numarr but without protections
 * (as an optimization step). Used internally.
 * Assumes given domain is in array form and that
 * its highest value is <= SMALL_MAX_NUM.
 *
 * @param {$domain_arr} domain
 * @param {number} len Length of the domain array (domain.length! not range count)
 * @returns {$domain_num}
 */
function _domain_arrToNum(domain, len) {
    ASSERT_ARRDOM(domain);
    ASSERT(domain[domain.length - 1] <= SMALL_MAX_NUM, 'SHOULD_BE_SMALL_DOMAIN', domain);
    var out = 0;
    for (var i = 0; i < len; i += ARR_RANGE_SIZE) {
        out = asmdomain_addRange(out, domain[i], domain[i + 1]);
    }
    return out;
}
/**
 * Accept a domain and if it is an array, try to reduce it
 * to a number if its max value is low enough for it.
 * Otherwise return a string domain, even if input was an
 * array domain.
 *
 * @param {$domain} domain
 * @returns {$domain}
 */
function domain_toNumstr(domain) { // number is ideal
    if (typeof domain === 'number') return domain;
    var len = domain.length; // either array or string, doesn't matter
    if (len === 0) return EMPTY;
    if (typeof domain === 'string') {
        ASSERT(domain_str_min(domain) >= SUB, 'SHOULD_BE_VALID_DOMAIN');
        if (domain_str_max(domain) <= SMALL_MAX_NUM) return domain_strToNum(domain, len);
        return domain;
    }
    ASSERT(domain instanceof Array, 'should be array if not num or str');
    return domain_arrToNumstr(domain);
}
/**
 * Convert string domain to number domain. Assumes domain
 * is eligible to be a small domain.
 *
 * @param {$domain_str} domain
 * @param {number} len Length of the domain array (domain.length! not range count)
 * @returns {$domain_num}
 */
function domain_strToNum(domain, len) {
    ASSERT_STRDOM(domain);
    ASSERT(domain.length === len, 'len should be cache of domain.length');
    ASSERT(domain_any_max(domain) <= SMALL_MAX_NUM, 'SHOULD_BE_SMALL_DOMAIN', domain, domain_any_max(domain));
    var out = EMPTY;
    for (var i = 0; i < len; i += STR_RANGE_SIZE) {
        var lo = domain_str_decodeValue(domain, i);
        var hi = domain_str_decodeValue(domain, i + STR_VALUE_SIZE);
        out = asmdomain_addRange(out, lo, hi);
    }
    return out;
}
/**
 * validate domains, filter and fix legacy domains, throw for bad inputs
 *
 * @param {$domain} domain
 * @returns {number[]}
 */
function domain_validateLegacyArray(domain) {
    ASSERT(domain instanceof Array, 'ONLY_ARRDOM'); // support legacy domains and validate input here
    var msg = domain_confirmLegacyDomain(domain);
    if (msg) {
        var fixedDomain = domain_tryToFixLegacyDomain(domain); //console.error('Fixed domain '+domain+' to '+fixedDomain);
        //THROW('Fixed domain '+domain+' to '+fixedDomain);
        if (fixedDomain) { //if (console && console.warn) {
            //  console.warn(msg, domain, 'auto-converted to', fixedDomain);
            //}
        } else {
            if (console && console.warn) {
                console.warn(msg, domain, 'unable to fix');
            }
            THROW('Fatal: unable to fix domain: ' + JSON.stringify(domain));
        }
        domain = fixedDomain;
    }
    ASSERT(domain instanceof Array, 'DOMAIN_SHOULD_BE_ARRAY', domain);
    return domain;
}
/**
 * Domain input validation
 * Have to support and transform legacy domain formats of domains of domains
 * and transform them to flat domains with lo/hi pairs
 *
 * @param {$domain_arr} domain
 * @returns {string|undefined}
 */
function domain_confirmLegacyDomain(domain) {
    ASSERT(domain instanceof Array, 'ONLY_ARRDOM');
    for (var i = 0; i < domain.length; i += ARR_RANGE_SIZE) {
        var lo = domain[i];
        var hi = domain[i + 1];
        var e = domain_confirmLegacyDomainElement(lo);
        if (e) {
            return e;
        }
        var f = domain_confirmLegacyDomainElement(hi);
        if (f) {
            return f;
        }
        if (lo < SUB) {
            return 'Domain contains a number lower than SUB (' + lo + ' < ' + SUB + '), this is probably a bug';
        }
        if (hi > SUP) {
            return 'Domain contains a number higher than SUP (' + hi + ' > ' + SUP + '), this is probably a bug';
        }
        if (lo > hi) {
            return 'Found a lo/hi pair where lo>hi, expecting all pairs lo<=hi (' + lo + '>' + hi + ')';
        }
    }
    ASSERT(domain.length % ARR_RANGE_SIZE === 0, 'other tests should have caught uneven domain lengths');
}
/**
 * @param {number} n
 * @returns {string|undefined}
 */
function domain_confirmLegacyDomainElement(n) {
    if (typeof n !== 'number') {
        if (n instanceof Array) {
            return 'Detected legacy domains (arrays of arrays), expecting flat array of lo-hi pairs';
        }
        return 'Expecting array of numbers, found something else (#{n}), this is probably a bug';
    }
    if (isNaN(n)) {
        return 'Domain contains an actual NaN, this is probably a bug';
    }
}
/**
 * Try to convert old array of arrays domain to new
 * flat array of number pairs domain. If any validation
 * step fails, return nothing.
 *
 * @param {$domain_arr|number[][]} domain
 * @returns {$domain_arr|undefined}
 */
function domain_tryToFixLegacyDomain(domain) {
    ASSERT(domain instanceof Array, 'ONLY_ARRDOM');
    var fixed = [];
    for (var i = 0; i < domain.length; i++) {
        var rangeArr = domain[i];
        if (!(rangeArr instanceof Array)) {
            return;
        }
        if (rangeArr.length !== ARR_RANGE_SIZE) {
            return;
        }
        var lo = rangeArr[ARR_FIRST_RANGE_LO];
        var hi = rangeArr[ARR_FIRST_RANGE_HI];
        if (lo > hi) {
            return;
        }
        fixed.push(lo, hi);
    }
    return fixed;
} // end of src/domain.js
// from: src/doms/domain_minus.js
/**
 * Subtract one domain from the other
 *
 * @param {$domain} domain1
 * @param {$domain} domain2
 * @returns {$domain}
 */
function domain_any_minus(domain1, domain2) {
    ASSERT_NUMSTRDOM(domain1);
    ASSERT_NUMSTRDOM(domain2); // note: this is not x-0=x. this is nothing-something=nothing because the domains contain no value
    if (!domain1) return EMPTY;
    if (!domain2) return EMPTY; // optimize an easy path: if both domains contain zero the
    // result will always be [0, max(domain1)], because:
    // d1-d2 = [lo1-hi2, hi1-lo2] -> [0-hi2, hi1-0] -> [0, hi1]
    if (domain_any_min(domain1) === 0 && domain_any_min(domain2) === 0) {
        return domain_createRange(0, domain_any_max(domain1));
    }
    var isNum1 = typeof domain1 === 'number';
    var isNum2 = typeof domain2 === 'number';
    if (isNum1) { // note: if domain1 is a small domain the result is always a small domain
        if (isNum2) return _domain_minusNumNumNum(domain1, domain2);
        return _domain_minusNumStrNum(domain1, domain2);
    }
    var result = void 0;
    if (isNum2) result = _domain_minusStrNumStr(domain1, domain2); // cannot swap minus args!
    else result = _domain_minusStrStrStr(domain1, domain2);
    return domain_toNumstr(domain_str_simplify(result));
}

function _domain_minusStrStrStr(domain1, domain2) {
    ASSERT_STRDOM(domain1);
    ASSERT_STRDOM(domain2); // Simplify the domains by closing gaps since when we add
    // the domains, the gaps will close according to the
    // smallest interval width in the other domain.
    var domains = domain_str_closeGaps(domain1, domain2);
    domain1 = domains[0];
    domain2 = domains[1];
    var newDomain = EMPTY_STR;
    for (var index = 0, len = domain1.length; index < len; index += STR_RANGE_SIZE) {
        var lo = domain_str_decodeValue(domain1, index);
        var hi = domain_str_decodeValue(domain1, index + STR_VALUE_SIZE);
        newDomain += _domain_minusRangeStrStr(lo, hi, domain2);
    }
    return newDomain;
}

function _domain_minusNumNumNum(domain1, domain2) {
    ASSERT_NUMDOM(domain1);
    ASSERT_NUMDOM(domain2);
    ASSERT(domain1 !== EMPTY && domain2 !== EMPTY, 'SHOULD_BE_CHECKED_ELSEWHERE');
    ASSERT(domain_any_max(domain1) - domain_any_min(domain2) <= SMALL_MAX_NUM, 'THE_POINTE');
    if (domain1 & ZERO && domain2 & ZERO) return asmdomain_createRangeZeroToMax(domain1);
    var flagIndex = 0; // find the first set bit. must find something because small domain and not empty
    while ((domain1 & 1 << flagIndex) === 0) {
        ++flagIndex;
    }
    var lo = flagIndex;
    var hi = flagIndex;
    var flagValue = 1 << ++flagIndex;
    var newDomain = EMPTY;
    while (flagValue <= domain1 && flagIndex <= SMALL_MAX_NUM) {
        if ((flagValue & domain1) > 0) {
            if (hi !== flagIndex - 1) { // there's a gap so push prev range now
                newDomain |= _domain_minusRangeNumNum(lo, hi, domain2);
                lo = flagIndex;
            }
            hi = flagIndex;
        }
        flagValue = 1 << ++flagIndex;
    }
    return newDomain | _domain_minusRangeNumNum(lo, hi, domain2);
}

function _domain_minusNumStrNum(domain_num, domain_str) {
    ASSERT_NUMDOM(domain_num);
    ASSERT_STRDOM(domain_str);
    ASSERT(domain_num !== EMPTY && domain_str !== EMPTY, 'SHOULD_BE_CHECKED_ELSEWHERE');
    ASSERT(domain_any_max(domain_num) - domain_any_min(domain_str) <= SMALL_MAX_NUM, 'THE_POINTE'); // since any number above the small domain max ends up with negative, which is truncated, use the max of domain1
    if (domain_num & ZERO && domain_any_min(domain_str) === 0) return asmdomain_createRangeZeroToMax(domain_num);
    var flagIndex = 0; // find the first set bit. must find something because small domain and not empty
    while ((domain_num & 1 << flagIndex) === 0) {
        ++flagIndex;
    }
    var lo = flagIndex;
    var hi = flagIndex;
    var flagValue = 1 << ++flagIndex;
    var newDomain = EMPTY;
    while (flagValue <= domain_num && flagIndex <= SMALL_MAX_NUM) {
        if ((flagValue & domain_num) > 0) {
            if (hi !== flagIndex - 1) { // there's a gap so push prev range now
                newDomain |= _domain_minusRangeStrNum(lo, hi, domain_str);
                lo = flagIndex;
            }
            hi = flagIndex;
        }
        flagValue = 1 << ++flagIndex;
    }
    return newDomain | _domain_minusRangeStrNum(lo, hi, domain_str);
}

function _domain_minusRangeNumNum(loi, hii, domain_num) {
    ASSERT_NUMDOM(domain_num);
    ASSERT(domain_num !== EMPTY, 'SHOULD_BE_CHECKED_ELSEWHERE');
    var flagIndex = 0; // find the first set bit. must find something because small domain and not empty
    while ((domain_num & 1 << flagIndex) === 0) {
        ++flagIndex;
    }
    var lo = flagIndex;
    var hi = flagIndex;
    var flagValue = 1 << ++flagIndex;
    var newDomain = EMPTY;
    while (flagValue <= domain_num && flagIndex <= SMALL_MAX_NUM) {
        if ((flagValue & domain_num) > 0) {
            if (hi !== flagIndex - 1) { // there's a gap so push prev range now
                newDomain |= _domain_minusRangeRangeNum(loi, hii, lo, hi);
                lo = flagIndex;
            }
            hi = flagIndex;
        }
        flagValue = 1 << ++flagIndex;
    }
    return newDomain | _domain_minusRangeRangeNum(loi, hii, lo, hi);
}

function _domain_minusStrNumStr(domain_str, domain_num) {
    ASSERT_NUMDOM(domain_num);
    ASSERT_STRDOM(domain_str);
    ASSERT(domain_num !== EMPTY && domain_str !== EMPTY, 'SHOULD_BE_CHECKED_ELSEWHERE'); // optimize an easy path: if both domains contain zero the
    // result will always be [0, max(domain1)], because:
    // d1-d2 = [lo1-hi2, hi1-lo2] -> [0-hi2, hi1-0] -> [0, hi1]
    if (domain_any_min(domain_str) === 0 && domain_any_min(domain_num) === 0) {
        return domain_createRange(0, domain_any_max(domain_str));
    }
    var newDomain = EMPTY_STR;
    for (var index = 0, len = domain_str.length; index < len; index += STR_RANGE_SIZE) {
        var lo = domain_str_decodeValue(domain_str, index);
        var hi = domain_str_decodeValue(domain_str, index + STR_VALUE_SIZE);
        newDomain += _domain_minusRangeNumStr(lo, hi, domain_num);
    }
    return newDomain;
}

function _domain_minusRangeNumStr(loi, hii, domain_num) {
    ASSERT_NUMDOM(domain_num);
    if (domain_num === EMPTY) return EMPTY;
    var flagIndex = 0; // find the first set bit. must find something because small domain and not empty
    while ((domain_num & 1 << flagIndex) === 0) {
        ++flagIndex;
    }
    var lo = flagIndex;
    var hi = flagIndex;
    var flagValue = 1 << ++flagIndex;
    var newDomain = EMPTY_STR;
    while (flagValue <= domain_num && flagIndex <= SMALL_MAX_NUM) {
        if ((flagValue & domain_num) > 0) {
            if (hi !== flagIndex - 1) { // there's a gap so push prev range now
                newDomain += _domain_minusRangeRangeStr(loi, hii, lo, hi);
                lo = flagIndex;
            }
            hi = flagIndex;
        }
        flagValue = 1 << ++flagIndex;
    }
    return newDomain + _domain_minusRangeRangeStr(loi, hii, lo, hi);
}

function _domain_minusRangeStrStr(loi, hii, domain_str) {
    ASSERT_STRDOM(domain_str);
    var newDomain = EMPTY_STR;
    for (var index = 0, len = domain_str.length; index < len; index += STR_RANGE_SIZE) {
        var lo = domain_str_decodeValue(domain_str, index);
        var hi = domain_str_decodeValue(domain_str, index + STR_VALUE_SIZE);
        newDomain += _domain_minusRangeRangeStr(loi, hii, lo, hi);
    }
    return newDomain;
}

function _domain_minusRangeStrNum(loi, hii, domain_str) {
    ASSERT_STRDOM(domain_str);
    var newDomain = EMPTY;
    for (var index = 0, len = domain_str.length; index < len; index += STR_RANGE_SIZE) {
        var lo = domain_str_decodeValue(domain_str, index);
        var hi = domain_str_decodeValue(domain_str, index + STR_VALUE_SIZE);
        newDomain |= _domain_minusRangeRangeNum(loi, hii, lo, hi);
    }
    return newDomain;
}

function _domain_minusRangeRangeStr(loi, hii, loj, hij) {
    var hi = hii - loj;
    if (hi >= SUB) { // silently ignore results that are OOB
        var lo = MAX(SUB, loi - hij);
        return domain_str_encodeRange(lo, hi);
    }
    return EMPTY_STR;
}

function _domain_minusRangeRangeNum(loi, hii, loj, hij) {
    var hi = hii - loj;
    if (hi >= SUB) { // silently ignore results that are OOB
        var lo = MAX(SUB, loi - hij);
        ASSERT(lo <= SMALL_MAX_NUM, 'RESULT_SHOULD_NOT_EXCEED_SMALL_DOMAIN');
        ASSERT(hi <= SMALL_MAX_NUM, 'RESULT_SHOULD_NOT_EXCEED_SMALL_DOMAIN');
        return asmdomain_createRange(lo, hi);
    }
    return EMPTY;
} // end of src/doms/domain_minus.js
// from: src/doms/domain_plus.js
/**
 * Does not harm input domains
 *
 * @param {$domain} domain1
 * @param {$domain} domain2
 * @returns {$domain}
 */
function domain_any_plus(domain1, domain2) {
    ASSERT_NUMSTRDOM(domain1);
    ASSERT_NUMSTRDOM(domain2); // note: this is not 0+x=x. this is nothing+something=nothing because the domains contain no value
    if (!domain1) return EMPTY;
    if (!domain2) return EMPTY;
    var isNum1 = typeof domain1 === 'number';
    var isNum2 = typeof domain2 === 'number';
    var result = void 0;
    if (isNum1 && isNum2) { // if the highest number in the result is below the max of a small
        // domain we can take a fast path for it. this case happens often.
        if (_domain_plusWillBeSmall(domain1, domain2)) {
            return _domain_plusNumNumNum(domain1, domain2);
        }
        result = _domain_plusNumNumStr(domain1, domain2);
    } else {
        if (isNum1) result = _domain_plusNumStrStr(domain1, domain2);
        else if (isNum2) result = _domain_plusNumStrStr(domain2, domain1); // swapped domains!
        else result = _domain_plusStrStrStr(domain1, domain2);
    }
    return domain_toNumstr(domain_str_simplify(result));
}

function _domain_plusStrStrStr(domain1, domain2) {
    ASSERT_STRDOM(domain1);
    ASSERT_STRDOM(domain2); // Simplify the domains by closing gaps since when we add
    // the domains, the gaps will close according to the
    // smallest interval width in the other domain.
    var domains = domain_str_closeGaps(domain1, domain2);
    domain1 = domains[0];
    domain2 = domains[1];
    var newDomain = EMPTY_STR;
    for (var index = 0, len = domain1.length; index < len; index += STR_RANGE_SIZE) {
        var lo = domain_str_decodeValue(domain1, index);
        var hi = domain_str_decodeValue(domain1, index + STR_VALUE_SIZE);
        newDomain += _domain_plusRangeStrStr(lo, hi, domain2);
    }
    return newDomain;
}

function _domain_plusWillBeSmall(domain1, domain2) {
    ASSERT(typeof domain1 === 'number', 'ONLY_WITH_NUMBERS');
    ASSERT(typeof domain2 === 'number', 'ONLY_WITH_NUMBERS'); // if both domains are small enough they cannot add to a domain beyond the max
    if (domain1 < NINE && domain2 < EIGHT) return true; // this shortcut catches most cases
    return domain_any_max(domain1) + domain_any_max(domain2) <= SMALL_MAX_NUM; // if max changes, update above too!
}

function _domain_plusNumNumStr(domain1, domain2) {
    ASSERT_NUMDOM(domain1);
    ASSERT_NUMDOM(domain2);
    var flagIndex = 0; // find the first set bit. must find something because small domain and not empty
    while ((domain1 & 1 << flagIndex) === 0) {
        ++flagIndex;
    }
    var lo = flagIndex;
    var hi = flagIndex;
    var flagValue = 1 << ++flagIndex;
    var newDomain = EMPTY_STR;
    while (flagValue <= domain1 && flagIndex <= SMALL_MAX_NUM) {
        if ((flagValue & domain1) > 0) {
            if (hi !== flagIndex - 1) { // there's a gap so push prev range now
                newDomain += _domain_plusRangeNumStr(lo, hi, domain2);
                lo = flagIndex;
            }
            hi = flagIndex;
        }
        flagValue = 1 << ++flagIndex;
    }
    return newDomain + _domain_plusRangeNumStr(lo, hi, domain2);
}

function _domain_plusNumNumNum(domain1, domain2) {
    ASSERT_NUMDOM(domain1);
    ASSERT_NUMDOM(domain2);
    ASSERT(domain1 !== EMPTY && domain2 !== EMPTY, 'SHOULD_BE_CHECKED_ELSEWHERE');
    ASSERT(domain_any_max(domain1) + domain_any_max(domain2) <= SMALL_MAX_NUM, 'THE_POINTE');
    var flagIndex = 0; // find the first set bit. must find something because small domain and not empty
    while ((domain1 & 1 << flagIndex) === 0) {
        ++flagIndex;
    }
    var lo = flagIndex;
    var hi = flagIndex;
    var flagValue = 1 << ++flagIndex;
    var newDomain = EMPTY;
    while (flagValue <= domain1 && flagIndex <= SMALL_MAX_NUM) {
        if ((flagValue & domain1) > 0) {
            if (hi !== flagIndex - 1) { // there's a gap so push prev range now
                newDomain |= _domain_plusRangeNumNum(lo, hi, domain2);
                lo = flagIndex;
            }
            hi = flagIndex;
        }
        flagValue = 1 << ++flagIndex;
    }
    return newDomain | _domain_plusRangeNumNum(lo, hi, domain2);
}

function _domain_plusRangeNumNum(loi, hii, domain_num) {
    ASSERT_NUMDOM(domain_num);
    ASSERT(domain_num !== EMPTY, 'SHOULD_BE_CHECKED_ELSEWHERE');
    var flagIndex = 0; // find the first set bit. must find something because small domain and not empty
    while ((domain_num & 1 << flagIndex) === 0) {
        ++flagIndex;
    }
    var lo = flagIndex;
    var hi = flagIndex;
    var flagValue = 1 << ++flagIndex;
    var newDomain = EMPTY;
    while (flagValue <= domain_num && flagIndex <= SMALL_MAX_NUM) {
        if ((flagValue & domain_num) > 0) {
            if (hi !== flagIndex - 1) { // there's a gap so push prev range now
                newDomain |= _domain_plusRangeRangeNum(loi, hii, lo, hi);
                lo = flagIndex;
            }
            hi = flagIndex;
        }
        flagValue = 1 << ++flagIndex;
    }
    return newDomain | _domain_plusRangeRangeNum(loi, hii, lo, hi);
}

function _domain_plusNumStrStr(domain_num, domain_str) {
    ASSERT_NUMDOM(domain_num);
    ASSERT_STRDOM(domain_str);
    var flagIndex = 0; // find the first set bit. must find something because small domain and not empty
    while ((domain_num & 1 << flagIndex) === 0) {
        ++flagIndex;
    }
    var lo = flagIndex;
    var hi = flagIndex;
    var flagValue = 1 << ++flagIndex;
    var newDomain = EMPTY_STR;
    while (flagValue <= domain_num && flagIndex <= SMALL_MAX_NUM) {
        if ((flagValue & domain_num) > 0) {
            if (hi !== flagIndex - 1) { // there's a gap so push prev range now
                newDomain += _domain_plusRangeStrStr(lo, hi, domain_str);
                lo = flagIndex;
            }
            hi = flagIndex;
        }
        flagValue = 1 << ++flagIndex;
    }
    return newDomain + _domain_plusRangeStrStr(lo, hi, domain_str);
}

function _domain_plusRangeNumStr(loi, hii, domain_num) {
    ASSERT_NUMDOM(domain_num);
    var flagIndex = 0; // find the first set bit. must find something because small domain and not empty
    while ((domain_num & 1 << flagIndex) === 0) {
        ++flagIndex;
    }
    var lo = flagIndex;
    var hi = flagIndex;
    var flagValue = 1 << ++flagIndex;
    var newDomain = EMPTY_STR;
    while (flagValue <= domain_num && flagIndex <= SMALL_MAX_NUM) {
        if ((flagValue & domain_num) > 0) {
            if (hi !== flagIndex - 1) { // there's a gap so push prev range now
                newDomain += _domain_plusRangeRangeStr(loi, hii, lo, hi);
                lo = flagIndex;
            }
            hi = flagIndex;
        }
        flagValue = 1 << ++flagIndex;
    }
    return newDomain + _domain_plusRangeRangeStr(loi, hii, lo, hi);
}

function _domain_plusRangeStrStr(loi, hii, domain_str) {
    ASSERT_STRDOM(domain_str);
    var newDomain = EMPTY_STR;
    for (var index = 0, len = domain_str.length; index < len; index += STR_RANGE_SIZE) {
        var lo = domain_str_decodeValue(domain_str, index);
        var hi = domain_str_decodeValue(domain_str, index + STR_VALUE_SIZE);
        newDomain += _domain_plusRangeRangeStr(loi, hii, lo, hi);
    }
    return newDomain;
}

function _domain_plusRangeRangeStr(loi, hii, loj, hij) {
    ASSERT(loi + loj >= 0, 'DOMAINS_SHOULD_NOT_HAVE_NEGATIVES');
    var lo = loi + loj;
    if (lo <= SUP) { // if lo exceeds SUP the resulting range is completely OOB and we ignore it.
        var hi = MIN(SUP, hii + hij);
        return domain_str_encodeRange(lo, hi);
    }
    return EMPTY_STR;
}

function _domain_plusRangeRangeNum(loi, hii, loj, hij) {
    ASSERT(loi + loj >= 0, 'DOMAINS_SHOULD_NOT_HAVE_NEGATIVES');
    ASSERT(loi + loj <= SMALL_MAX_NUM, 'RESULT_SHOULD_NOT_EXCEED_SMALL_DOMAIN');
    ASSERT(hii + hij <= SMALL_MAX_NUM, 'RESULT_SHOULD_NOT_EXCEED_SMALL_DOMAIN');
    return asmdomain_createRange(loi + loj, hii + hij);
} // end of src/doms/domain_plus.js
// from: src/front.js
var FRONT_DEFAULT_SIZE = 100;
var FRONT_FIRST_NODE_OFFSET = 0;
/**
 * @param {number} [size]
 * @returns {$front}
 */
function front_create(size) {
    ASSERT(FRONT_DEFAULT_SIZE > 0, 'build check');
    var front = {
        _class: '$front',
        lastNodeIndex: 0,
        buffer: new Uint16Array(size || FRONT_DEFAULT_SIZE)
    };
    ASSERT(!void(front._nodes = 0)); // total added nodes, not total nodes in model because we cant know this
    ASSERT(!void(front._grows = '[' + (size || FRONT_DEFAULT_SIZE) + ']'));
    return front;
}
/**
 * Moves the node pointer forward. Ensures the buffer has
 * at least as much space to fit the entire previous node
 * but does not copy/clone it. It's length starts at zero..
 *
 * @param {$front} front
 * @returns {number} the new nodeIndex
 */
function front_addNode(front) {
    ASSERT(front._class === '$front');
    ASSERT(!void++front._nodes); //console.log('front_addNode');
    var lastOffset = front.lastNodeIndex;
    var lastLen = front.buffer[lastOffset];
    if (!lastLen && lastOffset !== FRONT_FIRST_NODE_OFFSET) THROW('E_LAST_NODE_EMPTY'); // search should end if a list is empty so a node after an empty lis is an error. exception: first space.
    var newOffset = lastOffset + 1 + lastLen; // +1 = cell containing length
    front.lastNodeIndex = newOffset;
    var buf = front.buffer;
    var bufLen = buf.length;
    var requiredLen = newOffset + 1 + lastLen;
    if (requiredLen >= bufLen) {
        front_grow(front, Math.floor(Math.max(requiredLen, bufLen + 1, bufLen * 1.1)));
    }
    return newOffset;
}
/**
 * Grow the buffer of the front to given size. Will simply
 * replace the internal buffer with a new buffer and copy
 * the old buffer into it.
 *
 * @param {$front} front
 * @param {number} size
 */
function front_grow(front, size) {
    ASSERT(front._class === '$front');
    ASSERT(typeof size === 'number');
    ASSERT(size > front.buffer.length, 'buffer should only grow in our model');
    ASSERT(!void(front._grows += ' ' + size));
    var oldBuf = front.buffer;
    front.buffer = new Uint16Array(size); //console.log('growing from '+bufLen+' to '+buf.length)
    front.buffer.set(oldBuf);
}
/**
 * Returns the size of given node. This size excludes the size of the cell
 * that maintains the size, since the caller most likely doesn't care about
 * that internal artifact.
 *
 * @param {$front} front
 * @param {number} nodeIndex
 */
function front_getSizeOf(front, nodeIndex) {
    ASSERT(front._class === '$front');
    ASSERT(typeof nodeIndex === 'number');
    return _front_getSizeOf(front.buffer, nodeIndex);
}
/**
 * Same as front_getSizeOf except it expects the buffer immediately.
 *
 * @param {TypedArray} buffer
 * @param {number} nodeIndex
 */
function _front_getSizeOf(buffer, nodeIndex) {
    ASSERT(!buffer._class);
    ASSERT(nodeIndex >= 0, 'node should be >=0 (was ' + nodeIndex + ')');
    ASSERT(nodeIndex < buffer.length);
    ASSERT(nodeIndex + buffer[nodeIndex] < buffer.length);
    return buffer[nodeIndex];
}
/**
 * Set the size of given node to length. This length should
 * not include the cell size for the length value (so just the
 * number of elements that the node contains)..
 *
 * @param {$front} front
 * @param {number} nodeIndex
 * @param {number} length
 */
function front_setSizeOf(front, nodeIndex, length) {
    ASSERT(front._class === '$front');
    return _front_setSizeOf(front.buffer, nodeIndex, length);
}
/**
 * Same as front_setSizeOf except it expects the buffer immediately.
 *
 * @param {TypedArray} buffer
 * @param {number} nodeIndex
 */
function _front_setSizeOf(buffer, nodeIndex, length) {
    ASSERT(!buffer._class);
    ASSERT(typeof nodeIndex === 'number');
    ASSERT(typeof length === 'number');
    ASSERT(nodeIndex + 1 + length <= buffer.length, 'NODE_SHOULD_END_INSIDE_BUFFER [' + nodeIndex + ',' + length + ',' + buffer.length + ']');
    buffer[nodeIndex] = length;
}
/**
 * Add a value to the front. Value is inserted at given
 * cell offset wihch is relative to given node offset.
 * Only for the first node this operation may exceed the
 * size of the buffer. In that case the buffer is grown.
 * That is also the reason there is no _front_addCell with
 * buffer argument; too dangerous to make mistakes by
 * caching the buffer.
 * If the buffer is exceeded otherwise an error is thrown.
 * (Because each node in the front should only shrink so
 * there's no need for nodes to be bigger than their predecessor)
 *
 * @param {$front} front
 * @param {number} nodeIndex
 * @param {number} cellOffset
 * @param {number} value
 */
function front_addCell(front, nodeIndex, cellOffset, value) {
    ASSERT(front._class === '$front');
    ASSERT(typeof nodeIndex === 'number');
    ASSERT(typeof cellOffset === 'number');
    ASSERT(typeof value === 'number'); // dont abstract this. when adding cells or nodes the buffer should not be cached!
    var bufLen = front.buffer.length;
    var cellIndex = nodeIndex + 1 + cellOffset; // initial size of front may not be big enough to hold all indexes. other nodes should be.
    if (nodeIndex === FRONT_FIRST_NODE_OFFSET && cellIndex >= bufLen) {
        front_grow(front, Math.floor(Math.max(cellIndex + 1, bufLen * 1.1)));
    }
    ASSERT(cellIndex < front.buffer.length, 'cellIndex should be within buffer');
    front.buffer[cellIndex] = value;
}
/**
 * Return value of cell relative to given node.
 *
 * @param {$front} front
 * @param {number} nodeIndex
 * @param {number} cellOffset
 * @returns {number}
 */
function front_getCell(front, nodeIndex, cellOffset) {
    return _front_getCell(front.buffer, nodeIndex, cellOffset);
}
/**
 * Same as front_getCell except it expects the buffer immediately.
 *
 * @param {TypedArray} buffer
 * @param {number} nodeIndex
 */
function _front_getCell(buf, nodeIndex, cellOffset) {
    ASSERT(typeof nodeIndex === 'number', 'node must be number');
    ASSERT(typeof cellOffset === 'number', 'cell must be number');
    ASSERT(nodeIndex >= 0 && nodeIndex <= buf.length, 'node must not be OOB');
    ASSERT(cellOffset >= 0, 'cell must not be OOB');
    ASSERT(nodeIndex + 1 + cellOffset < buf.length, 'target cell should be within bounds');
    return buf[nodeIndex + 1 + cellOffset];
}
/**
 * @param {$front} front
 * @param {Object} [options]
 * @property {boolean} options.buf If true will do a pretty and raw print of the buffer
 * @property {boolean} options.bufPretty If true will do a pretty print of the buffer
 * @property {boolean} options.bufRaw If true will do a raw print of the buffer
 */
function _front_debug(front) {
    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
    console.log('##');
    console.log('Unsolved Vars Front:');
    console.log('Cells:', front.buffer.length);
    if (front._nodes !== 'undefined') console.log('Nodes:', front._nodes, '(added at some point, not currently containing)');
    if (front._grows !== 'undefined') console.log('Grows:', front._grows);
    console.log('');
    if (options.bufPretty || options.buf) {
        var buf = front.buffer;
        var next = 0;
        var nodes = 0;
        while (next <= front.lastNodeIndex) {
            ++nodes;
            var len = buf[next++];
            var s = next + ' [' + len + ']:';
            for (var i = 0; i < len; ++i) {
                s += ' ' + buf[next + i];
            }
            next += len;
            console.log(s);
        }
        console.log('Current node count:', nodes);
    }
    if (options.bufRaw || options.buf) {
        console.log('Raw buffer (' + front.buffer.length + '): [' + [].join.call(front.buffer, ',') + ']');
    }
    console.log('##');
} // end of src/front.js
// from: src/helpers.js
var SUB = 0; // WARNING: adjusting SUB to something negative means adjusting all tests. probably required for any change actually.
var SUP = 100000000;
var SOLVED = 1;
var UNDETERMINED = 0;
var NOT_FOUND = -1;
var EMPTY = 0;
var EMPTY_STR = '';
var LOG_NONE = 0;
var LOG_STATS = 1;
var LOG_SOLVES = 2;
var LOG_MIN = LOG_NONE;
var LOG_MAX = LOG_SOLVES; // different from NOT_FOUND in that NOT_FOUND must be -1 because of the indexOf api
// while NO_SUCH_VALUE must be a value that cannot be a legal domain value (<SUB or >SUP)
var NO_SUCH_VALUE = Math.min(0, SUB) - 1; // make sure NO_SUCH_VALUE is a value that may be neither valid in a domain nor >=0
var ENABLED = true; // override for most tests (but not regular ASSERTs) like full domains and space validations
var ENABLE_DOMAIN_CHECK = false; // also causes unrelated errors because mocha sees the expandos
var ENABLE_EMPTY_CHECK = false; //  also causes unrelated errors because mocha sees the expandos
var ARR_RANGE_SIZE = 2;
var SMALL_MAX_NUM = 30; // there are SMALL_MAX_NUM flags. if they are all on, this is the number value
// (oh and; 1<<31 is negative. >>>0 makes it unsigned. this is why 30 is max.)
var SMALL_MAX_FLAG = (1 << SMALL_MAX_NUM + 1 >>> 0) - 1; // __REMOVE_BELOW_FOR_ASSERTS__
ASSERT(SMALL_MAX_NUM <= 30, 'cant be larger because then shifting fails above and elsewhere');
ASSERT(NOT_FOUND === NO_SUCH_VALUE, 'keep not found constants equal to prevent confusion bugs'); // For unit tests
// Should be removed in production. Obviously.
function ASSERT(bool) {
    var msg = arguments.length <= 1 || arguments[1] === undefined ? '' : arguments[1];
    if (bool) {
        return;
    }
    if (!msg) msg = new Error('trace').stack;
    console.error('Assertion fail: ' + msg);
    for (var _len = arguments.length, args = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
        args[_key - 2] = arguments[_key];
    }
    if (args) {
        console.log('Error args:', args);
    } //      console.trace()
    //      process.exit() # uncomment for quick error access :)
    var suffix = '';
    if (args && args.length) {
        suffix = 'Args (' + args.length + 'x): `' + _stringify(args) + '`';
    }
    THROW('Assertion fail: ' + msg + ' ' + suffix);
}

function _stringify(o) {
    if (o instanceof Array) {
        return '[ ' + o.map(function(e) {
            return _stringify(e);
        }).join(', ') + ' ]';
    }
    return '' + o;
} // Simple function to completely validate a domain
// Should be removed in production. Obviously.
function ASSERT_STRDOM(domain) {
    ASSERT(typeof domain === 'string', 'ONLY_STRDOM');
    ASSERT(domain.length % 4 === 0, 'SHOULD_CONTAIN_RANGES');
}

function ASSERT_NUMDOM(domain) {
    ASSERT(typeof domain === 'number', 'ONLY_NUMDOM');
    ASSERT(domain >= 0 && domain <= SMALL_MAX_FLAG, 'NUMDOM_SHOULD_BE_VALID_RANGE');
}

function ASSERT_ARRDOM(domain) {
    ASSERT(domain instanceof Array, 'ONLY_ARRDOM');
    ASSERT(domain.length % 2 === 0, 'SHOULD_CONTAIN_RANGES');
}

function ASSERT_NUMSTRDOM(domain) {
    ASSERT(typeof domain === 'string' || typeof domain === 'number', 'ONLY_NUMDOM_OR_STRDOM');
}

function ASSERT_ANYDOM(domain) {
    ASSERT(typeof domain === 'string' || typeof domain === 'number' || domain instanceof Array, 'ONLY_VALID_DOM_TYPE');
} //__REMOVE_ABOVE_FOR_ASSERTS__
// given a value return value.id or value
// intended to return the name of a variable where the
// value can be either that variable, or just its name
// @returns {string}
function GET_NAME(e) { // e can be the empty string (TOFIX: let's not allow this...)
    if (e.id !== undefined && e.id !== null) {
        return e.id;
    }
    return e;
} // @see GET_NAME
// @returns {string[]}
function GET_NAMES(es) {
    if (typeof es === 'string') return es;
    var varNames = [];
    for (var i = 0; i < es.length; i++) {
        var varName = es[i];
        varNames.push(GET_NAME(varName));
    }
    return varNames;
} // Abstraction for throwing because throw statements cause deoptimizations
// All explicit throws should use this function. Also helps with tooling
// later, catching and reporting explicits throws and what not.
function THROW(msg) {
    throw new Error(msg);
} // end of src/helpers.js
// from: src/markov.js
/**
 * If a row has no boolean condition, return it.
 * If the boolean condition of a row is 1, return it.
 * If no row meets these conditions, return the last row.
 *
 * @param {$space} space
 * @param {?} matrix
 * @returns {*}
 */
function markov_getNextRowToSolve(space, matrix) {
    var vardoms = space.vardoms;
    for (var i = 0; i < matrix.length; i++) {
        var row = matrix[i];
        var boolDomain = vardoms[row.booleanId];
        if (boolDomain === undefined || asmdomain_isValue(boolDomain, 1) === 1) {
            break;
        }
    }
    return row;
}

function markov_createLegend(merge, inputLegend, domain) {
    if (merge) {
        return markov_mergeDomainAndLegend(inputLegend, domain);
    }
    return inputLegend;
}

function markov_mergeDomainAndLegend(inputLegend, domain) {
    var legend = void 0;
    if (inputLegend) {
        legend = inputLegend.slice(0);
    } else {
        legend = [];
    }
    var listed = domain_any_toList(domain);
    for (var i = 0; i < listed.length; ++i) {
        var val = listed[i];
        if (legend.indexOf(val) < 0) {
            legend.push(val);
        }
    }
    return legend;
}

function markov_createProbVector(space, matrix, expandVectorsWith, valueCount) {
    var row = markov_getNextRowToSolve(space, matrix);
    var probVector = row.vector;
    if (expandVectorsWith != null) { // could be 0
        probVector = probVector ? probVector.slice(0) : [];
        var delta = valueCount - probVector.length;
        if (delta > 0) {
            for (var i = 0; i < delta; ++i) {
                probVector.push(expandVectorsWith);
            }
        }
        return probVector;
    }
    if (!probVector || probVector.length !== valueCount) {
        THROW('E_EACH_MARKOV_VAR_MUST_HAVE_PROB_VECTOR_OR_ENABLE_EXPAND_VECTORS');
    }
    return probVector;
} // end of src/markov.js
// from: src/propagator.js
/**
 * @param {string} name
 * @param {number} index1
 * @param {number} [index2=-1]
 * @param {number} [index3=-1]
 * @param {string} [arg1='']
 * @param {string} [arg2='']
 * @param {string} [arg3='']
 * @param {string} [arg4='']
 * @param {string} [arg5='']
 * @param {string} [arg6='']
 * @returns {$propagator}
 */
function propagator_create(name, stepFunc, index1, index2, index3, arg1, arg2, arg3, arg4, arg5, arg6) {
    return {
        _class: '$propagator',
        name: name,
        stepper: stepFunc,
        index1: index1 === undefined ? -1 : index1,
        index2: index2 === undefined ? -1 : index2,
        index3: index3 === undefined ? -1 : index3,
        arg1: arg1 === undefined ? '' : arg1,
        arg2: arg2 === undefined ? '' : arg2,
        arg3: arg3 === undefined ? '' : arg3,
        arg4: arg4 === undefined ? '' : arg4,
        arg5: arg5 === undefined ? '' : arg5,
        arg6: arg6 === undefined ? '' : arg6
    };
}
/**
 * Adds propagators which reify the given operator application
 * to the given boolean variable.
 *
 * `opname` is a string giving the name of the comparison
 * operator to reify. Currently, 'eq', 'neq', 'lt', 'lte', 'gt' and 'gte'
 * are supported.
 *
 * `leftVarIndex` and `rightVarIndex` are the arguments accepted
 * by the comparison operator.
 *
 * `resultVarIndex` is the name of the boolean variable to which to
 * reify the comparison operator. Note that this boolean
 * variable must already have been declared. If this argument
 * is omitted from the call, then the `reified` function can
 * be used in "functional style" and will return the name of
 * the reified boolean variable which you can pass to other
 * propagator creator functions.
 *
 * @param {$config} config
 * @param {string} opname
 * @param {number} leftVarIndex
 * @param {number} rightVarIndex
 * @param {number} resultVarIndex
 */
function propagator_addReified(config, opname, leftVarIndex, rightVarIndex, resultVarIndex) {
    ASSERT(config._class === '$config', 'EXPECTING_CONFIG');
    ASSERT(typeof opname === 'string', 'OP_SHOULD_BE_STRING');
    ASSERT(typeof leftVarIndex === 'number' && leftVarIndex >= 0, 'LEFT_VAR_SHOULD_BE_VALID_INDEX', leftVarIndex);
    ASSERT(typeof rightVarIndex === 'number' && rightVarIndex >= 0, 'RIGHT_VAR_SHOULD_BE_VALID_INDEX', rightVarIndex);
    ASSERT(typeof resultVarIndex === 'number' && resultVarIndex >= 0, 'RESULT_VAR_SHOULD_BE_VALID_INDEX', resultVarIndex);
    var nopName = void 0;
    var opFunc = void 0;
    var nopFunc = void 0;
    var opRejectChecker = void 0;
    var nopRejectChecker = void 0;
    switch (opname) {
        case 'eq':
            {
                opFunc = propagator_eqStepBare;opRejectChecker = propagator_eqStepWouldReject;nopName = 'neq';nopFunc = propagator_neqStepBare;nopRejectChecker = propagator_neqStepWouldReject;
                var A = domain_toNumstr(config.initial_domains[leftVarIndex]);
                var B = domain_toNumstr(config.initial_domains[rightVarIndex]);
                var C = domain_toNumstr(config.initial_domains[resultVarIndex]); // optimization; if only with bools and A or B is solved, we can do eq(A,C) or neq(A,C)
                if (C === BOOL) {
                    if (B === BOOL) {
                        if (A === ONE) {
                            return propagator_addEq(config, rightVarIndex, resultVarIndex);
                        }
                        if (A === ZERO) {
                            return propagator_addNeq(config, rightVarIndex, resultVarIndex);
                        }
                    }
                    if (A === BOOL) {
                        if (B === ONE) {
                            return propagator_addEq(config, leftVarIndex, resultVarIndex);
                        }
                        if (B === ZERO) {
                            return propagator_addNeq(config, leftVarIndex, resultVarIndex);
                        }
                    }
                }
                break;
            }
        case 'neq':
            {
                opFunc = propagator_neqStepBare;opRejectChecker = propagator_neqStepWouldReject;nopName = 'eq';nopFunc = propagator_eqStepBare;nopRejectChecker = propagator_eqStepWouldReject;
                var _A = domain_toNumstr(config.initial_domains[leftVarIndex]);
                var _B = domain_toNumstr(config.initial_domains[rightVarIndex]);
                var _C = domain_toNumstr(config.initial_domains[resultVarIndex]); // optimization; if only with bools and A or B is solved, we can do eq(A,C) or neq(A,C)
                if (_C === BOOL) {
                    if (_B === BOOL) {
                        if (_A === ONE) {
                            return propagator_addNeq(config, rightVarIndex, resultVarIndex);
                        }
                        if (_A === ZERO) {
                            return propagator_addEq(config, rightVarIndex, resultVarIndex);
                        }
                    }
                    if (_A === BOOL) {
                        if (_B === ONE) {
                            return propagator_addNeq(config, leftVarIndex, resultVarIndex);
                        }
                        if (_B === ZERO) {
                            return propagator_addEq(config, leftVarIndex, resultVarIndex);
                        }
                    }
                }
                break;
            }
        case 'lt':
            opFunc = propagator_neqStepBare;
            opRejectChecker = propagator_ltStepWouldReject;
            nopName = 'gte';
            nopFunc = propagator_gteStepBare;
            nopRejectChecker = propagator_gteStepWouldReject;
            break;
        case 'gt':
            opFunc = propagator_gtStepBare;
            opRejectChecker = propagator_gtStepWouldReject;
            nopName = 'lte';
            nopFunc = propagator_lteStepBare;
            nopRejectChecker = propagator_lteStepWouldReject;
            break;
        case 'lte':
            opFunc = propagator_lteStepBare;
            opRejectChecker = propagator_lteStepWouldReject;
            nopName = 'gt';
            nopFunc = propagator_gtStepBare;
            nopRejectChecker = propagator_gtStepWouldReject;
            break;
        case 'gte':
            opFunc = propagator_gteStepBare;
            opRejectChecker = propagator_gteStepWouldReject;
            nopName = 'lt';
            nopFunc = propagator_ltStepBare;
            nopRejectChecker = propagator_ltStepWouldReject;
            break;
        default:
            THROW('UNKNOWN_REIFIED_OP');
    }
    config_addPropagator(config, propagator_create('reified', propagator_reifiedStepBare, leftVarIndex, rightVarIndex, resultVarIndex, opFunc, nopFunc, opname, nopName, opRejectChecker, nopRejectChecker));
}
/**
 * Domain equality propagator. Creates the propagator
 * in given config.
 * Can pass in vars or numbers that become anonymous
 * vars. Must at least pass in one var because the
 * propagator would be useless otherwise.
 *
 * @param {$config} config
 * @param {number} leftVarIndex
 * @param {number} rightVarIndex
 */
function propagator_addEq(config, leftVarIndex, rightVarIndex) {
    ASSERT(config._class === '$config', 'EXPECTING_CONFIG');
    ASSERT(typeof leftVarIndex === 'number' && leftVarIndex >= 0, 'LEFT_VAR_SHOULD_BE_VALID_INDEX', leftVarIndex);
    ASSERT(typeof rightVarIndex === 'number' && rightVarIndex >= 0, 'RIGHT_VAR_SHOULD_BE_VALID_INDEX', rightVarIndex);
    config_addPropagator(config, propagator_create('eq', propagator_eqStepBare, leftVarIndex, rightVarIndex));
}
/**
 * Less than propagator. See general propagator nores
 * for fdeq which also apply to this one.
 *
 * @param {$config} config
 * @param {number} leftVarIndex
 * @param {number} rightVarIndex
 */
function propagator_addLt(config, leftVarIndex, rightVarIndex) {
    ASSERT(config._class === '$config', 'EXPECTING_CONFIG');
    ASSERT(typeof leftVarIndex === 'number' && leftVarIndex >= 0, 'LEFT_VAR_SHOULD_BE_VALID_INDEX', leftVarIndex);
    ASSERT(typeof rightVarIndex === 'number' && rightVarIndex >= 0, 'RIGHT_VAR_SHOULD_BE_VALID_INDEX', rightVarIndex);
    config_addPropagator(config, propagator_create('lt', propagator_ltStepBare, leftVarIndex, rightVarIndex));
}
/**
 * Greater than propagator.
 *
 * @param {$config} config
 * @param {number} leftVarIndex
 * @param {number} rightVarIndex
 */
function propagator_addGt(config, leftVarIndex, rightVarIndex) { // _swap_ v1 and v2 because: a>b is b<a
    propagator_addLt(config, rightVarIndex, leftVarIndex);
}
/**
 * Less than or equal to propagator.
 *
 * @param {$config} config
 * @param {number} leftVarIndex
 * @param {number} rightVarIndex
 */
function propagator_addLte(config, leftVarIndex, rightVarIndex) {
    ASSERT(config._class === '$config', 'EXPECTING_CONFIG');
    ASSERT(typeof leftVarIndex === 'number' && leftVarIndex >= 0, 'LEFT_VAR_SHOULD_BE_VALID_INDEX', leftVarIndex);
    ASSERT(typeof rightVarIndex === 'number' && rightVarIndex >= 0, 'RIGHT_VAR_SHOULD_BE_VALID_INDEX', rightVarIndex);
    config_addPropagator(config, propagator_create('lte', propagator_lteStepBare, leftVarIndex, rightVarIndex));
}
/**
 * @param {$config} config
 * @param {number} leftVarIndex
 * @param {number} rightVarIndex
 * @param {number} resultVarIndex
 */
function propagator_addMul(config, leftVarIndex, rightVarIndex, resultVarIndex) {
    ASSERT(config._class === '$config', 'EXPECTING_CONFIG');
    ASSERT(typeof leftVarIndex === 'number' && leftVarIndex >= 0, 'LEFT_VAR_SHOULD_BE_VALID_INDEX', leftVarIndex);
    ASSERT(typeof rightVarIndex === 'number' && rightVarIndex >= 0, 'RIGHT_VAR_SHOULD_BE_VALID_INDEX', rightVarIndex);
    ASSERT(typeof resultVarIndex === 'number' && resultVarIndex >= 0, 'RESULT_VAR_SHOULD_BE_VALID_INDEX', resultVarIndex);
    config_addPropagator(config, propagator_create('mul', propagator_mulStep, leftVarIndex, rightVarIndex, resultVarIndex));
}
/**
 * @param {$config} config
 * @param {number} leftVarIndex
 * @param {number} rightVarIndex
 * @param {number} resultVarIndex
 */
function propagator_addDiv(config, leftVarIndex, rightVarIndex, resultVarIndex) {
    ASSERT(config._class === '$config', 'EXPECTING_CONFIG');
    ASSERT(typeof leftVarIndex === 'number' && leftVarIndex >= 0, 'LEFT_VAR_SHOULD_BE_VALID_INDEX', leftVarIndex);
    ASSERT(typeof rightVarIndex === 'number' && rightVarIndex >= 0, 'RIGHT_VAR_SHOULD_BE_VALID_INDEX', rightVarIndex);
    ASSERT(typeof resultVarIndex === 'number' && resultVarIndex >= 0, 'RESULT_VAR_SHOULD_BE_VALID_INDEX', resultVarIndex);
    config_addPropagator(config, propagator_create('div', propagator_divStep, leftVarIndex, rightVarIndex, resultVarIndex));
}
/**
 * Greater than or equal to.
 *
 * @param {$config} config
 * @param {number} leftVarIndex
 * @param {number} rightVarIndex
 */
function propagator_addGte(config, leftVarIndex, rightVarIndex) { // _swap_ v1 and v2 because: a>=b is b<=a
    propagator_addLte(config, rightVarIndex, leftVarIndex);
}
/**
 * Ensures that the two variables take on different values.
 *
 * @param {$config} config
 * @param {number} leftVarIndex
 * @param {number} rightVarIndex
 */
function propagator_addNeq(config, leftVarIndex, rightVarIndex) {
    ASSERT(config._class === '$config', 'EXPECTING_CONFIG');
    ASSERT(typeof leftVarIndex === 'number' && leftVarIndex >= 0, 'LEFT_VAR_SHOULD_BE_VALID_INDEX', leftVarIndex);
    ASSERT(typeof rightVarIndex === 'number' && rightVarIndex >= 0, 'RIGHT_VAR_SHOULD_BE_VALID_INDEX', rightVarIndex);
    config_addPropagator(config, propagator_create('neq', propagator_neqStepBare, leftVarIndex, rightVarIndex));
}
/**
 * Takes an arbitrary number of FD variables and adds propagators that
 * ensure that they are pairwise distinct.
 *
 * @param {$config} config
 * @param {number[]} varIndexes
 */
function propagator_addDistinct(config, varIndexes) {
    ASSERT(config._class === '$config', 'EXPECTING_CONFIG');
    for (var i = 0; i < varIndexes.length; i++) {
        var varIndex = varIndexes[i];
        for (var j = 0; j < i; ++j) {
            propagator_addNeq(config, varIndex, varIndexes[j]);
        }
    }
}
/**
 * @param {$config} config
 * @param {string} targetOpName
 * @param {string} invOpName
 * @param {Function} opFunc
 * @param {Function} nopFunc
 * @param {number} leftVarIndex
 * @param {number} rightVarIndex
 * @param {number} resultVarIndex
 */
function propagator_addRingPlusOrMul(config, targetOpName, invOpName, opFunc, nopFunc, leftVarIndex, rightVarIndex, resultVarIndex) {
    ASSERT(config._class === '$config', 'EXPECTING_CONFIG');
    ASSERT(typeof targetOpName === 'string', 'OP_SHOULD_BE_STRING');
    ASSERT(typeof invOpName === 'string', 'INV_OP_SHOULD_BE_STRING');
    ASSERT(typeof leftVarIndex === 'number' && leftVarIndex >= 0, 'LEFT_VAR_SHOULD_BE_VALID_INDEX', leftVarIndex);
    ASSERT(typeof rightVarIndex === 'number' && rightVarIndex >= 0, 'RIGHT_VAR_SHOULD_BE_VALID_INDEX', rightVarIndex);
    ASSERT(typeof resultVarIndex === 'number' && resultVarIndex >= 0, 'RESULT_VAR_SHOULD_BE_VALID_INDEX', resultVarIndex);
    propagator_addRing(config, leftVarIndex, rightVarIndex, resultVarIndex, targetOpName, opFunc);
    propagator_addRing(config, resultVarIndex, rightVarIndex, leftVarIndex, invOpName, nopFunc);
    propagator_addRing(config, resultVarIndex, leftVarIndex, rightVarIndex, invOpName, nopFunc);
}
/**
 * @param {$config} config
 * @param {string} A
 * @param {string} B
 * @param {string} C
 * @param {string} opName
 * @param {Function} opFunc
 */
function propagator_addRing(config, A, B, C, opName, opFunc) {
    ASSERT(config._class === '$config', 'EXPECTING_CONFIG');
    ASSERT(typeof A === 'number' && A >= 0, 'LEFT_VAR_SHOULD_BE_VALID_INDEX', A);
    ASSERT(typeof B === 'number' && B >= 0, 'RIGHT_VAR_SHOULD_BE_VALID_INDEX', B);
    ASSERT(typeof C === 'number' && C >= 0, 'RESULT_VAR_SHOULD_BE_VALID_INDEX', C);
    config_addPropagator(config, propagator_create('ring', propagator_ringStepBare, A, B, C, opName, opFunc));
}
/**
 * Bidirectional addition propagator.
 *
 * @param {$config} config
 * @param {number} leftVarIndex
 * @param {number} rightVarIndex
 * @param {number} resultVarIndex
 */
function propagator_addPlus(config, leftVarIndex, rightVarIndex, resultVarIndex) {
    propagator_addRingPlusOrMul(config, 'plus', 'min', domain_any_plus, domain_any_minus, leftVarIndex, rightVarIndex, resultVarIndex);
}
/**
 * @param {$config} config
 * @param {number} leftVarIndex
 * @param {number} rightVarIndex
 * @param {number} resultVarIndex
 */
function propagator_addMin(config, leftVarIndex, rightVarIndex, resultVarIndex) {
    ASSERT(config._class === '$config', 'EXPECTING_CONFIG');
    ASSERT(typeof leftVarIndex === 'number' && leftVarIndex >= 0, 'LEFT_VAR_SHOULD_BE_VALID_INDEX', leftVarIndex);
    ASSERT(typeof rightVarIndex === 'number' && rightVarIndex >= 0, 'RIGHT_VAR_SHOULD_BE_VALID_INDEX', rightVarIndex);
    ASSERT(typeof resultVarIndex === 'number' && resultVarIndex >= 0, 'RESULT_VAR_SHOULD_BE_VALID_INDEX', resultVarIndex);
    config_addPropagator(config, propagator_create('min', propagator_minStep, leftVarIndex, rightVarIndex, resultVarIndex));
}
/**
 * Bidirectional multiplication propagator.
 *
 * @param {$config} config
 * @param {number} leftVarIndex
 * @param {number} rightVarIndex
 * @param {number} resultVarIndex
 */
function propagator_addRingMul(config, leftVarIndex, rightVarIndex, resultVarIndex) {
    propagator_addRingPlusOrMul(config, 'mul', 'div', domain_any_mul, domain_any_divby, leftVarIndex, rightVarIndex, resultVarIndex);
}
/**
 * Sum of N domains = resultVar
 * Creates as many anonymous varIndexes as necessary.
 *
 * @param {$config} config
 * @param {number[]} varIndexes
 * @param {number} resultVarIndex
 */
function propagator_addSum(config, varIndexes, resultVarIndex) {
    ASSERT(config._class === '$config', 'EXPECTING_CONFIG');
    ASSERT(varIndexes instanceof Array, 'varIndexes should be an array of var names', varIndexes);
    ASSERT(typeof resultVarIndex === 'number' && resultVarIndex >= 0, 'RESULT_VAR_SHOULD_BE_VALID_INDEX', typeof resultVarIndex === 'undefined' ? 'undefined' : _typeof(resultVarIndex), resultVarIndex);
    var len = varIndexes.length;
    switch (len) {
        case 0:
            THROW('SUM_REQUIRES_VARS');
            return undefined;
        case 1:
            propagator_addEq(config, resultVarIndex, varIndexes[0]);
            return undefined;
        case 2:
            propagator_addPlus(config, varIndexes[0], varIndexes[1], resultVarIndex);
            return undefined;
    } // "divide and conquer" ugh. feels like there is a better way to do this
    ASSERT(len > 2, 'expecting at least 3 elements in the list...', varIndexes);
    var t1 = void 0;
    var n = Math.floor(varIndexes.length / 2);
    if (n > 1) {
        t1 = config_addVarAnonNothing(config);
        propagator_addSum(config, varIndexes.slice(0, n), t1);
    } else {
        t1 = varIndexes[0];
    }
    var t2 = config_addVarAnonNothing(config);
    propagator_addSum(config, varIndexes.slice(n), t2);
    propagator_addPlus(config, t1, t2, resultVarIndex);
}
/**
 * Product of N varIndexes = resultVar.
 * Create as many anonymous varIndexes as necessary.
 *
 * @param {$config} config
 * @param {number[]} varIndexes
 * @param {number} resultVarIndex
 */
function propagator_addProduct(config, varIndexes, resultVarIndex) {
    ASSERT(config._class === '$config', 'EXPECTING_CONFIG');
    ASSERT(varIndexes instanceof Array, 'varIndexes should be an array of var names', varIndexes);
    ASSERT(typeof resultVarIndex === 'number' && resultVarIndex >= 0, 'RESULT_VAR_SHOULD_BE_VALID_INDEX', resultVarIndex);
    switch (varIndexes.length) {
        case 0:
            THROW('PRODUCT_REQUIRES_VARS');
            return undefined;
        case 1: // note: by putting the result var first we get
            // the var name back for it in case it's a number
            propagator_addEq(config, resultVarIndex, varIndexes[0]);
            return undefined;
        case 2:
            propagator_addRingMul(config, varIndexes[0], varIndexes[1], resultVarIndex);
            return undefined;
    }
    var n = Math.floor(varIndexes.length / 2);
    var t1 = void 0;
    if (n > 1) {
        t1 = config_addVarAnonNothing(config);
        propagator_addProduct(config, varIndexes.slice(0, n), t1);
    } else {
        t1 = varIndexes[0];
    }
    var t2 = config_addVarAnonNothing(config);
    propagator_addProduct(config, varIndexes.slice(n), t2);
    propagator_addRingMul(config, t1, t2, resultVarIndex);
}
/**
 * @param {$config} config
 * @param {string} varIndex
 */
function propagator_addMarkov(config, varIndex) {
    ASSERT(config._class === '$config', 'EXPECTING_CONFIG');
    ASSERT(typeof varIndex === 'number' && varIndex >= 0, 'VAR_SHOULD_BE_VALID_INDEX', varIndex);
    config_addPropagator(config, propagator_create('markov', propagator_markovStepBare, varIndex));
} // end of src/propagator.js
// from: src/propagators/div.js
/**
 * @param {$space} space
 * @param {$config} config
 * @param {number} varIndex1
 * @param {number} varIndex2
 * @param {number} varIndex3
 * @returns {$fd_changeState}
 */
function propagator_divStep(space, config, varIndex1, varIndex2, varIndex3) {
    ASSERT(varIndex1 >= 0 && varIndex2 >= 0 && varIndex3 >= 0, 'expecting three vars', varIndex1, varIndex2, varIndex3);
    var domain1 = space.vardoms[varIndex1];
    var domain2 = space.vardoms[varIndex2];
    var domain3 = space.vardoms[varIndex3];
    space.vardoms[varIndex3] = _propagator_divStep(domain1, domain2, domain3);
}
/**
 * @param {$domain} domain1
 * @param {$domain} domain2
 * @param {$domain} domResult
 * @returns {$domain}
 */
function _propagator_divStep(domain1, domain2, domResult) {
    ASSERT_NUMSTRDOM(domain1);
    ASSERT_NUMSTRDOM(domain2);
    ASSERT(domain1 && domain2, 'SHOULD_NOT_BE_REJECTED');
    var domain = domain_any_divby(domain1, domain2);
    return domain_any_intersection(domResult, domain);
} // end of src/propagators/div.js
// from: src/propagators/eq.js
/**
 * This eq propagator looks a lot different from neq because in
 * eq we can prune early all values that are not covered by both.
 * Any value that is not covered by both can not be a valid solution
 * that holds this constraint. In neq that's different and we can
 * only start pruning once at least one var has a solution.
 * Basically eq is much more efficient compared to neq because we
 * can potentially skip a lot of values early.
 *
 * @param {$space} space
 * @param {$config} config
 * @param {number} varIndex1
 * @param {number} varIndex2
 * @returns {$fd_changeState}
 */
function propagator_eqStepBare(space, config, varIndex1, varIndex2) {
    ASSERT(space._class === '$space', 'SHOULD_GET_SPACE');
    ASSERT(typeof varIndex1 === 'number', 'VAR_INDEX_SHOULD_BE_NUMBER');
    ASSERT(typeof varIndex2 === 'number', 'VAR_INDEX_SHOULD_BE_NUMBER');
    var domain1 = space.vardoms[varIndex1];
    var domain2 = space.vardoms[varIndex2];
    ASSERT_NUMSTRDOM(domain1);
    ASSERT_NUMSTRDOM(domain2);
    ASSERT(domain1 && domain2, 'SHOULD_NOT_BE_REJECTED');
    var result = domain_any_intersection(domain1, domain2);
    space.vardoms[varIndex1] = result;
    space.vardoms[varIndex2] = result;
}
/**
 * The eq step would reject if there all elements in one domain
 * do not occur in the other domain. Because then there's no
 * valid option to make sure A=B holds. So search for such value
 * or return false.
 * Read only check
 *
 * @param {$domain} domain1
 * @param {$domain} domain2
 * @returns {boolean}
 */
function propagator_eqStepWouldReject(domain1, domain2) {
    ASSERT_NUMSTRDOM(domain1);
    ASSERT_NUMSTRDOM(domain2);
    ASSERT(domain1 && domain2, 'NON_EMPTY_DOMAIN_EXPECTED');
    return domain_any_sharesNoElements(domain1, domain2);
}
/**
 * An eq propagator is solved when both its vars are
 * solved. Any other state may still lead to failure.
 *
 * @param {$domain} domain1
 * @param {$domain} domain2
 * @returns {boolean}
 */
function propagator_eqSolved(domain1, domain2) {
    return domain_any_isSolved(domain1) && domain_any_isSolved(domain2);
} // end of src/propagators/eq.js
// from: src/propagators/lt.js
/**
 * @param {$space} space
 * @param {$config} config
 * @param {number} varIndex1
 * @param {number} varIndex2
 */
function propagator_ltStepBare(space, config, varIndex1, varIndex2) {
    ASSERT(space._class === '$space', 'SHOULD_GET_SPACE');
    ASSERT(typeof varIndex1 === 'number', 'VAR_INDEX_SHOULD_BE_NUMBER');
    ASSERT(typeof varIndex2 === 'number', 'VAR_INDEX_SHOULD_BE_NUMBER');
    var domain1 = space.vardoms[varIndex1];
    var domain2 = space.vardoms[varIndex2];
    ASSERT_NUMSTRDOM(domain1);
    ASSERT_NUMSTRDOM(domain2);
    ASSERT(domain1 && domain2, 'SHOULD_NOT_BE_REJECTED');
    var lo1 = domain_any_min(domain1);
    var hi1 = domain_any_max(domain1);
    var lo2 = domain_any_min(domain2);
    var hi2 = domain_any_max(domain2); // there six possible cases:
    // - 1: v1 already satisfies v2 completely (only case where the constraint is solved)
    // - 2: all v1 <= all v2, so at least some still overlap. we cant do anything yet.
    // - 3: some v1 are bigger than v2, some v2 are smaller than v1. both those sets can be removed
    // - 4: none v1 are smaller or equal to v2 (only case where the constraint is rejected)
    // - 5: some of v1 are bigger than all of v2, those can be removed
    // - 6: some of v2 are smaller than all of v1, those can be removed
    // TOFIX: make this bit work. it should work. why doesnt it work? it would prevent unnecessary operations quickly.
    //// every number in v1 can only be smaller than or equal to the biggest
    //// value in v2. bigger values will never satisfy lt so prune them.
    //if (hi2 < hi1) {
    //  // if you remove every number gte to the lowest number in
    //  // the domain, then and only then the result will be empty
    //  // TOFIX: the rejection case was not tested before so it probably isn't now.
    //
    //  space.vardoms[varIndex1] = EMPTY;
    //  space.vardoms[varIndex2] = EMPTY;
    //  return;
    //}
    // every number in v1 can only be smaller than or equal to the biggest
    // value in v2. bigger values will never satisfy lt so prune them.
    if (hi1 >= hi2) {
        space.vardoms[varIndex1] = domain_any_removeGte(domain1, hi2);
    } // likewise; numbers in v2 that are smaller than or equal to the
    // smallest value of v1 can never satisfy lt so prune them as well
    if (lo1 >= lo2) {
        space.vardoms[varIndex2] = domain_any_removeLte(domain2, lo1);
    }
}

function propagator_gtStepBare(space, config, varIndex1, varIndex2) {
    return propagator_ltStepBare(space, config, varIndex2, varIndex1);
}
/**
 * lt would reject if all elements in the left var are bigger or equal to
 * the right var. And since everything is CSIS, we only have to check the
 * lo bound of left to the high bound of right for that answer.
 * Read-only check
 *
 * @param {$domain} domain1
 * @param {$domain} domain2
 * @returns {boolean}
 */
function propagator_ltStepWouldReject(domain1, domain2) {
    ASSERT_NUMSTRDOM(domain1);
    ASSERT_NUMSTRDOM(domain2);
    ASSERT(domain1 && domain2, 'NON_EMPTY_DOMAIN_EXPECTED');
    return domain_any_min(domain1) >= domain_any_max(domain2);
}
/**
 * Reverse of propagator_ltStepWouldReject
 *
 * @param {$domain} domain1
 * @param {$domain} domain2
 * @returns {boolean}
 */
function propagator_gtStepWouldReject(domain1, domain2) {
    return propagator_ltStepWouldReject(domain2, domain1);
}
/**
 * lt is solved if dom1 contains no values that are equal
 * to or higher than any numbers in dom2. Since domains
 * only shrink we can assume that the lt constraint will not
 * be broken by searching further once this state is seen.
 *
 * @param {$domain} domain1
 * @param {$domain} domain2
 * @returns {boolean}
 */
function propagator_ltSolved(domain1, domain2) {
    ASSERT_NUMSTRDOM(domain1);
    ASSERT_NUMSTRDOM(domain2);
    ASSERT(domain1 && domain2, 'NON_EMPTY_DOMAIN_EXPECTED');
    return domain_any_max(domain1) < domain_any_min(domain2);
} // end of src/propagators/lt.js
// from: src/propagators/lte.js
/**
 * @param {$space} space
 * @param {$config} config
 * @param {number} varIndex1
 * @param {number} varIndex2
 * @returns {$fd_changeState}
 */
function propagator_lteStepBare(space, config, varIndex1, varIndex2) {
    ASSERT(space._class === '$space', 'SHOULD_GET_SPACE');
    ASSERT(typeof varIndex1 === 'number', 'VAR_INDEX_SHOULD_BE_NUMBER');
    ASSERT(typeof varIndex2 === 'number', 'VAR_INDEX_SHOULD_BE_NUMBER');
    var domain1 = space.vardoms[varIndex1];
    var domain2 = space.vardoms[varIndex2];
    ASSERT_NUMSTRDOM(domain1);
    ASSERT_NUMSTRDOM(domain2);
    ASSERT(domain1 && domain2, 'SHOULD_NOT_BE_REJECTED');
    var lo1 = domain_any_min(domain1);
    var hi1 = domain_any_max(domain1);
    var lo2 = domain_any_min(domain2);
    var hi2 = domain_any_max(domain2); // every number in v1 can only be smaller than or equal to the biggest
    // value in v2. bigger values will never satisfy lt so prune them.
    if (hi1 > hi2) {
        space.vardoms[varIndex1] = domain_any_removeGte(domain1, hi2 + 1);
    } // likewise; numbers in v2 that are smaller than or equal to the
    // smallest value of v1 can never satisfy lt so prune them as well
    if (lo1 > lo2) {
        space.vardoms[varIndex2] = domain_any_removeLte(domain2, lo1 - 1);
    }
}

function propagator_gteStepBare(space, config, varIndex1, varIndex2) {
    return propagator_lteStepBare(space, config, varIndex2, varIndex1);
}
/**
 * lte would reject if all elements in the left var are bigger than the
 * right var. And since everything is CSIS, we only have to check the
 * lo bound of left to the high bound of right for that answer.
 *
 * @param {$domain} domain1
 * @param {$domain} domain2
 * @returns {boolean}
 */
function propagator_lteStepWouldReject(domain1, domain2) {
    ASSERT_NUMSTRDOM(domain1);
    ASSERT_NUMSTRDOM(domain2);
    ASSERT(domain1 && domain2, 'NON_EMPTY_DOMAIN_EXPECTED');
    return domain_any_min(domain1) > domain_any_max(domain2);
}
/**
 * Reverse of propagator_lteStepWouldReject
 *
 * @param {$domain} domain1
 * @param {$domain} domain2
 * @returns {boolean}
 */
function propagator_gteStepWouldReject(domain1, domain2) {
    return propagator_lteStepWouldReject(domain2, domain1);
}
/**
 * lte is solved if dom1 contains no values that are
 * higher than any numbers in dom2. Since domains only
 * shrink we can assume that the lte constraint will not
 * be broken by searching further once this state is seen.
 *
 * @param {$domain} domain1
 * @param {$domain} domain2
 * @returns {boolean}
 */
function propagator_lteSolved(domain1, domain2) {
    ASSERT_NUMSTRDOM(domain1);
    ASSERT_NUMSTRDOM(domain2);
    ASSERT(domain1 && domain2, 'NON_EMPTY_DOMAIN_EXPECTED');
    return domain_any_max(domain1) <= domain_any_min(domain2);
} // end of src/propagators/lte.js
// from: src/propagators/markov.js
/**
 * Markov uses a special system for trying values. The domain doesn't
 * govern the list of possible values, only acts as a mask for the
 * current node in the search tree (-> space). But since FD will work
 * based on this domain anyways we will need this extra step to verify
 * whether a solved var is solved to a valid value in current context.
 *
 * Every markov variable should have a propagator. Perhaps later
 * there can be one markov propagator that checks all markov vars.
 *
 * @param {$space} space
 * @param {$config} config
 * @param {number} varIndex
 */
function propagator_markovStepBare(space, config, varIndex) { // THIS IS VERY EXPENSIVE IF expandVectorsWith IS ENABLED
    ASSERT(typeof varIndex === 'number', 'VAR_INDEX_SHOULD_BE_NUMBER');
    var domain = space.vardoms[varIndex];
    ASSERT_NUMSTRDOM(domain);
    ASSERT(domain, 'SHOULD_NOT_BE_REJECTED');
    if (!domain_any_isSolved(domain)) return;
    var value = domain_any_min(domain); // note: solved so lo=hi=value
    var configVarDistOptions = config.var_dist_options;
    var distributionOptions = configVarDistOptions[config.all_var_names[varIndex]];
    ASSERT(distributionOptions, 'var should have a config', varIndex, distributionOptions || JSON.stringify(configVarDistOptions));
    ASSERT(distributionOptions.valtype === 'markov', 'var should be a markov var', distributionOptions.valtype);
    var expandVectorsWith = distributionOptions.expandVectorsWith;
    ASSERT(distributionOptions.matrix, 'there should be a matrix available for every var');
    ASSERT(distributionOptions.legend || expandVectorsWith != null, 'every var should have a legend or expandVectorsWith set'); // note: expandVectorsWith can be 0, so check with null
    var values = markov_createLegend(expandVectorsWith != null, distributionOptions.legend, domain); // TODO: domain is a value, can this be optimized? is that worth the effort? (profile this)
    var probabilities = markov_createProbVector(space, distributionOptions.matrix, expandVectorsWith, values.length);
    var pos = values.indexOf(value);
    if (pos < 0 || pos >= probabilities.length || probabilities[pos] === 0) {
        space.vardoms[varIndex] = EMPTY;
    }
} // end of src/propagators/markov.js
// from: src/propagators/min.js
/**
 * Min as in minus. Only updates the result domain.
 *
 * @param {$space} space
 * @param {$config} config
 * @param {number} varIndex1
 * @param {number} varIndex2
 * @param {number} varIndex3
 */
function propagator_minStep(space, config, varIndex1, varIndex2, varIndex3) {
    ASSERT(varIndex1 >= 0 && varIndex2 >= 0 && varIndex3 >= 0, 'expecting three vars', varIndex1, varIndex2, varIndex3);
    var domain1 = space.vardoms[varIndex1];
    var domain2 = space.vardoms[varIndex2];
    var domain3 = space.vardoms[varIndex3];
    space.vardoms[varIndex3] = _propagator_minStep(domain1, domain2, domain3);
}
/**
 * @param {$domain} domain1
 * @param {$domain} domain2
 * @param {$domain} domResult
 * @returns {$domain}
 */
function _propagator_minStep(domain1, domain2, domResult) {
    ASSERT_NUMSTRDOM(domain1);
    ASSERT_NUMSTRDOM(domain2);
    ASSERT(domain1 && domain2, 'SHOULD_NOT_BE_REJECTED');
    var domain = domain_any_minus(domain1, domain2);
    return domain_any_intersection(domResult, domain);
} // end of src/propagators/min.js
// from: src/propagators/mul.js
/**
 * @param {$space} space
 * @param {$config} config
 * @param {number} varIndex1
 * @param {number} varIndex2
 * @param {number} varIndex3
 */
function propagator_mulStep(space, config, varIndex1, varIndex2, varIndex3) {
    ASSERT(varIndex1 >= 0 && varIndex2 >= 0 && varIndex3 >= 0, 'expecting three vars', varIndex1, varIndex2, varIndex3);
    var domain1 = space.vardoms[varIndex1];
    var domain2 = space.vardoms[varIndex2];
    var domain3 = space.vardoms[varIndex3];
    space.vardoms[varIndex3] = _propagator_mulStep(domain1, domain2, domain3);
}
/**
 * @param {$domain} domain1
 * @param {$domain} domain2
 * @param {$domain} domResult
 * @returns {$domain}
 */
function _propagator_mulStep(domain1, domain2, domResult) {
    ASSERT_NUMSTRDOM(domain1);
    ASSERT_NUMSTRDOM(domain2);
    ASSERT(domain1 && domain2, 'SHOULD_NOT_BE_REJECTED');
    var domain = domain_any_mul(domain1, domain2);
    return domain_any_intersection(domResult, domain);
} // end of src/propagators/mul.js
// from: src/propagators/neq.js
/**
 * @param {$space} space
 * @param {$config} config
 * @param {number} varIndex1
 * @param {number} varIndex2
 * @returns {$fd_changeState}
 */
function propagator_neqStepBare(space, config, varIndex1, varIndex2) {
    ASSERT(space && space._class === '$space', 'SHOULD_GET_SPACE');
    ASSERT(typeof varIndex1 === 'number', 'VAR_INDEX_SHOULD_BE_NUMBER');
    ASSERT(typeof varIndex2 === 'number', 'VAR_INDEX_SHOULD_BE_NUMBER');
    var domain1 = space.vardoms[varIndex1];
    var domain2 = space.vardoms[varIndex2];
    ASSERT_NUMSTRDOM(domain1);
    ASSERT_NUMSTRDOM(domain2);
    ASSERT(domain1 && domain2, 'SHOULD_NOT_BE_REJECTED'); // remove solved value from the other domain. confirm neither rejects over it.
    var value = domain_any_getValue(domain1);
    if (value !== NO_SUCH_VALUE) {
        if (domain1 === domain2) {
            space.vardoms[varIndex1] = EMPTY;
            space.vardoms[varIndex2] = EMPTY;
        } else {
            space.vardoms[varIndex2] = domain_any_removeValue(domain2, value);
        }
    } else { // domain1 is not solved, remove domain2 from domain1 if domain2 is solved
        value = domain_any_getValue(domain2);
        if (value !== NO_SUCH_VALUE) {
            space.vardoms[varIndex1] = domain_any_removeValue(domain1, value);
        }
    }
}
/**
 * neq will only reject if both domains are solved and equal.
 * This is a read-only check.
 *
 * @param {$domain} domain1
 * @param {$domain} domain2
 * @returns {boolean}
 */
function propagator_neqStepWouldReject(domain1, domain2) {
    if (!domain_any_isSolved(domain1) || !domain_any_isSolved(domain2)) {
        return false; // can not reject if either domain isnt solved
    }
    return domain_any_getValue(domain1) === domain_any_getValue(domain2);
}
/**
 * neq is solved if all values in both vars only occur in one var each
 *
 * @param {$domain} domain1
 * @param {$domain} domain2
 * @returns {boolean}
 */
function propagator_neqSolved(domain1, domain2) {
    return domain_any_sharesNoElements(domain1, domain2);
} // end of src/propagators/neq.js
// from: src/propagators/reified.js
/**
 * A boolean variable that represents whether a comparison
 * condition between two variables currently holds or not.
 *
 * @param {$space} space
 * @param {$config} config
 * @param {number} leftVarIndex
 * @param {number} rightVarIndex
 * @param {number} resultVarIndex
 * @param {Function} opFunc like propagator_ltStepBare
 * @param {Function} nopFunc opposite of opFunc like propagator_gtStepBare
 * @param {string} opName
 * @param {string} invOpName
 * @param {Function} opRejectChecker
 * @param {Function} nopRejectChecker
 */
function propagator_reifiedStepBare(space, config, leftVarIndex, rightVarIndex, resultVarIndex, opFunc, nopFunc, opName, invOpName, opRejectChecker, nopRejectChecker) {
    ASSERT(space._class === '$space', 'SPACE_SHOULD_BE_SPACE');
    ASSERT(typeof leftVarIndex === 'number', 'VAR_INDEX_SHOULD_BE_NUMBER');
    ASSERT(typeof rightVarIndex === 'number', 'VAR_INDEX_SHOULD_BE_NUMBER');
    ASSERT(typeof resultVarIndex === 'number', 'VAR_INDEX_SHOULD_BE_NUMBER');
    ASSERT(typeof opName === 'string', 'OP_SHOULD_BE_NUMBER');
    ASSERT(typeof invOpName === 'string', 'NOP_SHOULD_BE_NUMBER');
    var vardoms = space.vardoms;
    var domResult = vardoms[resultVarIndex];
    ASSERT(domResult === ZERO || domResult === ONE || domResult === BOOL, 'RESULT_DOM_SHOULD_BE_BOOL_BOUND [was' + domResult + ']');
    if (domResult === ZERO) {
        nopFunc(space, config, leftVarIndex, rightVarIndex);
    } else if (domResult === ONE) {
        opFunc(space, config, leftVarIndex, rightVarIndex);
    } else {
        ASSERT(domResult === BOOL, 'failsafe assertion');
        var domain1 = vardoms[leftVarIndex];
        var domain2 = vardoms[rightVarIndex];
        ASSERT_NUMSTRDOM(domain1);
        ASSERT_NUMSTRDOM(domain2);
        ASSERT(domain1 && domain2, 'SHOULD_NOT_BE_REJECTED');
        ASSERT(domResult === BOOL, 'result should be bool now because we already asserted it was either zero one or bool and it wasnt zero or one'); // we'll need to confirm both in any case so do it first now
        var opRejects = opRejectChecker(domain1, domain2);
        var nopRejects = nopRejectChecker(domain1, domain2); // if op and nop both reject then we cant fulfill the constraints
        // otherwise the reifier must solve to the other op
        if (nopRejects) {
            if (opRejects) {
                vardoms[resultVarIndex] = EMPTY;
            } else {
                vardoms[resultVarIndex] = ONE;
                opFunc(space, config, leftVarIndex, rightVarIndex);
            }
        } else if (opRejects) {
            vardoms[resultVarIndex] = ZERO;
            nopFunc(space, config, leftVarIndex, rightVarIndex);
        }
    }
} // end of src/propagators/reified.js
// from: src/propagators/ring.js
/**
 * @param {$space} space
 * @param {$config} config
 * @param {number} varIndex1
 * @param {number} varIndex2
 * @param {number} varIndex3
 * @param {string} opName
 * @param {Function} opFunc
 */
function propagator_ringStepBare(space, config, varIndex1, varIndex2, varIndex3, opName, opFunc) {
    ASSERT(varIndex1 >= 0 && varIndex2 >= 0 && varIndex3 >= 0, 'expecting three vars', varIndex1, varIndex2, varIndex3);
    ASSERT(typeof opName === 'string', 'OP_SHOULD_BE_STRING');
    var domain1 = space.vardoms[varIndex1];
    var domain2 = space.vardoms[varIndex2];
    var domain3 = space.vardoms[varIndex3];
    ASSERT(opName === 'plus' ? opFunc === domain_any_plus : opName === 'min' ? opFunc === domain_any_minus : opName === 'mul' ? opFunc === domain_any_mul : opName === 'div' ? opFunc === domain_any_divby : false, 'should get proper opfunc');
    space.vardoms[varIndex3] = _propagator_ringStepBare(domain1, domain2, domain3, opFunc, opName);
}
/**
 * @param {$domain} domain1
 * @param {$domain} domain2
 * @param {$domain} domainResult
 * @param {Function} opFunc
 * @param {string} opName For debugging only, the canonical name of opFunc
 * @returns {$domain}
 */
function _propagator_ringStepBare(domain1, domain2, domainResult, opFunc, opName) {
    ASSERT(typeof opFunc === 'function', 'EXPECTING_FUNC_TO_BE:', opName);
    ASSERT_NUMSTRDOM(domain1);
    ASSERT_NUMSTRDOM(domain2);
    ASSERT(domain1 && domain2, 'SHOULD_NOT_BE_REJECTED');
    var domain = opFunc(domain1, domain2);
    return domain_any_intersection(domainResult, domain);
} // end of src/propagators/ring.js
// from: src/search.js
/**
 * Depth first search.
 *
 * Traverse the search space in DFS order and return the first (next) solution
 *
 * state.space must be the starting space. The object is used to store and
 * track continuation information from that point onwards.
 *
 * On return, state.status contains either 'solved' or 'end' to indicate
 * the status of the returned solution. Also state.more will be true if
 * the search can continue and there may be more solutions.
 *
 * @param {Object} state
 * @property {$space} state.space Root space if this is the start of searching
 * @property {boolean} [state.more] Are there spaces left to investigate after the last solve?
 * @property {$space[]} [state.stack]=[state,space] The search stack as initialized by this class
 * @property {string} [state.status] Set to 'solved' or 'end'
 * @param {$config} config
 */
function search_depthFirst(state, config) {
    var isStart = !state.stack || state.stack.length === 0;
    if (isStart) { // If no stack argument, then search begins with state.space
        if (state.stack) {
            state.stack.push(state.space);
        } else {
            state.stack = [state.space];
        }
    }
    var stack = state.stack;
    while (stack.length > 0) {
        var solved = search_depthFirstLoop(stack[stack.length - 1], config, stack, state);
        if (solved) return;
    } // Failed space and no more options to explore.
    state.status = 'end';
    state.more = false;
}
/**
 * One search step of the given space
 *
 * @param {$space} space
 * @param {$config} config
 * @param {$space[]} stack
 * @param {Object} state See search_depthFirst
 * @returns {boolean}
 */
function search_depthFirstLoop(space, config, stack, state) { // we backtrack, update the last node in the data model with the previous space
    // I don't like doing it this way but what else?
    config._front.lastNodeIndex = space.frontNodeIndex;
    var rejected = space_propagate(space, config);
    if (rejected) {
        _search_onReject(state, space, stack);
        return false;
    }
    var solved = space_updateUnsolvedVarList(space, config);
    if (solved) {
        _search_onSolve(state, space, stack);
        return true;
    }
    var next_space = search_createNextSpace(space, config);
    if (next_space) { // Now this space is neither solved nor failed but since
        // no constraints are rejecting we must look further.
        // Push on to the stack and explore further.
        stack.push(next_space);
    } else { // Finished exploring branches of this space. Continue with the previous spaces.
        // This is a stable space, but isn't a solution. Neither is it a failed space.
        space.stable_children++;
        stack.pop();
    }
    return false;
}
/**
 * Create a new Space based on given Space which basically
 * serves as a child node in a search graph. The space is
 * cloned and in the clone one variable is restricted
 * slightly further. This clone is then returned.
 * This takes various search and distribution strategies
 * into account.
 *
 * @param {$space} space
 * @param {$config} config
 * @returns {$space|undefined} a clone with small modification or nothing if this is an unsolved leaf node
 */
function search_createNextSpace(space, config) {
    var varIndex = distribution_getNextVarIndex(space, config);
    if (varIndex !== NO_SUCH_VALUE) {
        ASSERT(typeof varIndex === 'number', 'VAR_INDEX_SHOULD_BE_NUMBER');
        ASSERT(varIndex >= 0, 'VAR_INDEX_SHOULD_BE_POSITIVE');
        var domain = space.vardoms[varIndex];
        if (!domain_any_isSolved(domain)) {
            var choice = space.next_distribution_choice++;
            var nextDomain = distribute_getNextDomainForVar(space, config, varIndex, choice);
            if (nextDomain) {
                var clone = space_createClone(space);
                clone.updatedVarIndex = varIndex;
                clone.vardoms[varIndex] = nextDomain;
                return clone;
            }
        }
    } // space is an unsolved leaf node, return undefined
}
/**
 * When search fails this function is called
 *
 *
 * @param {Object} state The search state data
 * @param {$space} space The search node to fail
 * @param {$space[]} stack See state.stack
 */
function _search_onReject(state, space, stack) { // Some propagators failed so this is now a failed space and we need
    // to pop the stack and continue from above. This is a failed space.
    space.failed = true;
    stack.pop();
}
/**
 * When search finds a solution this function is called
 *
 * @param {Object} state The search state data
 * @param {Space} space The search node to fail
 * @param {Space[]} stack See state.stack
 */
function _search_onSolve(state, space, stack) {
    stack.pop();
    state.status = 'solved';
    state.space = space; // is this so the solution can be read from it?
    state.more = stack.length > 0;
} // end of src/search.js
// from: src/solver.js
//
// It is extended by path_solver
/**
 * This is a super class.
 * It is extended by PathSolver in a private project
 *
 * @type {Solver}
 */
var Solver = function() {
    /**
     * @param {Object} options = {}
     * @property {string} [options.distribute='naive']
     * @property {number[]} [options.defaultDomain=[0,1]]
     * @property {Object} [options.searchDefaults]
     * @property {$config} [options.config=config_create()]
     */
    function Solver() {
        var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
        _classCallCheck(this, Solver);
        this._class = 'solver';
        this.distribute = options.distribute || 'naive';
        var config = options.config || config_create();
        this.config = config;
        if (config.initial_domains) {
            var initialDomains = config.initial_domains;
            for (var i = 0, len = initialDomains.length; i < len; ++i) {
                if (initialDomains[i] instanceof Array) initialDomains[i] = domain_arrToStr(initialDomains[i]);
            }
        }
        if (config._propagators) config._propagators = undefined; // will be regenerated
        if (config._varToPropagators) config._varToPropagators = undefined; // will be regenerated
        this.defaultDomain = options.defaultDomain || domain_createRange(0, 1);
        this.vars = {
            byId: {},
            byName: {},
            all: [],
            byClass: {},
            root: undefined
        };
        this.solutions = [];
        this.state = {
            space: null,
            more: false
        };
        this._prepared = false;
    }
    /**
     * @deprecated; use Solver#num() instead
     * @param {number} num
     * @returns {string}
     */
    _createClass(Solver, [{
        key: 'constant',
        value: function constant(num) {
                if (num === false) {
                    num = 0;
                }
                if (num === true) {
                    num = 1;
                }
                return this.num(num);
            }
            /**
             * Returns an anonymous var with given value as lo/hi for the domain
             *
             * @param {number} num
             * @returns {number}
             */
    }, {
        key: 'num',
        value: function num(_num) {
                if (typeof _num !== 'number') {
                    THROW('Solver#num: expecting a number, got ' + _num + ' (a ' + (typeof _num === 'undefined' ? 'undefined' : _typeof(_num)) + ')');
                }
                if (isNaN(_num)) {
                    THROW('Solver#num: expecting a number, got NaN');
                }
                var varIndex = config_addVarAnonConstant(this.config, _num);
                return this.config.all_var_names[varIndex];
            }
            /**
             * @param {Array} vs
             */
    }, {
        key: 'addVars',
        value: function addVars(vs) {
                ASSERT(vs instanceof Array, 'Expecting array', vs);
                for (var i = 0; i < vs.length; i++) {
                    var v = vs[i];
                    this.addVar(v);
                }
            }
            /**
             * @param {string} id
             * @param {$domain_arr|number} [domainOrValue=this.defaultDomain] Note: if number, it is a constant (so [domain,domain]) not a $domain_num!
             * @returns {string}
             */
    }, {
        key: 'decl',
        value: function decl(id, domainOrValue) {
                ASSERT(id && typeof id === 'string', 'EXPECTING_ID_STRING');
                var domain = void 0;
                if (typeof domainOrValue === 'number') domain = [domainOrValue, domainOrValue]; // just normalize it here.
                else domain = domainOrValue;
                if (!domain) {
                    domain = domain_any_clone(this.defaultDomain, FORCE_ARRAY);
                }
                ASSERT(domain instanceof Array, 'DOMAIN_SHOULD_BE_ARRAY', domain, domainOrValue);
                if (domain_any_isRejected(domain)) THROW('EMPTY_DOMAIN_NOT_ALLOWED');
                domain = domain_validateLegacyArray(domain);
                var varIndex = config_addVarDomain(this.config, id, domain);
                ASSERT(this.config.all_var_names[varIndex] === id, 'SHOULD_USE_ID_AS_IS');
                return id;
            }
            /**
             * Uses @defaultDomain if no domain was given
             * If domain is a number it becomes [dom, dom]
             * Distribution is optional
             * Name is used to create a `byName` hash
             *
             * @example
             *
             * S.addVar 'foo'
             * S.addVar 'foo', [1, 2]
             * S.addVar {id: '12', name: 'foo', domain: [1, 2]}
             * S.addVar {id: 'foo', domain: [1, 2]}
             * S.addVar {id: 'foo', domain: [1, 2], distribution: 'markov'}
             *
             * @param varOptions
             * @param [domain=v.domain] Note: this cannot be a "small domain"! Numbers are interpreted to be constants in Solver
             * @returns {*}
             */
    }, {
        key: 'addVar',
        value: function addVar(varOptions, domain) {
                if (typeof varOptions === 'string') {
                    ASSERT(typeof domain !== 'number', 'FOR_SANITY_REASON_NUMBERS_NOT_ALLOWED_HERE'); // because is it a small domain or a constant? exactly. always an array in this function.
                    if (domain === undefined) domain = domain_any_clone(this.defaultDomain, FORCE_ARRAY);
                    ASSERT(domain, 'NO_EMPTY_DOMAIN', domain);
                    domain = domain_validateLegacyArray(domain);
                    config_addVarDomain(this.config, varOptions, domain);
                    return varOptions;
                } // the rest is mostly legacy stuff that should move to multiverse's pathsolver subclass
                ASSERT(!(varOptions instanceof Array), 'Not expecting to receive an array', varOptions);
                ASSERT((typeof varOptions === 'undefined' ? 'undefined' : _typeof(varOptions)) === 'object', 'v should be an id or an object containing meta');
                domain = varOptions.domain;
                ASSERT(domain === undefined || domain instanceof Array, 'ARRAY_DOMAIN_OR_DEFAULT');
                if (domain) {
                    domain = domain_validateLegacyArray(domain);
                    ASSERT(domain instanceof Array, 'SHOULD_NOT_TURN_THIS_INTO_NUMBER');
                } else {
                    domain = domain_any_clone(this.defaultDomain, FORCE_ARRAY);
                }
                var id = varOptions.id;
                if (!id) THROW('Solver#addVar: requires id');
                config_addVarDomain(this.config, id, domain);
                if (varOptions.distributeOptions && varOptions.distributeOptions.valtype === 'markov') {
                    var matrix = varOptions.distributeOptions.matrix;
                    if (!matrix) {
                        if (varOptions.distributeOptions.expandVectorsWith) {
                            matrix = varOptions.distributeOptions.matrix = [{
                                vector: []
                            }];
                        } else {
                            THROW('Solver#addVar: markov distribution requires SolverVar ' + JSON.stringify(varOptions) + ' w/ distributeOptions:{matrix:[]}');
                        }
                    }
                    for (var i = 0; i < matrix.length; ++i) {
                        var row = matrix[i];
                        var boolFunc = row.boolean;
                        if (typeof boolFunc === 'function') {
                            row.booleanId = boolFunc(this, varOptions);
                        } else if (typeof boolFunc === 'string') {
                            row.booleanId = boolFunc;
                        } else {
                            ASSERT(!boolFunc, 'row.boolean should be a function returning a var name or just a var name');
                        }
                    }
                } // the rest is this.vars stuff for multiverse...
                var vars = this.vars;
                if (vars.byId[id]) THROW('Solver#addVar: var.id already added: ' + id);
                vars.byId[id] = varOptions;
                vars.all.push(varOptions);
                var name = varOptions.name;
                if (name != null) {
                    if (vars.byName[name] == null) {
                        vars.byName[name] = [];
                    }
                    vars.byName[name].push(varOptions);
                }
                return varOptions;
            } // Arithmetic Propagators
    }, {
        key: '+',
        value: function _(e1, e2, resultVar) {
            return this.plus(e1, e2, resultVar);
        }
    }, {
        key: 'plus',
        value: function plus(e1, e2, resultVar) {
            return config_addConstraint(this.config, 'plus', [GET_NAME(e1), GET_NAME(e2), resultVar && GET_NAME(resultVar)]);
        }
    }, {
        key: '-',
        value: function _(e1, e2, resultVar) {
            return this.min(e1, e2, resultVar);
        }
    }, {
        key: 'minus',
        value: function minus(e1, e2, resultVar) {
            return this.min(e1, e2, resultVar);
        }
    }, {
        key: 'min',
        value: function min(e1, e2, resultVar) {
            return config_addConstraint(this.config, 'min', [GET_NAME(e1), GET_NAME(e2), resultVar && GET_NAME(resultVar)]);
        }
    }, {
        key: '*',
        value: function _(e1, e2, resultVar) {
            return this.ring_mul(e1, e2, resultVar);
        }
    }, {
        key: 'times',
        value: function times(e1, e2, resultVar) { // deprecated
            return this.ring_mul(e1, e2, resultVar);
        }
    }, {
        key: 'ring_mul',
        value: function ring_mul(e1, e2, resultVar) {
            return config_addConstraint(this.config, 'ring-mul', [GET_NAME(e1), GET_NAME(e2), resultVar && GET_NAME(resultVar)]);
        }
    }, {
        key: '/',
        value: function _(e1, e2, resultVar) {
            return this.div(e1, e2, resultVar);
        }
    }, {
        key: 'div',
        value: function div(e1, e2, resultVar) {
            return config_addConstraint(this.config, 'ring-div', [GET_NAME(e1), GET_NAME(e2), resultVar && GET_NAME(resultVar)]);
        }
    }, {
        key: 'mul',
        value: function mul(e1, e2, resultVar) {
            return config_addConstraint(this.config, 'mul', [GET_NAME(e1), GET_NAME(e2), resultVar && GET_NAME(resultVar)]);
        }
    }, {
        key: '∑',
        value: function _(es, resultVar) {
            return this.sum(es, resultVar);
        }
    }, {
        key: 'sum',
        value: function sum(es, resultVar) {
            return config_addConstraint(this.config, 'sum', GET_NAMES(es), resultVar && GET_NAME(resultVar));
        }
    }, {
        key: '∏',
        value: function _(es, resultVar) {
            return this.product(es, resultVar);
        }
    }, {
        key: 'product',
        value: function product(es, resultVar) {
                return config_addConstraint(this.config, 'product', GET_NAMES(es), resultVar && GET_NAME(resultVar));
            } // TODO
            // times_plus    k1*v1 + k2*v2
            // wsum          ∑ k*v
            // scale         k*v
            // (In)equality Propagators
            // only first expression can be array
    }, {
        key: '{}≠',
        value: function _(es) {
            this.distinct(es);
        }
    }, {
        key: 'distinct',
        value: function distinct(es) {
            config_addConstraint(this.config, 'distinct', GET_NAMES(es));
        }
    }, {
        key: '==',
        value: function _(e1, e2) {
            return this.eq(e1, e2);
        }
    }, {
        key: 'eq',
        value: function eq(e1, e2) {
            return config_addConstraint(this.config, 'eq', [GET_NAME(e1), GET_NAME(e2)]);
        }
    }, {
        key: '!=',
        value: function _(e1, e2) {
            return this.neq(e1, e2);
        }
    }, {
        key: 'neq',
        value: function neq(e1, e2) {
            return config_addConstraint(this.config, 'neq', [GET_NAME(e1), GET_NAME(e2)]);
        }
    }, {
        key: '>=',
        value: function _(e1, e2) {
            return this.gte(e1, e2);
        }
    }, {
        key: 'gte',
        value: function gte(e1, e2) {
            ASSERT(!(e1 instanceof Array), 'NOT_ACCEPTING_ARRAYS');
            return config_addConstraint(this.config, 'gte', [GET_NAME(e1), GET_NAME(e2)]);
        }
    }, {
        key: '<=',
        value: function _(e1, e2) {
            return this.lte(e1, e2);
        }
    }, {
        key: 'lte',
        value: function lte(e1, e2) {
            ASSERT(!(e1 instanceof Array), 'NOT_ACCEPTING_ARRAYS');
            return config_addConstraint(this.config, 'lte', [GET_NAME(e1), GET_NAME(e2)]);
        }
    }, {
        key: '>',
        value: function _(e1, e2) {
            return this.gt(e1, e2);
        }
    }, {
        key: 'gt',
        value: function gt(e1, e2) {
            ASSERT(!(e1 instanceof Array), 'NOT_ACCEPTING_ARRAYS');
            return config_addConstraint(this.config, 'gt', [GET_NAME(e1), GET_NAME(e2)]);
        }
    }, {
        key: '<',
        value: function _(e1, e2) {
            return this.lt(e1, e2);
        }
    }, {
        key: 'lt',
        value: function lt(e1, e2) {
                ASSERT(!(e1 instanceof Array), 'NOT_ACCEPTING_ARRAYS');
                return config_addConstraint(this.config, 'lt', [GET_NAME(e1), GET_NAME(e2)]);
            } // Conditions, ie Reified (In)equality Propagators
    }, {
        key: '_cacheReified',
        value: function _cacheReified(op, e1, e2, boolVar) {
            return config_addConstraint(this.config, 'reifier', [GET_NAME(e1), GET_NAME(e2), boolVar && GET_NAME(boolVar)], op);
        }
    }, {
        key: '!=?',
        value: function _(e1, e2, boolVar) {
            return this.isNeq(e1, e2, boolVar);
        }
    }, {
        key: 'isNeq',
        value: function isNeq(e1, e2, boolVar) {
            return this._cacheReified('neq', e1, e2, boolVar);
        }
    }, {
        key: '==?',
        value: function _(e1, e2, boolVar) {
            return this.isEq(e1, e2, boolVar);
        }
    }, {
        key: 'isEq',
        value: function isEq(e1, e2, boolVar) {
            return this._cacheReified('eq', e1, e2, boolVar);
        }
    }, {
        key: '>=?',
        value: function _(e1, e2, boolVar) {
            return this.isGte(e1, e2, boolVar);
        }
    }, {
        key: 'isGte',
        value: function isGte(e1, e2, boolVar) {
            return this._cacheReified('gte', e1, e2, boolVar);
        }
    }, {
        key: '<=?',
        value: function _(e1, e2, boolVar) {
            return this.isLte(e1, e2, boolVar);
        }
    }, {
        key: 'isLte',
        value: function isLte(e1, e2, boolVar) {
            return this._cacheReified('lte', e1, e2, boolVar);
        }
    }, {
        key: '>?',
        value: function _(e1, e2, boolVar) {
            return this.isGt(e1, e2, boolVar);
        }
    }, {
        key: 'isGt',
        value: function isGt(e1, e2, boolVar) {
            return this._cacheReified('gt', e1, e2, boolVar);
        }
    }, {
        key: '<?',
        value: function _(e1, e2, boolVar) {
            return this.isLt(e1, e2, boolVar);
        }
    }, {
        key: 'isLt',
        value: function isLt(e1, e2, boolVar) {
                return this._cacheReified('lt', e1, e2, boolVar);
            } // Various rest
            /**
             * Solve this solver. It should be setup with all the constraints.
             *
             * @param {Object} options
             * @property {number} [options.max=1000]
             * @property {number} [options.log=LOG_NONE] Logging level; one of: 0, 1 or 2 (see LOG_* constants)
             * @property {string|Array.<string|Bvar>} options.vars Target branch vars or var names to force solve. Defaults to all.
             * @property {string|Object} [options.distribute='naive'] Maps to FD.distribution.value, see config_setOptions
             * @property {boolean} [_debug] A more human readable print of the configuration for this solver
             * @property {boolean} [_debugConfig] Log out solver.config after prepare() but before run()
             * @property {boolean} [_debugSpace] Log out solver._space after prepare() but before run(). Only works in dev code (stripped from dist)
             * @property {boolean} [_debugSolver] Call solver._debugSolver() after prepare() but before run()
             * @return {Object[]}
             */
    }, {
        key: 'solve',
        value: function solve() {
                var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
                var log = options.log === undefined ? LOG_NONE : options.log;
                var max = options.max || 1000;
                this._prepare(options, log);
                if (options._debug) this._debugLegible();
                if (options._debugConfig) this._debugConfig(); // __REMOVE_BELOW_FOR_DIST__
                if (options._debugSpace) console.log('## _debugSpace:\n', getInspector()(this._space)); // __REMOVE_ABOVE_FOR_DIST__
                if (options._debugSolver) this._debugSolver();
                this._run(max, log);
                return this.solutions;
            }
            /**
             * Prepare internal configuration before actually solving
             * Collects one-time config data and sets up defaults
             *
             * @param {Object} [options={}] See @solve
             * @param {number} log One of the LOG_* constants
             */
    }, {
        key: '_prepare',
        value: function _prepare(options, log) {
                ASSERT(log === undefined || log >= LOG_MIN && log <= LOG_MAX, 'log level should be a valid value or be undefined (in tests)');
                if (log >= LOG_STATS) {
                    console.log('      - FD Preparing...');
                    console.time('      - FD Prepare Time');
                }
                var config = this.config; // TODO: cant move this to addVar yet because mv can alter these settings after the addVar call
                var allVars = config.all_var_names;
                for (var i = 0; i < allVars.length; ++i) {
                    var name = allVars[i];
                    var bvar = this.vars.byId[name];
                    if (bvar) solver_varDistOptions(name, bvar, config);
                } // TODO: deal with the GET_NAMES bit at callsites, only allow string[] for .vars here. and do rename .vars as well.
                if (options.vars && options.vars !== 'all') config_setOption(config, 'targeted_var_names', GET_NAMES(options.vars));
                var distributionSettings = options.distribute || this.distribute;
                if (typeof distributionSettings === 'string') config_setDefaults(config, distributionSettings);
                else config_setOptions(config, distributionSettings); // TOFIX: get rid of this in mv
                // create the root node of the search tree (each node is a Space)
                var rootSpace = space_createFromConfig(config); // __REMOVE_BELOW_FOR_DIST__
                this._space = rootSpace; // only exposed for easy access in tests, and so only available after .prepare()
                // __REMOVE_ABOVE_FOR_DIST__
                this.state.space = rootSpace;
                this.state.more = true;
                this.state.stack = [];
                this._prepared = true;
                if (log >= LOG_STATS) console.timeEnd('      - FD Prepare Time');
            }
            /**
             * Run the solver. You should call @_prepare before calling this function.
             *
             * @param {number} max Hard stop the solver when this many solutions have been found
             * @param {number} log One of the LOG_* constants
             * @param {boolean} [squash] If squashed, dont get the actual solutions. They are irrelevant for perf tests.
             */
    }, {
        key: '_run',
        value: function _run(max, log, squash) {
                ASSERT(typeof max === 'number', 'max should be a number');
                ASSERT(log >= LOG_MIN && log <= LOG_MAX, 'log level should be a valid value');
                ASSERT(this._prepared, 'must run #prepare before #run');
                this._prepared = false;
                var state = this.state;
                ASSERT(state);
                if (log >= LOG_STATS) {
                    console.log('      - FD Var Count: ' + this.config.all_var_names.length);
                    console.log('      - FD Constraint Count: ' + this.config.all_constraints.length);
                    console.log('      - FD Propagator Count: ' + this.config._propagators.length);
                    console.log('      - FD Solving...');
                    console.time('      - FD Solving Time');
                    ASSERT(!void console.log('      - FD stats: called propagate(): ' + this.config._propagates + 'x'));
                }
                var alreadyRejected = false;
                var vardoms = state.space.vardoms;
                for (var i = 0, n = vardoms.length; i < n; ++i) {
                    if (vardoms[i] === EMPTY) {
                        alreadyRejected = true;
                        break;
                    }
                }
                var solvedSpaces = void 0;
                if (alreadyRejected) {
                    solvedSpaces = [];
                } else {
                    solvedSpaces = solver_runLoop(state, this.config, max);
                }
                if (log >= LOG_STATS) {
                    console.timeEnd('      - FD Solving Time');
                    console.log('      - FD Solutions: ' + solvedSpaces.length);
                }
                if (!squash) solver_getSolutions(solvedSpaces, this.config, this.solutions, log);
            }
            /**
             * Exposes internal method config_addVar for subclass
             * (Used by PathSolver in a private project)
             *
             * @public
             * @param {string} id
             * @param {number} lo
             * @param {number} hi
             * @returns {string}
             */
    }, {
        key: 'space_add_var_range',
        value: function space_add_var_range(id, lo, hi) {
                var varIndex = config_addVarRange(this.config, id, lo, hi);
                ASSERT(this.config.all_var_names[varIndex] === id, 'SHOULD_USE_ID_AS_IS');
                return id;
            }
            /**
             * Exposes internal method domain_fromList for subclass
             * (Used by PathSolver in a private project)
             * It will always create an array, never a "small domain"
             * (number that is bit-wise flags) because that should be
             * kept an internal finitedomain artifact.
             *
             * @param {number[]} list
             * @returns {number[]}
             */
    }, {
        key: 'domain_fromList',
        value: function domain_fromList(list) {
                return domain_toArr(_domain_fromList(list));
            }
            /**
             * Used by PathSolver in another (private) project
             * Exposes domain_max
             *
             * @param {$domain} domain
             * @returns {number} If negative, search failed. Note: external dep also depends on that being negative.
             */
    }, {
        key: 'domain_max',
        value: function domain_max(domain) {
                if (domain_any_isRejected(domain)) return NO_SUCH_VALUE;
                return domain_any_max(domain);
            }
            /**
             * Used by PathSolver in another (private) project
             * Exposes domain_toList
             * TODO: can we lock this down to a $domain_arr ?
             *
             * @param {$domain} domain
             * @returns {number[]}
             */
    }, {
        key: 'domain_toList',
        value: function domain_toList(domain) {
                return domain_any_toList(domain);
            }
            /**
             * Expose a method to normalize the internal representation
             * of a domain to always return an array representation
             *
             * @param {$space} space
             * @param {number} varIndex
             * @returns {$domain_arr}
             */
    }, {
        key: 'getDomain',
        value: function getDomain(space, varIndex) {
                return domain_toArr(space.vardoms[varIndex]);
            }
            /**
             * @returns {Solver}
             */
    }, {
        key: 'branch_from_current_solution',
        value: function branch_from_current_solution() { // get the _solved_ space, convert to config,
                // use new config as base for new solver
                var solvedConfig = space_toConfig(this.state.space, this.config);
                return new Solver({
                    config: solvedConfig
                });
            }
            /**
             * Set a search option for this solver
             *
             * @param {string} optionName
             * @param {*} value
             * @param {string} [target] Certain options target specific var names
             */
    }, {
        key: 'setOption',
        value: function setOption(optionName, value, target) {
            config_setOption(this.config, optionName, value, target);
        }
    }, {
        key: '_debugLegible',
        value: function _debugLegible() {
            var clone = JSON.parse(JSON.stringify(this.config)); // prefer this over config_clone, just in case.
            var names = clone.all_var_names;
            var targeted = clone.targetedVars;
            var constraints = clone.all_constraints;
            var domains = clone.initial_domains;
            var propagators = clone._propagators;
            clone.all_var_names = '<removed>';
            clone.all_constraints = '<removed>';
            clone.initial_domains = '<removed>';
            clone.initial_domains = '<removed>';
            if (targeted !== 'all') clone.targetedVars = '<removed>';
            clone._propagators = '<removed>';
            clone._varToPropagators = '<removed>';
            clone._var_names_trie = '<removed>';
            console.log('\n## _debug:\n');
            console.log('- config:');
            console.log(getInspector()(clone));
            console.log('- vars (' + names.length + '):');
            console.log(names.map(function(name, index) {
                return index + ': [' + domain_toArr(domains[index]) + '] ' + (name === String(index) ? '' : ' // ' + name);
            }).join('\n'));
            if (targeted !== 'all') {
                console.log('- targeted vars (' + targeted.length + '): ' + targeted.join(', '));
            }
            console.log('- constraints (' + constraints.length + ' -> ' + propagators.length + '):');
            console.log(constraints.map(function(c, index) {
                if (c.param === undefined) {
                    return index + ': ' + c.name + '(' + c.varIndexes + ')      --->  ' + c.varIndexes.map(function(index) {
                        return JSON.stringify(domains[index]);
                    }).join(',  ');
                } else if (c.name === 'reifier') {
                    return index + ': ' + c.name + '[' + c.param + '](' + c.varIndexes + ')      --->  ' + JSON.stringify(domains[c.varIndexes[0]]) + ' ' + c.param + ' ' + JSON.stringify(domains[c.varIndexes[1]]) + ' = ' + JSON.stringify(domains[c.varIndexes[2]]);
                } else {
                    return index + ': ' + c.name + '(' + c.varIndexes + ') = ' + c.param + '      --->  ' + c.varIndexes.map(function(index) {
                        return JSON.stringify(domains[index]);
                    }).join(',  ') + ' -> ' + JSON.stringify(domains[c.param]);
                }
            }).join('\n'));
            console.log('##/\n');
        }
    }, {
        key: '_debugSolver',
        value: function _debugSolver() {
            console.log('## _debugSolver:\n');
            var inspect = getInspector();
            var config = this.config;
            console.log('# Config:');
            console.log(inspect(_clone(config)));
            var names = config.all_var_names;
            console.log('# Variables (' + names.length + 'x):');
            console.log('  index name domain toArr');
            for (var varIndex = 0; varIndex < names.length; ++varIndex) {
                console.log('  ', varIndex, ':', names[varIndex], ':', config.initial_domains[varIndex], '(= [' + domain_toArr(config.initial_domains[varIndex]) + '])');
            }
            var constraints = config.all_constraints;
            console.log('# Constraints (' + constraints.length + 'x):');
            console.log('  index name vars param');
            for (var i = 0; i < constraints.length; ++i) {
                console.log('  ', i, ':', constraints[i].name, ':', constraints[i].varIndexes.join(','), ':', constraints[i].param);
            }
            var propagators = config._propagators;
            console.log('# Propagators (' + propagators.length + 'x):');
            console.log('  index name vars args');
            for (var _i6 = 0; _i6 < propagators.length; ++_i6) {
                console.log('  ', _i6, ':', propagators[_i6].name, ':', propagators[_i6].index1, propagators[_i6].index2, propagators[_i6].index3, ':', propagators[_i6].arg1, propagators[_i6].arg2);
            }
            console.log('##');
        }
    }, {
        key: '_debugConfig',
        value: function _debugConfig() {
            var config = _clone(this.config);
            config.initial_domains = config.initial_domains.map(domain_toArr);
            console.log('## _debugConfig:\n', getInspector()(config));
        }
    }]);
    return Solver;
}();
/**
 * Deep clone given object for debugging purposes (only)
 * Revise if used for anything concrete
 *
 * @param {*} value
 * @returns {*}
 */
function _clone(value) {
    switch (typeof value === 'undefined' ? 'undefined' : _typeof(value)) {
        case 'object':
            if (!value) return null;
            if (value instanceof Array) {
                return value.map(function(v) {
                    return _clone(v);
                });
            }
            var _obj2 = {};
            for (var key in value) {
                _obj2[key] = _clone(value[key]);
            }
            return _obj2;
        case 'function':
            var fobj = {
                __THIS_IS_A_FUNCTION: 1,
                __source: value.toString()
            };
            for (var _key2 in value) {
                fobj[_key2] = _clone(value[_key2]);
            }
            return fobj;
        case 'string':
        case 'number':
        case 'boolean':
        case 'undefined':
            return value;
    }
    THROW('config value what?', value);
}
var inspectorCache = void 0;

function getInspector() {
    if (!inspectorCache) {
        inspectorCache = typeof require === 'function' ? function(arg) {
            return require('util').inspect(arg, false, null);
        } : function(o) {
            return o;
        };
    }
    return inspectorCache;
}
/**
 * This is the core search loop. Supports multiple solves although you
 * probably only need one solution. Won't return more solutions than max.
 *
 * @param {Object} state
 * @param {$config} config
 * @param {number} max Stop after finding this many solutions
 * @returns {$space[]} All solved spaces that were found (until max or end was reached)
 */
function solver_runLoop(state, config, max) {
    var list = [];
    while (state.more && list.length < max) {
        search_depthFirst(state, config);
        if (state.status !== 'end') {
            list.push(state.space);
        }
    }
    return list;
}

function solver_varDistOptions(name, bvar, config) {
    var options = bvar.distributeOptions;
    if (options) { // TOFIX: change usages of .distribute as a string with valtype
        if (bvar.distribute) options.valtype = bvar.distribute;
        config_setOption(config, 'varStratOverride', options, name);
        if (options.valtype === 'markov') {
            config_addConstraint(config, 'markov', [name]);
        }
    }
}

function solver_getSolutions(solvedSpaces, config, solutions, log) {
    ASSERT(solutions instanceof Array);
    if (log >= LOG_STATS) {
        console.time('      - FD Solution Construction Time');
    }
    for (var i = 0; i < solvedSpaces.length; ++i) {
        var solution = space_solution(solvedSpaces[i], config);
        solutions.push(solution);
        if (log >= LOG_SOLVES) {
            console.log('      - FD solution() ::::::::::::::::::::::::::::');
            console.log(JSON.stringify(solution));
            console.log('                      ::::::::::::::::::::::::::::');
        }
    }
    if (log >= LOG_STATS) {
        console.timeEnd('      - FD Solution Construction Time');
    }
} // end of src/solver.js
// from: src/space.js
var space_uid = 0;
/**
 * @returns {$space}
 */
function space_createRoot() { // only for debugging
    var _depth = 0;
    var _child = 0;
    var _path = '';
    ASSERT(!(space_uid = 0));
    return space_createNew([], 0, _depth, _child, _path);
}
/**
 * @param {$config} config
 * @returns {$space}
 */
function space_createFromConfig(config) {
    ASSERT(config._class === '$config', 'EXPECTING_CONFIG');
    var space = space_createRoot();
    space_initFromConfig(space, config);
    return space;
}
/**
 * Create a space node that is a child of given space node
 *
 * @param {$space} space
 * @returns {$space}
 */
function space_createClone(space) {
    ASSERT(space._class === '$space', 'SPACE_SHOULD_BE_SPACE');
    var vardomsCopy = space.vardoms.slice(0);
    var frontNodeIndex = space.frontNodeIndex; // only for debugging
    var _depth = void 0;
    var _child = void 0;
    var _path = void 0; // do it inside ASSERTs so they are eliminated in the dist
    ASSERT(!void(_depth = space._depth + 1));
    ASSERT(!void(_child = space._child_count++));
    ASSERT(!void(_path = space._path));
    return space_createNew(vardomsCopy, frontNodeIndex, _depth, _child, _path);
}
/**
 * Create a new config with the configuration of the given Space
 * Basically clones its config but updates the `initial_domains` with fresh state
 *
 * @param {$space} space
 * @param {$config} config
 * @returns {$space}
 */
function space_toConfig(space, config) {
    ASSERT(space._class === '$space', 'SPACE_SHOULD_BE_SPACE');
    ASSERT(config._class === '$config', 'EXPECTING_CONFIG');
    var vardoms = space.vardoms;
    var newDomains = [];
    var names = config.all_var_names;
    for (var i = 0, n = names.length; i < n; i++) {
        var domain = vardoms[i];
        newDomains[i] = domain_any_clone(domain, FORCE_STRING);
    }
    return config_clone(config, newDomains);
}
/**
 * Concept of a space that holds config, some named domains (referred to as "vars"), and some propagators
 *
 * @param {$domain[]} vardoms Maps 1:1 to config.all_var_names
 * @param {number} frontNodeIndex
 * @param {number} _depth
 * @param {number} _child
 * @param {string} _path
 * @returns {$space}
 */
function space_createNew(vardoms, frontNodeIndex, _depth, _child, _path) {
    ASSERT((typeof vardoms === 'undefined' ? 'undefined' : _typeof(vardoms)) === 'object' && vardoms, 'vars should be an object', vardoms);
    var space = {
        _class: '$space',
        vardoms: vardoms,
        frontNodeIndex: frontNodeIndex,
        next_distribution_choice: 0,
        updatedVarIndex: -1
    }; // search graph metrics
    // debug only. do it inside ASSERT so they are stripped in the dist
    ASSERT(!void(space._depth = _depth));
    ASSERT(!void(space._child = _child));
    ASSERT(!void(space._child_count = 0));
    ASSERT(!void(space._path = _path + _child));
    ASSERT(!void(space._uid = ++space_uid));
    return space;
}
/**
 * @param {$space} space
 * @param {$config} config
 */
function space_initFromConfig(space, config) {
    ASSERT(space._class === '$space', 'EXPECTING_SPACE');
    ASSERT(config._class === '$config', 'EXPECTING_CONFIG');
    config_initForSpace(config, space);
    initializeUnsolvedVars(space, config);
}
/**
 * Return the current number of unsolved vars for given space.
 * Due to the nature of how we use a $front this is not reliable
 * retroactively.
 * This is only used for testing, prevents leaking internals into tests
 *
 * @param {$space} space
 * @param {$config} config
 * @returns {number}
 */
function space_getUnsolvedVarCount(space, config) {
    ASSERT(space._class === '$space', 'EXPECTING_SPACE');
    ASSERT(config._class === '$config', 'EXPECTING_CONFIG');
    return front_getSizeOf(config._front, space.frontNodeIndex);
}
/**
 * Only use this for testing or debugging as it creates a fresh array
 * for the result. We don't use the names internally, anyways.
 *
 * @param {$space} space
 * @param {$config} config
 * @returns {string[]} var names of all unsolved vars of given space
 */
function _space_getUnsolvedVarNamesFresh(space, config) {
    ASSERT(space._class === '$space', 'EXPECTING_SPACE');
    ASSERT(config._class === '$config', 'EXPECTING_CONFIG');
    var nodeIndex = space.frontNodeIndex; // fugly! :)
    var buf = config._front.buffer;
    var sub = [].slice.call(buf, nodeIndex + 1, nodeIndex + 1 + buf[nodeIndex]); // or .subArray() or something like that... or even toArray?
    return sub.map(function(index) {
        return config.all_var_names[index];
    });
}
/**
 * Initialized the front with unsolved variables. These are either the explicitly
 * targeted variables, or any unsolved variables if none were explicitly targeted.
 *
 * @param {$space} space
 * @param {$config} config
 */
function initializeUnsolvedVars(space, config) {
    ASSERT(space._class === '$space', 'EXPECTING_SPACE');
    ASSERT(config._class === '$config', 'EXPECTING_CONFIG');
    var targetVarNames = config.targetedVars;
    var vardoms = space.vardoms;
    var unsolvedFront = config._front;
    var nodeIndexStart = space.frontNodeIndex;
    var cellIndex = 0;
    if (targetVarNames === 'all') {
        for (var varIndex = 0, n = vardoms.length; varIndex < n; ++varIndex) {
            if (!domain_any_isSolved(vardoms[varIndex])) {
                if (config._varToPropagators[varIndex] || config._constrainedAway && config._constrainedAway.indexOf(varIndex) >= 0) {
                    front_addCell(unsolvedFront, nodeIndexStart, cellIndex++, varIndex);
                }
            }
        }
    } else {
        var varNamesTrie = config._var_names_trie;
        for (var i = 0, _n6 = targetVarNames.length; i < _n6; ++i) {
            var varName = targetVarNames[i];
            var _varIndex6 = trie_get(varNamesTrie, varName);
            if (_varIndex6 === TRIE_KEY_NOT_FOUND) THROW('E_TARGETED_VARS_SHOULD_EXIST_NOW');
            if (!domain_any_isSolved(vardoms[_varIndex6])) {
                front_addCell(unsolvedFront, nodeIndexStart, cellIndex++, _varIndex6);
            }
        }
    }
    front_setSizeOf(unsolvedFront, nodeIndexStart, cellIndex);
}
/**
 * Run all the propagators until stability point.
 * Returns true if any propagator rejects.
 *
 * @param {$space} space
 * @param {$config} config
 * @returns {boolean} when true, a propagator rejects and the (current path to a) solution is invalid
 */
function space_propagate(space, config) {
    ASSERT(space._class === '$space', 'EXPECTING_SPACE');
    ASSERT(config._class === '$config', 'EXPECTING_CONFIG');
    ASSERT(!void(config._propagates = (config._propagates | 0) + 1), 'number of calls to space_propagate');
    var propagators = config._propagators; // "cycle" is one step, "epoch" all steps until stable (but not solved per se)
    var cycles = config._propagationCycles;
    var changedTrie = config._changedVarsTrie; // track changed vars per cycle, epoch. persists across propagate calls for efficiency reasons.
    ASSERT(typeof cycles === 'number', 'cycles is a number?');
    ASSERT(changedTrie._class === '$trie', 'trie is a trie?');
    var changedVars = []; // in one cycle
    var minimal = 1;
    if (space.updatedVarIndex >= 0) {
        changedVars.push(space.updatedVarIndex);
    } else { // very first cycle of first epoch of the search. all propagators must be visited at least once now.
        var rejected = space_propagateAll(space, config, propagators, changedVars, changedTrie, ++cycles); // TODO: why can this trigger multiple times per single solve? :/
        if (rejected) {
            config._propagationCycles = cycles;
            return true;
        }
    }
    if (space_abortSearch(space, config)) {
        config._propagationCycles = cycles;
        return true;
    }
    var returnValue = false;
    while (changedVars.length) {
        var newChangedVars = [];
        var _rejected = space_propagateChanges(space, config, propagators, minimal, changedVars, newChangedVars, changedTrie, ++cycles);
        if (_rejected) {
            returnValue = true;
            break;
        }
        if (space_abortSearch(space, config)) {
            returnValue = true;
            break;
        }
        changedVars = newChangedVars;
        minimal = 2; // see space_propagateChanges
    }
    config._propagationCycles = cycles;
    return returnValue;
}

function space_propagateAll(space, config, propagators, changedVars, changedTrie, cycleIndex) {
    for (var i = 0, n = propagators.length; i < n; i++) {
        var propagator = propagators[i];
        var rejected = space_propagateStep(space, config, propagator, changedVars, changedTrie, cycleIndex);
        if (rejected) return true;
    }
    return false;
}

function space_propagateByIndexes(space, config, propagators, propagatorIndexes, changedVars, changedTrie, cycleIndex) {
    for (var i = 0, n = propagatorIndexes.length; i < n; i++) {
        var propagatorIndex = propagatorIndexes[i];
        var propagator = propagators[propagatorIndex];
        var rejected = space_propagateStep(space, config, propagator, changedVars, changedTrie, cycleIndex);
        if (rejected) return true;
    }
    return false;
}

function space_propagateStep(space, config, propagator, changedVars, changedTrie, cycleIndex) {
    ASSERT(propagator._class === '$propagator', 'EXPECTING_PROPAGATOR');
    var vardoms = space.vardoms;
    var index1 = propagator.index1;
    var index2 = propagator.index2;
    var index3 = propagator.index3;
    ASSERT(index1 !== 'undefined', 'all props at least use the first var...');
    var domain1 = vardoms[index1];
    var domain2 = index2 !== undefined && vardoms[index2];
    var domain3 = index3 !== undefined && vardoms[index3];
    var stepper = propagator.stepper;
    ASSERT(typeof stepper === 'function', 'stepper should be a func'); // TODO: if we can get a "solved" state here we can prevent an isSolved check later...
    stepper(space, config, index1, index2, index3, propagator.arg1, propagator.arg2, propagator.arg3, propagator.arg4, propagator.arg5, propagator.arg6);
    if (domain1 !== vardoms[index1]) {
        if (vardoms[index1] === EMPTY) return true; // fail
        space_recordChange(index1, changedTrie, changedVars, cycleIndex);
    }
    if (index2 !== undefined && domain2 !== vardoms[index2]) {
        if (vardoms[index2] === EMPTY) return true; // fail
        space_recordChange(index2, changedTrie, changedVars, cycleIndex);
    }
    if (index3 !== undefined && domain3 !== vardoms[index3]) {
        if (vardoms[index3] === EMPTY) return true; // fail
        space_recordChange(index3, changedTrie, changedVars, cycleIndex);
    }
    return false;
}

function space_recordChange(varIndex, changedTrie, changedVars, cycleIndex) {
    if (typeof varIndex === 'number') {
        var status = trie_getNum(changedTrie, varIndex);
        if (status !== cycleIndex) {
            changedVars.push(varIndex);
            trie_addNum(changedTrie, varIndex, cycleIndex);
        }
    } else {
        ASSERT(varIndex instanceof Array, 'index1 is always used');
        for (var i = 0, len = varIndex.length; i < len; ++i) {
            space_recordChange(varIndex[i], changedTrie, changedVars, cycleIndex);
        }
    }
}

function space_propagateChanges(space, config, allPropagators, minimal, targetVars, changedVars, changedTrie, cycleIndex) {
    ASSERT(space._class === '$space', 'EXPECTING_SPACE');
    ASSERT(config._class === '$config', 'EXPECTING_CONFIG');
    var varToPropagators = config._varToPropagators;
    for (var i = 0, vlen = targetVars.length; i < vlen; i++) {
        var propagatorIndexes = varToPropagators[targetVars[i]]; // note: the first loop of propagate() should require all propagators affected, even if
        // it is just one. after that, if a var was updated that only has one propagator it can
        // only have been updated by that one propagator. however, this step is queueing up
        // propagators to check, again, since one of its vars changed. a propagator that runs
        // twice without other changes will change nothing. so we do it for the initial loop,
        // where the var is updated externally, after that the change can only occur from within
        // a propagator so we skip it.
        // ultimately a list of propagators should perform better but the indexOf negates that perf
        // (this doesn't affect a whole lot of vars... most of them touch multiple propas)
        if (propagatorIndexes && propagatorIndexes.length >= minimal) {
            var result = space_propagateByIndexes(space, config, allPropagators, propagatorIndexes, changedVars, changedTrie, cycleIndex);
            if (result) return true; // rejected
        }
    }
    return false;
}
/**
 * @param {$space} space
 * @param {$config} config
 * @returns {boolean}
 */
function space_abortSearch(space, config) {
    ASSERT(space._class === '$space', 'EXPECTING_SPACE');
    ASSERT(config._class === '$config', 'EXPECTING_CONFIG');
    var callback = config.timeout_callback;
    if (callback) {
        return callback(space);
    }
    return false;
}
/**
 * Returns true if this space is solved - i.e. when
 * all the vars in the space have a singleton domain.
 *
 * This is a *very* strong condition that might not need
 * to be satisfied for a space to be considered to be
 * solved. For example, the propagators may determine
 * ranges for all variables under which all conditions
 * are met and there would be no further need to enumerate
 * those solutions.
 *
 * @param {$space} space
 * @param {$config} config
 * @returns {boolean}
 */
function space_updateUnsolvedVarList(space, config) {
    ASSERT(space._class === '$space', 'EXPECTING_SPACE');
    ASSERT(config._class === '$config', 'EXPECTING_CONFIG');
    var vardoms = space.vardoms;
    var unsolvedFront = config._front;
    var lastNodeIndex = unsolvedFront.lastNodeIndex;
    var nodeIndex = front_addNode(unsolvedFront);
    space.frontNodeIndex = nodeIndex;
    var cellIndex = 0;
    for (var i = 0, n = _front_getSizeOf(unsolvedFront.buffer, lastNodeIndex); i < n; i++) {
        var varIndex = _front_getCell(unsolvedFront.buffer, lastNodeIndex, i);
        var domain = vardoms[varIndex];
        if (!domain_any_isSolved(domain)) {
            front_addCell(unsolvedFront, nodeIndex, cellIndex++, varIndex);
        }
    }
    front_setSizeOf(unsolvedFront, nodeIndex, cellIndex);
    return cellIndex === 0; // 0 unsolved means we've solved it :)
}
/**
 * Returns an object whose field names are the var names
 * and whose values are the solved values. The space *must*
 * be already in a solved state for this to work.
 *
 * @param {$space} space
 * @param {$config} config
 * @returns {Object}
 */
function space_solution(space, config) {
    ASSERT(space._class === '$space', 'EXPECTING_SPACE');
    ASSERT(config._class === '$config', 'EXPECTING_CONFIG');
    var allVarNames = config.all_var_names;
    var result = {};
    for (var varIndex = 0, n = allVarNames.length; varIndex < n; varIndex++) {
        var varName = allVarNames[varIndex];
        result[varName] = space_getVarSolveState(space, varIndex);
    }
    return result;
}
/**
 * Note: this is the (shared) second most called function of the library
 * (by a third of most, but still significantly more than the rest)
 *
 * @param {$space} space
 * @param {number} varIndex
 * @returns {number|number[]|boolean} The solve state for given var index, also put into result
 */
function space_getVarSolveState(space, varIndex) {
    ASSERT(typeof varIndex === 'number', 'VAR_SHOULD_BE_INDEX');
    var domain = space.vardoms[varIndex];
    if (domain === EMPTY) {
        return false;
    }
    var value = domain_any_getValue(domain);
    if (value !== NO_SUCH_VALUE) return value;
    return domain_toArr(domain);
}

function space_getDomainArr(space, varIndex) {
    return domain_toArr(space.vardoms[varIndex]);
}
/**
 * @param {$space} space
 * @param {$config} [config]
 * @param {boolean} [printPath]
 */
function _space_debug(space, config, printPath) {
    console.log('\n## Space:'); //__REMOVE_BELOW_FOR_ASSERTS__
    console.log('# Meta:');
    console.log('uid:', space._uid);
    console.log('depth:', space._depth);
    console.log('child:', space._child);
    console.log('children:', space._child_count);
    if (printPath) console.log('path:', space._path); //__REMOVE_ABOVE_FOR_ASSERTS__
    console.log('# Domains:');
    console.log(space.vardoms.map(domain_toArr).map(function(d, i) {
        return (d + '').padEnd(15, ' ') + (!config || config.all_var_names[i] === String(i) ? '' : ' (' + config.all_var_names[i] + ')');
    }).join('\n'));
    console.log('##\n');
} // end of src/space.js
// from: src/trie.js
var TRIE_ROOT_OFFSET = 0;
var TRIE_BUCKET_COUNT = 10; // 10 digits
var TRIE_NODE_SIZE = TRIE_BUCKET_COUNT + 1; // inc value
var TRIE_INITIAL_SIZE = 16 * 1024;
var TRIE_MINIMAL_GROWTH = 4 * 1024;
var TRIE_KEY_NOT_FOUND = -1;
var TRIE_EMPTY = undefined;
var TRIE_DEFAULT_SIZE = undefined;
var TRIE_8_BIT = 8;
var TRIE_16_BIT = 16;
var TRIE_32_BIT = 32;
var TRIE_64_BIT = 64;
var TRIE_DEFAULT_BITS = undefined; // every trie node needs space for 10 jumps + 1 leaf value (must be capable of containing `size(Trie)-1`) so initially 11 bytes, later 12 bytes and then 22 bytes once the number of nodes exceeds 255
/**
 * Create a new trie and, optionally, initialize it
 * with given values as keys and their index as value.
 * Check `trie_add` for assumed key composition restrictions
 *
 * @param {string[]} [valuesByIndex] If exists, adds all values in array as keys, index as values
 * @param {number} [initialLength] Hint to help control memory consumption for large/small tries. This length is in cells, not bytes. (byteLength=length*(bitsize/8))
 * @param {number} [initialBitsize] Hint to set bitsize explicitly. One of: 8 16 32 64
 * @returns {$trie}
 */
function trie_create(valuesByIndex, initialLength, initialBitsize) {
    var size = initialLength | 0 || TRIE_INITIAL_SIZE;
    if (!size) THROW('fixme'); // blabla it's possible the constant is not yet initialized due to minification. dont initialize a trie in module global space
    var bits = Math.max(trie_getValueBitsize(size), initialBitsize | 0); // given bitsize might be lower than max address, ignore it in that case
    var buf = trie_createBuffer(size, bits); // have to use a wrapper because the buffer ref may change when it grows
    // otherwise we could just store the meta data inside the buffer. but at
    // least this is easier to read :)
    var trie = {
        _class: '$trie',
        buffer: buf,
        bits: bits, // 8 16 32 (64?)
        lastNode: TRIE_ROOT_OFFSET, // pointer to last node in the buffer
        count: 0, // number of keys in the Trie
        // __REMOVE_BELOW_FOR_DIST__
        // debug stats... any use should be wrapped in ASSERT so that it's use gets removed in a dist
        _mallocs: '' + buf.length, // malloc steps in a string
        _adds: 0, // number of trie_add calls
        _addSteps: 0, // sum of steps taken in all trie_add calls
        _hass: 0, // number of trie_has calls
        _gets: 0, // number of trie_get calls (and also contains has)
        _getSteps: 0
    };
    if (valuesByIndex) {
        for (var i = 0, n = valuesByIndex.length; i < n; ++i) {
            trie_add(trie, valuesByIndex[i], i);
        }
    }
    return trie;
}
/**
 * Create a buffer
 *
 * @param {number} size Length of the buffer in cells, not bytes (!)
 * @param {number} bits One of: 8 16 32 64
 * @returns {TypedArray}
 */
function trie_createBuffer(size, bits) {
    switch (bits) {
        case TRIE_8_BIT:
            return new Uint8Array(size);
        case 16:
            return new Uint16Array(size);
        case TRIE_32_BIT:
            return new Uint32Array(size);
        case TRIE_64_BIT:
            return new Float64Array(size); // let's hope not ;)
    }
    THROW('Unsupported bit size');
}
/**
 * Reserve a part of the Trie memory to represent a node in the Trie.
 *
 * In this particular implementation nodes are of fixed width. It's
 * a field of 10 address cells and one value cell.
 *
 * Address cells point to other nodes. If zero, there is none (because
 * that would be the root node) and a search ends in not found.
 *
 * Value cells that are zero (default) are also "not found".
 *
 * @returns {Uint16Array}
 */
function trie_addNode(trie) {
    var newNodePtr = trie.lastNode + TRIE_NODE_SIZE;
    trie.lastNode = newNodePtr; // technically the `while` is valid (instead of an `if`) but only
    // if the buffer could grow by a smaller amount than the node size...
    // note: buffer.length is cell size, buffer.byteLength is byte size. we want cells here.
    while (newNodePtr + TRIE_NODE_SIZE >= trie.buffer.length) {
        trie_grow(trie);
    }
    return newNodePtr;
}
/**
 * Allocate more size for this Trie
 *
 * Basically creates a new buffer with a larger size and then copies
 * the current buffer into it. If the new size exceeds the max size
 * of the current type (16bit/32bit) then the buffer is converted to
 * a bigger bit size automagically.
 * The trie buffer reference will be updated with the new buffer
 *
 * @param {$trie} trie
 */
function trie_grow(trie) {
    var len = trie.buffer.length; // cell size! not byte size.
    var newSize = ~~(len * 1.1); // grow by 10% (an arbitrary number)
    if (len + TRIE_MINIMAL_GROWTH > newSize) newSize = TRIE_MINIMAL_GROWTH + len;
    trie_malloc(trie, newSize);
}
/**
 * Allocate space for a Trie and copy given Trie to it.
 * Will grow bitsize if required, but never shrink it.
 * (Bitsize must grow if cell size exceeds certain threshholds
 * because otherwise we can't address all bytes in the buffer)
 *
 * @param {$trie} trie
 * @param {number} size Cell size, not byte size
 */
function trie_malloc(trie, size) { // make sure addressing fits
    var newBits = trie_getValueBitsize(size); // dont shrink bit size even if length would allow it; "large" _values_ may require it
    // (our tries dont need to shrink)
    trie.bits = Math.max(trie.bits, newBits);
    var nbuf = trie_createBuffer(size, trie.bits);
    nbuf.set(trie.buffer, 0);
    ASSERT(trie._mallocs += ' ' + nbuf.length);
    trie.buffer = nbuf;
}
/**
 * Return the cell width in bits to fit given value.
 * For example, numbers below 256 can be represented in
 * 8 bits but numbers above it will need at least 16 bits.
 * Max is 64 but you can't pass on larger numbers in JS, anyways :)
 *
 * @param {number} value
 * @returns {number}
 */
function trie_getValueBitsize(value) {
    if (value < 0x100) return TRIE_8_BIT;
    else if (value < 0x10000) return TRIE_16_BIT;
    else if (value < 0x100000000) return TRIE_32_BIT;
    else return TRIE_64_BIT;
}
/**
 * Add a key/value pair
 *
 * Note: keys and values are of limited structure
 *
 * The key must be a string of ascii in range of 32-131.
 * This key is hashed by turning each character into its
 * ascii ordinal value, stringifying it padded with zero,
 * and hashing each of the two resulting digits. This way
 * we can guarantee that each node in the Trie only
 * requires 10 places (one for each digit) plus a value.
 * That makes reads super fast.
 *
 * @param {$trie} trie
 * @param {string} key
 * @param {number} value Any unsigned 32bit-1 value
 * @returns {number} previous value, or -1 if there wasn't any
 */
function trie_add(trie, key, value) {
    ASSERT(++trie._adds);
    trie_ensureValueFits(trie, value);
    return _trie_add(trie, TRIE_ROOT_OFFSET, key, 0, key.length, value);
}
/**
 * Recursively find the place to add the key. If
 * the trail runs cold, pave it. Clobbers existing
 * values (though in our implementation that current
 * shouldn't really happen...)
 *
 * @param {$trie} trie
 * @param {number} offset
 * @param {string} key
 * @param {number} index Current index of the key being walked
 * @param {number} len Cache of key.length
 * @param {number} value Any unsigned 32bit-1 value
 * @returns {number} the old value, or not found
 */
function _trie_add(trie, offset, key, index, len, value) {
    ASSERT(++trie._addSteps);
    ASSERT(offset >= 0, 'OFFSET_UNSIGNED');
    ASSERT(typeof key === 'string', 'STRING_KEY');
    ASSERT(index >= 0, 'INDEX_UNSIGNED');
    ASSERT(key.length === len, 'KEY_LEN');
    ASSERT(value >= 0, 'VALUE_UNSIGNED'); // dont create next path part if it would create a leaf node
    if (index >= len) {
        var buf = trie.buffer;
        var valuePtr = offset + TRIE_BUCKET_COUNT;
        var curValue = trie.buffer[valuePtr];
        if (!curValue) ++trie.count;
        buf[valuePtr] = value + 1; // 0 is reserved to mean "unused"
        return curValue - 1;
    }
    var c = key.charCodeAt(index) - 32; // allow all asciis 31 < c < 130 encoded as stringified double digits
    offset = _trie_pavePath(trie, offset, c % 10);
    offset = _trie_pavePath(trie, offset, Math.floor(c / 10));
    return _trie_add(trie, offset, key, index + 1, len, value);
}
/**
 * Add a key/value pair
 *
 * This adds a value under a key that is a number. This
 * way reads and writes take `ceil(log(n)/log(10))` steps.
 * Eg. as many steps as digits in the decimal number.
 *
 * @param {$trie} trie
 * @param {number} key Assumes an unsigned int
 * @param {number} value Any unsigned 32bit-1 value
 * @returns {number} previous value, or -1 if there wasn't any
 */
function trie_addNum(trie, key, value) {
    ASSERT(++trie._adds);
    trie_ensureValueFits(trie, value);
    return _trie_addNum(trie, TRIE_ROOT_OFFSET, key + 1, value);
}
/**
 * Recursively find the place to add the key. If
 * the trail runs cold, pave it. Clobbers existing
 * values (though in our implementation that current
 * shouldn't really happen...)
 *
 * @param {$trie} trie
 * @param {number} offset
 * @param {number} key Assumes an unsigned int >0
 * @param {number} value Any unsigned 32bit-1 value
 * @returns {number} the old value, or not found
 */
function _trie_addNum(trie, offset, key, value) {
    ASSERT(++trie._addSteps);
    ASSERT(offset >= 0, 'OFFSET_UNSIGNED');
    ASSERT(typeof key === 'number', 'NUMBER_KEY');
    ASSERT(value >= 0, 'VALUE_UNSIGNED');
    if (key === 0) {
        var buf = trie.buffer;
        var valuePtr = offset + TRIE_BUCKET_COUNT;
        var curValue = trie.buffer[valuePtr];
        if (!curValue) ++trie.count;
        buf[valuePtr] = value + 1; // 0 is reserved to mean "unused"
        return curValue - 1;
    }
    offset = _trie_pavePath(trie, offset, key % 10);
    key = Math.floor(key / 10);
    return _trie_addNum(trie, offset, key, value);
}
/**
 * Make sure the Trie can hold a value of given manitude.
 * If the current bitsize of the trie is too small it will
 * grow the buffer to accomodate the larger size.
 *
 * @param {$trie} trie
 * @param {number} value
 */
function trie_ensureValueFits(trie, value) {
    var bitsNeeded = trie_getValueBitsize(value);
    if (bitsNeeded > trie.bits) {
        trie.bits = bitsNeeded;
        trie_malloc(trie, trie.buffer.length); // note: length = cell size, byteLength = byte size. we mean cell here.
    }
}
/**
 * One step of writing a value. Offset should be a node, if
 * the digit has no address yet create it. If a node needs
 * to be created the buffer may be grown to fit the new node.
 * It will return the pointer of the (possibly new) next
 * node for given digit.
 *
 * @param {$trie} trie
 * @param {number} offset Start of a node
 * @param {number} digit Zero through nine
 * @returns {number} new address
 */
function _trie_pavePath(trie, offset, digit) {
    offset += digit;
    var ptr = trie.buffer[offset];
    if (!ptr) {
        ptr = trie_addNode(trie);
        trie.buffer[offset] = ptr;
    }
    return ptr;
}
/**
 * Find the value for given key. See trie_add for more details.
 *
 * @param {$trie} trie
 * @param {string} key
 * @returns {number} -1 if not found, >= 0 otherwise
 */
function trie_get(trie, key) {
    ASSERT(++trie._gets);
    return _trie_get(trie, TRIE_ROOT_OFFSET, key, 0, key.length);
}
/**
 * Recursive function to search for key
 *
 * @param {$trie} trie
 * @param {number} offset Start of a node
 * @param {string} key
 * @param {number} index Current index of the key being walked
 * @param {number} len Cache of key.length
 * @returns {number} -1 if not found or >= 0 otherwise
 */
function _trie_get(trie, offset, key, index, len) {
    ASSERT(++trie._getSteps);
    ASSERT(offset >= 0, 'OFFSET_UNSIGNED');
    ASSERT(typeof key === 'string', 'STRING_KEY');
    ASSERT(index >= 0, 'INDEX_UNSIGNED');
    ASSERT(key.length === len, 'KEY_LEN');
    var buf = trie.buffer;
    if (index >= len) {
        var valuePtr = offset + TRIE_BUCKET_COUNT;
        return buf[valuePtr] - 1;
    }
    var c = key.charCodeAt(index) - 32; // allow all asciis 31 < c < 130 encoded as stringified double digits
    offset = buf[offset + c % 10];
    if (!offset) return TRIE_KEY_NOT_FOUND;
    offset = buf[offset + Math.floor(c / 10)];
    if (!offset) return TRIE_KEY_NOT_FOUND;
    return _trie_get(trie, offset, key, index + 1, len);
}
/**
 * See trie_get for more details
 *
 * @param {$trie} trie
 * @param {string} key
 * @returns {boolean}
 */
function trie_has(trie, key) {
    ASSERT(++trie._hass);
    return trie_get(trie, key) !== TRIE_KEY_NOT_FOUND;
}
/**
 * Find the value for given number key.
 * See trie_addNum for more details.
 *
 * @param {$trie} trie
 * @param {number} key Assumed to be an unsigned int >=0
 * @returns {number} -1 if not found, >= 0 otherwise
 */
function trie_getNum(trie, key) {
    ASSERT(++trie._gets);
    return _trie_getNum(trie, TRIE_ROOT_OFFSET, key + 1);
}
/**
 * Recursive function to search for number key
 *
 * @param {$trie} trie
 * @param {number} offset Start of a node
 * @param {number} key Assumed to be an unsigned int >=0
 * @returns {number} -1 if not found or >= 0 otherwise
 */
function _trie_getNum(trie, offset, key) {
    ASSERT(++trie._getSteps);
    ASSERT(offset >= 0, 'OFFSET_UNSIGNED');
    ASSERT(typeof key === 'number', 'NUMBER_KEY');
    var buf = trie.buffer;
    if (key === 0) {
        var valuePtr = offset + TRIE_BUCKET_COUNT;
        return buf[valuePtr] - 1;
    }
    offset = buf[offset + key % 10];
    if (!offset) return TRIE_KEY_NOT_FOUND;
    key = Math.floor(key / 10);
    return _trie_getNum(trie, offset, key);
}
/**
 * See trie_getNum for more details
 *
 * @param {$trie} trie
 * @param {number} key Assumed to be unsigned int >= 0
 * @returns {boolean}
 */
function trie_hasNum(trie, key) {
    ASSERT(++trie._hass);
    return trie_getNum(trie, key) !== TRIE_KEY_NOT_FOUND;
}
/**
 * Human readable yay. Does not log, only returns a debug string.
 *
 * @param {$trie} trie
 * @param {boolean} [skipBuffer=false]
 * @returns {string}
 */
function _trie_debug(trie, skipBuffer) { /* eslint no-extend-native: "off" */
    var buf = trie.buffer;
    var lastNode = trie.lastNode; // patch some es6 stuff for debugging. note: dont do this in prod, it may slow stuff down.
    if (!String.prototype.padStart) {
        String.prototype.padStart = function(n, c) {
            var s = this;
            if (this.length < n)
                for (var i = 0; i < n - this.length; ++i) {
                    s = c + s;
                }
            return s;
        };
    }
    if (!String.prototype.padEnd) {
        String.prototype.padEnd = function(n, c) {
            var s = this;
            if (this.length < n)
                for (var i = 0; i < n - this.length; ++i) {
                    s = s + c;
                }
            return s;
        };
    }
    if (!Array.from) {
        Array.from = function(a) {
            return [].concat.call(a);
        };
    } // if one doesnt support them, they probably all dont.
    if (!Uint8Array.prototype.slice) {
        Uint8Array.prototype.slice = Uint16Array.prototype.slice = Uint32Array.prototype.slice = Float64Array.prototype.slice = Array.prototype.slice;
    }

    function bytes(b) {
        if (b < 1024) return b + ' b';
        b /= 1024;
        if (b < 1024) return ~~(b * 100) / 100 + ' kb';
        b /= 1024;
        if (b < 1024) return ~~(b * 100) / 100 + ' mb';
        b /= 1024;
        return ~~(b * 100) / 100 + ' gb';
    }
    var pad = 20;
    var npad = 6;
    var s = '' + '\n' + '###\n' + 'Key count:'.padEnd(pad, ' ') + trie.count + '\n' + 'Node count:'.padEnd(pad, ' ') + (lastNode / TRIE_NODE_SIZE + 1) + ' (' + (lastNode / TRIE_NODE_SIZE + 1) / trie.count + ' nodes per key)\n' + 'Buffer cell length:'.padEnd(pad, ' ') + buf.length + '\n' + 'Buffer byte length:'.padEnd(pad, ' ') + buf.byteLength + '\n' + 'Bit size:'.padEnd(pad, ' ') + trie.bits + '\n' + 'Node len:'.padEnd(pad, ' ') + TRIE_NODE_SIZE + '\n' + 'Node size:'.padEnd(pad, ' ') + TRIE_NODE_SIZE + '\n' + 'Last Node:'.padEnd(pad, ' ') + lastNode + '\n' + 'Used space:'.padEnd(pad, ' ') + (lastNode + TRIE_NODE_SIZE) + ' cells, ' + bytes((lastNode + TRIE_NODE_SIZE) * (trie.bits >> 3)) + '\n' + 'Unused space:'.padEnd(pad, ' ') + (buf.length - (lastNode + TRIE_NODE_SIZE)) + ' cells, ' + bytes((buf.length - (lastNode + TRIE_NODE_SIZE)) * (trie.bits >> 3)) + '\n' + // __REMOVE_BELOW_FOR_DIST__
        'Mallocs:'.padEnd(pad, ' ') + trie._mallocs + '\n' + 'trie_adds:'.padEnd(pad, ' ') + trie._adds + '\n' + 'Avg key distance:'.padEnd(pad, ' ') + trie._addSteps / trie._adds + '\n' + 'trie_hass:'.padEnd(pad, ' ') + trie._hass + '\n' + 'trie_gets:'.padEnd(pad, ' ') + trie._gets + '\n' + 'Avg get distance:'.padEnd(pad, ' ') + trie._getSteps + ' -> ' + trie._getSteps / trie._gets + '\n' + // __REMOVE_ABOVE_FOR_DIST__
        '\n';
    if (!skipBuffer) {
        s += 'ptr \\ key= 0      1      2      3      4      5      6      7      8      9  ->  value\n\n';
        var ptr = TRIE_ROOT_OFFSET;
        while (ptr <= lastNode) {
            s += String(ptr).padStart(npad, ' ') + ': ' + Array.from(buf.slice(ptr, ptr + TRIE_NODE_SIZE - 1)).map(function(n) {
                return String(n).padStart(npad, ' ');
            }).join(', ') + '  ->  ' + String(buf[ptr + TRIE_NODE_SIZE - 1]).padStart(npad, ' ') + '\n';
            ptr += TRIE_NODE_SIZE;
        }
    }
    s += '###\n\n';
    return s;
} // end of src/trie.js
exports.default = Solver;
//# sourceMappingURL=finitedomain-es5.js.map