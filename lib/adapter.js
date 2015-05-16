'use strict';

/**
 * Generic adapter with events emitter
 */
var Adapter = function(){};

require('util').inherits(Adapter, require('events').EventEmitter);

module.exports = Adapter;
