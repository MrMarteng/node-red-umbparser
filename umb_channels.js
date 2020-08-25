/**
 * Copyright (c) 2020
 *
 * Node-Red UMB channels
 *
 * @summary Node-Red UMB parser
 * @author Martin Kiepfer <martin.kiepfer@otthydromet.com>
 */
let mod_umbparser = require('./umbparser');
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
    function UMBChannels(config) {
        RED.nodes.createNode(this, config);
        this.channels = config.channels;
        var node = this;
    }
    RED.nodes.registerType("umbchannels", UMBChannels);
}
