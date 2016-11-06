pragma solidity ^0.4.4;

import "wordbaseClient.sol";

contract TestContract is wordbaseClient {
 
  function TestContract(address wordbaseAddr) {
    _setWordbase(wordbaseAddr);
  }

  function setWord(bytes32[] fields, bytes32 value){
    _setWord(fields, value);
  }
}