import React from 'react'
import { ComponentBase } from 'resub'
import {
  Dimensions,
  StyleSheet,
} from 'react-native'
import {
  Text,
  View,
} from 'native-base'

const { width: viewportWidth, height: viewportHeight } = Dimensions.get('window')

export class MethodsComponent extends ComponentBase<any, {}> {
  constructor(props: any) {
    super(props)
  }
  public render() {
    const methods = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]
    return (
      <View style={{ marginBottom: 20, marginRight: 10 }}>
        {methods.map((item: any, index: any) => {
          return this.props.data[`method_` + item] ? <View key={'method' + index} style={{ marginLeft: 10, alignItems: 'flex-start' }}>
            <Text style={styles.ingredientText}>{this.props.data[`method_` + item]}</Text>
          </View> : null
        })}
      </View>
    )
  }
}
const styles = StyleSheet.create({
  ingredientList: {
    marginTop: 30,
    height: viewportHeight * 0.1,
    width: viewportWidth * 0.6,
  },
  ingredientText: {
    fontSize: 14,
    marginTop: 30,
    fontFamily: 'Montserrat-Bold',
    color: '#999999',
  },
})
