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

let l_socket_id = 0;

const UMBSocketStatus = {
    created: "created",
    closed: "closed",
    error: "error",
    undefined: "undefined",
    connected: "connected"
}

class UMBSocket extends net.Socket
{
    constructor(node, emitter)
    {
        super();

        this.emitter = emitter;
        this.node = node;
        this.socket_status = UMBSocketStatus.created;
        this.umbparser = new mod_umbparser.UMBParser(this.node);
        this.id = l_socket_id++;

        this.node.log("[" + this.id + "] Socket created");

        this.setNoDelay(true);
        this.on('error', (ex) => {
            this.socket_status = UMBSocketStatus.error;
            this.node.log("[" + this.id + "] Socket error (" + ex + ")");
            this.node.log(ex);
            this.emitter.emit('finished', 'Socket error');
        });
        this.on('close', (hadError) => {
            this.socket_status = UMBSocketStatus.closed;
            this.node.log("[" + this.id + "] Socket closed (Error: " + hadError + ")");
            this.node.status({fill:"red",shape:"ring",text:"disconnected"});
            this.emitter.emit('finished', 'Socket closed');
        });
        this.on('connect', () => {
            this.socket_status = UMBSocketStatus.connected;
            this.node.log("[" + this.id + "] Socket connected");
            this.node.status({fill:"green",shape:"ring",text:"connected"});
            this.emitter.emit('connected', 'Socket connected');
        })
        this.on('data', (data) => {
            this.node.log("[" + this.id + "] Socket RX: " + data.length + "bytes");
            
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

        this.emitter = new EventEmitter();
        
        this.cb_result = undefined;

        this.client = new UMBSocket(this.node, this.emitter);
    }

    async syncTransfer(umbreq)
    {
        let con_retval = undefined;
        let data_retval = undefined;
        let fnct_retval = undefined;

        let dataTimer = undefined;
        let connTimer = undefined;
        let num_retries = 3;

        this.node.log("TX start (length:" + umbreq.length + ")");

        while((num_retries > 0) && (fnct_retval == undefined)) {

            // make sure socket is connected
            switch(this.client.socket_status) 
            {
                case UMBSocketStatus.connected:
                    // Socket already connected. Nothing to do here

                    // transfer
                    this.node.log("TX: " + umbreq.length);
                    this.client.write(umbreq);
        
                    // set TX Timeout
                    /*this.client.setTimeout(umb_consts.UMB_TIMEOUT.TIMEOUT_LONG*2, () => {
                        this.node.log("Data timeout");
                        this.emitter.emit('finished', "Data timeout");
                    });*/
                    dataTimer = setTimeout(() => {
                        this.node.log("Data timeout");
                        this.emitter.emit('finished', "Data timeout");
                    }, umb_consts.UMB_TIMEOUT.TIMEOUT_LONG*2);
        
                    // Wait for result
                    data_retval = await new Promise((resolve, reject) => {
                        this.emitter.on('finished', (retval) => {
                            this.node.log("Socket event received (" + retval + ")");
                            //this.client.setTimeout(0);
                            clearTimeout(dataTimer);
                            resolve(retval);
                        })
                    });

                    if(data_retval == "Data timeout")
                    {
                        num_retries--;
                    }
                    else if((data_retval.umbframe != undefined) && (data_retval.parserState != undefined)) {
                        fnct_retval = data_retval
                    }
                    break;
                case UMBSocketStatus.error:
                    // Socket error. Socket needs to be recreated
                    // >> fallthrough
                case UMBSocketStatus.closed:
                    // Socket is closed. Needs to be recreated
                    this.node.log("Socket lost. Recreating...");
                    this.client = new UMBSocket(this.node, this.emitter);
                    // >> fallthrough
                case UMBSocketStatus.created:
                    // Socket is created, but needs to be connected
                    this.node.log("Socket created. Connecting...");

                    connTimer = setTimeout(() => {
                        this.node.log("Connection timeout");
                        this.emitter.emit('connected', "Connection timeout");
                    }, 2000);

                    // Wait for result
                    con_retval = await new Promise((resolve, reject) => {
                        this.emitter.on('connected', (retval) => {
                            this.node.log("Socket connected received (" + retval + ")");
                            //this.client.setTimeout(0);
                            clearTimeout(connTimer);
                            resolve(retval);
                        });
                        this.client.connect(this.ip_port, this.ip_address);
                    });

                    if(con_retval == "Connection timeout") {
                        fnct_retval = con_retval;
                    }
                    break;
                default:
                    this.node.log("Error: undefined socket state!");
                    fnct_retval = "Invalid socket state";
                    break;
            }
        }
        
        this.node.log("TX end (retval: parsedFrame.parserState=" + fnct_retval.parserState + " / parsedFrame.umbframe=" + fnct_retval.umbframe + ")");
        return fnct_retval;
    }
}

module.exports.UMBHandler = UMBHandler;
