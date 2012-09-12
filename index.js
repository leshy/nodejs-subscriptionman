var backbone = require("backbone4000")
var _ = require('underscore')
var v = require('validator'); var Validator = v.Validator; var Select = v.Select

exports.SubscriptionMan = backbone.Model.extend4000({
    initialize: function () {
        this.patterns = {}
    },

    subscribe: function (pattern,callback,name) {

        if (!name) { name = Math.random() } // need something else here, callback can be reused for different patterns... 
        if (this.patterns[name]) { throw "subscription with name " + name + " already exists" }
        var subscriber
        this.patterns[name] = subscriber = { validator: Validator(pattern), callback: callback }
        this.trigger('subscribe', subscriber)
        return name
    },
    
    subscribers: function () {
        return _.values(this.patterns)
    },

    unsubscribe: function (name) {
        if (!this.patterns[name]) { throw "subscription with name " + name + " not found" }
        delete this.patterns[name]
    },
    
    oneshot: function(pattern,callback,name) {
        var self = this;
        function ff() { self.unsubscribe(name); callback.apply(this,arguments); }
        name = this.subscribe(pattern, ff, name );
        return function() { self.unsubscribe(name); };
    },
    
    msg: function (msg) {
        var args = _.flatten(_.map(_.values(this.patterns), function (matcher) { return [ matcher.validator, matcher.callback] }))
        if (!args.length) { return }
        args.unshift(msg)
        Select.apply(this, args)
    }
})


