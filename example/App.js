/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react'
import { Switch, Platform, StyleSheet, Text, View } from 'react-native'
import { SplitView } from 'react-native-split-view'

const instructions = Platform.select({
  ios: 'Press Cmd+R to reload,\n' +
  'Cmd+D or shake for dev menu',
  android: 'Double tap R on your keyboard to reload,\n' +
  'Shake or press menu button for dev menu',
})

class CustomSeparatorContent extends React.Component {
  render () {
    const {horizontal, dragging} = this.props

    const style = {
      backgroundColor: 'silver',
      borderWidth: 1,
      zIndex: 1,
      borderColor: 'green',
      justifyContent: 'center',
      alignItems: 'center',
      opacity: dragging ? 0.5 : 1.0
    }

    if (horizontal) {
      style.width = 40
      style.flexDirection = 'row'
      style.height = '100%'
    } else {
      style.height = 40
      style.width = '100%'
    }

    const textStyle = {
      position: 'absolute',
      transform: [
        { rotate: horizontal ? '-90deg' : '0deg' }
      ],
    }

    return (
      <View style={style}>
        <Text style={textStyle}>{horizontal ? 'horizontal' : 'vertical'} </Text>
      </View>
    )
  }
}

export default class App extends Component<{}> {
  constructor (props) {
    super(props)
    this.state = {
      horizontal: false,
    }

    this.toggleHorizontal = this.toggleHorizontal.bind(this)
    this.renderCustomSeparatorContent = this.renderCustomSeparatorContent.bind(this)
  }

  renderCustomSeparatorContent (index, horizontal, dragging) {
    return (
      <CustomSeparatorContent
        index={index}
        dragging={dragging}
        horizontal={horizontal}
      />
    )
  }

  toggleHorizontal() {
    this.setState( state => ({horizontal: !state.horizontal}) )
  }

  render () {
    return (
      <View style={styles.container}>
        <Switch value={this.state.horizontal} onValueChange={this.toggleHorizontal} />
        <SplitView
          style={styles.flex}
          renderSeparatorContent={this.renderCustomSeparatorContent}
          horizontal={this.state.horizontal}
        >
          <View style={styles.block1} weight={1}>
            <Text style={styles.welcome}>
              Welcome to React Native!
            </Text>
          </View>
          <View style={styles.block2} weight={2}>
            <Text style={styles.instructions}>
              To get started, edit App.js
            </Text>
          </View>
          <View style={styles.block3} weight={3}>
            <Text style={styles.instructions}>
              {instructions}
            </Text>
          </View>
          <View style={styles.block4} weight={4}>
            <Text style={styles.welcome}>
              Enjoy SplitView
            </Text>
          </View>
        </SplitView>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    flex: 1,
    marginTop: Platform.select({
      ios: 20,
    })
  },
  flex: {
    flex: 1,
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
  block1: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'wheat',
  },
  block2: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'beige',
  },
  block3: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'whitesmoke',
  },
  block4: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'snow',
  }
})
