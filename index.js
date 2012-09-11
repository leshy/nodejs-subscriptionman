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
        this.patterns[name] = [ Validator(pattern), callback ]
        return name
    },
    
    unsubscribe: function (name) {
        if (!this.patterns[name]) { throw "subscription with name " + name + " not found" }
        delete this.patterns[name]
    },
    
    oneshot: function(msg,f) {
        var self = this;
        function ff() { self.unsubscribe(ff); f.apply(this,arguments); }
        this.subscribe(msg, ff );
        return function() { self.unsubscribe(ff); };
    },
    
    msg: function (msg,callback) {
        var args = _.flatten(_.values(this.patterns))
        args.unshift(msg)
        Select.apply(this, args)
    }
})


