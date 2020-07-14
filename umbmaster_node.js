/**
 * Copyright (c) 2020
 *
 * Node-Red UMB parser
 *
 * @summary Node-Red UMB parser
 * @author Martin Kiepfer <martin.kiepfer@otthydromet.com>
 */
let mod_umbparser = require('./umbparser');

module.exports = function(RED) {
    function UMBParserNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        
        let umbparser = new mod_umbparser.UMBParser(this);
        node.on('input', function(msg) {
            in_data = null;

            if(Array.isArray(msg.payload))
            {
                in_data = Buffer.from(msg.payload);
            }

            if(msg.payload instanceof Buffer)
            {
                in_data = msg.payload;
            }

            if(in_data != null)
            {
                this.log("Valid input buffer detected");
                let parsedFrame = umbparser.ParseReadBuf(in_data);

                this.log("Parsing status:")
                this.log("parser status: " + parsedFrame.parserState);
                if(parsedFrame.parserState == "finished")
                {
                    this.log("Frametype: " + parsedFrame.umbframe.type);
                    this.log("Framestatus: " + parsedFrame.umbframe.status);
                    this.log("Framecmd: " + parsedFrame.umbframe.cmd);
                    let retmsg = new Object;
                    retmsg.payload = parsedFrame;
                    this.send(retmsg);
                }
                else if(parsedFrame.parserState == "processing")
                {
                    this.log("processing...");
                }
            }
            else
            {
                this.error("invalid paramter");
                this.log("invalid paramter");
            }

        });
    }
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

            in_data = umbgen.createMultiChReq(this.address, this.channels);

            if(in_data != null)
            {
                this.log("Valid input buffer detected");
                let parsedFrame = umbparser.ParseReadBuf(in_data);

                this.log("Parsing status:")
                this.log("parser status: " + parsedFrame.parserState);
                if(parsedFrame.parserState == "finished")
                {
                    this.log("Frametype: " + parsedFrame.umbframe.type);
                    this.log("Framestatus: " + parsedFrame.umbframe.status);
                    this.log("Framecmd: " + parsedFrame.umbframe.cmd);
                    retmsg.payload = parsedFrame;
                }
                else if(parsedFrame.parserState == "processing")
                {
                    this.log("processing...");
                }
            }
            else
            {
                this.error("invalid paramter");
                this.log("invalid paramter");
            }

            node.send(retmsg);
        });
    }
    RED.nodes.registerType("umbparser", UMBParserNode);
    RED.nodes.registerType("umbmaster", UMBMasterNode);
}
