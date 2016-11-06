pragma solidity ^0.4.4;

contract Wordbase {

  struct Node {
    bytes32 value;
    mapping(bytes32 => Node) nodes;
  }

  mapping(address => Node) realms;

  function _getNode(address addr , bytes32[] fields) internal returns (Node storage) {
    Node node = realms[addr];
    for (uint i = 0; i < fields.length; i ++) {
      node = node.nodes[fields[i]];
    }
    return node;
  }

  function get(address addr, bytes32[] fields) constant returns (bytes32) {
    return _getNode(addr, fields).value;
  }

  function get(bytes32[] fields) constant returns (bytes32) {
    return get(msg.sender, fields);
  }

  function set(bytes32[] fields, bytes32 value) {
    _getNode(msg.sender, fields).value = value;
  }

}