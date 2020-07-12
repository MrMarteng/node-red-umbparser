/**
 * Copyright (c) 2020
 *
 * Node-Red UMB channels
 *
 * @summary Node-Red UMB parser
 * @author Martin Kiepfer <martin.kiepfer@otthydromet.com>
 */
let mod_umbparser = require('./umbparser');

module.exports = function(RED) {
    function UMBChannels(config) {
        RED.nodes.createNode(this, config);
        var node = this;
    }
    RED.nodes.registerType("umbchannels", UMBChannels);
}
