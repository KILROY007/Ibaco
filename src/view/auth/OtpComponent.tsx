import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  Image,
  ImageBackground,
  Dimensions,
  Keyboard,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import { ComponentBase } from 'resub';
import { LoginState, LoginViewModel } from '../../view-madel/LoginViewModel';
import LinearGradient from 'react-native-linear-gradient';
import { Content, Container } from 'native-base';
import ImageAssets from '../../assets';
import { TextField } from '../components/react-native-material-textfield';
import { Retry } from '../common-components/Retry';
import { Loader } from '../common-components/Loader';

const { width: viewportWidth, height: viewportHeight } = Dimensions.get('window');

export default class OtpComponent extends ComponentBase<any, LoginState> {
  emailTextInput;
  constructor(props) {
    super(props);
  }

  componentDidUpdate() {
    if (this.state.onOtpVerifiedSuccesfully) {
      const alert = {
        shouldShowCancelButton: true,
        description: 'Otp verified successfully.',
        title: 'HAPDailySays',
        okButtonText: 'OK',
        onCancelPress: () => {
          this.props.viewModel.set('alertDetails', undefined)
        },
        onOkPress: async () => {
          this.props.viewModel.set('onOtpVerifiedSuccesfully', false);
          this.props.viewModel.set('isSignUpSuccess', false);
          this.props.viewModel.set('clickOTPButton', false);
          this.props.resetAllTextFields();
          this.props.viewModel.reset();
          this.props.viewModel.setShouldShowAccountStack();
          this.props.navigation.navigate('Shop', {
            screen: 'ShopComponent',
            params: { isUpdated: true },
          });
        },
      };
      this.props.viewModel.set('alertDetails', alert);
      this.props.viewModel.set('onOtpVerifiedSuccesfully', false);
    }
  }

  render() {

    if (this.state.loadError) {
      return (
        <Retry
          message={this.state.loadError.message}
          onPress={() => {
            this.props.viewModel.set('loadError', undefined);
          }}
        />
      );
    } else {
      return (
        <Container style={{ flex: 1, backgroundColor: '#ffffff' }}>
          <StatusBar barStyle="default" backgroundColor={Colors.primary_gradient_color_header} />
          <Content contentContainerStyle={{ flex: 1 }}>
            <View style={{ flex: 3 }}>
              <View
                style={{
                  width: '100%',
                  height: '100%',
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                <View style={{ flex: 0.5 }}>
                  <Image source={ImageAssets.login_chef} />
                </View>
                <View style={{ flex: 0.5 }}>
                  <Image source={ImageAssets.chopserve_icon} />
                </View>
              </View>
            </View>
            <View style={{ flex: 7 }}>
              <View style={{ flex: 1 }}>
                <ImageBackground
                  source={ImageAssets.login_background}
                  style={{ width: '100%', height: '100%', position: 'absolute' }}
                />
                <View style={{ marginTop: 15, width: '100%' }}>
                  <View
                    style={{
                      marginLeft: 10,
                      marginTop: 15,
                      borderTopLeftRadius: 28,
                      borderBottomLeftRadius: 28,
                    }}>
                    <LinearGradient
                      colors={['#f29365', '#ec2f23']}
                      style={{
                        borderTopLeftRadius: 28,
                        borderBottomLeftRadius: 28,
                        flex: 1,
                        marginBottom: 60,
                      }}
                      start={{ x: 1, y: 1 }}
                      end={{ x: 0, y: 0 }}>
                      <View
                        style={{
                          marginLeft: 20,
                          marginTop: 30,
                          marginBottom: 60,
                        }}>
                        <View
                          style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <TouchableOpacity
                            style={{
                              marginRight: 20,
                              height: 50,
                              justifyContent: 'center',
                              alignItems: 'center',
                            }}
                            onPress={i => {
                              // this.viewModel.set('isLogin', true);
                              // this.viewModel.set('isSignin', false);
                              // this.viewModel.set('clickOTPButton', false);
                              // this.viewModel.set('showAllTextField', true);
                            }}>
                            <Text
                              style={{
                                color: this.state.isLogin
                                  ? '#FFFFFF'
                                  : '#FF9696',
                                fontFamily: 'Montserrat-ExtraBold',
                                fontSize: 16,
                              }}>
                              {/* {this.state.isLogin ? 'LOGIN' : 'SIGNUP'} */}
                              OTP
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </LinearGradient>
                    <View>
                      <View style={{ marginTop: 20 }} />
                      <View
                        style={{
                          flexDirection: 'column',
                          height: viewportHeight * 0.079,
                          width: viewportWidth * 0.8,
                          justifyContent: 'flex-start',
                          marginLeft: 15,
                        }}>
                        <TextField
                          autoCorrect={false}
                          autoCompleteType="off"
                          autoCapitalize="none"
                          label="Email"
                          onChangeText={value => {
                            this.props.viewModel.set('email', value);
                          }}
                          value={this.props.data.email}
                          returnKeyType="next"
                          style={{
                            height: viewportWidth < 450 ? 18 : 26,
                            width:
                              viewportWidth < 450 ? viewportWidth * 1 : 450,
                            color: '#FFFFFF',
                            fontFamily: 'Montserrat-Bold',
                            fontSize: viewportWidth < 450 ? 18 : 22,
                            flexDirection: 'column',
                            alignContent: 'flex-start',
                          }}
                          baseColor={'#FFBBBB'}
                          labelTextStyle={{
                            color: '#FFBBBB',
                            fontFamily: 'Montserrat-Light',
                          }}
                          tintColor={'#FFBBBB'}
                          keyboardType="default"
                          ref={input => (this.emailTextInput = input)}
                        />
                      </View>
                      <View
                        style={{
                          flexDirection: 'column',
                          height: viewportHeight * 0.079,
                          width: viewportWidth * 0.8,
                          justifyContent: 'flex-start',
                          marginLeft: 15,
                        }}>
                        <TextField
                          autoCorrect={false}
                          autoCompleteType="off"
                          autoCapitalize="none"
                          label="PhoneNumber"
                          onChangeText={value => {
                            this.props.viewModel.set('mobileNumber', value);
                          }}
                          value={this.props.data.phNo}
                          returnKeyType="next"
                          style={{
                            height: viewportWidth < 450 ? 18 : 26,
                            width:
                              viewportWidth < 450 ? viewportWidth * 1 : 450,
                            color: '#FFFFFF',
                            fontFamily: 'Montserrat-Bold',
                            fontSize: viewportWidth < 450 ? 18 : 22,
                            flexDirection: 'column',
                            alignContent: 'flex-start',
                          }}
                          baseColor={'#FFBBBB'}
                          labelTextStyle={{
                            color: '#FFBBBB',
                            fontFamily: 'Montserrat-Light',
                          }}
                          tintColor={'#FFBBBB'}
                          keyboardType="default"
                          ref={input => (this.emailTextInput = input)}
                        />
                      </View>
                      <View
                        style={{
                          flexDirection: 'column',
                          height: viewportHeight * 0.079,
                          width: viewportWidth * 0.8,
                          justifyContent: 'flex-start',
                          marginLeft: 15,
                        }}>
                        <TextField
                          autoCorrect={false}
                          autoCompleteType="off"
                          autoCapitalize="none"
                          label="Otp"
                          onChangeText={value => {
                            this.props.viewModel.set('otp', value);
                          }}
                          value={this.state.otp}
                          returnKeyType="next"
                          style={{
                            height: viewportWidth < 450 ? 18 : 26,
                            width:
                              viewportWidth < 450 ? viewportWidth * 1 : 450,
                            color: '#FFFFFF',
                            fontFamily: 'Montserrat-Bold',
                            fontSize: viewportWidth < 450 ? 18 : 22,
                            flexDirection: 'column',
                            alignContent: 'flex-start',
                          }}
                          baseColor={'#FFBBBB'}
                          labelTextStyle={{
                            color: '#FFBBBB',
                            fontFamily: 'Montserrat-Light',
                          }}
                          tintColor={'#FFBBBB'}
                          keyboardType="default"
                          ref={input => (this.emailTextInput = input)}
                        />
                      </View>
                      <View
                        style={{
                          marginTop:
                            Platform.OS === 'android'
                              ? viewportWidth < 450
                                ? -10
                                : -60
                              : -30,
                          alignSelf: 'flex-end',
                        }}>
                        <TouchableOpacity
                          onPress={async () => {
                            await this.props.viewModel.generateOtp();
                          }}
                          style={styles.addButton}>
                          <Text style={styles.addButtonText}>RESEND OTP</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                    <View>
                      <View style={styles.space} />
                      <TouchableOpacity
                        style={styles.signInButton}
                        onPress={() => {
                          Keyboard.dismiss();
                          const data = {
                            otp: Number(this.state.otp),
                            email: this.props.data.email,
                            customerNumber: this.props.data.phNo,
                          };
                          this.props.viewModel.verifyOtp(data);
                        }}>
                        <Text style={styles.getOtp}>VERIFY</Text>
                      </TouchableOpacity>
                      <View style={styles.space} />
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </Content>
          {this.state.isLoading ? <Loader isTransperant={true} /> : null}
        </Container>
      );
    }
  }

  protected _buildState() {
    if (this.props.viewModel) {
      return this.props.viewModel.getState();
    }
  }
}

const styles = StyleSheet.create({
  signInButton: {
    height: viewportHeight * 0.07,
    width: viewportWidth * 0.4,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    color: '#FFFFFF',
    alignItems: 'center',
    alignContent: 'center',
    alignSelf: 'center',
  },
  getOtp: {
    height: viewportWidth < 450 ? 20 : 52,
    width: viewportWidth < 450 ? 110 : 140,
    color: '#ec2f23',
    fontFamily: 'Montserrat-Bold',
    fontWeight: 'bold',
    fontSize: viewportWidth < 450 ? 18 : 26,
    alignSelf: 'center',
    marginVertical: viewportWidth < 450 ? 12 : 21,
    textAlign: 'center',
  },
  space: {
    marginTop: 28,
  },
  addButton: {
    backgroundColor: 'transparent',
  },
  addButtonText: {
    color: '#FFFFFF',
    height: viewportWidth < 450 ? 15 : 20,
    width: viewportWidth < 450 ? 110 : 110,
    fontFamily: 'Montserrat-Light',
    fontSize: viewportWidth < 450 ? 12 : 16,
    fontWeight: 'bold',
  },
});
