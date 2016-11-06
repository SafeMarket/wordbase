const Chaithereum = require('chaithereum')
const chaithereum = new Chaithereum
const solc = require('solc')
const fs = require('fs')
const expect = chaithereum.chai.expect

const a = '0x'+new Array(33).join('aa')
const b = '0x'+new Array(33).join('bb')
const c = '0x'+new Array(33).join('cc')
const d = '0x'+new Array(33).join('dd')
const e = '0x'+new Array(33).join('ee')
const f = '0x'+new Array(33).join('ff')

before(() => { return chaithereum.promise })

describe('contracts', () => {

  let solcOutput
  const sources = {}
  let wordbase
  let wordbaseClient
  let testContract

  it('should get sources', () => {
    sources['Wordbase.sol'] = fs.readFileSync('contracts/Wordbase.sol', 'utf-8')
    sources['wordbaseClient.sol'] = fs.readFileSync('contracts/wordbaseClient.sol', 'utf-8')
    sources['TestContract.sol'] = fs.readFileSync('contracts/TestContract.sol', 'utf-8')
  })

  it ('should compile with solc', () => {
    solcOutput = solc.compile({ sources })
    if(solcOutput.errors && solcOutput.errors.length > 0) {
      throw new Error(solcOutput.errors[0])
    }
  })

  describe('Wordbase', () => {
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

  describe('WordbaseClient', () => {

    it('should deploy', () => {
      return chaithereum.web3.eth.contract(JSON.parse(solcOutput.contracts.wordbaseClient.interface)).new.q({
        data: solcOutput.contracts.wordbaseClient.bytecode
      }).should.eventually.be.a.contract.then((_wordbaseClient) => {
        wordbaseClient = _wordbaseClient
      })
    })

    it('should have .wordbase address', () => {
      return wordbaseClient.wordbase.q().should.eventually.be.an.address
    })

    it('should not have ._setWordbase exposed', () => {
      expect(wordbaseClient._setWordbase).to.be.undefined
    })

    it('should not have ._setWord exposed', () => {
      expect(wordbaseClient._setWord).to.be.undefined
    })

    it('should have getWord function', () => {
      return wordbaseClient.getWord.should.be.a.function
    })

  })

  describe('TestContract', () => {

    it('should deploy', () => {
      return chaithereum.web3.eth.contract(JSON.parse(solcOutput.contracts.TestContract.interface))
        .new.q(wordbase.address, {
          data: solcOutput.contracts.TestContract.bytecode
        }).should.eventually.be.a.contract.then((_testContract) => {
          testContract = _testContract
        })
    })

    it('should have wordbase address', () => {
      return testContract.wordbase.q().should.eventually.equal(wordbase.address)
    })

    it('should not have _setWordbase exposed', () => {
      expect(testContract._setWordbase).to.be.undefined
    })

    it('should not have _setWord exposed', () => {
      expect(testContract._setWord).to.be.undefined
    })

    it('should not have getWord exposed', () => {
      expect(testContract.getWord).to.be.a.function
    })

    it('should not have setWord exposed', () => {
      expect(testContract.setWord).to.be.a.function
    })

    it('should get [a, b, c] as zeros', () => {
      return testContract.getWord.q([a, b, c]).should.eventually.be.zeros
    })

    it('should set [a, b, c] to d', () => {
      return testContract.setWord.q([a, b, c], d).should.eventually.be.fulfilled
    })

    it('should get [a, b, c] as d', () => {
      return testContract.getWord.q([a, b, c]).should.eventually.equal(d)
    })

  })

})