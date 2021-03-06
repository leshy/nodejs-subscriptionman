
var backbone = require("backbone4000")
var _ = require('underscore')
var v = require('validator2-extras'); var Validator = v.v; var Select = v.Select

var helpers = require('helpers')

exports.SubscriptionMan = backbone.Model.extend4000({
    // oneshot: f(patterns, callback, name) ->
    //    ff = (args...) => @unsubscribe name ; callback.apply @, args
    //    name = @subscribe pattern, ff, name
    //    -> @unsubscribe name
    
    // msg: (msg) ->
    //    args = _.flatten _.map _.values @patterns, (matcher) -> [matcher.validator, matcher.callback]
    //    args = _.flatten ([m.validator, m.callback] for m in _.values @patterns)


    initialize: function () {
        this.patterns = {}
    },

    subscribe: function (pattern,callback,name) {
        var self = this
        if (!name) { name = Math.random() }

        if (this.patterns[name]) { throw "subscription with name " + name + " already exists" }

        var subscriber
        this.patterns[name] = subscriber = { validator: Validator(pattern), callback: callback }
        this.trigger('subscribe', subscriber)

        return function () { self.unsubscribe(name) }
    },

    subscribers: function () {
        return _.values(this.patterns)
    },

    unsubscribe: function (name) {
        if (!this.patterns[name]) { throw "subscription with name " + name + " not found" }
        delete this.patterns[name]
    },
    
    oneshot: function(pattern,callback,name) {
        var unsub = undefined
        function ff() { unsub(); callback.apply(this,arguments); }
        unsub = this.subscribe(pattern, ff, name );
        return unsub;
    },

    msg: function (msg,wrap) {
        this.trigger('msg',msg)
        var args = _.flatten(_.map(this.patterns, function (matcher,name) { if (wrap) { return [ matcher.validator, wrap(matcher.callback,name)] } else { return [ matcher.validator, matcher.callback] } }))
        if (!args.length) { return }
        args.unshift(msg)
        Select.apply(this, args)
    }
})


