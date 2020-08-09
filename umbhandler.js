const net = require('net');
let mod_umbparser = require('./umbparser');
const umb_consts = require('./umb_consts').umb_consts;

class UMBHandler
{
    /**
     * 
     * @param {node} node 
     * @param {int} address 
     * @param {string} ip_port 
     * @param {int} ip_address 
     */
    constructor(node, address, ip_port, ip_address)
    {
        var self = this;

        this.node = node;
        this.address = address;
        this.ip_port = ip_port;
        this.ip_address = ip_address;
        this.client = undefined;
        this.umbparser = new mod_umbparser.UMBParser(this.node);

        this.resp_pending = false;
        this.cb_result = undefined;

        this.client = undefined;

        this.node.status({fill:"red",shape:"ring",text:"disconnected"});
    }

    connect()
    {
        if(this.client == undefined || this.client.destroyed)
        {
            this.client = new net.Socket();
            this.client.setNoDelay(true);
            this.client.setTimeout(umb_consts.UMB_TIMEOUT.TIMEOUT_LONG, () => this.cb_socketTimeout());
            this.client.on('error', () => this.cb_socketError());
            this.client.on('close', () => this.cb_socketClose());
            this.client.on('data', (data) => this.cb_socketReceive(data));
            this.client.connect(this.ip_port, this.ip_address, () => this.cb_socketConnect());
        }
    }

    transfer(umbreq, cb_result)
    {
        if(typeof cb_result == 'function')
        {
            this.cb_result = cb_result;
            this.resp_pending = true;

            this.connect()
            
            return this.client.write(umbreq);
        }

        return false;
    }

    sendResult(result, umbResp=undefined)
    {
        if(this.cb_result != undefined && typeof this.cb_result == 'function')
        {
            this.cb_result(result, umbResp);
            this.resp_pending = false;
        }

        this.cb_result = undefined;
    }

    cb_socketTimeout() 
    {
        this.node.log('timeout');
        if(this.resp_pending) {
            this.node.log('Data timeout');
            this.client.destroy();
            this.sendResult("Response timeout");
        }
    }

    cb_socketError(ex) 
    {
        this.node.log("handled error");
        this.node.log(ex);
        this.sendResult("Socket error");
    }

    cb_socketClose() 
    {
        this.node.log('closed');
        this.node.status({fill:"red",shape:"ring",text:"disconnected"});
    }

    cb_socketConnect() 
    {
        this.node.log('Connected');
        this.node.status({fill:"green",shape:"dot",text:"connected"});
    }

    cb_socketReceive(data)
    {
        let retmsg = new Object;

        this.node.log('Received ' + data.length + 'bytes');
        
        this.node.log("Valid input buffer detected");
        let parsedFrame = this.umbparser.ParseReadBuf(data);

        this.node.log("Parsing status:")
        this.node.log("parser status: " + parsedFrame.parserState);
        if(parsedFrame.parserState == "finished")
        {
            this.node.log("Frametype: " + parsedFrame.umbframe.type);
            this.node.log("Framestatus: " + parsedFrame.umbframe.status);
            this.node.log("Framecmd: " + parsedFrame.umbframe.cmd);
            this.sendResult("finished", parsedFrame);
            this.resp_pending = false;
        }
        else if(parsedFrame.parserState == "processing")
        {
            this.node.log("processing...");
        }
    }
}

module.exports.UMBHandler = UMBHandler;
