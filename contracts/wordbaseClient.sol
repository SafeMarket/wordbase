pragma solidity ^0.4.4;

import "Wordbase.sol";

contract wordbaseClient {

  Wordbase public wordbase;

  function _setWordbase(address wordbaseAddr) internal {
    wordbase = Wordbase(wordbaseAddr);
  }

  function _setWord (bytes32[] fields, bytes32 value) internal {
    wordbase.set(fields, value);
  }

  function getWord (bytes32[] fields) constant returns (bytes32) {
    return wordbase.get(fields);
  }

}