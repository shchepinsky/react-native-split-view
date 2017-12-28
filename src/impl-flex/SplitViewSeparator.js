import PropTypes from 'prop-types'
import React from 'react'
import { PanResponder, StyleSheet, View } from 'react-native'

const INITIAL_OFFSET = {x: 0, y: 0}

const styles = StyleSheet.create({
  content: {
    zIndex: 1,
  },
  defaultSeparator: {
    backgroundColor: 'green',
  }
})

function renderDefaultSeparator (index, horizontal, dragging) {
  const style = {
    opacity: dragging ? 0.5 : 1.0
  }

  if (horizontal) {
    style.width = 20
    style.height = '100%'
  } else {
    style.height = 20
    style.width = '100%'
  }

  return (
    <View style={[styles.defaultSeparator, style]} key={index}/>
  )
}

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
        this.setState(() => ({dragging: true, offset: {...INITIAL_OFFSET}}))
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
        console.log('released')
        this.setState(() => ({dragging: false, offset: {...INITIAL_OFFSET}}))
        this.props.onDrag && this.props.onDrag(this.props.index, this.state.layout, this.state.offset)
      },
      onPanResponderTerminate: (evt, gestureState) => {
        // Another component has become the responder, so this gesture
        // should be cancelled
        console.log('terminated')
        this.setState(() => ({dragging: false, offset: {...INITIAL_OFFSET}}))
        this.props.onDrag && this.props.onDrag(this.props.index, this.state.layout, this.state.offset)
      },
      onShouldBlockNativeResponder: (evt, gestureState) => {
        // Returns whether this component should block native components from becoming the JS
        // responder. Returns true by default. Is currently only supported on android.
        return true
      },
    })

    this.state = {
      layout: null,
      offset: {...INITIAL_OFFSET},
      dragging: false,
    }
  }

  onDrag (evt, gestureState) {
    this.setState(state => {
      let offset = {
        ...state.offset,
        x: this.props.horizontal ? gestureState.dx : state.offset.x,
        y: this.props.horizontal ? state.offset.y : gestureState.dy,
      }

      return {
        offset,
      }
    })
  }

  onLayout (e) {
    const {layout} = e.nativeEvent
    this.setState(state => {
      if (!state.layout || layout.width !== state.layout.width || layout.height !== state.layout.height) {
        return {
          layout,
        }
      }
    })
  }

  renderShadowSeparator () {
    if (!this.state.dragging) {
      return
    }

    const shadow = this.props.renderSeparatorContent
      ? this.props.renderSeparatorContent(this.props.index, this.props.horizontal, this.state.dragging)
      : renderDefaultSeparator(this.props.index, this.props.horizontal, this.state.dragging)

    if (shadow) {
      // this has the same dimensions as normal separator but is offset accordingly yo gesture state
      const shadowOverlayContainerStyle = {
        position: 'absolute',
        zIndex: 2,
        left: this.state.layout.x,
        top: this.state.layout.y,
        width: this.state.layout.width,
        height: this.state.layout.height,
      }

      if (this.state.layout) {
        this.props.horizontal
          ? shadowOverlayContainerStyle.left = this.state.offset.x
          : shadowOverlayContainerStyle.top = this.state.offset.y
      }

      return (
        <View style={shadowOverlayContainerStyle}>
          {shadow}
        </View>
      )
    }
  }

  render () {
    const {
      renderSeparatorContent,
      ...rest
    } = this.props

    // decide which dimension to control based on horizontal or vertical mode
    const style = [
      styles.content,
      this.props.style,
    ]

    // this is normal separator
    const content = renderSeparatorContent
      ? renderSeparatorContent(this.props.index, this.props.horizontal, false)
      : renderDefaultSeparator(this.props.index, this.props.horizontal, false)

    // this is separator dragged over new position
    const shadow = this.renderShadowSeparator()

    return (
      <View
        {...rest}
        {...this._panResponder.panHandlers}
        style={style}
        onLayout={this.onLayout}
      >
        {content}
        {shadow}
      </View>
    )
  }
}

SplitViewSeparator.propTypes = {
  horizontal: PropTypes.bool,
}
