# user-conf

> Manage configs in the user home directory

Made with ❤ at [@outlandish](http://www.twitter.com/outlandish)

<a href="http://badge.fury.io/js/user-conf"><img alt="npm version" src="https://badge.fury.io/js/user-conf.svg"></a>

Easily persist and update a JSON object in a user's home directory.

Simplifies managing a single configuration (JSON) object for Node 
programs that need to save user options, e.g. CLI apps. Probably has other
uses too but CLI apps is why I made this.

## Install

```sh
npm install --save user-conf
```

```sh
yarn add user-conf
```

## Import

```js
// ES2015
import UserConf from 'user-conf'
```

```js
// CommonJS
var userConf = require('user-conf')
```

## Usage

### `userConf.init(name[, baseOptions]) : UserConfig`

Initialise or get a user configuration. 

The first time this is run the configuration is initialised with the `baseOptions` object.

- __name__ {String} name of the config
- __base__ {Object} _(optional)_ base config object (default: `{}`)

Returns an instance of UserConfig (available at `exports.UserConfig`). 

### API

All methods except `destroy` have a `*Sync` equivalent, e.g. `getSync()` and `setSync()`.

#### `UserConfig#get([key]) : Promise`

Get all options or one option by passing `key`.

- __key__ {String} _(optional)_ key name of option, accepts dot-paths

#### `UserConfig#set([key,] val) : Promise`

Set an option value or the whole object (pass `val` as first argument)

- __key__ {String} _(optional)_ key name of option, accepts dot-paths
- __value__ {*} value of option (must be serialisable as JSON)

#### `UserConfig#update(diff) : Promise`

Merge an object into the user configuration.

- __diff__ {Object} options object to merge (must be serialisable as JSON)

#### `UserConfig#clear() : Promise`

Clear the user configuration object of all options.
 
#### `UserConfig#destroy() : Promise`

Delete the config from filesystem.

## Example

```js
import userConf from 'user-conf'
import prompt from 'inquirer'

const conf = userConf.init('user-name-app', {name: 'Joe Bloggs'})

console.log(conf.getSync('name')) 
//=> first run: "Joe Bloggs" 
//=> subsequent runs: "Spongebob Squarepants" 

prompt([{name: 'What\'s your name?'}]).then(({name}) => {
  conf.setSync('name', name)
  console.log(conf.getSync('name')) //=> "Spongebob Squarepants"
})
```

## Contributing

All pull requests and issues welcome!

If you're not sure how, check out the [great video tutorials on egghead.io](http://bit.ly/2aVzthz)!

## License

MIT © [Sam Gluck](github.com/sdgluck)
