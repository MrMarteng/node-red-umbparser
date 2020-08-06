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

        node.status({fill:"red",shape:"ring",text:"disconnected"});

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

        const net = require('net');
        var client = undefined;
        let umbparser = new mod_umbparser.UMBParser(this);
        
        node.on('input', function(msg) {
            let retmsg = new Object;
            let resp_pending = true;

            //let umbreq = umbgen.createMultiChReq(this.address, this.channels);
            let umbreq = umbgen.createChNumReq(this.address);

            if(client == undefined || client.destroyed) {
                client = new net.Socket();
                client.setNoDelay(true);
                client.on('error', function(ex) {
                    node.log("handled error");
                    node.log(ex);
                });
                client.on('close', function() {
                    node.log('closed');
                    node.status({fill:"red",shape:"ring",text:"disconnected"});
                })
                client.on('data', function(data) {
                    let retmsg = new Object;
        
                    node.log('Received ' + data.length + 'bytes');
                    
                    node.log("Valid input buffer detected");
                    let parsedFrame = umbparser.ParseReadBuf(data);
        
                    node.log("Parsing status:")
                    node.log("parser status: " + parsedFrame.parserState);
                    if(parsedFrame.parserState == "finished")
                    {
                        node.log("Frametype: " + parsedFrame.umbframe.type);
                        node.log("Framestatus: " + parsedFrame.umbframe.status);
                        node.log("Framecmd: " + parsedFrame.umbframe.cmd);
                        retmsg.payload = parsedFrame;
                        node.send(retmsg);
                        resp_pending = false;
                    }
                    else if(parsedFrame.parserState == "processing")
                    {
                        node.log("processing...");
                    }
                });
                client.setTimeout(umb_consts.UMB_TIMEOUT.TIMEOUT_LONG, function() {
                    node.log('timeout');
                    if(resp_pending) {
                        node.log('Data timeout');
                        client.destroy();
                        let retmsg = new Object;
                        retmsg.payload = "Response timeout";
                        node.send(retmsg);
                    }
                });
                client.connect(config.ip_port, config.ip_address, function() {
                    node.log('Connected');
                    node.status({fill:"green",shape:"dot",text:"connected"});
                    client.write(umbreq);
                });
            }
            else {
                client.write(umbreq);
            }
        });
    }
    RED.nodes.registerType("umbmaster", UMBMasterNode);
}
