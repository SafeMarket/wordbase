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
  let testContract

  it('should get sources', () => {
    sources['Wordbase.sol'] = fs.readFileSync('contracts/Wordbase.sol', 'utf-8')
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
      return wordbase.set['bytes32[],bytes32'].q([a, b, c], d).should.eventually.be.fulfilled
    })

    it('should set [a, b, c, d, e] to f', () => {
      return wordbase.set['bytes32[],bytes32'].q([a, b, c, d, e], f).should.eventually.be.fulfilled
    })

    it('should mutli-set [a] to b', () => {
      return wordbase.set['bytes32[],uint32[],bytes32[]'].q([a], [1] ,[b]).should.eventually.be.fulfilled
    })

    it('should mutli-set [b] to c, [c] to d, [d] to e, [a, b] to c, [c, d, e] to f, [f] to a', () => {
      return wordbase.set['bytes32[],uint32[],bytes32[]'].q(
        [b, c, d, a, b, c, d, e, f],
        [1, 1, 1, 2, 3, 1],
        [c, d, e, c, f, a]
      ).should.eventually.be.fulfilled
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

    it('should get(bytes32[]) [a] as b', () => {
     return wordbase.get['bytes32[]'].q([a]).should.eventually.be.equal(b)
    })

    it('should get(bytes32[]) [b] as c', () => {
     return wordbase.get['bytes32[]'].q([b]).should.eventually.be.equal(c)
    })

    it('should get(bytes32[]) [c] as d', () => {
     return wordbase.get['bytes32[]'].q([c]).should.eventually.be.equal(d)
    })

    it('should get(bytes32[]) [d] as e', () => {
     return wordbase.get['bytes32[]'].q([d]).should.eventually.be.equal(e)
    })

    it('should get(bytes32[]) [a, b] as c', () => {
     return wordbase.get['bytes32[]'].q([a, b]).should.eventually.be.equal(c)
    })

    it('should get(bytes32[]) [c, d, e] as f', () => {
     return wordbase.get['bytes32[]'].q([c, d, e]).should.eventually.be.equal(f)
    })

    it('should get(bytes32[]) [f] as a', () => {
     return wordbase.get['bytes32[]'].q([f]).should.eventually.be.equal(a)
    })

    it('should multi-get(bytes32[],uint32[]) [a, b, c] as d', () => {
     return wordbase.get['bytes32[],uint32[]'].q([a, b, c], [3]).should.eventually.be.deep.equal([d])
    })

    it('should multi-get(bytes32[],uint32[]) [a, b, c, d, e] as f, [a] as b, [a, b] as c', () => {
     return wordbase.get['bytes32[],uint32[]'].q(
      [
        a, b, c, d, e,
        a,
        a, b
      ], [
        5,
        1,
        2
      ]).then((values) => {
        values.should.be.instanceOf(Array)
        values.should.have.length(3)
        values[0].should.equal(f)
        values[1].should.equal(b)
        values[2].should.equal(c)
      }).should.be.fulfilled
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

    it('should not have _setWord exposed', () => {
      expect(testContract._setWord).to.be.undefined
    })

    it('should not have setWord exposed', () => {
      expect(testContract.setWord).to.be.a.function
    })

    it('should get [a, b, c] as zeros', () => {
      return wordbase.get['address,bytes32[]'].q(testContract.address, [a, b, c]).should.eventually.be.zeros
    })

    it('should set [a, b, c] to d', () => {
      return testContract.setWord.q([a, b, c], d).should.eventually.be.fulfilled
    })

    it('should get [a, b, c] as d', () => {
      return wordbase.get['address,bytes32[]'].q(testContract.address, [a, b, c]).should.eventually.equal(d)
    })

  })

})