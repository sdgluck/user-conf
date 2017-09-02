const fs = require('fs')
const path = require('path')
const homeDir = require('os-homedir')
const userConf = require('./bin')

const testConfName = '__test__'

function confObj (obj) {
  obj[userConf.ident] = true
  return obj
}

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

  it('sets and gets', (done) => {
    conf.set('name', 'Spongebob Squarepants', (err) => {
      if (err) return done(err)
      conf.get('name', (err, name) => {
        if (err) return done(err)
        expect(name).toEqual('Spongebob Squarepants')
        done()
      })
    })
  })

  it('setsAll and getsAll', () => {
    conf.setSync({name: 'David Bowie', awesome: true})
    const expected = confObj({name: 'David Bowie', awesome: true})
    expect(conf.getSync()).toEqual(expected)
  })

  it('updates', () => {
    conf.updateSync({awesome: 'hell yeah!'})
    const expected = confObj({name: 'David Bowie', awesome: 'hell yeah!'})
    expect(conf.getSync()).toEqual(expected)
  })

  it('init gets existing conf', () => {
    const c = userConf.init(testConfName)
    const result = c.getSync('name')
    expect(result).toEqual('David Bowie')
  })

  it('clears', () => {
    conf.clearSync()
    expect(conf.getSync()).toEqual(confObj({}))
  })

  it('destroys conf', (done) => {
    conf.destroy((err) => {
      if (err) return done(err)
      const p = path.resolve(homeDir(), testConfName)
      if (fs.existsSync(p)) return done(new Error('conf still exists'))
      done()
    })
  })
})
