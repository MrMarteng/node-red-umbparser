const mod_umbparser = require('../umbparser')

let assert = require('assert');
let umbparser = new mod_umbparser.UMBParser();

let statusFrame = new ByteArray() [ 0, 01, 05 ];

describe('Class', function() {
    describe('#status frame', function(){
        umbparser.readBuffer(statusFrame);
    })
})

describe('Array', function() {
  describe('#indexOf()', function() {
    it('should return -1 when the value is not present', function() {
      assert.equal([1, 2, 3].indexOf(4), -1);
    });
  });
});