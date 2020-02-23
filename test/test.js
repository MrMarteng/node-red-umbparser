const mod_umbparser = require('../umbparser')

let assert = require('assert');
let umbparser = new mod_umbparser.UMBParser();

let statusOkResponse = [ 0x01, 0x10, 0x01, 0xFF, 0x01, 0x50, 0x03, 0x02, 0x26, 0x10, 0x00, 0x03, 0xFF, 0xFF, 0x04 ];
let status55Response = [ 0x01, 0x10, 0x01, 0xFF, 0x01, 0x50, 0x03, 0x02, 0x26, 0x10, 0x55, 0x03, 0xFF, 0xFF, 0x04 ];

describe('Class', function() {
    describe('#status frame', function(){
        it('UMB status requires with error status OK has been parsed correctly', function() {
            umbstatus = umbparser.ParseReadBuf(statusOkResponse);
            assert.equal(umbstatus.umbframe.status, 0);
            assert.equal(umbstatus.parserState, "finished");
        })
    })
})

describe('Array', function() {
  describe('#indexOf()', function() {
    it('should return -1 when the value is not present', function() {
      assert.equal([1, 2, 3].indexOf(4), -1);
    });
  });
});