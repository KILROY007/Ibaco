//NewLogin

import React from 'react';
import {
  TouchableOpacity,
  View,
  StyleSheet,
  Keyboard,
  Image,
  StatusBar,
  Dimensions,
  ImageBackground,
  Alert,
  Platform,
} from 'react-native';
import {ComponentBase} from 'resub';
import {
  Container,
  Text,
  Input,
  Item,
  Content,
  Button,
  Tabs,
  Tab,
  Card,
} from 'native-base';
import {DependencyInjector} from '../../dependency-injector/DependencyInjector';
import {GoogleSignin} from '@react-native-google-signin/google-signin';;
import {LoginViewModel, LoginState} from '../../view-madel/LoginViewModel';
import ImageAssets from '../../assets';
import {TextField} from '../components/react-native-material-textfield';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-community/async-storage';
import {Retry} from '../common-components/Retry';
import {Loader} from '../common-components/Loader';
import OtpComponent from './OtpComponent';
import AlertComponent from '../common-components/Alert/Alert';
import Strings from '../../resources/String';
import {Colors} from 'react-native/Libraries/NewAppScreen';

const {width: viewportWidth, height: viewportHeight} = Dimensions.get('window');

export class LoginComponent extends ComponentBase<any, LoginState> {
  viewModel: LoginViewModel;
  secondTextInput: any;
  firstNameTextInput;
  lastNameTextInput;
  phoneNoTextInput;
  phoneNoForLoginTextInput;
  emailTextInput;
  otp;
  constructor(props: any) {
    super(props);
    this.viewModel = DependencyInjector.default().provideLoginViewModel();
    GoogleSignin.configure({
      // webClientId: '237456344198-3uhr72irtf0l2ihpberhbcndse4l5fkg.apps.googleusercontent.com',
      webClientId:
        '202908944050-c0io6qamb12u5qhedbbhlc716sf98tl4.apps.googleusercontent.com',
    });
  }

  componentWillUnmount() {
    if (Platform.OS === 'android') {
      this.unRegisterSMSRetriever();
    }
  }

  protected async registerSMSRetriever() {
    try {
      const SmsRetrieverModule = await import('react-native-sms-retriever');
      const SmsRetriever = SmsRetrieverModule.default;
      const registered = await SmsRetriever.startSmsRetriever();
      if (registered) {
        SmsRetriever.addSmsListener(event => {
          this.autoFillOTP(event.message);
          SmsRetriever.removeSmsListener();
        });
      }
    } catch (error) {}
  }

  protected async unRegisterSMSRetriever() {
    try {
      const SmsRetrieverModule = await import('react-native-sms-retriever');
      const SmsRetriever = SmsRetrieverModule.default;
      SmsRetriever.removeSmsListener();
    } catch (error) {}
  }

  private autoFillOTP(message: any) {
    if (message) {
      const otp = /[0-9]{6}/;
      const index = message.search(otp);
      this.viewModel.set('otp', message.substring(index, index + 6));
      if (this.state.otp) {
        this.viewModel.verifyOtp(this.state.otp);
      }
    }
  }

  componentDidMount() {
    if (
      this.props &&
      this.props.route.params &&
      this.props.route.params.isLogin
    ) {
      if (this.props.route.params.isLogin === true) {
        this.viewModel.set('isLogin', true);
        this.viewModel.set('isSignin', false);
      } else {
        this.viewModel.set('isLogin', false);
        this.viewModel.set('isSignin', true);
      }
    }
    if (Platform.OS === 'android') {
      this.registerSMSRetriever();
    }
  }

  componentDidUpdate() {
    if (this.state.error) {
      const alert = {
        shouldShowCancelButton: false,
        description: this.state.error.message,
        title: Strings.alert_title,
        okButtonText: Strings.button_ok,
        onCancelPress: () => {
          this.viewModel.set('alertDetails', undefined);
        },
        onOkPress: async () => {
          this.viewModel.set('alertDetails', undefined);
        },
      };
      this.viewModel.set('alertDetails', alert);
      this.viewModel.set('error', undefined);
    } else if (this.state.validationError) {
      const alert = {
        description: this.state.validationError.message,
        title: Strings.alert_title,
        okButtonText: Strings.button_ok,
        onOkPress: () => {
          this.viewModel.set('alertDetails', undefined);
        },
      };
      this.viewModel.set('alertDetails', alert);
      this.viewModel.set('validationError', undefined);
    } else if (this.state.onSuccess) {
      const alert = {
        description: Strings.alert_signup_success,
        title: Strings.alert_title,
        okButtonText: Strings.button_ok,
        onCancelPress: () => {
          this.viewModel.set('alertDetails', undefined);
        },
        onOkPress: () => {
          this.viewModel.set('alertDetails', undefined);
          this.viewModel.set('onSuccess', false);
          this.viewModel.set('clickOTPButton', true);
          this.viewModel.set('isSignUpSuccess', true);
        },
      };
      this.viewModel.set('alertDetails', alert);
      this.viewModel.set('onSuccess', false);
    } else if (this.state.onUpdatePhoneSuccess) {
      const alert = {
        description: Strings.alert_phoneNo_valid_success,
        title: Strings.alert_title,
        okButtonText: Strings.button_ok,
        onCancelPress: () => {
          this.viewModel.set('alertDetails', undefined);
        },
        onOkPress: () => {
          this.viewModel.set('alertDetails', undefined);
          this.viewModel.set('onUpdatePhoneSuccess', false);
          this.viewModel.set('clickOTPButton', true);
          this.viewModel.set('isSignUpSuccess', true);
        },
      };
      this.viewModel.set('alertDetails', alert);
      this.viewModel.set('onUpdatePhoneSuccess', false);
    } else if (this.state.onOtpSendSuccess) {
      const alert = {
        description: Strings.alert_onOtpSend,
        title: Strings.alert_title,
        okButtonText: Strings.button_ok,
        onCancelPress: () => {
          this.viewModel.set('alertDetails', undefined);
        },
        onOkPress: async () => {
          this.viewModel.set('alertDetails', undefined);
          this.viewModel.set('onOtpSendSuccess', false);
        },
      };
      this.viewModel.set('alertDetails', alert);
      this.viewModel.set('onOtpSendSuccess', false);
    } else if (this.state.onLogInSuccess) {
      const alert = {
        description: Strings.alert_login_success,
        title: Strings.alert_title,
        okButtonText: Strings.button_ok,
        onCancelPress: () => {
          this.viewModel.set('alertDetails', undefined);
        },
        onOkPress: async () => {
          this.viewModel.set('alertDetails', undefined);
          this.viewModel.set('onLogInSuccess', false);
          this.resetAllTextFieldsForLogin();
          this.viewModel.reset();
          this.viewModel.setShouldShowAccountStack();
          if (
            this.props &&
            this.props.route.params &&
            this.props.route.params.isLogin
          ) {
            this.props.navigation.navigate('Cart', {
              screen: 'CartComponent',
              params: {isUpdated: true},
            });
          } else {
            this.props.navigation.navigate('Shop', {
              screen: 'ShopComponent',
              params: {isUpdated: false},
            });
          }
        },
      };
      this.viewModel.set('alertDetails', alert);
      this.viewModel.set('onLogInSuccess', false);
    } else if (this.state.onSendOtp) {
      const alert = {
        shouldShowCancelButton: false,
        description: Strings.alert_onNoUser_found,
        title: Strings.alert_title,
        okButtonText: Strings.button_ok,
        onCancelPress: () => {
          this.viewModel.set('alertDetails', undefined);
        },
        onOkPress: async () => {
          this.viewModel.set('alertDetails', undefined);
          this.viewModel.set('onSendOtp', false);
        },
      };
      this.viewModel.set('alertDetails', alert);
      this.viewModel.set('onSendOtp', false);
    } else if (this.state.invalidOtp) {
      const alert = {
        shouldShowCancelButton: false,
        description: Strings.alert_onSend_invalidOTP,
        title: Strings.alert_title,
        okButtonText: Strings.button_ok,
        onCancelPress: () => {
          this.viewModel.set('alertDetails', undefined);
        },
        onOkPress: async () => {
          this.viewModel.set('alertDetails', undefined);
          this.viewModel.set('invalidOtp', false);
          this.viewModel.set('otp', '');
          this.otp.clear();
        },
      };
      this.viewModel.set('alertDetails', alert);
      this.viewModel.set('invalidOtp', false);
    } else if (this.state.newGoogleUserAlert) {
      const alert = {
        shouldShowCancelButton: false,
        description: 'Please enter your mobile number to continue',
        title: `welcome ${this.state.googleUserName}`,
        okButtonText: Strings.button_ok,
        onCancelPress: () => {
          this.viewModel.set('alertDetails', undefined);
        },
        onOkPress: async () => {
          this.viewModel.set('alertDetails', undefined);
          this.viewModel.set('newGoogleUserAlert', false);
        },
      };
      this.viewModel.set('alertDetails', alert);
      this.viewModel.set('newGoogleUserAlert', false);
    } else if (this.state.onOtpVerifiedSuccesfully) {
      const alert = {
        shouldShowCancelButton: false,
        description: Strings.alert_otpVerified_success,
        title: Strings.alert_title,
        okButtonText: Strings.button_ok,
        onCancelPress: () => {
          this.viewModel.set('alertDetails', undefined);
        },
        onOkPress: () => {
          this.viewModel.set('alertDetails', undefined);
          this.viewModel.set('onOtpVerifiedSuccesfully', false);
          this.viewModel.set('isSignUpSuccess', false);
          this.viewModel.set('clickOTPButton', false);
          this.phoneNoTextInput.clear();
          this.emailTextInput.clear();
          this.otp.clear();
          this.viewModel.reset();
          this.viewModel.setShouldShowAccountStack();
          this.props.navigation.navigate('Shop', {
            screen: 'ShopComponent',
            params: {isUpdated: false},
          });
        },
      };
      this.viewModel.set('alertDetails', alert);
      this.viewModel.set('onOtpVerifiedSuccesfully', false);
    }
  }

  // resetAllTextFields(){
  //   this.firstNameTextInput.clear();
  //   this.lastNameTextInput.clear();
  //   this.phoneNoTextInput.clear();
  //   this.emailTextInput.clear();
  // };
  resetAllTextFieldsForLogin = async () => {
    this.phoneNoForLoginTextInput.clear();
  };
  signIn = () => {
    GoogleSignin.signOut();
    GoogleSignin.signIn()
      .then(data => {
        GoogleSignin.getTokens().then(async res => {
          let googleForms = {
            firstname: data.user.givenName,
            lastname: data.user.familyName,
            auth_id: res.accessToken,
            phone_number: data.user.phone_number,
            email: data.user.email,
            email_verified: 1,
            img_url: data.user.photo,
          };
          this.viewModel.set('googleForm', googleForms);
          const response = await this.viewModel.checkUserFromGoogle(
            data.user.email,
          );
          if (
            (response[0].mobile && response[0].mobile.length < 10) ||
            response[0].status === 0
          ) {
            this.viewModel.set('newGoogleUser', true);
          } else {
            this.viewModel.set('oldGoogleUser', true);
            const res = await this.viewModel.createUserFromGoogle();
            if  (res) {
              this.viewModel.set('onLogInSuccess',true);
            }
          }
          const dataToken = {id_token: data.idToken};
        });
      })
      .catch(error => {
        console.log('google sdk error' + JSON.stringify(error));
      });
  };
  private handleGoogleLoginForm = (value: any) => {
    const googleForm = this.state.googleForm;
    // @ts-ignore
    googleForm.phone_number = value;
    this.viewModel.set('googleForm', googleForm);
  };
  private handleGoogleLogin = async () => {
    const response = await this.viewModel.validateGoogleUser();
    if (response) {
      this.viewModel.set('onLogInSuccess',true);
    }
  };
  public setCartGuestUsersCartDetails = async () => {
    // const cartSummary: any = await AsyncStorage.getItem('cartSummary')
    // const cartItems: any = await AsyncStorage.getItem('cartItems')
    // this.viewModel.setCartGuestUsersCartDetails(data)
  };
  public render() {
    if (this.state.loadError) {
      return (
        <Retry
          message={this.state.loadError.message}
          onPress={() => {
            this.viewModel.set('loadError', undefined);
          }}
        />
      );
    } else {
      return (
        <Container style={{flex: 1, backgroundColor: '#fff'}}>
          <StatusBar barStyle="light-content" backgroundColor="#020101" />

          <Content style={{flex: 1}}>
            {this.state.alertDetails && this.state.alertDetails.description ? (
              <AlertComponent
                visible={true}
                title={
                  this.state.alertDetails.title
                    ? this.state.alertDetails.title
                    : Strings.alert_title
                }
                description={this.state.alertDetails.description}
                okButtonText={
                  this.state.alertDetails.okButtonText
                    ? this.state.alertDetails.okButtonText
                    : Strings.button_ok
                }
                onOkPress={this.state.alertDetails.onOkPress}
                onCancelPress={async () => {
                  this.viewModel.set('alertDetails', undefined);
                }}
                cancelButtonText={Strings.text_cancel}
                shouldShowCancelButton={
                  this.state.alertDetails.shouldShowCancelButton
                }
              />
            ) : null}
            <View style={{flex: 0.4}}>
              <View
                style={{
                  marginTop: 40,
                  width: '100%',
                  height: '100%',
                  // flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: 40,
                }}>
                {/* <View style={{flex: 0.5}}>
                  <Image source={ImageAssets.login_chef} />
                </View> */}
                <View style={{justifyContent: 'center'}}>
                  <Card
                    style={{
                      backgroundColor: '#fff',
                      height: 82,
                      width: 170,
                      alignItems: 'center',
                      justifyContent: 'center',
                      alignContent: 'center',
                    }}>
                    <ImageBackground
                      source={ImageAssets.ibacologo}
                      style={{width: '100%', height: '100%'}}
                    />
                    {/* <Text style={{ color: "#FFFFFF", fontSize: 40, fontFamily: "Montserrat-Bold" }}>HAP</Text>
                    <Text style={{ color: "#FFFFFF", fontSize: 25 }}>daily</Text> */}
                  </Card>
                  {/* <Image source={ImageAssets.chopserve_icon} /> */}
                </View>
              </View>
            </View>
            <View style={{flex: 0.6}}>
              <View style={{flex: 1}}>
                {/* <ImageBackground
                  source={ImageAssets.login_background}
                  style={{ width: '100%', height: '100%', position: 'absolute' }}
                /> */}
                <View style={{marginTop: 15, width: '100%'}}>
                  <View
                    style={{
                      marginLeft: 10,
                      marginRight: 10,
                      marginTop: 15,
                      borderTopLeftRadius: 28,
                      borderTopRightRadius: 28,
                      borderBottomLeftRadius: 28,
                      borderBottomRightRadius: 28,
                    }}>
                    <LinearGradient
                      colors={['#f29365', '#ec2f23']}
                      style={{
                        borderTopLeftRadius: 28,
                        borderTopRightRadius: 28,
                        borderBottomLeftRadius: 28,
                        borderBottomRightRadius: 28,
                        flex: 1,
                        marginBottom: 60,
                      }}
                      start={{x: 1, y: 1}}
                      end={{x: 0, y: 0}}>
                      <View
                        style={{
                          marginLeft: 20,
                          marginTop: 30,
                          marginBottom: 60,
                        }}>
                        <View
                          style={{flexDirection: 'row', alignItems: 'center'}}>
                          <TouchableOpacity
                            style={{
                              marginRight: 20,
                              height: 50,
                              justifyContent: 'center',
                              alignItems: 'center',
                            }}
                            onPress={i => {
                              this.viewModel.set('isLogin', true);
                              this.viewModel.set('isSignin', false);
                              this.viewModel.set(
                                'clickOTPButtonForLogin',
                                false,
                              );
                              this.viewModel.set('mobileNumberForLogin', '');
                              this.viewModel.set('showAllTextField', true);
                              // this.resetAllTextFieldsForLogin();
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
                              {Strings.button_login}
                            </Text>
                          </TouchableOpacity>

                        {!this.state.newGoogleUser &&
                            <TouchableOpacity
                              style={{
                                height: 50,
                                justifyContent: 'center',
                                alignItems: 'center',
                              }}
                              onPress={() => {
                                this.viewModel.set('isLogin', false);
                                this.viewModel.set('isSignin', true);
                                // this.viewModel.set('clickOTPButton', false);
                                this.viewModel.set('showAllTextField', true);
                                // this.resetAllTextFields();
                              }}>
                              <Text
                                style={{
                                  color: !this.state.isLogin
                                    ? '#FFFFFF'
                                    : '#FF9696',
                                  fontFamily: 'Montserrat-ExtraBold',
                                  fontSize: 16,
                                }}>
                                {/* {!this.state.isLogin ? 'LOGIN' : 'SIGNUP'} */}
                                {Strings.button_signUp}
                              </Text>
                            </TouchableOpacity>
                          }
                        </View>
                        {/*******************NEW GOOGLE USER TEXTFIELD **********************/}
                        {this.state.newGoogleUser && (
                          <>
                            <View
                              style={{
                                marginTop: viewportWidth < 420 ? 10 : 9,
                              }}>
                              <View style={styles.phoneText}>
                                <Text
                                  style={{
                                    color: '#FFBBBB',
                                    fontFamily: 'Montserrat-Light',
                                  }}>
                                  {Strings.text_phone_number}
                                </Text>
                              </View>

                              <View style={{marginTop: 10}}>
                                <View
                                  style={{
                                    marginTop: 10,
                                    marginBottom: -64,
                                    marginLeft: 15,
                                  }}>
                                  <Text style={styles.stickyText}>+91</Text>
                                </View>
                                <View style={[styles.inputFieldOTP]}>
                                  <TextField
                                    autoCorrect={false}
                                    autoCompleteType="off"
                                    autoCapitalize="none"
                                    onChangeText={value => {
                                      let valueIs = value.replace(/\s/g, '');
                                      this.handleGoogleLoginForm(valueIs);;

                                 }}
                                    maxLength={10}
                                    value={this.state.googleForm.phone_number}
                                    returnKeyType="next"
                                    style={[styles.inputText1Login]}
                                    baseColor={'#FFBBBB'}
                                    labelTextStyle={{
                                      color: '#FFBBBB',
                                      fontFamily: 'Montserrat-Light',
                                    }}
                                    tintColor={'#FFBBBB'}
                                    keyboardType="number-pad"
                                    ref={input => {
                                      this.phoneNoForLoginTextInput = input;
                                    }}
                                    containerStyle={{
                                      borderBottomWidth: 1.5,
                                      borderColor: '#FFBBBB',
                                    }}
                                    activeLineWidth={0}
                                    lineWidth={0}
                                  />
                                </View>
                              </View>
                            </View>
                            <View
                              style={{
                                justifyContent: 'center',
                                alignItems: 'center',
                              }}>
                              <View style={styles.space} />
                              <TouchableOpacity
                                style={[styles.signInButtonTest]}
                                onPress={async () => {
                                  Keyboard.dismiss();
                                  this.handleGoogleLogin();
                                }}>
                                <Text style={styles.getOtpTest}>Continue</Text>
                              </TouchableOpacity>
                              <View style={styles.space} />
                            </View>
                          </>
                        )}
                        {/* ****************************************FOR LOGIN TEXT FIELDS************************************ */}
                        {this.state.showAllTextField &&
                          this.state.isLogin &&
                          !this.state.newGoogleUser && (
                            <View
                              style={{
                                marginTop: viewportWidth < 420 ? 10 : 9,
                              }}>
                              <View style={styles.phoneText}>
                                <Text
                                  style={{
                                    color: '#FFBBBB',
                                    fontFamily: 'Montserrat-Light',
                                  }}>
                                  {Strings.text_phone_number}
                                </Text>
                              </View>

                              <View style={{marginTop: 10}}>
                                <View
                                  style={{
                                    marginTop: 10,
                                    marginBottom: -64,
                                    marginLeft: 15,
                                  }}>
                                  <Text style={styles.stickyText}>+91</Text>
                                </View>
                                <View style={[styles.inputFieldOTP]}>
                                  <TextField
                                    autoCorrect={false}
                                    autoCompleteType="off"
                                    autoCapitalize="none"
                                    onChangeText={value => {
                                      let valueIs = value.replace(/\s/g, '');
                                      this.viewModel.set(
                                        'mobileNumberForLogin',
                                        valueIs,
                                      );
                                    }}
                                    maxLength={10}
                                    value={this.state.mobileNumberForLogin}
                                    returnKeyType="next"
                                    style={[styles.inputText1Login]}
                                    baseColor={'#FFBBBB'}
                                    labelTextStyle={{
                                      color: '#FFBBBB',
                                      fontFamily: 'Montserrat-Light',
                                    }}
                                    tintColor={'#FFBBBB'}
                                    keyboardType="number-pad"
                                    ref={input => {
                                      this.phoneNoForLoginTextInput = input;
                                    }}
                                    containerStyle={{
                                      borderBottomWidth: 1.5,
                                      borderColor: '#FFBBBB',
                                    }}
                                    activeLineWidth={0}
                                    lineWidth={0}
                                  />
                                </View>
                              </View>
                            </View>
                          )}
                        {this.state.clickOTPButtonForLogin != true &&
                          !this.state.newGoogleUser &&
                          this.state.isLogin && (
                            <View
                              style={{
                                justifyContent: 'center',
                                alignItems: 'center',
                              }}>
                              <View style={styles.space} />
                              <TouchableOpacity
                                style={[styles.signInButtonTest]}
                                onPress={async () => {
                                  Keyboard.dismiss();
                                  if (this.state.isLogin) {
                                    await this.viewModel.generateOtp();
                                  }
                                  if (this.state.isSignin) {
                                    await this.viewModel.signUp();
                                  }
                                }}>
                                <Text style={styles.getOtpTest}>
                                  {this.state.isLogin && Strings.button_getOtp}
                                </Text>
                              </TouchableOpacity>
                              <View style={styles.space} />
                            </View>
                          )}
                        {this.state.clickOTPButtonForLogin == true &&
                          !this.state.newGoogleUser &&
                          this.state.isLogin && (
                            <View>
                              <View style={styles.inputField2}>
                                <TextField
                                  autoCorrect={false}
                                  autoCompleteType="off"
                                  autoCapitalize="none"
                                  label={Strings.text_otp}
                                  onChangeText={value => {
                                    this.viewModel.set('otpForLogin', value);
                                  }}
                                  value={this.state.otpForLogin}
                                  maxLength={6}
                                  returnKeyType="next"
                                  style={styles.inputText1}
                                  baseColor={'#FFBBBB'}
                                  labelTextStyle={{
                                    color: '#FFBBBB',
                                    fontFamily: 'Montserrat-Light',
                                  }}
                                  tintColor={'#FFBBBB'}
                                  keyboardType="number-pad"
                                  ref={input => (this.otp = input)}
                                  containerStyle={{
                                    borderBottomWidth: 1.5,
                                    borderColor: '#FFBBBB',
                                  }}
                                  activeLineWidth={0}
                                  lineWidth={0}
                                  inputContainerStyle={{marginLeft: 0}}
                                />
                              </View>
                              <View
                                style={{
                                  marginTop:
                                    Platform.OS === 'android'
                                      ? viewportWidth < 450
                                        ? 0
                                        : -50
                                      : -30,
                                  alignSelf: 'flex-end',
                                  marginRight:
                                    Platform.OS === 'android'
                                      ? viewportWidth < 450
                                        ? 0
                                        : viewportWidth * 0.14
                                      : 0,
                                }}>
                                <TouchableOpacity
                                  onPress={async () => {
                                    await this.viewModel.generateOtp();
                                  }}
                                  style={[styles.addButton, {marginTop: -10}]}>
                                  <Text style={styles.addButtonText}>
                                    {Strings.button_resendOtp}
                                  </Text>
                                </TouchableOpacity>
                              </View>
                              <View
                                style={[styles.space, {marginBottom: 20}]}
                              />
                              <View
                                style={{
                                  justifyContent: 'center',
                                  alignItems: 'center',
                                }}>
                                <TouchableOpacity
                                  style={styles.signInButtonTest}
                                  onPress={async () => {
                                    Keyboard.dismiss();
                                    if (this.state.isLogin) {
                                      await this.viewModel.logIn();
                                    }
                                  }}>
                                  <Text style={styles.getOtpTest}>
                                    {Strings.button_login}
                                  </Text>
                                </TouchableOpacity>
                              </View>
                            </View>
                          )}
                        {/* ****************************************FOR SIGNUP TEXT FIELDS************************************ */}

                        {this.state.showAllTextField &&
                          this.state.isSignin &&
                          !this.state.newGoogleUser  && (
                            <View
                              style={{marginTop: viewportWidth < 420 ? 10 : 9}}>
                              <View style={styles.phoneText}>
                                <Text
                                  style={{
                                    color: '#FFBBBB',
                                    fontFamily: 'Montserrat-Light',
                                  }}>
                                  {Strings.text_phone_number}
                                </Text>
                              </View>
                              <View style={{marginTop: 10}}>
                                <View
                                  style={{
                                    marginTop: 10,
                                    marginBottom: -64,
                                    marginLeft: 15,
                                  }}>
                                  <Text style={styles.stickyText}>+91</Text>
                                </View>
                                <View style={[styles.inputFieldOTP]}>
                                  <TextField
                                    autoCorrect={false}
                                    autoCompleteType="off"
                                    autoCapitalize="none"
                                    onChangeText={value => {
                                      let valueIs = value.replace(/\s/g, '');
                                      this.viewModel.set(
                                        'mobileNumber',
                                        valueIs,
                                      );
                                    }}
                                    maxLength={10}
                                    value={this.state.mobileNumber}
                                    returnKeyType="next"
                                    style={[styles.inputText1Login]}
                                    baseColor={'rgba(163, 178, 191, 1)'}
                                    labelTextStyle={{
                                      color: '#FFBBBB',
                                      fontFamily: 'Montserrat-Light',
                                    }}
                                    tintColor={'#FFBBBB'}
                                    keyboardType="number-pad"
                                    ref={input => {
                                      this.phoneNoTextInput = input;
                                    }}
                                    editable={
                                      this.state.editNumber ? false : true
                                    }
                                    containerStyle={{
                                      borderBottomWidth: 1.5,
                                      borderColor: '#FFBBBB',
                                    }}
                                    activeLineWidth={0}
                                    lineWidth={0}
                                  />
                                </View>
                              </View>
                              {this.state.isSignUpSuccess && (
                                <View
                                  style={{
                                    marginTop:
                                      Platform.OS === 'android'
                                        ? viewportWidth < 450
                                          ? -10
                                          : -20
                                        : -30,
                                    alignSelf: 'flex-end',
                                    marginRight:
                                      Platform.OS === 'android'
                                        ? viewportWidth < 450
                                          ? 0
                                          : viewportWidth * 0.14
                                        : 0,
                                  }}>
                                  <TouchableOpacity
                                    onPress={async () => {
                                      this.viewModel.set('editNumber', false);
                                      // await this.viewModel.generateOtp();
                                    }}
                                    style={[
                                      styles.addButton,
                                      {marginTop: -10},
                                    ]}>
                                    <Text style={styles.addButtonText}>
                                      {Strings.button_edit_phoneNumber}
                                    </Text>
                                  </TouchableOpacity>
                                </View>
                              )}
                              {!this.state.isLogin &&
                                this.state.isSignin &&
                                !this.state.newGoogleUser  && (
                                  <View>
                                    {!this.state.isSignUpSuccess && (
                                      <View>
                                        <View style={{marginTop: 0}} />
                                        <View style={styles.inputField}>
                                          <TextField
                                            autoCorrect={false}
                                            autoCompleteType="off"
                                            autoCapitalize="none"
                                            label={Strings.text_first_name}
                                            onChangeText={value => {
                                              let valueIs = value.replace(
                                                /\s/g,
                                                '',
                                              );
                                              this.viewModel.set(
                                                'firstname',
                                                valueIs,
                                              );
                                            }}
                                            value={this.state.firstname}
                                            returnKeyType="next"
                                            style={styles.inputText1}
                                            baseColor={'#FFBBBB'}
                                            labelTextStyle={{
                                              color: '#FFBBBB',
                                              fontFamily: 'Montserrat-Light',
                                            }}
                                            tintColor={'#FFBBBB'}
                                            keyboardType="default"
                                            ref={input =>
                                              (this.firstNameTextInput = input)
                                            }
                                            containerStyle={{
                                              borderBottomWidth: 1.5,
                                              borderColor: '#FFBBBB',
                                            }}
                                            activeLineWidth={0}
                                            lineWidth={0}
                                            inputContainerStyle={{
                                              marginLeft: 0,
                                            }}
                                          />
                                        </View>
                                        <View
                                          style={{
                                            marginTop: 0,
                                          }}
                                        />
                                        <View style={styles.inputField}>
                                          <TextField
                                            autoCorrect={false}
                                            autoCompleteType="off"
                                            autoCapitalize="none"
                                            label={Strings.text_last_name}
                                            onChangeText={value => {
                                              let valueIs = value.replace(
                                                /\s/g,
                                                '',
                                              );
                                              this.viewModel.set(
                                                'lastname',
                                                valueIs,
                                              );
                                            }}
                                            value={this.state.lastname}
                                            returnKeyType="next"
                                            style={styles.inputText1}
                                            baseColor={'#FFBBBB'}
                                            labelTextStyle={{
                                              color: '#FFBBBB',
                                              fontFamily: 'Montserrat-Light',
                                            }}
                                            tintColor={'#FFBBBB'}
                                            keyboardType="default"
                                            ref={input =>
                                              (this.lastNameTextInput = input)
                                            }
                                            containerStyle={{
                                              borderBottomWidth: 1.5,
                                              borderColor: '#FFBBBB',
                                            }}
                                            activeLineWidth={0}
                                            lineWidth={0}
                                            inputContainerStyle={{
                                              marginLeft: 0,
                                            }}
                                          />
                                        </View>
                                      </View>
                                    )}
                                    <View
                                      style={{
                                        marginTop:
                                          this.state.isSignUpSuccess &&
                                          viewportWidth > 450
                                            ? 30
                                            : 0,
                                      }}
                                    />
                                    <View style={styles.inputField2}>
                                      <TextField
                                        autoCorrect={false}
                                        autoCompleteType="off"
                                        autoCapitalize="none"
                                        label={Strings.text_email}
                                        onChangeText={value => {
                                          let valueIs = value.replace(
                                            /\s/g,
                                            '',
                                          );
                                          this.viewModel.set('email', valueIs);
                                        }}
                                        value={this.state.email}
                                        returnKeyType="next"
                                        style={styles.inputText1}
                                        baseColor={'#FFBBBB'}
                                        labelTextStyle={{
                                          color: '#FFBBBB',
                                          fontFamily: 'Montserrat-Light',
                                        }}
                                        tintColor={'#FFBBBB'}
                                        keyboardType="default"
                                        ref={input =>
                                          (this.emailTextInput = input)
                                        }
                                        editable={
                                          this.state.isSignUpSuccess
                                            ? false
                                            : true
                                        }
                                        containerStyle={{
                                          borderBottomWidth: 1.5,
                                          borderColor: '#FFBBBB',
                                        }}
                                        activeLineWidth={0}
                                        lineWidth={0}
                                        inputContainerStyle={{marginLeft: 0}}
                                      />
                                    </View>
                                    {/* <View style={{marginTop: 15}} /> */}
                                  </View>
                                )}
                            </View>
                          )}
                        <View
                          style={
                            this.state.clickOTPButton != true &&
                            !this.state.editNumber &&
                            this.state.isSignin
                              ? styles.space
                              : {marginTop: viewportWidth < 420 ? 30 : 0}
                          }
                        />

                        {/* //OTP BUTTON */}

                        {this.state.clickOTPButton != true &&
                          !this.state.newGoogleUser  &&
                          !this.state.editNumber &&
                          this.state.isSignin && (
                            <View
                              style={{
                                justifyContent: 'center',
                                alignItems: 'center',
                              }}>
                              <View style={styles.space} />
                              <TouchableOpacity
                                style={styles.signInButton}
                                onPress={async () => {
                                  Keyboard.dismiss();
                                  if (this.state.isLogin) {
                                    await this.viewModel.generateOtp();
                                  }
                                  if (this.state.isSignin) {
                                    await this.viewModel.signUp();
                                  }
                                }}>
                                <Text style={styles.getOtpTest}>
                                  {this.state.isSignin &&
                                    !this.state.isLogin &&
                                    Strings.button_register}
                                </Text>
                              </TouchableOpacity>
                              <View style={styles.space} />
                            </View>
                          )}
                        {/* FOR OTP FIELD */}

                        {this.state.clickOTPButton == true &&
                          this.state.isSignin && (
                            <View>
                              {this.state.editNumber && (
                                <View style={styles.inputField2}>
                                  <TextField
                                    autoCorrect={false}
                                    autoCompleteType="off"
                                    autoCapitalize="none"
                                    label={Strings.text_otp}
                                    onChangeText={value => {
                                      this.viewModel.set('otp', value);
                                    }}
                                    value={this.state.otp}
                                    maxLength={6}
                                    returnKeyType="next"
                                    style={styles.inputText1}
                                    baseColor={'#FFBBBB'}
                                    labelTextStyle={{
                                      color: '#FFBBBB',
                                      fontFamily: 'Montserrat-Light',
                                    }}
                                    tintColor={'#FFBBBB'}
                                    keyboardType="number-pad"
                                    ref={input => (this.otp = input)}
                                    containerStyle={{
                                      borderBottomWidth: 1.5,
                                      borderColor: '#FFBBBB',
                                    }}
                                    activeLineWidth={0}
                                    lineWidth={0}
                                    inputContainerStyle={{marginLeft: 0}}
                                  />
                                </View>
                              )}
                              {this.state.editNumber && (
                                <View
                                  style={{
                                    marginTop:
                                      Platform.OS === 'android'
                                        ? viewportWidth < 450
                                          ? viewportWidth < 450
                                            ? 22
                                            : -5
                                          : -40
                                        : -30,
                                    alignSelf: 'flex-end',
                                    marginRight:
                                      Platform.OS === 'android'
                                        ? viewportWidth < 450
                                          ? 0
                                          : viewportWidth * 0.14
                                        : 0,
                                  }}>
                                  <TouchableOpacity
                                    onPress={async () => {
                                      await this.viewModel.generateOtp();
                                    }}
                                    style={[
                                      styles.addButton,
                                      {
                                        marginTop:
                                          Platform.OS === 'android'
                                            ? viewportWidth < 420
                                              ? -30
                                              : -40
                                            : -40,
                                      },
                                    ]}>
                                    <Text style={styles.addButtonText}>
                                      {Strings.button_resendOtp}
                                    </Text>
                                  </TouchableOpacity>
                                </View>
                              )}
                              <View
                                style={[styles.space, {marginBottom: 25}]}
                              />
                              <View
                                style={{
                                  justifyContent: 'center',
                                  alignItems: 'center',
                                }}>
                                <TouchableOpacity
                                  style={styles.signInButton}
                                  onPress={async () => {
                                    Keyboard.dismiss();
                                    if (this.state.isLogin) {
                                      await this.viewModel.logIn();
                                    } else if (this.state.isSignUpSuccess) {
                                      if (this.state.editNumber) {
                                        const data = {
                                          otp: Number(this.state.otp),
                                          email: this.state.email,
                                          customerNumber: this.state
                                            .mobileNumber,
                                        };
                                        await this.viewModel.verifyOtp(data);
                                      } else {
                                        const data = {
                                          email: this.state.email,
                                          customerNumberNew: this.state
                                            .mobileNumber,
                                        };
                                        await this.viewModel.updateMobileNumber(
                                          data,
                                        );
                                      }
                                      // this.viewModel.reset();
                                    }
                                  }}>
                                  <Text style={styles.getOtpTest}>
                                    {this.state.isLogin
                                      ? Strings.button_login
                                      : this.state.isSignUpSuccess &&
                                        !this.state.editNumber
                                      ? Strings.button_update
                                      : Strings.button_verify}
                                  </Text>
                                </TouchableOpacity>
                              </View>
                            </View>
                          )}

                        {/* FOR GOOGLE BUTTON */}
                        {!this.state.newGoogleUser && (
                          <View style={{marginTop: 2}}>
                            <Text
                              style={[styles.nextText3, {textAlign: 'center'}]}>
                              {Strings.text_or}
                            </Text>
                            <View
                              style={{
                                marginRight: 30,
                                height: 40,
                                borderRadius: 14,
                                justifyContent: 'center',
                                marginTop: 30,
                              }}>
                              <TouchableOpacity
                                style={[
                                  {justifyContent: 'center'},
                                  styles.googleButton,
                                ]}
                                onPress={() => {
                                  this.signIn();
                                }}>
                                <View
                                  style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                  }}>
                                  <View style={{flex: 2, alignItems: 'center'}}>
                                    <Image
                                      source={ImageAssets.google_icon}
                                      style={styles.buttonImages}
                                    />
                                  </View>
                                  <View style={styles.horizentalLine} />

                                  <View style={[{flex: 8}]}>
                                    <Text style={styles.googleText}>
                                      {Strings.button_google_login}
                                    </Text>
                                  </View>
                                </View>
                              </TouchableOpacity>
                            </View>
                          </View>
                        )}
                      </View>
                    </LinearGradient>
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
    return this.viewModel.getState();
  }
}

const styles = StyleSheet.create({
  button: {
    flex: 1,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#ec2f23',
    fontFamily: 'Montserrat-ExtraBold',
    fontSize: 16,
    paddingLeft: 35,
    paddingRight: 33,
  },

  space: {
    marginTop: 28,
  },
  inputFieldPhone: {
    height: viewportHeight * 0.065,
    width: viewportWidth * 0.79,
    marginLeft: 20,
    marginTop: -2.05,
  },
  inputFieldOTP: {
    width: viewportWidth * 0.79,
    marginLeft: 20,
  },
  inputField: {
    flexDirection: 'column',
    width: viewportWidth * 0.79,
    justifyContent: 'flex-start',
    marginLeft: 15,
  },
  inputText1: {
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Bold',
    fontSize: viewportWidth < 450 ? 18 : 22,
    marginBottom: viewportWidth < 450 ? -8 : -4,
    // flexDirection: 'column',
    // alignContent: 'flex-start',
  },
  inputText1Login: {
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Bold',
    fontSize: viewportWidth < 450 ? 18 : 22,
    marginLeft: viewportWidth < 450 ? 33 : 42,
    marginBottom: viewportWidth < 450 ? -8 : -4,
    // marginTop: 40,
  },
  signInButton: {
    height: viewportHeight * 0.07,
    width: viewportWidth * 0.4,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    color: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signInButtonTest: {
    height: viewportHeight * 0.07,
    width: viewportWidth * 0.4,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    color: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  getOtpTest: {
    color: '#ec2f23',
    fontFamily: 'Montserrat-Bold',
    fontWeight: 'bold',
    fontSize: viewportWidth < 450 ? 18 : 26,
  },
  getOtp: {
    height: viewportWidth < 450 ? 20 : 52,
    width: viewportWidth < 450 ? 110 : 140,
    color: '#ec2f23',
    fontFamily: 'Montserrat-Bold',
    fontWeight: 'bold',
    fontSize: viewportWidth < 450 ? 18 : 26,
    alignContent: 'center',
    marginVertical: viewportWidth < 450 ? 12 : 21,
    textAlign: 'center',
  },
  logInButton: {
    height: viewportWidth < 450 ? 20 : 50,
    width: viewportWidth < 450 ? 85 : 90,
    color: '#ec2f23',
    fontFamily: 'Montserrat-Bold',
    fontSize: viewportWidth < 450 ? 18 : 26,
    alignContent: 'center',
    textAlign: 'center',
    marginVertical: viewportWidth < 450 ? 12 : 21,
  },
  space2: {
    marginTop: -3,
  },
  nextText3: {
    // height: viewportWidth < 450 ? 20 : 50,
    // width: viewportWidth < 450 ? 24 : 50,
    color: '#FFB8B8',
    fontFamily: 'Montserrat-Bold',
    fontSize: viewportWidth < 450 ? 18 : 28,
  },
  googleButton: {
    borderColor: '#FFABAB',
    height: viewportHeight * 0.07,
    width: viewportWidth * 0.7,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderRadius: 30,
    elevation: 0,
    alignItems: 'center',
    alignContent: 'center',
    alignSelf: 'center',
  },
  googleText: {
    color: '#FFFFFF',
    height:
      viewportWidth < 450 ? viewportHeight * 0.03 : viewportHeight * 0.041,
    width: viewportWidth * 0.5,
    fontFamily: 'Montserrat-Bold',
    fontSize: viewportWidth < 450 ? 13 : 18,
    alignContent: 'center',
    marginVertical: viewportWidth < 450 ? 20 : 30,
    textAlign: 'center',
  },
  horizentalLine: {
    height: viewportHeight * 0.07,
    borderLeftWidth: 1,
    borderLeftColor: '#FF9696',
  },
  buttonImages: {
    height: viewportWidth < 450 ? 20 : 30,
    width: viewportWidth < 450 ? 20 : 30,
    alignItems: 'center',
  },
  addButton: {
    backgroundColor: 'transparent',
    marginTop: viewportWidth < 420 ? 0 : -10,
  },
  addButtonText: {
    color: '#FFFFFF',
    height: viewportWidth < 450 ? 15 : 20,
    width: viewportWidth < 450 ? 110 : 110,
    fontFamily: 'Montserrat-Light',
    fontSize: viewportWidth < 450 ? 12 : 16,
    fontWeight: 'bold',
  },
  inputField2: {
    flexDirection: 'column',
    height: viewportHeight * 0.08,
    width: viewportWidth * 0.8,
    justifyContent: 'flex-start',
    marginLeft: 15,
  },
  stickyText: {
    color: '#f3a5a5',
    fontFamily: 'Montserrat-Bold',
    fontSize: viewportWidth < 450 ? 18 : 22,
    flexDirection: 'column',
    alignContent: 'flex-end',
  },
  phoneText: {
    marginTop: 10,
    marginBottom: -25,
    marginLeft: 15,
  },
});
