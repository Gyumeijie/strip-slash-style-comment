# strip-slash-style-comment
strip slash style comments, and can be used for `JSON`, `JavaScript`, `C++`, `C` files and more.

# Install
```bash
$ npm install strip-slash-style-comment
```

# Usage
```js
var decommented = decomment(input, {
    strategy: 'remove'
});
```
where `input` can be a `string literal` or data from a `source file`.


# API
**decomment(input, [options])**

##### input     
Type: `string`

##### options
Type: `object`

- strategy         
Specify how to handle with comments, the default is doing nothing. `remove`: remove comments; `replace-with-whitespace`:
replace comments with whitespace, this allows us locate error positions as close as possible to the original source.

# Test

```
$ npm run test
```