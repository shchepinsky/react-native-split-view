import PropTypes from 'prop-types'
import React from 'react'
import { StyleSheet, View } from 'react-native'
import { SplitViewSeparator } from './SplitViewSeparator'

const SEPARATOR_SIZE = 40
const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
  },
  col: {
    flexDirection: 'column', // is default, but set explicitly for convenience
  },
})

const isBlock = (index) => index % 2 === 0
const isSeparator = (index) => index % 2 !== 0

export class SplitView extends React.Component {

  constructor (props) {
    super(props)

    this.onLayout = this.onLayout.bind(this)
    this.clampSeparatorLayout = this.clampSeparatorLayout.bind(this)
    this.onDrag = this.onDrag.bind(this)
    this.calcDefaultBlockLayouts = this.calcDefaultBlockLayouts.bind(this)
    this.renderBlock = this.renderBlock.bind(this)

    this.state = {
      layout: {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
      },
      blockLayouts: [],
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

      let blockLayouts = state.blockLayouts.length > 0
        ? this.recalculateLayoutsIntoNewContainer(layout)
        : this.calcDefaultBlockLayouts(layout, this.props.children)

      let content = blockLayouts.map(this.renderBlock)

      return {
        layout,
        content,
        blockLayouts,
      }
    })
  }

  recalculateLayoutsIntoNewContainer (containerLayout) {
    const blockLayouts = []
    const max_i = this.state.blockLayouts.length - 1

    // calculate amount of space used by separator and blocks in previous layout
    let prevBlockSpace = 0
    let separatorSpace = 0
    for (let i = 0; i <= max_i; i++) {
      const layout = this.state.blockLayouts[i]
      isBlock(i)
        ? prevBlockSpace += layout.height
        : separatorSpace += layout.height
    }

    // space available for all blocks in new layout
    const nextBlockSpace = containerLayout.height - separatorSpace

    // scale each block needs to be resized to fit into new space available
    const scale = nextBlockSpace / prevBlockSpace

    let offsetY = containerLayout.y
    for (let i = 0; i <= max_i; i++) {
      const prevLayout = this.state.blockLayouts[i]
      const nextHeight = isBlock(i)
        ? prevLayout.height * scale
        : SEPARATOR_SIZE

      const nextLayout = {
        ...prevLayout,
        x: prevLayout.x,
        y: offsetY,
        width: containerLayout.width,
        height: nextHeight
      }

      offsetY += nextHeight

      blockLayouts[i] = nextLayout
    }

    return blockLayouts
  }

  calcDefaultBlockLayouts (containerLayout, children = []) {
    const blockLayouts = []

    if (children) {
      children = Array.isArray(children)
        ? children
        : [children]
    }

    const separatorCount = children.length - 1
    const blockCount = children.length

    let x = 0
    let y = 0

    let blockWidth = containerLayout.width
    let blockHeight = (containerLayout.height - separatorCount * SEPARATOR_SIZE) / blockCount

    for (let i = 0; i < children.length; i++) {
      const blockLayout = {
        x: x,
        y: y,
        width: blockWidth,
        height: blockHeight,
        // min values used for constraints
        minHeight: 0,
      }

      y = y + blockHeight

      blockLayouts.push(blockLayout)

      if (i < children.length - 1) {
        // push separator layout for all elements except last
        const separatorLayout = {
          x: x,
          y: y,
          width: blockWidth,
          height: SEPARATOR_SIZE,
          // min values used for constraints
          minHeight: SEPARATOR_SIZE,
        }

        y = y + SEPARATOR_SIZE

        blockLayouts.push(separatorLayout)
      }
    }

    return blockLayouts
  }

  renderBlock (blockLayout, blockIndex) {
    const blockStyle = {
      position: 'absolute',
      left: blockLayout.x,
      top: blockLayout.y,
      width: blockLayout.width,
      height: blockLayout.height,
    }

    const content = isBlock(blockIndex)
      ? this.props.children[blockIndex / 2]
      : null

    return isBlock(blockIndex) ? (
      <View style={blockStyle} key={'block-' + blockIndex}>
        {content}
      </View>
    ) : (
      <SplitViewSeparator
        style={blockStyle}
        layout={blockLayout}
        index={blockIndex}
        key={'separator-' + blockIndex}
        onDrag={this.onDrag}
        clampLayout={this.clampSeparatorLayout}
      />
    )
  }

  clampSeparatorLayout (layout, blockIndex) {
    // limit to container by default
    let minY = this.state.layout.y
    let maxY = this.state.layout.y + this.state.layout.height - layout.minHeight

    // process all heights of all blocks before an after current block
    for (let i = 0; i < this.state.blockLayouts.length; i++) {
      const blockLayout = this.state.blockLayouts[i]

      if (i < blockIndex) {
        // blocks before
        minY += blockLayout.minHeight
      }

      if (i > blockIndex) {
        // blocks after
        maxY -= blockLayout.minHeight
      }
    }

    const clamped = {...layout}

    // clamp to calculated values
    if (clamped.y < minY) {
      clamped.y = minY
    } else if (clamped.y > maxY) {
      clamped.y = maxY
    }

    // now constrain to nearby blocks
    const prevBlockLayout = this.state.blockLayouts[blockIndex - 1]
    const nextBlockLayout = this.state.blockLayouts[blockIndex + 1]
    if (clamped.y < prevBlockLayout.y + prevBlockLayout.minHeight) {
      clamped.y = prevBlockLayout.y + prevBlockLayout.minHeight
    } else if (clamped.y + clamped.height > nextBlockLayout.y + nextBlockLayout.height) {
      clamped.y = nextBlockLayout.y - clamped.height
    }

    return clamped
  }

  onDrag (separatorIndex, separatorLayout, originalLayout) {

    this.setState(state => {
      let {content, blockLayouts} = state
      // re-calculate only nearby blocks and separator itself
      const priorBlockLayout = {
        ...blockLayouts[separatorIndex - 1],
        height: separatorLayout.y - blockLayouts[separatorIndex - 1].y
      }

      const nextBlockLayout = {
        ...blockLayouts[separatorIndex + 1],
        y: separatorLayout.y + separatorLayout.height,
        height: blockLayouts[separatorIndex + 2] // change height accordingly to parent layout or next block
          ? blockLayouts[separatorIndex + 2].y - (separatorLayout.y + separatorLayout.height)
          : this.state.layout.height - (separatorLayout.y + separatorLayout.height),
      }

      blockLayouts[separatorIndex - 1] = priorBlockLayout
      blockLayouts[separatorIndex] = separatorLayout
      blockLayouts[separatorIndex + 1] = nextBlockLayout

      const prevChildIndex = (separatorIndex - 1) / 2
      const nextChildIndex = (separatorIndex + 1) / 2

      content[separatorIndex - 1] = this.renderBlock(priorBlockLayout, separatorIndex - 1, prevChildIndex)
      content[separatorIndex] = this.renderBlock(separatorLayout, separatorIndex)
      content[separatorIndex + 1] = this.renderBlock(nextBlockLayout, separatorIndex + 1, nextChildIndex)

      return {
        blockLayouts,
        content,
      }
    })
  }

  render () {
    return this.state.content.length > 0 ? (
      <View style={this.props.style} onLayout={this.onLayout}>
        {this.state.content}
      </View>
    ) : (
      <View style={this.props.style} onLayout={this.onLayout}/>
    )
  }
}

SplitView.propTypes = {
  horizontal: PropTypes.bool,
}
