import path from 'path'
import pify from 'pify'
import merge from 'lodash.merge'
import get from 'lodash.get'
import set from 'lodash.set'
import isPlainObject from 'lodash.isplainobject'

// to be promisified
import _fs from 'fs'
import _rimraf from 'rimraf'

const USER_CONF = '__user-conf__'

const fs = pify(_fs)
const rimraf = pify(_rimraf)

class UserConfig {
  constructor (name, base = {}) {
    if (!name || typeof name !== 'string') {
      throw new Error('Expecting name to be non-empty string')
    } else if (!isPlainObject(base)) {
      throw new Error('Expecting base to be plain object')
    }

    this._confFile = path.resolve(
      require('os').homedir(),
      name + '.json'
    )

    if (fs.existsSync(this._confFile)) {
      let conf
      try {
        conf = require(this._confFile)
      } catch (err) {
        throw new Error('Could not load existing config at ' + this._confFile)
      }
      if (!conf[USER_CONF]) {
        throw new Error('File at ' + this._confFile + ' is not user-conf file')
      }
    } else {
      base[USER_CONF] = true
      fs.closeSync(fs.openSync(this._confFile, 'w'))
      const stringy = JSON.stringify(base, null, '\t')
      fs.writeFileSync(this._confFile, stringy)
    }
  }

  /// Private

  _writeJSON (obj) {
    if (!isPlainObject(obj)) {
      throw new Error('Expecting obj to be object')
    }
    obj[USER_CONF] = true
    const stringy = JSON.stringify(obj, null, '\t')
    return fs.writeFile(this._confFile, stringy)
  }

  _writeJSONSync (obj) {
    if (!isPlainObject(obj)) {
      throw new Error('Expecting obj to be object')
    }
    obj[USER_CONF] = true
    const stringy = JSON.stringify(obj, null, '\t')
    fs.writeFileSync(this._confFile, stringy)
  }

  _getJSON () {
    return fs.readFile(this._confFile).then((result) => {
      const json = JSON.parse(String(result))
      delete json[USER_CONF]
      return json
    })
  }

  _getJSONSync () {
    const stringy = String(fs.readFileSync(this._confFile))
    const json = JSON.parse(stringy)
    delete json[USER_CONF]
    return json
  }

  /// Public

  clear () {
    return this._writeJSON({})
  }

  clearSync () {
    this._writeJSONSync({})
  }

  get (key) {
    if (key && typeof key !== 'string') {
      throw new Error('Expecting key to be string')
    }
    return this._getJSON()
      .then((json) => key ? get(json, key) : json)
  }

  getSync (key) {
    if (key && typeof key !== 'string') {
      throw new Error('Expecting key to be string')
    }
    const json = this._getJSONSync()
    return key ? get(json, key) : json
  }

  set (key, val) {
    let json
    if (typeof val === 'undefined') {
      if (!isPlainObject(key)) {
        throw new Error('set expects object if no key given')
      }
      json = key
    } else if (typeof key !== 'string') {
      throw new Error('Expecting key to be string')
    } else {
      json = this._getJSONSync()
      set(json, key, val)
    }
    return this._writeJSON(json)
  }

  setSync (key, val) {
    let json
    if (typeof val === 'undefined') {
      if (!isPlainObject(key)) {
        throw new Error('setSync expects object if no key given')
      }
      json = key
    } else if (typeof key !== 'string') {
      throw new Error('Expecting key to be string')
    } else {
      json = this._getJSONSync()
      set(json, key, val)
    }
    this._writeJSONSync(json)
  }

  update (diff) {
    if (!isPlainObject(diff)) {
      throw new Error('Expecting diff to be object')
    }
    return this.get()
      .then((options) => this.set(merge({}, options, diff)))
      .then(() => this.get())
  }

  updateSync (diff) {
    if (!isPlainObject(diff)) {
      throw new Error('Expecting diff to be object')
    }
    const options = this.getSync()
    const updatedOptions = merge({}, options, diff)
    this.setSync(updatedOptions)
    return this.getSync()
  }

  destroy () {
    return rimraf(this._confFile)
  }
}

module.exports = {
  UserConfig,
  init (...args) {
    return new UserConfig(...args)
  }
}
