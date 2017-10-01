const fs = require('fs')
const path = require('path')
const homeDir = require('os-homedir')
const userConf = require('./bin')

const testConfName = '__test__'

describe('user-conf', () => {
  let conf

  it('throws with bad name', () => {
    expect(() => userConf.init()).toThrowError(/expecting name/i)
    expect(() => userConf.init(1)).toThrowError(/expecting name/i)
    expect(() => userConf.init({})).toThrowError(/expecting name/i)
  })

  it('throws with bad base', () => {
    expect(() => userConf.init('__test__', 0)).toThrowError(/expecting base/i)
    expect(() => userConf.init('__test__', '')).toThrowError(/expecting base/i)
  })

  it('creates conf', () => {
    conf = userConf.init('__test__')
    const p = path.resolve(homeDir(), testConfName + '.json')
    const exists = fs.existsSync(p)
    expect(exists).toEqual(true)
  })

  it('sets and gets', () => {
    return conf.set('name', 'Spongebob Squarepants')
      .then(() => conf.get('name'))
      .then((name) => expect(name).toEqual('Spongebob Squarepants'))
  })

  it('setsAll and getsAll', () => {
    conf.setSync({name: 'David Bowie', awesome: true})
    const expected = {name: 'David Bowie', awesome: true}

    expect(conf.getSync()).toEqual(expected)
  })

  it('updates', () => {
    conf.updateSync({awesome: 'hell yeah!'})
    const expected = {name: 'David Bowie', awesome: 'hell yeah!'}
    expect(conf.getSync()).toEqual(expected)
  })

  it('init gets existing conf', () => {
    const c = userConf.init(testConfName)
    const result = c.getSync('name')
    expect(result).toEqual('David Bowie')
  })

  it('clears', () => {
    conf.clearSync()
    expect(conf.getSync()).toEqual({})
  })

  it('destroys conf', () => {
    conf.destroy().then(() => {
      const p = path.resolve(homeDir(), testConfName)
      if (fs.existsSync(p)) {
        throw new Error('conf still exists')
      }
    })
  })
})
