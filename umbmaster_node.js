/**
 * Copyright (c) 2020
 *
 * Node-Red UMB parser
 *
 * @summary Node-Red UMB parser
 * @author Martin Kiepfer <martin.kiepfer@otthydromet.com>
 */
let mod_umbhandler = require('./umbhandler');
let mod_umbparser = require('./umbparser');

const { parse } = require('path');
const { promises } = require('fs');
const { memory } = require('console');
const umb_consts = require('./umb_consts').umb_consts;

var node = undefined;
var dev_address = 0;
var ip_address = 0
var ip_port = 0;

var umb_channels = {
    name: {value: "WS10"},
    channels: {value: [
        {enabled:true, ch:"100", chname:"Temperature"},
        {enabled:true, ch:"200", chname:"Rel. Humidity"},
        {enabled:true, ch:"300", chname:"Air Pressure"},
        {enabled:true, ch:"400", chname:"Wind Speed"},
        {enabled:true, ch:"405", chname:"Wind Speed"},
        {enabled:true, ch:"500", chname:"Wind Direction"},
        {enabled:true, ch:"600", chname:"Precipiation amount"},
        {enabled:true, ch:"601", chname:"Precipiation amount daily"},
        {enabled:true, ch:"700", chname:"Precipiation tpe"},
        {enabled:true, ch:"900", chname:"Global Radiation"},
        {enabled:true, ch:"903", chname:"Illumination"},
        {enabled:true, ch:"904", chname:"Dawn"},
        {enabled:true, ch:"910", chname:"Sun Direction Azimut"},
        {enabled:true, ch:"911", chname:"Sun Direction Elevation"},
    ]},
};

module.exports = function(RED) {
    function UMBMasterNode(config) {
        RED.nodes.createNode(this, config);

        // BUG: NRU-15 - Communication only working with to-address 0
        //dev_address = parseInt(config.dev_address, 16);
        ip_address = config.ip_address;
        ip_port = config.ip_port;
        node = this;

        this.cfg_channels = RED.nodes.getNode(config.channels);
        if(this.cfg_channels)
        {
            this.channels = [];
            this.cfg_channels.channels.forEach(element => {
                if(element.enabled)
                    this.channels.push(element.ch);
            });
        }
        
        let umbgen = new mod_umbparser.UMBGenerator(this);
        let umbhandler = new mod_umbhandler.UMBHandler(this, dev_address, ip_port, ip_address);

        node.on('input', function(msg) {
            //let umbreq = umbgen.createMultiChReq(dev_address, this.channels);
            let umbreq = umbgen.createChListReq(dev_address, 0)
            //let umbreq = umbgen.createChDetailsReq(this.address, 100);
            
            umbhandler.transfer(umbreq, function(statusMsg, parsedFrame) {
                let retmsg = new Object;

                if(parsedFrame == undefined)
                {
                    retmsg.payload = statusMsg;
                }
                else
                {
                    retmsg.payload = parsedFrame;
                }
                node.send(retmsg);
            });
        });
    }
    RED.nodes.registerType("umbmaster", UMBMasterNode);

    // Register internal URL to query channel list (used by channel_list config node)
    RED.httpAdmin.get("/umbchannels", RED.auth.needsPermission('umbchannels.read'), function(req,res) {
        let umbgen = new mod_umbparser.UMBGenerator(node);
        let umbhandler = new mod_umbhandler.UMBHandler(node, dev_address, ip_port, ip_address);

        let numChannels = NaN;
        let numBlocks = NaN;
        let channelList = undefined;
        
        let events = require('events');
        var eventEmitter = new events.EventEmitter();

        function promis_queryChDetails(curChannel) {
            node.log("### CH" + curChannel);
            let umbreq = umbgen.createChDetailsReq(dev_address, curChannel);
            let parseFrame = umbhandler.syncTransfer(umbreq);
            if(parsedFrame != undefined)
            {
                let curChDetails = new Object();
                curChDetails.enabled = true;
                node.log("### XXX");
                //curChDetails.ch = 
                //enabled:true, ch:"100", chname:"Temperature"},
                //channelList = parsedFrame.umbframe.framedata.parsed.
            }
        }

        /* 1. query number of blocks and channels */
        eventEmitter.on('1', function() {
            let umbreq = umbgen.createChNumReq(dev_address);
            parsedFrame = umbhandler.syncTransfer(umbreq);
            if(parsedFrame != undefined) 
            {
                numChannels = parsedFrame.umbframe.framedata.parsed.numChannels;

                node.log("channels detected: " + numChannels);
                eventEmitter.emit('2');
            }
        });

        /* 2. Query channel list */
        eventEmitter.on('2', function() {
            let umbreq = umbgen.createChListReq(dev_address, 0);
            umbhandler.syncTransfer(umbreq).then((response) => {
                let parsedFrame = response;
                if(parsedFrame != undefined)
                {
                    node.log("Channellist detected");
                    channelList = parsedFrame.umbframe.framedata.parsed.channels;
                    eventEmitter.emit('3');
                }
            });
        });
        
        /* 3. Query channel details */
        eventEmitter.on('3', () => {
            let channelCfg = new Array();

            (async () => {
                await channelList.reduce(async (memo, curChannel) => {
                    await memo;
                    let umbreq = umbgen.createChDetailsReq(dev_address, curChannel);
                    await umbhandler.syncTransfer(umbreq).then((response) => {
                        let parsedFrame = response;
                        if(parsedFrame != undefined)
                        {
                            node.log("CurChannel: " + curChannel);
                            curChDetails = new Object();
                            curChDetails.enabled = true;
                            curChDetails.ch = curChannel;
                            curChDetails.chname = parsedFrame.umbframe.framedata.parsed.name;
                            curChDetails.chunit = parsedFrame.umbframe.framedata.parsed.unit;
                            channelCfg.push(curChDetails);
                        }
                    });
                }, undefined);
                umb_channels.channels.value = channelCfg;
                res.json(umb_channels);

            })();
            
        });

        eventEmitter.emit('2');
        
    });
    
}
