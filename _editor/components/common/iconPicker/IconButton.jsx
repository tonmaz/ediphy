import React, { Component } from 'react';

/* eslint-disable react/prop-types */
class IconButton extends Component {
    constructor(props) {
        super(props);
        this.onClick = this.onClick.bind(this);
    }

    render() {
        return (<div onClick={this.onClick}> <i className="material-icons">{this.props.text}</i></div>);
    }
    onClick() {
        this.props.handleClick(this.props.text);
    }
}

export default IconButton;
/* eslint-enable react/prop-types */