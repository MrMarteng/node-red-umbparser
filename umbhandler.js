/**
 * Copyright (c) 2020
 *
 * UMB handler class
 *
 * @summary UMB handler class
 * @author Martin Kiepfer <martin.kiepfer@otthydromet.com>
 */

const net = require('net');
let mod_umbparser = require('./umbparser');
const { throws } = require('assert');
const { EventEmitter } = require('events');
const { resolve } = require('path');
const umb_consts = require('./umb_consts').umb_consts;

class UMBSocket extends net.Socket
{
    constructor(ip_address, ip_port)
    {
        super();

        
    }
}

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

        this.emitter = new EventEmitter();

        this.socket_status = "undefined";
        this.cb_result = undefined;

        this.client = new net.Socket();
        this.client.setNoDelay(true);
        this.client.on('error', (ex) => {
            this.node.log("Socket error");
            this.node.log(ex);
            this.emitter.emit('finished', 'Socket error');
            this.socket_status = "error";
        });
        this.client.on('close', (hadError) => {
            this.node.log("Soecet closed (Status: " + hadError + ")");
            this.node.status({fill:"red",shape:"ring",text:"disconnected"});
            this.socket_status = "closed";
        });
        this.client.on('connect', () => {
            this.node.log("Socket connected");
            this.node.status({fill:"green",shape:"ring",text:"connected"});
            this.socket_status = "connected";
        })
        this.client.on('data', (data) => {
            this.node.log('Socket RX: ' + data.length + 'bytes');
            
            this.node.log("Valid input buffer detected");
            let parsedFrame = this.umbparser.ParseReadBuf(data);

            this.node.log("Parsing status:")
            this.node.log("parser status: " + parsedFrame.parserState);
            if(parsedFrame.parserState == "finished")
            {
                this.node.log("Frametype: " + parsedFrame.umbframe.type);
                this.node.log("Framestatus: " + parsedFrame.umbframe.status);
                this.node.log("Framecmd: " + parsedFrame.umbframe.cmd);
                this.emitter.emit('finished', parsedFrame);
            }
            else if(parsedFrame.parserState == "processing")
            {
                this.node.log("processing...");
            }
        });

        this.node.status({fill:"red",shape:"ring",text:"disconnected"});
    }

    async syncTransfer(umbreq)
    {
        let num_retries = 3;
        let fnct_retval = undefined;

        while(num_retries > 0) {
            let dataTimer = undefined;

            // make sure socket is connected
            if (this.socket_status != "connected") {
                this.node.log("connection closed. Reconnecting...");
                this.client.connect(this.ip_port, this.ip_address);
                /*this.ip_port, this.ip_address, () => {
                    this.node.log("TX: " + umbreq.length);
                    this.socket_status = "connected";
                    this.node.status({fill:"green",shape:"ring",text:"connected"});
                });*/
            }
            
            // transfer
            this.node.log("TX: " + umbreq.length);
            this.client.write(umbreq);

            // set TX Timeout
            //this.client.setTimeout(umb_consts.UMB_TIMEOUT.TIMEOUT_LONG*2, () => {
            dataTimer = setTimeout(() => {
                this.node.log("Data timeout");
                this.emitter.emit('finished', "Data timeout");
            }, umb_consts.UMB_TIMEOUT.TIMEOUT_LONG*2);

            // Wait for result
            fnct_retval = await new Promise((resolve, reject) => {
                this.emitter.on('finished', (retval) => {
                    this.node.log("##");
                    //this.client.setTimeout(0);
                    if(dataTimer != undefined) {
                        clearTimeout(dataTimer);
                    }
                    //this.client.destroy();
                    resolve(retval);
                })
            });

            num_retries--;
            if(fnct_retval != "Data timeout") {
                num_retries = 0;
            }

        }

        this.node.log("TX end");
        return fnct_retval;
    }

    createSoecket()
    {
        let socket = new net.Socket();
    }

}

module.exports.UMBHandler = UMBHandler;
