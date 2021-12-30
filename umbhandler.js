/**
 * Copyright (c) 2020 OTT Hydromet Fellbach GmbH
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
const umb_consts = require('./umb_consts').umb_consts;
const SerialPort = require('serialport')
const Readline = require('@serialport/parser-readline')

let l_socket_id = 0;
let l_client = undefined;
let l_emitter = undefined; 

const UMBSocketStatus = {
    created: "created",
    closed: "closed",
    error: "error",
    undefined: "undefined",
    connected: "connected"
}

class UMBSocket extends net.Socket
{
    constructor(node, emitter, umbparser)
    {
        super();

        l_emitter = emitter;
        this.node = node;
        this.socket_status = UMBSocketStatus.created;
        this.umbparser = umbparser;
        this.id = l_socket_id++;

        this.node.log("[" + this.id + "] Socket created");

        this.setNoDelay(true);
        this.on('error', (ex) => {
            this.node.log("[" + this.id + "] Socket error (" + ex + ")");
            this.node.log(ex);
            this.socket_status = UMBSocketStatus.error;
            l_emitter.emit('finished', 'Socket error');
        });
        this.on('close', (hadError) => {
            this.node.log("[" + this.id + "] Socket closed (Error: " + hadError + ")");
            this.socket_status = UMBSocketStatus.closed;
            l_emitter.emit('finished', 'Socket closed');
            this.node.status({fill:"red",shape:"ring",text:"disconnected"});
        });
        this.on('connect', () => {
            this.node.log("[" + this.id + "] Socket connected");
            this.socket_status = UMBSocketStatus.connected;
            l_emitter.emit('connected', 'Socket connected');
            this.node.status({fill:"green",shape:"ring",text:"connected"});
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
                l_emitter.emit('finished', parsedFrame);
            }
            else if(parsedFrame.parserState == "processing")
            {
                this.node.log("processing...");
            }
        });

        this.node.status({fill:"red", shape:"ring", text:"disconnected"});
    }
}

class UMBHandler
{
    

    /**
     * 
     * @param {node}    node        Reference to Node-Red instrance
     * @param {int}     address     Device-Adresse of the device to communicate with
     * @param {int}     com_intf    Communication-com_intf to be used (0: Serial, 1: IP)
     * @param {Object}  paramset    Context of paramters: ip_port, ip_address, sp_tty, sp_baud, sp_parity
     */
    constructor(node, address, com_intf, paramset)
    {   
        var self = this;

        const default_paramset = {
            ip_port: "9750",
            ip_address: "192.168.0.1", 
            sp_tty: "/dev/ttyS0", 
            sp_baud: "19200",
            sp_parity: "8N1"
        }
        this.paramset = Object.assign({}, default_paramset, paramset);

        this.node = node;
        this.address = address;
        this.com_intf = com_intf;

        this.umbparser = new mod_umbparser.UMBParser(this.node);

        this.cb_result = undefined;

        if(l_emitter == undefined) {
            l_emitter= new EventEmitter();
        }

        if((l_client == undefined) && (com_intf == 1)) {
            l_client = new UMBSocket(this.node, l_emitter, this.umbparser);
        }
    }
    
    async syncTransfer(umbreq) {
        if(this.com_intf == 1) {
            return this.syncTransfer_NET(umbreq);
        } else {
            return this.syncTransfer_SERIAL(umbreq);
        }
    }

    async syncTransfer_SERIAL(umbreq) {
        let fnct_retval = undefined;        
        let data_sent = false;
        let datatimer = undefined;
        let num_retries = 0;

        let serialport = new SerialPort(this.paramset.sp_tty, { 
            baudRate: parseInt(this.paramset.sp_baud),
            dataBits: 8,
            parity: (this.paramset.sp_parity == "8N1") ? 'none' : 'even',
            stopBits: 1,
            flowControl: false
        });

        while(fnct_retval == undefined) {

            this.node.log("TX start (length:" + umbreq.length + ")");
            
            this.node.status({fill:"green",shape:"ring",text:"connected"});

            await new Promise( (resolve, reject) => {             
                serialport.on('data', (chunk) => {
                    let parsedFrame;
                    
                    this.node.log("tty RX: " + chunk.length + "bytes");
                    this.node.trace(chunk.toString('hex'));
                    
                    // @Note: Some USB to serial adapters seem to receive 1 byte frames, although no device is connected
                    parsedFrame = this.umbparser.ParseReadBuf(chunk);                    
                
                    this.node.log("Parser status: " + parsedFrame.parserState);

                    switch(parsedFrame.parserState) {
                        case mod_umbparser.PAR_STATE.PARSER_FINISHED:
                            this.node.log("Frametype: " + parsedFrame.umbframe.type);
                            this.node.log("Framestatus: " + parsedFrame.umbframe.status);
                            this.node.log("Framecmd: " + parsedFrame.umbframe.cmd);
                            resolve(parsedFrame);
                            break;
                        case mod_umbparser.PAR_STATE.PARSER_IDLE:
                        case mod_umbparser.PAR_STATE.PARSER_PROCESSING:
                            // still processing wait for complete frame to be parsed
                            this.node.log("processing...");
                            break;
                        case mod_umbparser.PAR_STATE.PARSER_ERROR:
                            resolve("Parsing error");
                            break;
                        case mod_umbparser.PAR_STATE.PARSER_CRCERROR:
                            resolve("CRC error");
                            break;
                    }
                });

                serialport.on('error', (error) => {
                    resolve("Data error on serial port (" + error + ")");
                });
                
                if(!data_sent) {
                    this.umbparser.resetParser();
                    // send request
                    serialport.write(umbreq);         
                    data_sent = true;

                    datatimer = setTimeout(() => {
                        this.node.log("Data timeout");
                        resolve("Data timeout");
                    }, umb_consts.UMB_TIMEOUT.TIMEOUT_LONG*2);
                }
            }).then( (result)=> {

                clearTimeout(datatimer);

                // data timeout. execute 3 retries
                if (result == "Data timeout")
                {
                    this.node.log("Data timeout #" + num_retries)
                    num_retries++;
                    data_sent = false;
                    if (num_retries > 3) {
                        fnct_retval = "Data Timeout";
                    }
                }
                else {
                    fnct_retval = result;
                }
            });

        }

        this.node.log("TX end (" + fnct_retval + ")");

        if(serialport.isOpen) {
            serialport.close();
        }
        this.node.status({fill:"red",shape:"ring",text:"disconnected"});

        return fnct_retval;
    }

    async syncTransfer_NET(umbreq)
    {
        let fnct_retval = undefined;
        let num_retries = 0;

        this.node.log("TX start (length:" + umbreq.length + ")");

        while(fnct_retval == undefined) {

            // make sure socket is connected
            switch(l_client.socket_status) 
            {
                case UMBSocketStatus.connected:
                    // Socket already connected. Nothing to do here

                    // transfer
                    await new Promise( (resolve, reject) => {
                        this.node.log("TX: " + umbreq.length);
                        l_client.setTimeout(umb_consts.UMB_TIMEOUT.TIMEOUT_LONG*2, () => {
                            this.node.log("Data timeout");
                            l_emitter.emit('finished', "Data timeout");
                        });
                        l_emitter.on('finished', (result) => {
                            this.node.log("Socket event received (" + result + ")");
                            l_client.setTimeout(0);
                            resolve(result);
                        });
                        l_client.write(umbreq);
                    }).then( (result) => {
                        l_emitter.removeAllListeners("finished");
                        if (result == "Data timeout")
                        {
                            this.node.log("Data timeout #" + num_retries)
                            num_retries++;
                            if (num_retries > 3) {
                                fnct_retval = "Data Timeout";
                            }
                        }
                        else if ((result.umbframe != undefined) && (result.parserState != undefined)) {
                            fnct_retval = result;
                        }
                        else {
                            fnct_retval = result;
                        }
                    });
                    
                    break;
                case UMBSocketStatus.error:
                    // Socket error
                    fnct_retval = "Socket Error";
                    break;
                case UMBSocketStatus.closed:
                    // Socket is closed. Needs to be recreated
                    this.node.log("Socket closed");
                    //l_client = new UMBSocket(this.node, l_emitter);
                    // >> fallthrough
                case UMBSocketStatus.created:
                    // Socket is created, but needs to be connected
                    this.node.log("Socket created. Connecting...");

                    // wait for connection
                    await new Promise((resolve, reject) => {
                        let conTimeout = setTimeout(() => {
                            this.node.log("Connection timeout");
                            l_emitter.emit('connected', "Connection timeout");
                        }, 5000);
                        l_emitter.on('connected', (result) => {
                            this.node.log("Socket connected received (" + result + ")");
                            clearTimeout(conTimeout);
                            resolve(result);
                        });
                        l_client.connect(this.paramset.ip_port, this.paramset.ip_address);
                    }).then((result) => {
                        l_emitter.removeAllListeners("connected");
                        if(result == "Connection timeout") {
                            fnct_retval = result;
                        }
                    });
                    
                    break;
                default:
                    this.node.log("Error: undefined socket state!");
                    fnct_retval = "Invalid socket state";
                    break;
            }
        }

        this.node.log("TX end (" + fnct_retval + ")");

        return fnct_retval;
    }

    async syncTransfer_NET(umbreq)
    {
        let fnct_retval = undefined;
        let num_retries = 0;

        this.node.log("TX start (length:" + umbreq.length + ")");

        while(fnct_retval == undefined) {

            // make sure socket is connected
            switch(l_client.socket_status) 
            {
                case UMBSocketStatus.connected:
                    // Socket already connected. Nothing to do here

                    // transfer
                    await new Promise( (resolve, reject) => {
                        this.node.log("TX: " + umbreq.length);
                        l_client.setTimeout(umb_consts.UMB_TIMEOUT.TIMEOUT_LONG*2, () => {
                            this.node.log("Data timeout");
                            l_emitter.emit('finished', "Data timeout");
                        });
                        l_emitter.on('finished', (result) => {
                            this.node.log("Socket event received (" + result + ")");
                            l_client.setTimeout(0);
                            resolve(result);
                        });
                        l_client.write(umbreq);
                    }).then( (result) => {
                        l_emitter.removeAllListeners("finished");
                        if (result == "Data timeout")
                        {
                            this.node.log("Data timeout #" + num_retries)
                            num_retries++;
                            if (num_retries > 3) {
                                fnct_retval = "Data Timeout";
                            }
                        }
                        else if ((result.umbframe != undefined) && (result.parserState != undefined)) {
                            fnct_retval = result;
                        }
                        else {
                            fnct_retval = result;
                        }
                    });
                    
                    break;
                case UMBSocketStatus.error:
                    // Socket error
                    fnct_retval = "Socket Error";
                    break;
                case UMBSocketStatus.closed:
                    // Socket is closed. Needs to be recreated
                    this.node.log("Socket closed");
                    //l_client = new UMBSocket(this.node, l_emitter);
                    // >> fallthrough
                case UMBSocketStatus.created:
                    // Socket is created, but needs to be connected
                    this.node.log("Socket created. Connecting...");

                    // wait for connection
                    await new Promise((resolve, reject) => {
                        let conTimeout = setTimeout(() => {
                            this.node.log("Connection timeout");
                            l_emitter.emit('connected', "Connection timeout");
                        }, 5000);
                        l_emitter.on('connected', (result) => {
                            this.node.log("Socket connected received (" + result + ")");
                            clearTimeout(conTimeout);
                            resolve(result);
                        });
                        l_client.connect(this.paramset.ip_port, this.paramset.ip_address);
                    }).then((result) => {
                        l_emitter.removeAllListeners("connected");
                        if(result == "Connection timeout") {
                            fnct_retval = result;
                        }
                    });
                    
                    break;
                default:
                    this.node.log("Error: undefined socket state!");
                    fnct_retval = "Invalid socket state";
                    break;
            }
        }

        this.node.log("TX end (" + fnct_retval + ")");

        return fnct_retval;
    }
}

module.exports.UMBHandler = UMBHandler;
