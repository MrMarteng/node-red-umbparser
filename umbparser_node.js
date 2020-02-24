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
                }
               
            }
            else
            {
                log("Oh nooo");
            }

            //msg.payload = msg.payload.toLowerCase();
            this.send(msg);
        });
    }
    RED.nodes.registerType("umbparser", UMBParserNode);
}
