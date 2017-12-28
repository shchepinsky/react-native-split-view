import PropTypes from 'prop-types'
import React from 'react'
import { PanResponder, StyleSheet, Text, View } from 'react-native'

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'green',
  },
  title: {
    textAlign: 'center',
    backgroundColor: 'transparent',
  },
})

export class SplitViewSeparator extends React.Component {
  constructor (props) {
    super(props)

    this.onLayout = this.onLayout.bind(this)
    this.onDrag = this.onDrag.bind(this)

    this._panResponder = PanResponder.create({
      // Ask to be the responder:
      onStartShouldSetPanResponder: (evt, gestureState) => true,
      onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => true,
      onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,

      onPanResponderGrant: (evt, gestureState) => {
        // The gesture has started. Show visual feedback so the user knows
        // what is happening!

        // gestureState.d{x,y} will be set to zero now
        this.setState(state => ({
          originalLayout: state.layout,
        }))
      },
      onPanResponderMove: (evt, gestureState) => {
        // The most recent move distance is gestureState.move{X,Y}

        this.onDrag && this.onDrag(evt, gestureState)

        // The accumulated gesture distance since becoming responder is
        // gestureState.d{x,y}
      },
      onPanResponderTerminationRequest: (evt, gestureState) => true,
      onPanResponderRelease: (evt, gestureState) => {
        // The user has released all touches while this view is the
        // responder. This typically means a gesture has succeeded
        this.props.onDrag && this.props.onDrag(this.props.index, this.state.layout, this.state.originalLayout)
      },
      onPanResponderTerminate: (evt, gestureState) => {
        // Another component has become the responder, so this gesture
        // should be cancelled
        this.props.onDrag && this.props.onDrag(this.props.index, this.state.originalLayout, this.state.originalLayout)
      },
      onShouldBlockNativeResponder: (evt, gestureState) => {
        // Returns whether this component should block native components from becoming the JS
        // responder. Returns true by default. Is currently only supported on android.
        return true
      },
    })

    this.state = {
      layout: {...props.layout},
      originalLayout: {...props.layout}
    }
  }

  onDrag (evt, gestureState) {
    this.setState(state => {
      let layout = {
        ...state.layout,
        y: state.originalLayout.y + gestureState.dy,
        width: this.props.layout.width,
      }

      layout = this.props.clampLayout
        ? this.props.clampLayout(layout, this.props.index)
        : layout

      this.props.onDrag && this.props.onDrag(this.props.index, layout, state.originalLayout)

      return {
        layout,
      }
    })
  }

  onLayout (e) {
    const {layout} = e.nativeEvent
    this.setState(state => {
      if (layout.width !== state.layout.width || layout.height !== state.layout.height) {
        return {
          originalLayout: layout,
          layout: layout,
        }
      }
    })
  }

  render () {
    const {children, ...rest} = this.props

    console.log(this.state.layout.y)

    // decide which dimension to control based on horizontal or vertical mode
    const style = {
      position: 'absolute',
      zIndex: 999,
      left: this.state.layout.x,
      top: this.props.layout.y,
      width: this.props.layout.width,
      height: this.state.layout.height,
    }

    return (
      <View
        {...rest}
        {...this._panResponder.panHandlers}
        style={style}
        onLayout={this.onLayout}
      >
        <View style={styles.content}>
          <Text style={styles.title}>separator</Text>
          {children}
        </View>
      </View>
    )
  }
}

SplitViewSeparator.propTypes = {
  clampLayout: PropTypes.func,
}
