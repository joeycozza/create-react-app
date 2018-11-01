import React, {Component} from 'react';
import {connect} from 'react-redux';

function ExampleTimestamp(props) {
  return <div>{props.timestamp}</div>;
}

function mapStateToProps(state) {
  return {
    timestamp: state.example.timestamp,
  };
}

export default connect(mapStateToProps)(ExampleTimestamp);
