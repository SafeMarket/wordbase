const chaithereum = require('chaithereum')
const solc = require('solc')
const fs = require('fs')
const leftPad = require('left-pad')

const a = '0x'+new Array(33).join('aa')
const b = '0x'+new Array(33).join('bb')
const c = '0x'+new Array(33).join('cc')
const d = '0x'+new Array(33).join('dd')
const e = '0x'+new Array(33).join('ee')
const f = '0x'+new Array(33).join('ff')

before(() => { return chaithereum.promise })

describe('Wordbase', () => {

  let solcOutput
  let WordbaseSol
  let wordbase

  it('should get WordbaseSol', () => {
    WordbaseSol = fs.readFileSync('Wordbase.sol', 'utf-8')
    WordbaseSol.should.be.a.string
  })

  it ('should compile with solc', () => {
    solcOutput = solc.compile(WordbaseSol)
    if(solcOutput.errors && solcOutput.errors.length > 0) {
      throw new Error(solcOutput.errors[0])
    }
  })

  it('should deploy', () => {
    return chaithereum.web3.eth.contract(JSON.parse(solcOutput.contracts.Wordbase.interface)).new.q({
      data: solcOutput.contracts.Wordbase.bytecode
    }).should.eventually.be.a.contract.then((_wordbase) => {
      wordbase = _wordbase
    })
  })

  it('should set [a, b, c] to d', () => {
    return wordbase.set.q([a, b, c], d).should.eventually.be.fulfilled
  })

  it('should set [a, b, c, d, e] to f', () => {
    return wordbase.set.q([a, b, c, d, e], f).should.eventually.be.fulfilled
  })

  it('should get(bytes32[]) [a, b, c] as d', () => {
   return wordbase.get['bytes32[]'].q([a, b, c]).should.eventually.be.equal(d)
  })

  it('should get(address,bytes32[]) [a, b, c] as d', () => {
   return wordbase.get['address,bytes32[]'].q(chaithereum.account, [a, b, c]).should.eventually.be.equal(d)
  })

  it('should get(bytes32[]) [a, b, c, d, e]  as f', () => {
   return wordbase.get['bytes32[]'].q([a, b, c, d, e]).should.eventually.be.equal(f)
  })

  it('should get(address,bytes32[]) [a, b, c, d, e]  as f', () => {
   return wordbase.get['address,bytes32[]'].q(chaithereum.account, [a, b, c, d, e]).should.eventually.be.equal(f)
  })

})