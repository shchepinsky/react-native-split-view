import PropTypes from 'prop-types'
import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { SplitViewSeparator } from './SplitViewSeparator'
import { SplitViewChild } from './SplitViewChild'

const DEFAULT_WEIGHT = 1

const styles = StyleSheet.create({
  normal: {
    overflow: 'hidden',
    flexDirection: 'column',
  },
  horizontal: {
    overflow: 'hidden',
    flexDirection: 'row',
  },
})

function renderContent (weights, children, onChildLayout, onSeparatorDrag, horizontal, renderSeparatorContent) {
  const content = []

  const last_i = weights.length - 1
  for (let i = 0; i <= last_i; i++) {
    content.push(
      <SplitViewChild
        index={i}
        weight={weights[i]}
        key={'block-' + i}
        horizontal={horizontal}
        onLayout={onChildLayout}
        children={children[i]}
      />
    )

    // push separators for all items except last
    if (i < last_i) {
      content.push(
        <SplitViewSeparator
          index={i}
          key={'separator-' + i}
          onDrag={onSeparatorDrag}
          horizontal={horizontal}
          renderSeparatorContent={renderSeparatorContent}
        />
      )
    }
  }

  return content
}

export class SplitView extends React.Component {

  constructor (props) {
    super(props)

    this.onLayout = this.onLayout.bind(this)
    this.onChildLayout = this.onChildLayout.bind(this)
    this.onDrag = this.onDrag.bind(this)

    const mapChildWeight = child => typeof child.props.weight === 'number'
      ? child.props.weight
      : DEFAULT_WEIGHT

    this.state = {
      layout: {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
      },
      weights: props.children.map(mapChildWeight),
      layouts: [],
      content: [],
    }
  }

  onLayout (e) {
    const {layout} = e.nativeEvent

    this.setState(state => {
      if (state.layout.width === layout.width && state.layout.height === layout.height) {
        console.log('layout not changed, no-op')
        return
      }

      const content = renderContent(
        state.weights,
        this.props.children,
        this.onChildLayout,
        this.onDrag,
        this.props.horizontal,
        this.props.renderSeparatorContent
      )

      return {
        layout,
        content,
      }
    })
  }

  onChildLayout (layout, index) {
    this.setState(state => {
      const layouts = state.layouts
      layouts[index] = layout
      return {
        layouts
      }
    })
  }

  onDrag (index, layout, offset) {
    this.setState(state => {
      // re-calculate weights of nearby blocks
      const {weights, layouts} = state
      const prev = layouts[index]
      const next = layouts[index + 1]
      const prevSize = this.props.horizontal ? prev.width : prev.height
      const nextSize = this.props.horizontal ? next.width : next.height

      // currently movement is restricted by nearby child outer bounds
      offset.x = offset.x < 0
        ? Math.max(offset.x, -prev.width)
        : Math.min(offset.x, +next.width)

      offset.y = offset.y < 0
        ? Math.max(offset.y, -prev.height)
        : Math.min(offset.y, +next.height)

      const sizeDelta = this.props.horizontal ? offset.x : offset.y

      const nearbyWeightSum = weights[index] + weights[index + 1]
      const nearbySizeSum = prevSize + nextSize
      const prevSizeNew = prevSize + sizeDelta
      const nextSizeNew = nextSize - sizeDelta

      weights[index] = nearbyWeightSum * prevSizeNew / nearbySizeSum
      weights[index + 1] = nearbyWeightSum * nextSizeNew / nearbySizeSum

      const content = renderContent(
        weights,
        this.props.children,
        this.onChildLayout,
        this.onDrag,
        this.props.horizontal,
        this.props.renderSeparatorContent
      )

      return {
        weights,
        content,
      }
    })
  }

  render () {
    const style = [
      this.props.horizontal
        ? styles.horizontal
        : styles.normal,
      this.props.style
    ]

    return this.state.content.length > 0 ? (
      <View style={style} onLayout={this.onLayout}>
        {this.state.content}
      </View>
    ) : (
      <View style={style} onLayout={this.onLayout}/>
    )
  }
}

SplitView.propTypes = {
  horizontal: PropTypes.bool,
  renderSeparatorContent: PropTypes.func,
}
