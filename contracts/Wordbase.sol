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

  function get(bytes32[] fields, uint32[] fieldsLengths) constant returns(bytes32[]) {
    
    bytes32[] memory values = new bytes32[](fieldsLengths.length);

    uint first = 0;
    uint last = fieldsLengths[0] - 1;
    uint valuesGotten = 0;

    bytes32[] memory currentFields = new bytes32[](last - first + 1);

    for (uint i = 0; i < fields.length; i ++) {

      currentFields[i - first] = fields[i];

      if(i == last) {
        
        values[valuesGotten] = _getNode(msg.sender, currentFields).value;

        valuesGotten++;
        
        if (values.length > valuesGotten) {
          first = i + 1;
          last = first + fieldsLengths[valuesGotten] - 1;
          currentFields = new bytes32[](last - first + 1);
        }
        
      }
    }

    return values;
  }

  function set(bytes32[] fields, uint32[] fieldsLengths, bytes32[] values) {
    
    uint first = 0;
    uint last = fieldsLengths[0] - 1;
    uint valuesSet = 0;

    bytes32[] memory currentFields = new bytes32[](last - first + 1);

    for (uint i = 0; i < fields.length; i ++) {

      currentFields[i - first] = fields[i];

      if(i == last) {
        
        _getNode(msg.sender, currentFields).value = values[valuesSet];

        valuesSet++;
        
        if (values.length > valuesSet) {
          first = i + 1;
          last = first + fieldsLengths[valuesSet] - 1;
          currentFields = new bytes32[](last - first + 1);
        }
        
      }
    }
  }

}