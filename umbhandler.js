const net = require('net');
let mod_umbparser = require('./umbparser');
const { throws } = require('assert');
const { EventEmitter } = require('events');
const { resolve } = require('path');
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

        this.emitter = new EventEmitter();

        this.node.status({fill:"red",shape:"ring",text:"disconnected"});
    }

    async syncTransfer(umbreq)
    {
        //this.cb_result = cb_result;
        this.resp_pending = true;

        let e = new EventEmitter();
        let dataTimer = undefined;

        this.client = new net.Socket();
        this.client.setNoDelay(true);
        
        this.client.on('error', (ex) => {
            this.node.log("Socket error");
            this.node.log(ex);
            e.emit('finished', 'Socket error');
        });
        this.client.on('close', (hadError) => {
            this.node.log("closed" + (hadError ? " (with Error)":""));
            this.node.status({fill:"red",shape:"ring",text:"disconnected"});
        });
        this.client.on('data', (data) => {
            this.node.log('RX: ' + data.length + 'bytes');
            
            this.node.log("Valid input buffer detected");
            let parsedFrame = this.umbparser.ParseReadBuf(data);

            this.node.log("Parsing status:")
            this.node.log("parser status: " + parsedFrame.parserState);
            if(parsedFrame.parserState == "finished")
            {
                this.node.log("Frametype: " + parsedFrame.umbframe.type);
                this.node.log("Framestatus: " + parsedFrame.umbframe.status);
                this.node.log("Framecmd: " + parsedFrame.umbframe.cmd);
                e.emit('finished', parsedFrame);
            }
            else if(parsedFrame.parserState == "processing")
            {
                this.node.log("processing...");
            }
        });
        this.client.connect(this.ip_port, this.ip_address, () => {
            this.node.log("TX: " + umbreq.length);

            dataTimer = setTimeout(() => {
                this.node.log("Data timeout");
                e.emit('finished', "Data timeout");
            }, umb_consts.UMB_TIMEOUT.TIMEOUT_LONG);
    
            this.client.write(umbreq);
        });
                
        let retval = await new Promise((resolve, reject) => {
            e.on('finished', (retval) => {
                if(dataTimer != undefined) {
                    clearTimeout(dataTimer);
                }
                this.client.destroy();
                resolve(retval);
            })
        });

        return retval;
    }

}

module.exports.UMBHandler = UMBHandler;
