let mod_umbparser = require('./umbparser');

let umbparser = new mod_umbparser.UMBParser();

module.exports = function(RED) {
    function UMBParserNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        node.on('input', function(msg) {
            if( msg.payload instanceof Buffer )
            {
                this.log("Valid input buffer detected");
                let parsedFrame = umbparser.ParseReadBuf(msg.payload);

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
                error("invalid paramter");
            }

        });
    }
    RED.nodes.registerType("umbparser", UMBParserNode);
}
