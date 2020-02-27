const mod_umbparser = require('../umbparser')

let assert = require('assert');
let umbparser = new mod_umbparser.UMBParser();

let statusOkResponse = [ 0x01, 0x10, 0x01, 0xF0, 0x01, 0x50, 0x03, 0x02, 0x26, 0x10, 0x00, 0x03, 0x4D, 0xF7, 0x04 ];
let status55Response = [ 0x01, 0x10, 0x01, 0xF0, 0x01, 0x50, 0x03, 0x02, 0x26, 0x10, 0x55, 0x03, 0x02, 0x5A, 0x04 ];

describe('Class', function() {
    describe('#status frame', function(){
        it('Parsing UMB status request with error status OK', function() {
            umbstatus = umbparser.ParseReadBuf(statusOkResponse);
            assert.equal(umbstatus.umbframe.status, 0x00);
            assert.equal(umbstatus.parserState, "finished");
        })
        it('Parsing UMB status request with error status E55', function() {
            umbstatus = umbparser.ParseReadBuf(status55Response);
            assert.equal(umbstatus.umbframe.status, 0x55);
            assert.equal(umbstatus.parserState, "finished");
        })
    })
})
