import React from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import {ComponentBase} from 'resub';
import Colors from '../../resources/Colors';
import Strings from '../../resources/String';

export class Retry extends ComponentBase<any, any> {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'white',
        }}>
        <View
          style={[
            {
              justifyContent: 'center',
              alignItems: 'center',
              marginHorizontal: 20,
            },
          ]}>
          <Text
            style={{
              color: Colors.text_primary_light,
              fontFamily: 'Muli-Regular',
              fontSize: 14,
            }}>
            {this.props.message}
          </Text>
          <TouchableOpacity
            onPress={() => {
              this.props.onPress();
            }}
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              width: 150,
              height: 40,
              marginTop: 5,
              backgroundColor: Colors.primary_color,
              borderRadius: 5,
              elevation: 4,
              shadowColor: Colors.primary_gradient_color,
            }}>
            <Text
              style={{
                color: Colors.white,
                fontFamily: 'Muli-Bold',
                fontSize: 20,
              }}>
              {Strings.button_retry}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}
