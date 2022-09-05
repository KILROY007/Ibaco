import React, { Component, useState } from 'react';
import {
  Alert,
  Modal,
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Strings from '../../../resources/String';
const { width: viewportWidth, height: viewportHeight } = Dimensions.get('window');

export default class AlertComponent extends React.Component<any, {}> {
  componentDidMount() {
    this.setState({ visible: this.props.visible });
  }

  state = {
    visible: false,
    isThemeToggled: false,
  };
  render() {
    return (
      <View style={styles.centeredView}>
        <Modal
          animationType="slide"
          transparent={true}
          visible={this.state.visible}
          onRequestClose={() => { }}>
          <View
            style={{
              flex: 1,
              backgroundColor: 'rgba(1,1,1,0.5)',
              alignSelf: 'center',
              height: viewportHeight,
              width: viewportWidth,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <View
              style={{
                width: '90%',
                backgroundColor: '#f7f7f7',
                borderRadius: 10,
                shadowColor: '#000',
                shadowOffset: {
                  width: 0,
                  height: 2,
                },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
                alignSelf: 'center',
              }}>
              {/* <LinearGradient
                colors={['#f29365', '#ec2f23']}
                style={{
                  height: 40,
                  width: '100%',
                  borderTopLeftRadius: 10,
                  borderTopRightRadius: 10,
                  justifyContent: 'center',
                }}>
                <Text
                  style={{
                    marginLeft: 10,
                    color: '#ffffff',
                    fontSize: 16,
                    fontWeight: 'bold',
                  }}>
                  {this.props.title ? this.props.title : 'HAPDailySays...'}
                </Text>
              </LinearGradient> */}
              <View>
                <Text
                  numberOfLines={5}
                  style={{ margin: 15, fontSize: 16, color: '#000' }}>
                  {this.props.description}
                </Text>
              </View>
              <View
                style={{
                  borderBottomRightRadius: 10,
                  paddingBottom: 10,
                  borderBottomLeftRadius: 10,
                  flexDirection: 'row',
                  justifyContent: 'flex-end',
                  marginRight: 10,
                }}>
                {this.props.shouldShowCancelButton ? (
                  <TouchableOpacity
                    onPress={() => {
                      this.props.onCancelPress
                        ? this.props.onCancelPress()
                        : null;
                      this.setState({
                        visible: false,
                      });
                    }}
                    style={{ alignSelf: 'center' }}>
                    <LinearGradient
                      style={{
                        height: 28,
                        width: 80,
                        borderRadius: 5,
                        paddingTop: 3,
                      }}
                      colors={['#f29365', '#ec2f23']}>
                      <Text
                        style={{
                          textAlign: 'center',
                          fontWeight: '700',
                          color: '#ffffff',
                        }}>
                        {this.props.cancelButtonText}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                ) : null}
                <TouchableOpacity
                  onPress={() => {
                    this.props.onOkPress();
                  }}
                  style={{ alignSelf: 'center', marginLeft: '10%' }}>
                  <LinearGradient
                    style={{
                      height: 28,
                      width: 100,
                      borderRadius: 5,
                      paddingTop: 3,
                    }}
                    colors={['#f29365', '#ec2f23']}>
                    <Text
                      style={{
                        textAlign: 'center',
                        fontWeight: '700',
                        color: '#ffffff',
                      }}>
                    {this.props.okButtonText}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  openButton: {
    backgroundColor: '#F194FF',
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
});
