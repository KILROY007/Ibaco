import React from 'react';
import {ComponentBase} from 'resub';
import {DependencyInjector} from '../../dependency-injector/DependencyInjector';
import {
  Dimensions,
  StyleSheet,
  StatusBar,
  Keyboard,
  Image,
  TouchableOpacity,
  Platform,
  RefreshControl,
  Linking
} from 'react-native';
import {
  Container,
  Text,
  Content,
  Button,
  View,
  List,
  ListItem,
  Radio,
  Icon,
  Item,
} from 'native-base';
import {
  OrderTrackingViewModel,
  OrderTrackingState,
} from '../../view-madel/OrderTrackingViewModel';
import ImageAssets from '../../assets';
import LinearGradient from 'react-native-linear-gradient';
import {useFocusEffect} from '@react-navigation/native';
import {ModalPopUp} from '../common-components/ModalPopUp';
import MapView, {
  Marker,
  Polyline,
  AnimatedRegion,
  PROVIDER_GOOGLE,
} from 'react-native-maps';
import haversine from 'haversine';
import StepIndicator from 'react-native-step-indicator';
import {Loader} from '../common-components/Loader';
import {DateUtils} from '../../core/DateUtils';
import {OrderTrackingEndPageComponent} from './OrderTrackingEndPageComponent';
import AsyncStorage from '@react-native-community/async-storage';
import {Retry} from '../common-components/Retry';
import Colors from '../../resources/Colors';
import Strings from '../../resources/String';
import {WebView} from 'react-native-webview';

const {width: viewportWidth} = Dimensions.get('window');
function FetchUserData({doApiCall}) {
  useFocusEffect(
    React.useCallback(() => {
      doApiCall();
    }, []),
  );

  return null;
}
const stepIndicatorStyles = {
  stepIndicatorSize: 20,
  currentStepIndicatorSize: 20,
  separatorStrokeWidth: 2,
  currentStepStrokeWidth: 3,
  stepStrokeCurrentColor: '#EB6A6A',
  separatorFinishedColor: '#EB6A6A',
  separatorUnFinishedColor: '#aaaaaa',
  stepIndicatorFinishedColor: '#EB6A6A', // FOR IMAGE
  stepIndicatorUnFinishedColor: '#ffffff',
  stepIndicatorCurrentColor: '#ffffff',
  stepIndicatorLabelFontSize: 18,
  currentStepIndicatorLabelFontSize: 18,
  stepIndicatorLabelCurrentColor: '#000000',
  stepIndicatorLabelFinishedColor: '#EB6A6A',
  stepIndicatorLabelUnFinishedColor: 'rgba(255,255,255,0.5)',
  labelColor: '#aaaaaa',
  labelSize: 20,
  labelFontFamily: 'Montserrat-Bold',
  currentStepLabelColor: '#EB6A6A',
  labelAlign: 'flex-start',
  separatorStrokeUnfinishedWidth: 1,
  separatorStrokeFinishedWidth: 1,
  stepStrokeWidth: 3,
  stepStrokeUnFinishedColor: '#AAAAAA',
  stepStrokeFinishedColor: '#EB6A6A',

  stepIndicatorFinishedImage: ImageAssets.order_tracking_radiobutton_complete,
};

export class OrderTrackingComponent extends ComponentBase<
  any,
  OrderTrackingState
> {
  viewModel: OrderTrackingViewModel;
  secondTextInput: any;
  watchID;
  marker: any;
  viewabilityConfig;
  constructor(props: any) {
    super(props);
    this.viewModel = DependencyInjector.default().provideOrderTrackingViewModel();
    this.viewabilityConfig = {itemVisiblePercentThreshold: 60};
  }

  componentDidMount() {
    this.viewModel.set(
      'addresstype',
      this.props.route.params.isUpdateTrackOrder,
    );
    const id = this.props.route.params
      ? this.props.route.params.response
      : null;
    if (id) {
      this.viewModel.getOrderTrackingUpdate(id);
    }
  }

  async componentDidUpdate() {
    if (this.state.isOrderCancelled) {
      await AsyncStorage.removeItem('OrderId');
      await AsyncStorage.removeItem('OrderResponse');
    }
  }
  public _doApiCall = async () => {
    const id = this.props.route.params
      ? this.props.route.params.response
      : null;
    if (id) {
      await this.viewModel.loadData(id);
    }
  };

  public render() {
    if (this.state.error) {
      return (
        <Retry
          message={this.state.error.message}
          onPress={() => {
            this.viewModel.set('error', undefined);
            const id = this.props.route.params
              ? this.props.route.params.response
              : null;
            if (id) {
              this.viewModel.getOrderTrackingUpdate(id);
            }
          }}
        />
      );
    } else if (
      this.state.isOrderCancelled ||
      (this.props.route.params &&
        this.props.route.params.orderItem.status === 'canceled')
    ) {
      return (
        <View style={{flex: 1, backgroundColor: Colors.white}}>
          <View style={{marginLeft: 20, marginRight: 17}}>
            <View style={styles.headeText}>
              <Text style={styles.textHead}>{Strings.text_order_status}</Text>
              <TouchableOpacity
                style={styles.collapsButton}
                onPress={async () => {
                  this.viewModel.set('isOrderCancelled', false);
                  // await AsyncStorage.removeItem('OrderId');
                  // await AsyncStorage.removeItem('OrderResponse');
                  this.ShouldOrderPlacedScreen();
                }}>
                <Image
                  source={ImageAssets.cross}
                  style={{alignSelf: 'center'}}
                />
              </TouchableOpacity>
            </View>

            <View style={{flexDirection: 'row'}}>
              <View>
                <Image
                  source={ImageAssets.Order_cancelled}
                  style={{resizeMode: 'contain'}}
                />
              </View>
              <View style={{padding: 8}}>
                <Text
                  style={{
                    fontFamily: 'Montserrat-Bold',
                    fontSize: 18,
                    color: Colors.primary_color,
                  }}>
                  {Strings.text_order_cancel}
                </Text>

                <Text
                  style={{
                    fontFamily: 'Montserrat-Light',
                    fontSize: 12,
                    color: '#3A3A3A',
                    marginTop: 11,
                  }}>
                  {Strings.text_order_cancel_description}
                </Text>
                <TouchableOpacity onPress={() => Linking.openURL(`mailto:${Strings.text_contact_details}`)}>
                <Text style={[styles.subText, { color: Colors.primary_color, marginTop: 5, textAlign:"center" }]}>
                  {Strings.text_contact_details}
                </Text>
                </TouchableOpacity>
              </View>
            </View>
            {/* <View style={{ flexDirection: 'row', padding: 12 }}>
                            <View style={{ flex: 0.4 }}>
                                <View style={{ alignItems: 'center' }}>
                                    <Image
                                        source={ImageAssets.Order_cancelled}
                                        style={{ resizeMode: 'contain' }}
                                    />
                                </View>
                            </View>
                            <View>
                                <View>
                                    <Text
                                        style={{
                                            fontFamily: 'Montserrat-Bold',
                                            fontSize: 18,
                                            color: Colors.primary_color,
                                        }}>
                                        {Strings.text_order_cancel}
                                    </Text>
                                    <Text
                                        style={{
                                            fontFamily: 'Montserrat-Light',
                                            fontSize: 12,
                                            color: '#3A3A3A',
                                            marginTop: 11,
                                        }}>
                                        {Strings.text_order_cancel_description}
                                    </Text>
                                </View>
                            </View>
                        </View> */}
            <View style={{marginTop: 43}}>
              <TouchableOpacity
                style={{height: 40, alignSelf: 'center'}}
                onPress={async () => {
                  this.viewModel.set('isOrderCancelled', false);
                  this.viewModel.set('isLoading', true);
                  await AsyncStorage.removeItem('OrderId');
                  await AsyncStorage.removeItem('OrderResponse');
                  this.viewModel.set('isLoading', true);
                  this.ShouldOrderPlacedScreen();
                }}>
                <LinearGradient
                  colors={['#EEEEEE', '#FFFFFF']}
                  style={[
                    {
                      flex: 1,
                      justifyContent: 'center',
                      alignItems: 'center',
                      borderWidth: 1,
                      borderColor: '#ec2f23',
                      borderRadius: 14,
                    },
                  ]}>
                  <Text
                    style={{
                      fontSize: 16,
                      fontFamily: 'Montserrat-ExtraBold',
                      color: Colors.primary_color,
                      paddingLeft: 21,
                      paddingRight: 20,
                    }}>
                    {Strings.button_review_order}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      );
    } else if (this.state.shouldShowOrderPlacedState) {
      return (
        <Container>
          <StatusBar barStyle="light-content" backgroundColor="#1B1B1B" />
          <Content style={{flex: 1}} contentContainerStyle={{flexGrow: 1}}>
            <View style={styles.view1}>
              <Text style={styles.textHead1}>{Strings.text_order_status}</Text>
            </View>
            <View style={styles.view2}>
              <Text style={styles.textHurray}>{Strings.text_hurry}</Text>
            </View>
            <View style={styles.view3}>
              <Text style={styles.text3}>{Strings.text_order_placed}</Text>
            </View>
            <View style={{marginTop: 59}}>
              {/* <Image
                                source={ImageAssets.order_tracking_chef}
                                style={styles.imageChef}
                            /> */}
            </View>
          </Content>
        </Container>
      );
    } else if (
      this.state.currentPage != undefined &&
      this.state.radioItem != undefined
    ) {
      let sourceName = '';
      let address = '';
      if (
        this.props.route.params &&
        !this.props.route.params.isUpdateTrackOrder &&
        this.props.route.params.orderItem &&
        this.props.route.params.orderItem.billing_address &&
        this.props.route.params.orderItem.billing_address.street &&
        this.props.route.params.orderItem.billing_address.street.length
      ) {
        const addressArray = this.props.route.params.orderItem.billing_address.street[0].split(
          ',',
        );
        sourceName = addressArray[addressArray.length - 1];
        address = `${
          this.props.route.params.orderItem.billing_address.street[0]
        },${this.props.route.params.orderItem.billing_address.city},${
          this.props.route.params.orderItem.billing_address.region
        },${this.props.route.params.orderItem.billing_address.postcode}`;
      }
      return (
        <Container style={{justifyContent: 'flex-start'}}>
          <StatusBar barStyle="light-content" backgroundColor="#1B1B1B" />
          <Content
            refreshControl={
              <RefreshControl
                refreshing={this.state.refreshing}
                enabled={true}
                onRefresh={() => {
                  this.viewModel.set('refreshing', true);
                  const id = this.props.route.params
                    ? this.props.route.params.response
                    : null;
                  if (id) {
                    this.viewModel.getOrderTrackingUpdate(id);
                  }
                  this.viewModel.set('refreshing', false);
                }}
              />
            }
            style={{flex: 1}}
            contentContainerStyle={{flexGrow: 1}}>
            <Button
              style={styles.refreshButton}
              onPress={() => {
                this.viewModel.set('refreshing', true);
                const id = this.props.route.params
                  ? this.props.route.params.response
                  : null;
                if (id) {
                  this.viewModel.getOrderTrackingUpdate(id);
                }
                this.viewModel.set('refreshing', false);
              }}>
              <Text
                style={{
                  fontFamily: 'Montserrat-Bold',
                  color: Colors.primary_color,
                }}>
                refresh
              </Text>
              <Image source={ImageAssets.refresh} />
            </Button>
            <View style={[styles.headeText]}>
              <FetchUserData doApiCall={this._doApiCall} />

              <Text style={styles.textHead}>
                {Strings.text_order_status}
                {/* {this.state.trackingState&&  */}
                {this.props.route.params.isUpdateTrackOrder ? (
                  <Text style={styles.nameStyle}>
                    &nbsp;:&nbsp;{this.getTrackingStatus()}
                  </Text>
                ) : null}
              </Text>
              <TouchableOpacity
                style={styles.collapsButton}
                onPress={() => {
                  this.props.navigation.navigate('orders', {
                    screen: 'OrdersHistoryComponent',
                    params: {isUpdated: true},
                  });
                }}>
                <Image
                  source={ImageAssets.order_tracking_colaps_icon}
                  style={{height: 12, width: 21}}
                />
              </TouchableOpacity>
            </View>

            <View style={{height: 240, flex: 1}}>
              {/* <StepIndicatorComponent /> */}

              <View style={styles.container}>
                <View
                  style={[
                    styles.stepIndicator,
                    {
                      height: this.state.currentPage !== 2 ? '110%' : '80%',
                    },
                  ]}>
                  <StepIndicator
                    customStyles={stepIndicatorStyles}
                    stepCount={4}
                    direction="vertical"
                    currentPosition={this.state.currentPage}
                    labels={
                      // this.state.radioItem.map(item => item.Title)
                      this.props.route.params.isUpdateTrackOrder
                        ? this.state.radioItem.map(item => item.Title)
                        : this.state.radioItem2.map(item => item.Title)
                    }
                    renderStepIndicator={value => {
                      return (
                        <View>
                          {value.position <= this.state.currentPage &&
                            this.state.response && (
                              <Image
                                source={
                                  this.props.route.params.isUpdateTrackOrder
                                    ? this.state.radioItem[value.position]
                                        .radioImage
                                    : this.state.radioItem2[value.position]
                                        .radioImage
                                }
                                style={{height: 25, width: 25}}
                              />
                            )}
                          <Text
                            style={
                              this.state.currentPage == value.position
                                ? styles.subTitleFocus
                                : styles.subTitle
                            }>
                            {this.state.currentPage <= value.position
                              ? this.props.route.params.isUpdateTrackOrder
                                ? this.state.radioItem[value.position].subTitle
                                : `${
                                    this.state.radioItem2[value.position]
                                      .subTitle
                                  } ${
                                    !this.props.route.params
                                      .isUpdateTrackOrder &&
                                    value.position === 2
                                      ? `${sourceName}`
                                      : ''
                                  }`
                              : ''}
                          </Text>
                        </View>
                      );
                    }}
                  />
                </View>
              </View>
            </View>
            {this.state.radioValue == '3' ? (
              this.props.route.params.isUpdateTrackOrder ? (
                <View style={{marginTop: 25}}>
                  {/* <Image
                      source={ImageAssets.order_tracking_phone_icon}
                      style={{
                        height: 63,
                        width: 63,
                        marginLeft: 20,
                        marginTop: 15,
                      }}
                    /> */}
                  <TouchableOpacity onPress={()=>{
                      Linking.openURL(`tel:${this.state.phoneNumber}`)
                    }}>
                  <View style={styles.deliveryContent}>
                    <Image
                      source={ImageAssets.order_tracking_motorman}
                      style={{height: 100, width: 52}}
                    />
                    <View style={{height: 63, marginLeft: 15}}>
                      <Text style={styles.deliveryHeader}>
                        {Strings.text_delivery_partner}
                      </Text>
                      <Text style={styles.nameStyle}>{this.state.name}</Text>
                      <Text style={styles.phoneNumber}>
                        +91 {this.state.phoneNumber}
                      </Text>
                    </View>
                    
                  </View>
                  </TouchableOpacity>
                  
                </View>
              ) : (
                <>
                  <View
                    style={{
                      marginTop: -25,
                      flexDirection: 'row',
                      marginLeft: 45,
                      // marginLeft:30
                    }}>
                    <View style={{flex: 0.5}}>
                      <Text style={styles.addressText}>{address}</Text>
                    </View>
                    <View
                      style={{
                        flex: 0.5,
                        marginTop: 11.5,
                        alignItems: 'center',
                      }}>
                      <View>
                        <Text style={styles.addressText}>
                          {Strings.text_call_store}
                        </Text>
                        <Text
                          style={{
                            fontFamily: 'Montserrat-SemiBold',
                            fontSize: 12,
                            color: Colors.text_primary_light,
                          }}>
                          1800-425-3355
                        </Text>
                        <Image
                          source={ImageAssets.order_tracking_phone_icon}
                          style={{
                            height: 26,
                            width: 26,
                            marginTop: 9,
                          }}
                        />
                      </View>
                    </View>
                  </View>
                </>
              )
            ) : null}
            <View style={{alignItems: 'center', marginLeft: 15}}>
              {this.state.radioValue == '3' &&
              this.props.route.params.isUpdateTrackOrder ? (
                <View style={styles.webViewStyle}>
                  {this.state.telyportTrackableId
                    ? this.renderLocationTrack()
                    : null}
                </View>
              ) : (
                <>
                  <Image source={ImageAssets.box} style={styles.imageStyle} />
                  <Text style={{fontSize: 28, color: '#f7bf29'}}>
                    Packing Your Order
                  </Text>
                  {/* <View style={{ height: 320, width: "100%" }}>
                                   <Item style={{
                                        marginTop: 40, backgroundColor: "#ffedbd", height: 172, width: 171, borderRadius: 100,
                                    }}>

                                    </Item>
                                </View>  */}
                </>
              )}
            </View>
            <View style={{marginTop: 20, marginBottom: 40}}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  Keyboard.dismiss();
                  if (!this.state.showCancelBtn) {
                    this.props.navigation.navigate('Help', {
                      selectedOrder: this.props.route.params.orderItem,
                    });
                  } else {
                    this.viewModel.set('showPopUp', true);
                  }
                }}>
                <LinearGradient
                  colors={['#FFFFFF', '#EEEEEE']}
                  style={styles.gradient}
                />
                <Text style={styles.cancelText}>
                  {this.state.showCancelBtn
                    ? Strings.button_cancel_ordertracking
                    : Strings.button_help}
                </Text>
                {this.state.showCancelBtn && (
                  <Text style={{color: '#777777'}}>
                    &nbsp;{this.state.minutes}m:{this.state.seconds}s
                  </Text>
                )}
              </TouchableOpacity>
            </View>
            {this.state.showPopUp == true && (
              <View>
                <ModalPopUp
                  title={Strings.text_cancel_order}
                  question={Strings.text_cancel_order_confirmation}
                  buttonText1={Strings.button_no}
                  buttonText2={Strings.button_yes}
                  display={this.state.showPopUp}
                  cancelOrder={() => {
                    this.viewModel.set('showPopUp', false);
                    const id = this.props.route.params
                      ? this.props.route.params.response
                      : null;

                    if (id) {
                      this.viewModel.cancelOrder(id);
                    }
                  }}
                  closeDisplay={() => {
                    this.viewModel.set('showPopUp', false);
                  }}
                  onPress={() => {}}
                />
              </View>
            )}
          </Content>
          {this.state.isLoading ? <Loader /> : null}
        </Container>
      );
    } else if (this.state.shouldShowOrderState) {
      return (
        <OrderTrackingEndPageComponent
          ShouldOrderPlacedScreen={this.ShouldOrderPlacedScreen}
        />
      );
    }
  }
  getTrackingStatus() {
    switch (this.state.trackingState) {
      case 'created':
      case 'queued':
      case 'reached_for_pickup':
        return 'Delivery Initiated';
      case 'pickup_complete':
      case 'started_for_delivery':
        return 'Items are on the way ';
      case 'runner_cancelled':
        return 'Our Valet has cancelled your order';
      case 'runner_accepted':
        return 'Your order is awaited for pickup';
      case 'reached_for_delivery':
        return 'Order Reached for delivery';
      case 'delivered':
        return 'Delivered';
      case 'cancelled':
        return 'Order Cancelled';
      default:
        return 'Getting delivery info';
    }
  }
  renderLocationTrack() {
    return (
      <WebView
        source={{
          uri: `https://telyport.com/live/${this.state.telyportTrackableId}`,
        }}
      />
    );
  }

  public ShouldOrderPlacedScreen = () => {
    this.viewModel.set('currentPage', 0);
    this.viewModel.set('radioValue', '1');
    this.viewModel.set('onSuccess', false);
    this.viewModel.set('shouldShowOrderState', false);
    this.props.navigation.navigate('orders', {
      screen: 'OrdersHistoryComponent',
      params: {isUpdated: true},
    });
  };
  protected _buildState() {
    return this.viewModel.getState();
  }
}

const styles = StyleSheet.create({
  //
  view1: {
    marginTop: 35,
    marginLeft: 20,
    marginRight: 166,
  },
  view2: {
    marginTop: 24,
    marginLeft: 56,
  },
  view3: {
    marginTop: 14,
    marginLeft: 42,
  },
  textHead1: {
    height: 30,
    width: 174,
    color: '#888888',
    fontFamily: 'Montserrat',
    fontSize: 24,
    fontWeight: 'bold',
  },
  textHurray: {
    height: 100,
    width: 258,
    color: '#EB6A6A',
    fontFamily: 'Montserrat-Medium',
    fontSize: 80,
  },
  text3: {
    height: 27,
    width: 286,
    color: 'rgba(73,69,69,0.81)',
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 22,
    fontWeight: 'bold',
  },
  imageChef: {
    height: 286,
    width: 309,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginVertical: 20,
    backgroundColor: 'transparent',
  },
  bubble: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.7)',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 20,
  },
  button: {
    width: 80,
    paddingHorizontal: 12,
    alignItems: 'center',
    marginHorizontal: 10,
  },
  bottomBarContent: {},
  ///
  headeText: {
    marginTop: 10,
    marginLeft: 20,
    // marginRight: 166,
    justifyContent: 'space-between',
    marginBottom: 35,
    flexDirection: 'row',
    // alignItems: 'center',
  },
  collapsButton: {
    marginRight: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textHead: {
    // height: 35,
    // width: 180,
    color: Colors.primary_color2,
    fontFamily: 'Montserrat-Bold',
    fontSize: 24,
  },
  gradient: {
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  helpButton: {
    borderColor: '#ec2f23',
    height: 40,
    width: 180,
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderRadius: 14,
    elevation: 0,
    marginLeft: 100,
    borderBottomColor: '#ec2f23',
    borderBottomWidth: 2,
  },
  cancelButton: {
    borderColor: '#ec2f23',
    height: 60,
    width: 180,
    borderWidth: 1,
    borderRadius: 14,
    borderBottomColor: '#ec2f23',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    fontFamily: 'Montserrat-ExtraBold',
    fontSize: 17,
    color: '#ec2f23',
  },
  helpText: {
    fontFamily: 'Montserrat-ExtraBold',
    fontSize: 17,
    color: '#ec2f23',
  },

  imageStyle: {
    // height: 326,
    // width: 360,
    height: 240,
    width: 250,
    marginTop: 50,
    resizeMode: 'cover',
    marginBottom: 20,
  },
  webViewStyle: {
    height: 520,
    width: '100%',
    marginTop: 50,
    marginBottom: 20,
  },
  phoneNumber: {
    height: 20,
    width: 130,
    color: '#777777',
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'Montserrat',
    marginTop: -5,
  },
  nameStyle: {
    height: 28,
    width: 104,
    color: '#777777',
    fontFamily: 'Montserrat-Bold',
    fontSize: 16,
    marginTop: 12,
  },
  deliveryHeader: {
    height: 15,
    width: 94,
    color: '#AAAAAA',
    fontFamily: 'Montserrat-Bold',
    fontSize: 12,
  },
  deliveryContent: {
    flexDirection: 'row',
    alignSelf: 'center',
  },
  map: {
    flex: 1,
    ...StyleSheet.absoluteFillObject,
  },
  ///snap
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#ffffff',
  },
  stepIndicator: {
    marginVertical: -10,
    paddingHorizontal: 20,
    // width: 240,
  },
  refreshButton: {
    backgroundColor: '#fff',
    width: 150,
    alignSelf: 'flex-end',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    borderBottomWidth: 1,
    marginTop:10,
    borderBottomColor: '#ccc',
    elevation: 5,
  },
  subTitleFocus: {
    fontSize: 12,
    position: 'absolute',
    marginLeft: 28,
    height: 40,
    // width: 320,
    width: Dimensions.get('window').width,
    color: '#777777',
    fontFamily: 'Montserrat-Bold',
    marginTop: 25,
  },
  subTitle: {
    fontSize: 14,
    position: 'absolute',
    marginLeft: 20,
    height: 40,
    // width: 320,
    width: Dimensions.get('window').width/1.2,
    color: '#9D9D9D',
    fontFamily: 'Montserrat-Bold',
    marginTop: 15,
  },
  addressText: {
    fontFamily: 'Montserrat-Medium',
    fontSize: 12,
    color: Colors.dark_gray,
  },
});
