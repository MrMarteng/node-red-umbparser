const mod_umbparser = require('../umbparser')
const umb_consts = require('../umb_consts').umb_consts;

let assert = require('assert');
let umbparser = new mod_umbparser.UMBParser();

let statusOkResponse = [ 0x01, 0x10, 0x01, 0xF0, 0x01, 0x50, 0x03, 0x02, 0x26, 0x10, 0x00, 0x03, 0x4D, 0xF7, 0x04 ];
let status55Response = [ 0x01, 0x10, 0x01, 0xF0, 0x01, 0x50, 0x03, 0x02, 0x26, 0x10, 0x55, 0x03, 0x02, 0x5A, 0x04 ];

let onlineCmdResponse_2ValOk = [ 0x01, 0x10, 0x01, 0xF0, 0x01, 0x50, 0x14, 0x02, 0x2F, 0x10, 0x00, 0x02, 0x08, 0x00, 0xC8, 0x00, 0x16, 0x00, 0x00, 0xc8, 0x41, 0x06, 0x00, 0xA0, 0x0F, 0x12, 0xFF, 0x00, 0x03, 0x45, 0xE6, 0x04 ];

describe('#status frame', function(){
    it('Parsing UMB status request with error status OK', function() {
        umbstatus = umbparser.ParseReadBuf(statusOkResponse);
        assert.equal(umbstatus.umbframe.cmd, 0x26);
        assert.equal(umbstatus.umbframe.status, 0x00);
        assert.equal(umbstatus.umbframe.type, "response");
        assert.equal(umbstatus.parserState, "finished");
    })
    it('Parsing UMB status request with error status E55', function() {
        umbstatus = umbparser.ParseReadBuf(status55Response);
        assert.equal(umbstatus.umbframe.status, 0x55);
        assert.equal(umbstatus.umbframe.type, "response");
        assert.equal(umbstatus.parserState, "finished");
    })
});

describe('#online command', function(){
    it('Online command data', function() {
        umbstatus = umbparser.ParseReadBuf(onlineCmdResponse_2ValOk);
        assert.equal(umbstatus.umbframe.cmd, 0x2F);
        assert.equal(umbstatus.umbframe.status, 0x00);
        assert.equal(umbstatus.umbframe.type, "response");
        assert.equal(umbstatus.parserState, "finished");
    })
});
