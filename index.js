import path from 'path'
import fs from 'fs'
import rimraf from 'rimraf'
import merge from 'lodash.merge'
import get from 'lodash.get'
import set from 'lodash.set'
import isPlainObject from 'lodash.isplainobject'
import homeDir from 'os-homedir'

const USER_CONF = '__user-conf__'

function assertCb (cb) {
  if (typeof cb !== 'function') {
    throw new Error('Expecting cb to be function')
  }
}

class UserConfig {
  constructor (name, base = {}) {
    if (!name || typeof name !== 'string') {
      throw new Error('Expecting name to be non-empty string')
    } else if (!isPlainObject(base)) {
      throw new Error('Expecting base to be plain object')
    }

    this._confFile = path.resolve(homeDir(), name + '.json')

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

  _writeJSON (obj, cb) {
    if (!isPlainObject(obj)) {
      throw new Error('Expecting obj to be object')
    }
    assertCb(cb)
    obj[USER_CONF] = true
    const stringy = JSON.stringify(obj, null, '\t')
    fs.writeFile(this._confFile, stringy, cb)
  }

  _writeJSONSync (obj) {
    if (!isPlainObject(obj)) {
      throw new Error('Expecting obj to be object')
    }
    obj[USER_CONF] = true
    const stringy = JSON.stringify(obj, null, '\t')
    fs.writeFileSync(this._confFile, stringy)
  }

  _getJSON (cb) {
    assertCb(cb)
    fs.readFile(this._confFile, (err, result) => {
      if (err) return cb(err)
      cb(null, JSON.parse(String(result)))
    })
  }

  _getJSONSync () {
    return JSON.parse(String(fs.readFileSync(this._confFile)))
  }

  /// Public

  clear (cb = () => {}) {
    assertCb(cb)
    this._writeJSON({}, cb)
  }

  clearSync () {
    this._writeJSONSync({})
  }

  get (key, cb) {
    if (!cb) {
      cb = key
    } else if (typeof key !== 'string') {
      throw new Error('Expecting key to be string')
    }
    assertCb(cb)
    this._getJSON((err, json) => {
      if (err) return cb(err)
      cb(null, key ? get(json, key) : json)
    })
  }

  getSync (key) {
    if (key && typeof key !== 'string') {
      throw new Error('Expecting key to be string')
    }
    const json = this._getJSONSync()
    return key ? get(json, key) : json
  }

  set (key, val, cb) {
    let json
    if (isPlainObject(key)) {
      cb = val || (() => {})
      val = key
      assertCb(cb)
      json = val
    } else if (typeof key !== 'string') {
      throw new Error('Expecting key to be string')
    } else {
      json = this._getJSONSync()
      set(json, key, val)
    }
    this._writeJSON(json, cb)
  }

  setSync (key, val) {
    let json
    if (typeof val === 'undefined') {
      if (!isPlainObject(key)) {
        throw new Error('setSync expects value to be object if no key given')
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

  update (diff, cb = () => {}) {
    if (!isPlainObject(diff)) {
      throw new Error('Expecting diff to be object')
    }
    assertCb(cb)
    this.get((options) => {
      const updatedOptions = merge({}, options, diff)
      this.set(updatedOptions, () => this.get(cb))
    })
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

  destroy (cb = () => {}) {
    assertCb(cb)
    rimraf(this._confFile, cb)
  }
}

module.exports = {
  UserConfig,
  ident: USER_CONF,
  init (...args) {
    return new UserConfig(...args)
  }
}
