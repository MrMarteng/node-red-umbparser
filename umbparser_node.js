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
    function UMBGenNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        let umbgen = new mod_umbparser.UMBGenerator(this);

        this.address = parseInt(config.address, 16);
        this.channels = config.channels.split(",");

        node.on('input', function(msg) {
            let retmsg = new Object;
            retmsg.payload = umbgen.createMultiChReq(this.address, this.channels);
            node.send(retmsg);
        });
    }
    RED.nodes.registerType("umbparser", UMBParserNode);
    RED.nodes.registerType("umbgenerator", UMBGenNode);
}
