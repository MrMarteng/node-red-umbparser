let mod_umbparser = require('./umbparser');

let umbparser = new mod_umbparser.UMBParser();

module.exports = function(RED) {
    function UMBParserNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;
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
    RED.nodes.registerType("umbparser", UMBParserNode);
}
