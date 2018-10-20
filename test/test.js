const assert = require('assert');
const decomment = require('..');

// Credits to sindresorhus, most of testcases from https://github.com/sindresorhus/strip-json-comments/blob/master/test.js
describe('Remove slash-style comment', () => {
   it('do nothing', () => {
      assert.equal(decomment('//comment\n{"a":"b"}'), '//comment\n{"a":"b"}');
      assert.equal(decomment('/*//comment*/{"a":"b"}'), '/*//comment*/{"a":"b"}');
      assert.equal(decomment('{"a":"b"//comment\n}'), '{"a":"b"//comment\n}');
      assert.equal(decomment('{"a":"b"/*comment*/}'), '{"a":"b"/*comment*/}');
      assert.equal(decomment('{"a"/*\n\n\ncomment\r\n*/:"b"}'), '{"a"/*\n\n\ncomment\r\n*/:"b"}');
   });

   it('replace comments with whitespace', () => {
      const opt = { strategy: 'replace-with-whitespace' };
      assert.equal(decomment('//comment\n{"a":"b"}', opt), '         \n{"a":"b"}');
      assert.equal(decomment('/*//comment*/{"a":"b"}', opt), '             {"a":"b"}');
      assert.equal(decomment('{"a":"b"//comment\n}', opt), '{"a":"b"         \n}');
      assert.equal(decomment('{"a":"b"/*comment*/}', opt), '{"a":"b"           }');
      assert.equal(decomment('{"a"/*\n\n\ncomment\r\n*/:"b"}', opt), '{"a"  \n\n\n       \r\n  :"b"}');
      assert.equal(decomment('/*!\n * comment\n */\n{"a":"b"}', opt), '   \n          \n   \n{"a":"b"}');
      assert.equal(decomment('{/*comment*/"a":"b"}', opt), '{           "a":"b"}');
   });

   it('remove comments', () => {
      const opt = { strategy: 'remove' };
      assert.equal(decomment('//comment\n{"a":"b"}', opt), '{"a":"b"}');
      assert.equal(decomment('/*//comment*/{"a":"b"}', opt), '{"a":"b"}');
      assert.equal(decomment('{"a":"b"//comment\n}', opt), '{"a":"b"\n}');
      assert.equal(decomment('{"a":"b"/*comment*/}', opt), '{"a":"b"}');
      assert.equal(decomment('{"a"/*\n\n\ncomment\r\n*/:"b"}', opt), '{"a":"b"}');
      assert.equal(decomment('/*!\n * comment\n */\n{"a":"b"}', opt), '\n{"a":"b"}');
      assert.equal(decomment('{/*comment*/"a":"b"}', opt), '{"a":"b"}');
   });

   it('doesn\'t strip comments inside strings', () => {
      assert.equal(decomment('{"a":"b//c"}'), '{"a":"b//c"}');
      assert.equal(decomment('{"a":"b/*c*/"}'), '{"a":"b/*c*/"}');
      assert.equal(decomment('{"/*a":"b"}'), '{"/*a":"b"}');
      assert.equal(decomment('{"\\"/*a":"b"}'), '{"\\"/*a":"b"}');
   });

   it('consider escaped slashes when checking for escaped string quote', () => {
      assert.equal(decomment('{"\\\\":"https://foobar.com"}'), '{"\\\\":"https://foobar.com"}');
      assert.equal(decomment('{"foo\\"":"https://foobar.com"}'), '{"foo\\"":"https://foobar.com"}');

   });

   it('line endings - no comments', () => {
      assert.equal(decomment('{"a":"b"\n}'), '{"a":"b"\n}');
      assert.equal(decomment('{"a":"b"\r\n}'), '{"a":"b"\r\n}');

   });

   it('line endings - double-slash comment', () => {
      const opt = { strategy: 'replace-with-whitespace' };
      assert.equal(decomment('{"a":"b"//c\n}', opt), '{"a":"b"   \n}');
      assert.equal(decomment('{"a":"b"//c\r\n}', opt), '{"a":"b"   \r\n}');
   });

   it('line endings - slash-slash comment:single line', () => {
      const opt = { strategy: 'replace-with-whitespace' };
      assert.equal(decomment('{"a":"b"/*c*/\n}', opt), '{"a":"b"     \n}');
      assert.equal(decomment('{"a":"b"/*c*/\r\n}', opt), '{"a":"b"     \r\n}');
   });

   it('line endings - slash-slash comment:multi line', () => {
      const opt = { strategy: 'replace-with-whitespace' };
      assert.equal(decomment('{"a":"b",/*c\nc2*/"x":"y"\n}', opt), '{"a":"b",   \n    "x":"y"\n}');
      assert.equal(decomment('{"a":"b",/*c\r\nc2*/"x":"y"\r\n}', opt), '{"a":"b",   \r\n    "x":"y"\r\n}');
   });

   it('line endings - works ad EOF', () => {
      const opt1 = { strategy: 'replace-with-whitespace' };
      const opt2 = { strategy: 'remove' };
      assert.equal(decomment('{\r\n\t"a":"b"\r\n} //EOF'), '{\r\n\t"a":"b"\r\n} //EOF');
      assert.equal(decomment('{\r\n\t"a":"b"\r\n} //EOF', opt1), '{\r\n\t"a":"b"\r\n}      ');
      assert.equal(decomment('{\r\n\t"a":"b"\r\n} //EOF', opt2), '{\r\n\t"a":"b"\r\n} ');
   });
});

describe('Test file', () => {
   let weirdData = '', expectedData = ' ';
   const fs = require('fs'); 

   beforeEach(() => {
      weirdData = fs.readFileSync(`${__dirname}/weird.json`, 'utf8');    
      expectedData = fs.readFileSync(`${__dirname}/expect.json`, 'utf8');
   });

   it('handles weird escaping', () => {
      const opt = { strategy: 'remove' };
      assert.equal(decomment(weirdData, opt), expectedData);
   });
});
