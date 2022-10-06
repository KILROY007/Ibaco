import React, {Component} from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  Button,
  TouchableHighlight,
  FlatList,
  TouchableOpacity,
  Platform,
  Modal,
  TouchableWithoutFeedback,
  TextInput,
  Keyboard,
  Dimensions,
  ActivityIndicator,
  PermissionsAndroid,
  ViewBase,
} from 'react-native';
import {ComponentBase} from 'resub';
import ImageAssets from '../../../assets';
import Colors from '../../../resources/Colors';
import LinearGradient from 'react-native-linear-gradient';
import ModalDropdown from '../../../view/components/react-native-modal-dropdown';
import {Item, Badge} from 'native-base';
import {
  ShopHeaderViewModel,
  ShopHeaderState,
} from '../../../view-madel/ShopHeaderViewModel';
import {DependencyInjector} from '../../../dependency-injector/DependencyInjector';
import AlertComponent from '../../common-components/Alert/Alert';
import Strings from '../../../resources/String';
import {Loader} from '../../common-components/Loader';
import AsyncStorage from '@react-native-community/async-storage';
import constants from '../../../resources/constants';
import Geocoder from 'react-native-geocoder';
import Geolocation from '@react-native-community/geolocation';
import {RadioButton} from 'react-native-paper';

const windowWidth = Dimensions.get("window").width;
export class ShopHeaderComponent extends ComponentBase<any, ShopHeaderState> {
  modalDropdownRef: any;
  viewModel: ShopHeaderViewModel;
  constructor(props: any) {
    super(props);
    this.viewModel = DependencyInjector.default().provideShopHeaderViewModel();
  }

  async componentDidMount() {
    const pickupAddress = await AsyncStorage.getItem(constants.PICK_UP_ADDRESS);
    await this.getLocationOnMount();
    if (pickupAddress) {
      const pickUpAddress = JSON.parse(pickupAddress);
      this.viewModel.set('isDelivery', false);
      this.viewModel.set('pickUpAddress', pickUpAddress);
      this.viewModel.set('pincode', pickUpAddress.postcode);
    } else {
      const pincode = await AsyncStorage.getItem('pincode');
      this.viewModel.set('isDelivery', true);
      this.viewModel.set('pincode', pincode);
    }
  }
  async componentWillReceiveProps(newprops) {
    if (newprops.route.params && newprops.route.params.changeStore) {
      this.viewModel.set('isOpen', true);
      this.props.navigation.setParams({changeStore: undefined});
    }
  }
  public getLocationOnMount = async () => {
    const defaultStoreId = await AsyncStorage.getItem('storeSelectedPincode');
    if(defaultStoreId){
      this.viewModel.setDefaultStore(defaultStoreId)
    }
    else{
    const granted = await PermissionsAndroid.check(
      'android.permission.ACCESS_FINE_LOCATION',
    );
    if (!granted) {
      const isGranted = await PermissionsAndroid.request(
        'android.permission.ACCESS_FINE_LOCATION',
      );
      if (isGranted === 'granted') {
        this.getLocation();
      }
    } else {
      this.getLocation();
    }
  }
  };
  public async getLocation() {
    await Geolocation.getCurrentPosition(
      async position => {
        await this.viewModel.getLocation(position);
      },
      async error => {
        await this.viewModel.setDefaultPincode()
        console.log(error, '--pisitionerror');
      },
      {enableHighAccuracy: false, timeout: 5000, maximumAge: 1000},
    );
  }
  public onLocateMePress = async () => {
    const granted = await PermissionsAndroid.check(
      'android.permission.ACCESS_FINE_LOCATION',
    );
    if (!granted) {
      const isGranted = await PermissionsAndroid.request(
        'android.permission.ACCESS_FINE_LOCATION',
      );
      if (isGranted === 'granted') {
        this.reverseGeoCode();
      }
    } else {
      this.reverseGeoCode();
    }
  };
   onClose=()=>{
    this.viewModel.set('shopdailog', false);
    this.viewModel.set("isOpen",true)
    this.viewModel.set("pincode","")
  }
  public async reverseGeoCode() {
    this.viewModel.set('isLoading', true);
    await Geolocation.getCurrentPosition(
      async position => {
        const region = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        const res = await Geocoder.geocodePosition(region);
        this.viewModel.set('pincode', res[0].postalCode);
        this.viewModel.set('isLoading', false);
        await this.viewModel.getStoreList(res[0].postalCode)
        if (
          this.modalDropdownRef&&!this.state.shopdailog
        ) {
          this.modalDropdownRef.show();
        }
      },
      error => {
        if (error.code === 1) {
          const alert = {
            shouldShowCancelButton: false,
            description: Strings.alert_location_permition_denied,
            title: Strings.alert_location_title,
            okButtonText: Strings.button_ok,
            onOkPress: async () => {
              this.viewModel.set('alertDetails', undefined);
            },
          };
          this.viewModel.set('alertDetails', alert);
        } else if (error.code === 2) {
          const alert = {
            shouldShowCancelButton: false,
            description: Strings.alert_location_gps,
            title: Strings.alert_location_title,
            okButtonText: Strings.button_ok,
            onOkPress: async () => {
              this.viewModel.set('alertDetails', undefined);
            },
          };
          this.viewModel.set('alertDetails', alert);
        } else if (error.code === 3) {
          const alert = {
            shouldShowCancelButton: false,
            description: Strings.alert_location_timeOut,
            title: Strings.alert_location_title,
            okButtonText: Strings.button_ok,
            onOkPress: async () => {
              this.viewModel.set('alertDetails', undefined);
            },
          };
          this.viewModel.set('alertDetails', alert);
        }
      },
      {enableHighAccuracy: false, timeout: 20000, maximumAge: 1000},
    );
  }
 
  public render() {
    const inventorySources: any = [];
    this.props.inventorySources &&
      this.props.inventorySources.length > 0 &&
      this.props.inventorySources.map((source: any, index: any) => {
        if (source.source_code !== 'default' && source.enabled) {
          inventorySources.push(source);
        }
      });
    let storeOptions=this.state.storeInfo&&this.state.storeInfo.length>0&&this.state.pincode?.length===6?this.state.storeInfo:inventorySources;
    return (
      <View>
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
            onOkPress={
              this.state.alertDetails.onOkPress
                ? this.state.alertDetails.onOkPress
                : () => {
                    this.viewModel.set('alertDetails', undefined);
                  }
            }

            cancelButtonText={Strings.text_cancel} 
            onCancelPress={this.state.alertDetails.onCancelPress}
            shouldShowCancelButton={
              this.state.alertDetails.shouldShowCancelButton
            }
          />
        ) : null}
        <View
          style={{
            flexDirection: 'row',
            height: Platform.OS === 'android' ? 55 : 90,
          }}>
          <LinearGradient
            colors={[Colors.white, Colors.white]}
            style={styles.gradient}
            start={{x: 1, y: 1}}
            end={{x: 0, y: 1.0}}>
            <View
              style={{
                flexDirection: 'row',
                // justifyContent: 'center',
                alignItems: 'center',
                // marginLeft: 10,
              }}>
              <Image
                style={{width: 85, height: 40}}
                source={ImageAssets.ibacologo}
              />
              
            </View>
            <TouchableOpacity
              onPress={async () => {
                this.viewModel.set('isOpen', true);
              }}>
                 <View style={[styles.pinCodeView,!this.state.isDelivery&&{borderBottomColor:"none",borderBottomWidth:0}]}>
                 {this.state.isDelivery?
                
                  <Text style={styles.titleStyle}>Delivery location</Text>
                  :
                  <Text style={styles.titleStyle}>Pickup location</Text>
                  
                }
                <View style={{flexDirection:"row"}}>
                <Text
                numberOfLines={1}
                  style={[
                    styles.pinCode,
                  ]}>
                  
                  {!this.state.isDelivery
                    ? this.props.pickupAddress && this.props.pickupAddress.name
                      ? this.props.pickupAddress.name
                      : 'Select Location'
                    : this.props.pincode}
                </Text>
                <Image source={ImageAssets.pincode_dropdown} style={{tintColor:"#4b4b4b",marginTop:10,marginLeft:5}}/>
                </View>
                </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={{paddingRight: 15,}}
              onPress={() => this.props.navigation.navigate('Cart')}>
              <Image source={ImageAssets.cart_header} />
              {this.props.cartSummary &&
              this.props.cartSummary.items_qty > 0 ? (
                <Badge
                  style={{
                    position: 'absolute',
                    top: -5,
                    right: 2,
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: 18,
                    width: 24,
                    backgroundColor:Colors.primary_color,
                  }}>
                  <Text style={{fontSize: 10, color: Colors.white}}>
                    {this.props.cartSummary.items_qty}
                  </Text>
                </Badge>
              ) : null}
            </TouchableOpacity>
          </LinearGradient>
          <View style={{alignSelf: 'center', justifyContent: 'center'}}>
            {/*{this.state.isOpen ? (
              <Modal
                animationType={'fade'}
                visible={true}
                transparent={true}
                onRequestClose={() => {
                  this.viewModel.set('isOpen', false);
                }}>
                <TouchableWithoutFeedback
                  disabled={!this.state.isOpen}
                  onPress={() => {
                    this.viewModel.set('isOpen', false);
                    const pincode =
                      this.props.pincode === undefined
                        ? ''
                        : this.props.pincode;
                    const pickupAddress =
                      this.props.pickupAddress === undefined
                        ? ''
                        : this.props.pickupAddress;
                    const pickupLocationName = this.props.pickupAddress
                      ? this.props.pickupAddress.name
                      : '';
                    this.viewModel.set(
                      'pickupLocationName',
                      pickupLocationName,
                    );
                    this.viewModel.set('pickUpAddress', pickupAddress);
                    this.viewModel.set('pincode', pincode);
                    this.viewModel.set('isDelivery', this.props.isDelivery);
                  }}
                  style={{alignItems: 'center'}}>
                  <View
                    style={{
                      flexGrow: 1,
                    }}>
                    <TouchableOpacity
                      style={[styles.dropdown]}
                      activeOpacity={1}>
                      <View style={styles.mainView}>
                        <View
                          style={[
                            styles.TriangleShapeCSS,
                            {top: -15, left: '46%'},
                          ]}
                        />
                        <View style={styles.inputView}>
                          <TouchableOpacity
                            activeOpacity={1}
                            style={{
                              paddingLeft: 5,
                              borderRadius: 14,
                              width: '70%',
                            }}
                            onPress={() => {
                              if (
                                !this.state.isDelivery &&
                                this.modalDropdownRef
                              ) {
                                this.modalDropdownRef.show();
                              }
                            }}>
                            <TextInput
                              editable={this.state.isDelivery}
                              value={
                                !this.state.isDelivery
                                  ? this.state.pickUpAddress
                                    ? this.state.pickUpAddress?.name
                                    : this.state.pickupLocationName
                                  : this.state.pincode
                              }
                              placeholder="Enter your pincode"
                              style={{
                                color: Colors.text_dark,
                                fontFamily: 'Montserrat-Medium',
                              }}
                              onChangeText={async text => {
                                if (text.length === 6) {
                                  Keyboard.dismiss();
                                }
                                if (this.state.isDelivery) {
                                  this.viewModel.set('pincode', text);
                                } else {
                                  this.viewModel.set(
                                    'pickupLocationName',
                                    text,
                                  );
                                }
                              }}
                              maxLength={this.state.isDelivery ? 6 : 200}
                              keyboardType="number-pad"
                            />
                          </TouchableOpacity>
                          <ModalDropdown
                            ref={arg => {
                              this.modalDropdownRef = arg;
                            }}
                            visible={true}
                            defaultValue=""
                            style={{marginTop: 5}}
                            dropdownStyle={{
                              width: 250,
                              elevation: 15,
                              shadowOpacity: 0.75,
                              shadowRadius: 5,
                              height: 250,
                              marginLeft: -20,
                              marginTop: 18,
                              marginRight:-80
                            }}
                            dropdownTextStyle={styles.dropDownText}
                            dropdownTextHighlightStyle={styles.dropDownText}
                            renderSeparator={() => {
                              return <View />;
                            }}
                            onSelect={(index, value) => {
                              inventorySources.length &&
                                inventorySources.map(item => {
                                  if (
                                    value == `${item.name} - ${item.postcode}`
                                  ) {
                                    this.viewModel.set('pickUpAddress', item);
                                  }
                                });
                            }}
                            options={
                              inventorySources.length &&
                              inventorySources.map(item => {
                                return `${item.name} - ${item.postcode}`;
                              })
                            }>
                            <Text />
                          </ModalDropdown>
                          <View style={styles.locateButtonView}>
                          {this.state.isDelivery &&
                              <TouchableOpacity
                                disabled={!this.state.isDelivery}
                                style={{
                                  flexDirection: 'row',
                                  alignItems: 'center',
                                }}
                                onPress={async () => {
                                  this.onLocateMePress();
                                }}>
                                <Image source={ImageAssets.locate_me_icon} />

                                <Text style={styles.locateMe}>Locate Me</Text>
                              </TouchableOpacity>
                            }
                            <TouchableOpacity
                              style={styles.go}
                              onPress={() => {
                                // this.setState({ shopdailog: true });
                                if (this.state.isDelivery) {
                                  this.viewModel.getStores();
                                } else {
                                  this.viewModel.checkForCartItems(
                                    this.props.cartItems,
                                  );
                                }
                              }}>
                              {this.state.isLoading ? (
                                <ActivityIndicator
                                  size="small"
                                  color={Colors.white}
                                  style={{marginLeft: 6, marginRight: 6}}
                                />
                              ) : (
                                <Text style={styles.goText}>GO</Text>
                              )}
                            </TouchableOpacity>
                          </View>
                        </View>
                        <Item
                          style={{
                            borderBottomWidth: 0,
                            marginTop: 13.52,
                          }}>
                          <TouchableOpacity
                            onPress={() => {
                              this.viewModel.set('isDelivery', true);
                              this.viewModel.set(
                                'pickUpAddress',
                                this.props.pickupAddress,
                              );
                            }}>
                            <View style={{flexDirection: 'row'}}>
                              <Image
                                source={
                                  this.state.isDelivery
                                    ? ImageAssets.radio_active_icon
                                    : ImageAssets.radio_inactive_icon
                                }
                                style={{
                                  height: 10,
                                  width: 10,
                                  alignSelf: 'center',
                                }}
                              />
                              <Text
                                style={[
                                  styles.radioText,
                                  {
                                    color: this.state.isDelivery
                                      ? Colors.primary_color
                                      : Colors.dark_gray,
                                  },
                                ]}>
                                Delivery
                              </Text>
                            </View>
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => {
                              this.viewModel.set('isDelivery', false);
                              this.viewModel.set(
                                'pickUpAddress',
                                this.props.pickupAddress,
                              );
                              if (this.modalDropdownRef) {
                                this.modalDropdownRef.show();
                              }
                            }}>
                            <View
                              style={{
                                flexDirection: 'row',
                                marginLeft: 7.6,
                              }}>
                              <Image
                                source={
                                  !this.state.isDelivery
                                    ? ImageAssets.radio_active_icon
                                    : ImageAssets.radio_inactive_icon
                                }
                                style={{
                                  height: 10,
                                  width: 10,
                                  alignSelf: 'center',
                                }}
                              />
                              <Text
                                style={[
                                  styles.radioText,
                                  {
                                    color: !this.state.isDelivery
                                      ? Colors.primary_color
                                      : Colors.dark_gray,
                                  },
                                ]}>
                                Self Pick-up
                              </Text>
                            </View>
                          </TouchableOpacity>
                        </Item>
                      </View>
                    </TouchableOpacity>
                  </View>
                </TouchableWithoutFeedback>
              </Modal>
            ) : null} */}
               <Modal
              
              animationType="fade"
              transparent={true}
              visible={this.state.isOpen}
              onRequestClose={() => {
                this.viewModel.set('isOpen', false);
              }}>
              <Item
                style={styles.modelview}
                >
                <View style={[styles.viewmodal]}>
                  <View style={{flexDirection: 'row'}}>
                    {/* <Text style={[styles.storeTime]}>
                      6 AM-9 PM EVERYDAY
                    </Text> */}
                    <TouchableWithoutFeedback
                    onPress={()=>{
                      this.viewModel.set("isOpen",false)
                      }
                    }
                    >  
                    <Image
                      style={{width: 20, height: 20, marginLeft: 'auto'}}
                      source={ImageAssets.remove}
                    />
                    </TouchableWithoutFeedback>

                  </View>
                  <Text style={{ fontFamily: 'Montserrat-Bold',color:"#ec7d5f", height:18}}>
                  {new Date().getHours() >= 22 || new Date().getHours() < 6 ?
                   "Closed":"Open now"}
                  </Text>
                  <View style={{width:"100%",color:"#eeeeee",height:1}} />
                          <Item
                          style={{
                            borderBottomWidth: 0,
                            marginTop: 13.52,
                            alignItems:'center',
                            justifyContent:'center'
                          }}>
                          <TouchableOpacity
                            onPress={() => {
                              this.viewModel.set('isDelivery', true);
                              this.viewModel.set(
                                'pickUpAddress',
                                this.props.pickupAddress,
                              );
                            }}>
                           <View style={{flexDirection: 'column',height:15}}>
                              <Text
                                style={this.state.isDelivery?styles.activeType:styles.inactiveType}>
                                Delivery
                              </Text>
                              {this.state.isDelivery&&
                              <Image source={ImageAssets.underline}/>
                              }
                            </View>
                          </TouchableOpacity>
                          {/* <TouchableOpacity
                            onPress={() => {
                              this.viewModel.set('isDelivery', false);
                              this.viewModel.set(
                                'pickUpAddress',
                                this.props.pickupAddress,
                              );
                            }}>
                            <View
                              style={{
                                flexDirection: 'column',
                                marginLeft: 40,
                                height:15
                              }}>

                              <Text
                                style={!this.state.isDelivery?styles.activeType:styles.inactiveType}>
                                Self Pick-up
                              </Text>
                                {!this.state.isDelivery&&
                              <Image source={ImageAssets.underline} style={{alignSelf:"center"}}/>
                              }
                            </View>
                            </TouchableOpacity> */}
                            </Item>
                            <Text style={styles.modalSubtext}>
                            {this.state.isDelivery?
                            "Get products delivered from your nearest stores"
                            :"Enter pincode to see nearest stores"
                          }  
                        </Text>
                         <View style={{backgroundColor:"#f7f7f7",borderRadius:7}}>
                          <View style={styles.inputView}>
                          <TouchableOpacity
                            activeOpacity={1}
                            style={{
                              paddingLeft: 5,
                              borderRadius: 14,
                              width: "50%",
                            }}
                            onPress={() => {
                              if (
                                !this.state.isDelivery &&
                                this.modalDropdownRef&&!this.state.shopdailog
                              ) {
                                this.modalDropdownRef.show();
                              }
                            }}>
                            <TextInput
                              editable={true}
                              value={ this.state.pincode
                              }
                              placeholder="Enter pincode"
                              style={{
                                color: Colors.text_dark,
                                fontFamily: 'Montserrat-Medium',
                              }}
                              onChangeText={async (text) => {
                                if (text.length === 6) {
                                  Keyboard.dismiss();
                                  console.log('search pincode',text)
                                  await this.viewModel.getStoreList(text)
                                  if (
                                    this.modalDropdownRef&&!this.state.shopdailog
                                  ) {
                                    this.modalDropdownRef.show();
                                  }
                                }
                                  this.viewModel.set('pincode', text);
                               
                              }}
                              keyboardType="number-pad"
                            />
                          </TouchableOpacity>
                          <View style={[styles.locateButtonView]}>
                              <TouchableOpacity
                                style={{
                                  flexDirection: 'row',
                                  alignItems: 'center',
                                }}
                                onPress={async () => {
                                  this.onLocateMePress();
                                }}>
                                <Image source={ImageAssets.locate_me_icon} />
                                <Text style={styles.locateMe}>Auto-detect my location </Text>
                                    
                              </TouchableOpacity>
                            </View>
                        </View>
                        <View style={styles.inputView2}>
                          <View style={styles.column}>
                          <TouchableOpacity
                            activeOpacity={1}
                            style={{
                              paddingLeft: 5,
                              borderRadius: 14,
                              width: "110%",
                            }}
                            onPress={() => {
                              if (
                                this.modalDropdownRef&&!this.state.shopdailog
                              ) {
                                this.modalDropdownRef.show();
                              }
                            }}>
                            <TextInput
                              editable={false}
                              value={ !this.state.isDelivery
                                ? this.state.pickUpAddress
                                  ? this.state.pickUpAddress?.name
                                  : this.state.pickupLocationName
                                : this.state.selectedStore?.name}
                              placeholder="Select Store"
                              style={{
                                color: Colors.text_dark,
                                fontFamily: 'Montserrat-Medium',
                              }}
                              keyboardType="number-pad"
                            />
                          </TouchableOpacity>
                          
                          <ModalDropdown
                            ref={arg => {
                              this.modalDropdownRef = arg;
                            }}
                            visible={true}
                            defaultValue=""
                            style={{marginTop:-15}}
                            renderRowProps={{ underlayColor: 'lightgray' }}
                            dropdownStyle={{
                              elevation: 5,
                              width:"80%",
                              height:storeOptions.length===1&&75,
                              shadowOpacity: 0.75,
                              shadowRadius: 5
                            }
                          }
                            renderRow={((option: IOption,isSelected) => (
                              <View style={[styles.column,{paddingLeft:11,backgroundColor:isSelected?"#fff":"#eee"}]}>
                              <Text style={styles.dropDownTitle}>{option.name}</Text>
                              <Text style={styles.dropDownText}>{option.street}</Text>
                              </View>
                          ))}
                            dropdownTextStyle={styles.dropDownText}
                            dropdownTextHighlightStyle={styles.dropDownText}
                            renderSeparator={() => {
                              return   <View style={{width:"100%",borderColor:"#eeeeee",height:10}} />;
                            }}
                            onSelect={(index, value) => {
                              inventorySources.length &&
                                inventorySources.map(item => {
                                  if (
                                    value.source_code == item.source_code
                                  ) {
                                    // this.viewModel.set(
                                    //   'pincode',
                                    //   item.postcode,
                                    // );
                                    if(this.state.isDelivery){
                                      this.viewModel.set(
                                        'storeSelectedPincode',
                                        item.source_code,
                                      );
                                      if(!this.state.pincode){
                                        this.viewModel.set(
                                          'pincode',
                                          item.postcode,
                                        );
                                       }
                                      
                                    }
                                    else{
                                      this.viewModel.set('pickUpAddress', item);
                                    }
                                    this.viewModel.set('selectedStore', item);
                                  }
                                });
                            }}
                            options={
                              storeOptions.map(item => {
                                return item;
                                })
                            }>
                            <Text />
                          </ModalDropdown>
                          </View>
                              <View style={[styles.locateButtonView,{marginRight:10}]}>
                                  <TouchableOpacity
                                     onPress={() => {
                                      if (
                                        this.modalDropdownRef&&!this.state.shopdailog
                                      ) {
                                        this.modalDropdownRef.show();
                                      }
                                    }}
                                    style={{
                                      flexDirection: 'row',
                                      alignItems: 'center',
                                    }}>
                                    <Image source={ImageAssets.pincode_dropdown} style={{tintColor:"#4b4b4b"}}/>
                                  </TouchableOpacity>
                              
                                
                              </View>
                        
                        </View>
                          
                          <View>
                          <LinearGradient
                          start={{x: 0, y: 0}} end={{x: 1, y: 0}}
                          colors={Colors.add_button_gradient} 
                          style={styles.startShop}
                         >  
                       <TouchableOpacity
                            onPress={async() => {
                              // this.setState({ shopdailog: true });
                              this.viewModel.validatePincode();
                                if (this.state.isDelivery) {
                                  await AsyncStorage.setItem(
                                    'storeSelectedPincode',
                                    this.state.storeSelectedPincode,
                                  );
                                  this.viewModel.checkForCartItems(
                                    this.props.cartItems,
                                  );
                                  this.viewModel.set('isOpen', false);
                                  // this.viewModel.getStores()
                                 
                                } else {
                                  this.viewModel.checkForCartItems(
                                    this.props.cartItems,
                                  );
                                }
                              }}>
                              {this.state.isLoading ? (
                                <ActivityIndicator
                                  size="small"
                                  color={Colors.white}
                                  style={{marginLeft: 25, marginRight: 25}}
                                />
                              ) : (
                                <Text style={styles.shopText}>START SHOPPING</Text>
                              )}
                            </TouchableOpacity>
                            </LinearGradient>
                            </View>
                          </View>
                  {/* <View style={[styles.imgdata]}>
                    <Image
                     source={ImageAssets.store_img}
                      style={{height: 140, width: 140}}
                    /> */}
                    {/* <View style={{flexDirection: 'column'}}>
                      {this.state.storeInfo.length > 0 ? (
                        <View style={{paddingTop: 12}}>
                          {this.state.storeInfo.map((store: any) => {
                            return (
                              <View
                                style={{
                                  flexDirection: 'row',
                                }}>
                                <RadioButton
                                  value="first"
                                  color={Colors.primary_color}
                                  status={
                                    this.state.storeSelectedPincode ===
                                    store.source_code
                                      ? 'checked'
                                      : 'unchecked'
                                  }
                                  onPress={() => {
                                    this.viewModel.set(
                                      'storeSelectedPincode',
                                      store.source_code,
                                    );
                                    this.viewModel.set('storeCheckbox', true);
                                    this.viewModel.set(
                                      'pincode',
                                      store.postcode,
                                    );
                                  }}
                                />
                                <Text
                                  style={{
                                    color: Colors.text_dark,
                                    fontFamily: 'Montserrat-Bold',
                                    fontSize:13,
                                    marginTop: 8,
                                  }}>
                                  {store.name}
                                </Text>
                              </View>
                            );

                            // <Text>{store.name}</Text>
                          })}
                          <TouchableOpacity
                            style={{
                              backgroundColor: Colors.primary_color,
                              margin: 2,
                              padding: 4,
                              width: '50%',
                              alignSelf: 'center',
                            }}
                            onPress={async () => {
                              await AsyncStorage.setItem(
                                'storeSelectedPincode',
                                this.state.storeSelectedPincode,
                              );

                              if (this.state.isDelivery) {
                                this.viewModel.validatePincode();
                              }
                              this.viewModel.checkForCartItems(
                                this.props.cartItems,
                              );
                              // this.viewModel.getStores()
                              this.viewModel.set('shopdailog', false);
                            }}>
                            {this.state.isLoading ? (
                              <ActivityIndicator
                                size="small"
                                color={Colors.white}
                                style={{marginLeft: 6, marginRight: 6}}
                              />
                            ) : (
                              <Text
                                style={{
                                  textAlign: 'center',
                                  color: Colors.white,
                                  fontFamily: 'Montserrat-Medium',
                                }}>
                                Go
                              </Text>
                            )}
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <Text
                          style={{
                            padding: 12,
                            color: Colors.text_dark,
                            fontFamily: 'Montserrat-Bold',
                            marginTop: 15,
                          }}>
                          No Store Found
                        </Text>
                      )}
                    </View> */}
                  {/* </View> */}
                </View>
              </Item>
            </Modal>
              <Modal
              animationType="fade"
              transparent={true}
              visible={this.state.shopdailog}
              onRequestClose={() => {
                this.onClose()
              }}>
              <Item
                style={styles.modelview}
                onPress={() => {
                  this.onClose()
               
                }}>
                <View style={[styles.viewmodal]}>
                  <View style={{flexDirection: 'row'}}>
                    {/* <Text style={[styles.storeselect]}>
                      Please select the store near you.
                    </Text> */}
                    <Image
                      style={{width: 20, height: 20, marginLeft: 'auto'}}
                      source={ImageAssets.remove}
                    />
                  </View>
                  {/* <Text style={{ fontFamily: 'Montserrat-Medium', marginVertical: 5 }}>
                    Your order will be delivered to your doorstep from the store
                    you select.
                  </Text> */}
                    <View style={{flexDirection: 'column',}}>
                    <Image
                     source={ImageAssets.store_img}
                      style={{height: 140, width: 140,alignSelf: 'center',
                      justifyContent: 'center',}}
                    />
                      {/* {this.state.storeInfo.length > 0 ? (
                        <View style={{paddingTop: 12}}> */}
                          {/* {this.state.storeInfo.map((store: any) => {
                            return (
                              <View
                                style={{
                                  flexDirection: 'row',
                                }}>
                                <RadioButton
                                  value="first"
                                  color={Colors.primary_color}
                                  status={
                                    this.state.storeSelectedPincode ===
                                    store.source_code
                                      ? 'checked'
                                      : 'unchecked'
                                  }
                                  onPress={() => {
                                    this.viewModel.set(
                                      'storeSelectedPincode',
                                      store.source_code,
                                    );
                                    this.viewModel.set('storeCheckbox', true);
                                    this.viewModel.set(
                                      'pincode',
                                      store.postcode,
                                    );
                                  }}
                                />
                                <Text
                                  style={{
                                    color: Colors.text_dark,
                                    fontFamily: 'Montserrat-Bold',
                                    fontSize:13,
                                    marginTop: 8,
                                  }}>
                                  {store.name}
                                </Text>
                              </View>
                            );

                            // <Text>{store.name}</Text>
                          })}
                          <TouchableOpacity
                            style={{
                              backgroundColor: Colors.primary_color,
                              margin: 2,
                              padding: 4,
                              width: '50%',
                              alignSelf: 'center',
                            }}
                            onPress={async () => {
                              await AsyncStorage.setItem(
                                'storeSelectedPincode',
                                this.state.storeSelectedPincode,
                              );

                              if (this.state.isDelivery) {
                                this.viewModel.validatePincode();
                              }
                              this.viewModel.checkForCartItems(
                                this.props.cartItems,
                              );
                              // this.viewModel.getStores()
                              this.viewModel.set('shopdailog', false);
                            }}>
                            {this.state.isLoading ? (
                              <ActivityIndicator
                                size="small"
                                color={Colors.white}
                                style={{marginLeft: 6, marginRight: 6}}
                              />
                            ) : (
                              <Text
                                style={{
                                  textAlign: 'center',
                                  color: Colors.white,
                                  fontFamily: 'Montserrat-Medium',
                                }}>
                                Go
                              </Text>
                            )}
                          </TouchableOpacity>
                        </View>
                      ) : ( */}
                        <Text
                        numberOfLines={2}
                          style={{
                            padding: 12,
                            color: Colors.text_dark,
                            fontFamily: 'Montserrat-Bold',
                            marginTop: 15,
                          }}>
                          No store found at 
                           pincode {this.state.pincode}
                        </Text>
                      {/* )} */}
                    </View>
                  </View>
              </Item>
            </Modal>
          </View>
        </View>
      </View>
    );
  }
  protected _buildState() {
    return this.viewModel.getState();
  }
}
const styles = StyleSheet.create({
  TriangleShapeCSS: {
    width: 0,
    height: 0,
    borderLeftWidth: 12,
    borderRightWidth: 12,
    borderBottomWidth: 24,
    borderStyle: 'solid',
    backgroundColor: 'transparent',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: Colors.white,
  },
  activeType:{
    fontFamily: 'Montserrat-Bold',
    color:"#393939",
    flexDirection:'column'
  },
  inactiveType:{
    fontFamily: 'Montserrat-SemiBold',
    color:"#b4b4b4"
  },
  titleStyle: {
    color:"#d15a3a",
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 14,
  },
  storeTime: {
    color: "#9e9e9e",
    fontFamily: 'Montserrat-Bold',
    height:14,
    fontSize: 11,
  },
  storeselect: {
    color: Colors.text_dark,
    fontFamily: 'Montserrat-Bold',
    fontSize: 16,
    marginVertical: 10
  },
  modelview: {
    height: '100%',
    width:"100%",
    flex: 1,
    flexDirection: 'column',
    borderRadius:7,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
  },
  viewmodal: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
    elevation: 2,
    backgroundColor: Colors.white,
    marginLeft: '5%',
    marginRight: '5%',
    padding: 5,
    borderRadius: 2,
  },
  imgdata: {
    flexDirection: 'row',
    alignSelf: 'center',
    justifyContent: 'center',
  },
  column: {
    flexDirection: 'column',
  },
  dropdown: {
    position: 'absolute',
    borderRadius: 2,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: 45,
    marginLeft: 15,
    marginRight: 15,
    width: '95%',
    shadowColor: '#808080',
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.58,
    shadowRadius: 16.0,
    elevation: 24,
  },
  mainView: {
    marginLeft: 30,
    marginRight: 30,
    height: '100%',
    marginBottom: 20,
    marginTop: 28,
  },
  inputView: {
    borderWidth: 1,
    borderColor: Colors.primary_color,
    backgroundColor:Colors.white,
    flexDirection: 'row',
    height: 40,
    margin:11,
    justifyContent: 'space-between',
  },
  inputView2: {
    borderWidth: 1,
    borderColor: "#d7d7d7",
    backgroundColor:Colors.white,
    flexDirection: 'row',
    height: 40,
    marginHorizontal:11,
    justifyContent: 'space-between',
  },
  locateButtonView: {
    marginRight:20,
    flexDirection: 'row',
    height: '100%',
  },
  locateMe: {
    fontFamily: 'Montserrat-Medium',
    fontSize: 9.6,
    color: Colors.text_primary_light,
  },
  modalSubtext:{ 
  fontFamily: 'Montserrat-Medium',
  color:'#3b3b3b', 
  fontSize:11,
  marginVertical: 20,
  textAlign:'center'
 },
  go: {
    marginLeft: 8.5,
    alignSelf: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary_color,
    height: '100%',
    borderTopRightRadius: 14,
    borderBottomRightRadius: 14,
  },
  startShop: {
    alignSelf: 'center',
    justifyContent: 'center',
    height: 30,
    marginVertical:17,
    borderRadius:4
  },
  shopText: {
    marginLeft: 7.5,
    marginRight: 7.5,
    fontFamily: 'Montserrat-Bold',
    fontSize: 10.8,
    color: Colors.white,
  },
  goText: {
    marginLeft: 7.5,
    marginRight: 7.5,
    fontFamily: 'Montserrat-Bold',
    fontSize: 10.8,
    color: Colors.white,
  },
  radioText: {
    fontSize: 13,
    fontFamily: 'Montserrat-SemiBold',
    color: Colors.dark_gray,
    marginLeft: 3.4,
  },
  pinCodeView: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  pinCode: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 16,
    color: "#000"
  },
  gradient: {
    justifyContent: 'space-between',
    flex: 1,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    elevation: 5,
    backgroundColor: 'white',
    alignItems: 'center',
    paddingTop: Platform.OS === 'android' ? 0 : 20,
  },
  dropDownTitle: {
    fontSize: 12,
    fontFamily: 'Montserrat-Bold',
    color:"#2c2c2c",
    
  },
  dropDownText: {
    fontSize: 12,
    fontFamily: 'Montserrat-Medium',
    color:"#8d8d8d",
  },
});
