pragma solidity ^0.4.4;

import "Wordbase.sol";

contract TestContract {

  Wordbase public wordbase;
 
  function TestContract(address wordbaseAddr) {
    wordbase = Wordbase(wordbaseAddr);
  }

  function setWord(bytes32[] fields, bytes32 value){
    wordbase.set(fields, value);
  }
}