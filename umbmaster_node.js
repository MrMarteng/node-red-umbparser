/**
 * Copyright (c) 2020
 *
 * Node-Red UMB parser
 *
 * @summary Node-Red UMB parser
 * @author Martin Kiepfer <martin.kiepfer@otthydromet.com>
 */
let mod_umbparser = require('./umbparser');
const umb_consts = require('./umb_consts').umb_consts;

module.exports = function(RED) {
    function UMBMasterNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        this.cfg_channels = RED.nodes.getNode(config.channels);

        let umbgen = new mod_umbparser.UMBGenerator(this);

        this.address = parseInt(config.address, 16);
        
        if(this.cfg_channels)
        {
            this.channels = [];
            this.cfg_channels.channels.forEach(element => {
                if(element.enabled)
                    this.channels.push(element.ch);
            });
        }

        node.on('input', function(msg) {
            let retmsg = new Object;
            let umbparser = new mod_umbparser.UMBParser(this);
            const net = require('net');

            let umbreq = umbgen.createMultiChReq(this.address, this.channels);
            var client = new net.Socket();

            client.setTimeout(umb_consts.UMB_TIMEOUT.TIMEOUT_LONG, function() {
                console.loge('Socket timeout')
            });
            client.on('error', function(ex) {
                console.log("handled error");
                console.log(ex);
            });
            client.on('timeout', function() {
                retmsg.payload = "Response timeout";
                node.send(retmsg);
                client.destroy();
            });
            client.on('data', function(data) {
                console.log('Received ' + data.length + 'bytes');
                data_test = data
                
                console.log("Valid input buffer detected");
                let parsedFrame = umbparser.ParseReadBuf(data_test);

                node.log("Parsing status:")
                node.log("parser status: " + parsedFrame.parserState);
                if(parsedFrame.parserState == "finished")
                {
                    node.log("Frametype: " + parsedFrame.umbframe.type);
                    node.log("Framestatus: " + parsedFrame.umbframe.status);
                    node.log("Framecmd: " + parsedFrame.umbframe.cmd);
                    retmsg.payload = parsedFrame;
                    node.send(retmsg);
                    client.destroy();
                }
                else if(parsedFrame.parserState == "processing")
                {
                    node.log("processing...");
                }
            });
            client.connect(config.ip_port, config.ip_address, function() {
                console.log('Connected');
                client.write(umbreq);
            });
                
        });
    }
    RED.nodes.registerType("umbmaster", UMBMasterNode);
}
