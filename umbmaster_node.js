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
const umb_consts = require('./umb_consts').umb_consts;

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
        var node = this;

        this.cfg_channels = RED.nodes.getNode(config.channels);
        if(this.cfg_channels)
        {
            this.channels = [];
            this.cfg_channels.channels.forEach(element => {
                if(element.enabled)
                    this.channels.push(element.ch);
            });
        }

        var dev_address = parseInt(config.dev_address, 16);
        var ip_address = config.ip_address;
        var ip_port = config.ip_port;

        let umbgen = new mod_umbparser.UMBGenerator(this);
        var umbhandler = new mod_umbhandler.UMBHandler(this, dev_address, ip_port, ip_address);
        
        node.on('input', function(msg) {
            let retmsg = new Object;

            let umbreq = umbgen.createMultiChReq(this.address, this.channels);
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

    RED.httpAdmin.get("/umbchannels", RED.auth.needsPermission('umbchannels.read'), function(req,res) {
        res.json(umb_channels);

        //let umbreq = umbgen.createMultiChReq(this.address, this.channels);
    });
}
