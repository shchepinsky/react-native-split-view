import PropTypes from 'prop-types'
import React from 'react'
import { View } from 'react-native'

export class SplitViewChild extends React.Component {
  constructor (props) {
    super(props)
    this.onLayout = this.onLayout.bind(this)
  }

  onLayout (e) {
    const {layout} = e.nativeEvent
    this.props.onLayout && this.props.onLayout(layout, this.props.index)
  }

  render () {
    const styles = { flexBasis: 1, flex: this.props.weight }
    return (
      <View
        {...this.props}
        style={styles}
        onLayout={this.onLayout}
      />
    )
  }
}

SplitViewChild.propTypes = {
  index: PropTypes.number.isRequired,
  weight: PropTypes.number.isRequired,
}
