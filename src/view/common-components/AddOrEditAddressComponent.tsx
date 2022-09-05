import * as React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
  Image,
  PermissionsAndroid,
} from 'react-native';
import {ComponentBase} from 'resub';
import {Container, Content, Item, Toast} from 'native-base';
import TextInput from './TextInput';
import Geocoder from 'react-native-geocoder';
import Geolocation from '@react-native-community/geolocation';
import {
  AddOrEditAddressViewModel,
  AddOrEditAddressState,
} from '../../view-madel/AddOrEditAddressViewModel';
import {DependencyInjector} from '../../dependency-injector/DependencyInjector';
import LinearGradient from 'react-native-linear-gradient';
import ModalDropdown from '../../view/components/react-native-modal-dropdown';
import {AddressItemComponent} from '../home/cart/AddressItemComponent';
import {Retry} from '../common-components/Retry';
import {Loader} from '../common-components/Loader';
import ImageAssets from '../../assets';
import {AddressTypeEnum} from '../../domain/enumerations/AddressTypeEnum';
import AlertComponent from './Alert/Alert';
import Strings from '../../resources/String';
import MapViewComponent from './MapViewComponent';

const {width: viewportWidth, height: viewportHeight} = Dimensions.get('window');
export default class AddOrEditAddressComponent extends ComponentBase<
  any,
  AddOrEditAddressState
> {
  public viewModel: AddOrEditAddressViewModel;
  constructor(props) {
    super(props);
    this.viewModel = DependencyInjector.default().provideAddOrEditAddressViewModel();
  }
  componentDidMount() {
    this.viewModel.getInputItems(
      this.props.route.params ? this.props.route.params.editAddress : false,
      this.props.route.params && this.props.route.params.key,
    );
  }

  UNSAFE_componentWillReceiveProps(newprops) {
    if (newprops.route.params && newprops.route.params.isUpdated) {
      this.viewModel.getInputItems(
        this.props.route.params ? this.props.route.params.editAddress : false,
        this.props.route.params && this.props.route.params.key,
      );
      this.props.navigation.setParams({isUpdated: false});
    }
  }

  public async navigateToPayment() {
    const newAddress = await this.viewModel.getProfileInfoAfterAddAddressForDelivery();
    this.props.navigation.navigate('CartComponent', {
      newAddress,
    });
  }

  componentDidUpdate() {
    if (this.state.error) {
      const alert = {
        shouldShowCancelButton: true,
        description: this.state.error.message,
        title: Strings.alert_title,
        okButtonText: Strings.button_ok,
        onCancelPress: () => {
          this.viewModel.set('alertDetails', undefined);
        },
        onOkPress: async () => {
          this.viewModel.set('error', undefined);
        },
      };
      this.viewModel.set('alertDetails', alert);
      this.viewModel.set('error', undefined);
    } else if (this.state.validationError) {
      const alert = {
        shouldShowCancelButton: false,
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
      if (
        this.props.route.params != undefined &&
        this.props.route.params.keyParrent === 'checkout'
      ) {
        if (
          this.props.route.params != undefined &&
          this.props.route.params.keyParrent === 'checkout'
        ) {
          this.navigateToPayment();
        }
      } else if (this.state.onDeleteSuccess) {
        const alert = {
          shouldShowCancelButton: false,
          description: Strings.alert_address_deleted_success,
          title: Strings.alert_title,
          okButtonText: Strings.button_ok,
          onOkPress: async () => {
            this.viewModel.set('alertDetails', undefined);
            this.props.navigation.navigate('Profile', {isUpdated: true});
          },
        };
        this.viewModel.set('alertDetails', alert);
        this.viewModel.set('onSuccess', false);
        this.viewModel.set('onDeleteSuccess', false);
      } else {
        const alert = {
          shouldShowCancelButton: false,
          description: Strings.alert_profile_update_success,
          title: Strings.alert_title,
          okButtonText: Strings.button_ok,
          onOkPress: async () => {
            this.viewModel.set('alertDetails', undefined);
            this.props.navigation.navigate('Profile', {isUpdated: true});
          },
        };
        this.viewModel.set('alertDetails', alert);
        this.viewModel.set('onSuccess', false);
      }
      this.viewModel.set('onSuccess', false);
    }
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
  public async reverseGeoCode() {
    await Geolocation.getCurrentPosition(
      async position => {
        const latlng = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        await this.viewModel.getAddressByLatLng(latlng);
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

  public setCoordinateDelta = (coordinate: any) => {
    this.viewModel.set('coordinateDelta', coordinate);
  };

  public getLatLongByPincode = pincode => {
    this.viewModel.getLatLongByPincode(pincode);
  };

  public render() {
    let buttonText;
    let headerText;
    if (this.props.route.params) {
      if (this.props.route.params.editAddress) {
        buttonText =
          this.props.route.params.key !== undefined
            ? Strings.button_update_address
            : this.props.route.params.keyParrent === 'checkout'
            ? Strings.button_add_and_deliver
            : Strings.button_save;
        headerText =
          this.props.route.params.key !== undefined
            ? Strings.text_edit_address
            : Strings.text_add_new_address;
      } else if (this.props.route.params.isPersonalDetails) {
        buttonText = Strings.button_update;
        headerText = Strings.text_personal_details;
      }
    }
    if (this.state.loadError) {
      return (
        <Retry
          message={this.state.loadError.message}
          onPress={() => {
            this.viewModel.set('loadError', undefined);
            this.viewModel.getInputItems(
              this.props.route.params
                ? this.props.route.params.editAddress
                : false,
              this.props.route.params && this.props.route.params.key,
            );
          }}
        />
      );
    } else {
      return this.state.isLoading ? (
        <Loader />
      ) : (
        <Container style={{flex: 1}}>
          <Content>
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
                cancelButtonText={Strings.text_cancel}
                onOkPress={this.state.alertDetails.onOkPress}
                onCancelPress={async () => {
                  this.viewModel.set('alertDetails', undefined);
                }}
                shouldShowCancelButton={
                  this.state.alertDetails.shouldShowCancelButton
                }
              />
            ) : null}
            <View style={{overflow: 'scroll'}}>
              <View
                style={{
                  marginLeft: 20,
                  marginRight: 19,
                  marginTop: 46.9,
                  marginBottom: 15,
                }}>
                <Text
                  style={
                    this.props.route.params &&
                    this.props.route.params.editAddress
                      ? styles.header
                      : styles.headerText
                  }>
                  {headerText}
                </Text>
                {this.props.route.params &&
                !this.props.route.params.isPersonalDetails ? (
                  <>
                    <MapViewComponent
                      coordinate={this.state.coordinate}
                      coordinateDelta={this.state.coordinateDelta}
                      setCoordinateDelta={this.setCoordinateDelta}
                      description={this.state.description}
                      model={this.viewModel}
                    />
                    <TouchableOpacity
                      style={styles.getlLocationTxt}
                      onPress={async () => {
                        this.onLocateMePress();
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
                        <Text style={styles.getOtpTest}>
                          <Image
                            source={ImageAssets.locate_me_icon}
                            style={styles.locateimg}
                          />
                          {Strings.text_get_location}
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </>
                ) : null}
                <View
                  style={{
                    marginTop:
                      this.props.route.params &&
                      this.props.route.params.isPersonalDetails
                        ? 46
                        : 15,
                  }}>
                  {this.props.route.params.isPersonalDetails ? null : (
                    <View>
                      <Text style={{textAlign: 'center'}}>OR</Text>
                      <Text>
                        1. Enter your Pincode/Address to load your area map.
                      </Text>
                      <Text>
                        2. Hold and then move the marker to change position.
                      </Text>
                      <Text style={{marginBottom: 10}}>
                        3. Hold and move the marker to locate your address.
                      </Text>
                    </View>
                  )}
                  {this.state.items.length > 0 &&
                    this.state.items.map((item, index) => {
                      // if (
                      //     this.props.route.params &&
                      //     this.props.route.params.keyParrent === 'checkout' &&
                      //     item.state.label === 'PinCode'
                      // ) {
                      //     this.state.items[index].set(
                      //         'value',
                      //         this.viewModel.SelectedAddressPinCode,
                      //     );
                      // }
                      return (
                        <TextInput
                          key={index}
                          viewModel={item}
                          model={this.viewModel}
                          dataFor={
                            this.props.route.params
                              ? this.props.route.params.keyParrent
                              : ''
                          }
                          getLatLongByPincode={this.getLatLongByPincode}
                          setCoordinateDelta={this.setCoordinateDelta}
                          error={this.state.error}
                        />
                      );
                    })}
                </View>
                {this.props.route.params &&
                  this.props.route.params.editAddress && (
                    <View style={{height: 1, backgroundColor: '#AAAAAA'}} />
                  )}
                {/* : (
                   <View
                    style={{
                      height: 80,
                      borderWidth: 1,
                      borderTopWidth: 0.5,
                      borderColor: '#AAAAAA',
                      justifyContent: 'center',
                    }}>
                    <Text
                      style={{
                        fontFamily: 'Montserrat-Bold',
                        fontSize: 12,
                        color: '#AAAAAA',
                        marginLeft: 15,
                      }}>
                      {Strings.text_gender}
                    </Text>
                    <ModalDropdown
                      dropdownStyle={{
                        width: 150,
                        elevation: 3,
                        shadowOpacity: 0.75,
                        shadowRadius: 5,
                        marginTop: 5,
                        height: 100,
                      }}
                      dropdownTextStyle={styles.mediumCuts}
                      renderSeparator={() => {
                        return <View />;
                      }}
                      style={{marginTop: 14, marginLeft: 15}}
                      options={[
                        Strings.text_male,
                        Strings.text_femal,
                        Strings.text_others,
                      ]}
                      onSelect={(index, item) => {
                        this.viewModel.set('gender', item);
                      }}>
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          marginRight: 25,
                        }}>
                        <Text style={styles.mediumCuts}>
                          {this.state.gender}
                        </Text>
                        <Image
                          source={ImageAssets.order_tracking_colaps_icon}
                        />
                      </View>
                    </ModalDropdown>
                  </View>
                )} */}
                <View style={{marginTop: 40}}>
                  {this.props.route.params &&
                  this.props.route.params.editAddress ? (
                    <Item style={{alignSelf: 'center', borderBottomWidth: 0}}>
                      {this.state.addressType.map((item, i) => {
                        return (
                          <TouchableOpacity
                            key={i}
                            style={[
                              styles.addressList,
                              {
                                backgroundColor: item.isActive
                                  ? '#555555'
                                  : '#FFFFFF',
                                flexDirection: 'row',
                              },
                            ]}
                            onPress={() => {
                              this.viewModel.set('AddressSelectedIndex', i);
                              this.onAddressChange(item.id);
                            }}>
                            <Image
                              source={item.imageSrc}
                              style={{
                                marginRight: 6,
                              }}
                            />
                            <Text
                              style={[
                                styles.addressTypeText,
                                {color: item.isActive ? '#FFFFFF' : '#555555'},
                              ]}>
                              {item.title}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </Item>
                  ) : null}
                </View>
                <View
                  style={{
                    marginTop:
                      this.props.route.params &&
                      this.props.route.params.isPersonalDetails
                        ? 30
                        : 0,
                  }}>
                  {!(
                    this.props.route.params &&
                    this.props.route.params.editAddress
                  ) ? (
                    <TouchableOpacity
                      style={{height: 40, alignSelf: 'center'}}
                      onPress={async () => {
                        await this.update(undefined, 'Information update');
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
                          style={[
                            styles.buttonText,
                            {
                              paddingLeft: 37,
                              paddingRight: 35,
                              color: '#ec2f23',
                            },
                          ]}>
                          {buttonText}
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  ) : (
                    <LinearGradient
                      colors={['#f29365', '#ec2f23']}
                      style={styles.button}>
                      <TouchableOpacity
                        style={{
                          justifyContent: 'center',
                          alignItems: 'center',
                          height: '100%',
                        }}
                        // onPress={async () => {
                        //   await this.update(
                        //     this.props.route.params.key,
                        //     'Address update',
                        //   );
                        // }}
                        onPress={async () => {
                          Alert.alert(
                            "Address Alert",
                            "Are you sure marker has been placed properly?",
                            [
                              {
                                text: "No",
                                onPress: () => console.log("Cancel Pressed"),
                                style: "cancel"
                              },
                              { text: "Yes", onPress: async () =>  await this.update(
                                this.props.route.params.key,
                                'Address update',
                              ) }
                            ]
                          );
                        }}
                        >
                        <Text style={styles.buttonText}>{buttonText}</Text>
                      </TouchableOpacity>
                    </LinearGradient>
                  )}
                </View>
              </View>
              {!(
                this.props.route.params && this.props.route.params.editAddress
              ) ? (
                <View style={{marginTop: 40}}>
                  <Text style={[styles.headerText, {marginLeft: 21}]}>
                    {Strings.text_address_book}
                  </Text>
                  <View style={{marginTop: 18}}>
                    {this.state.adressItem.map((item, index) => {
                      return (
                        <AddressItemComponent
                          key={index}
                          OnPress={() => {
                            this.props.navigation.navigate('EditAddress', {
                              editAddress: true,
                              key: index,
                            });
                          }}
                          onDeletePress={async () => {
                            await this.update(index, 'Delete address');
                          }}
                          data={item}
                          buttonText={Strings.button_edit_address}
                          deletButtonText={`DELETE`}
                        />
                      );
                    })}
                  </View>
                  <View>
                    <AddressItemComponent
                      isNewAddress={true}
                      key={this.state.adressItem.length}
                      OnPress={() => {
                        this.props.navigation.navigate('EditAddress', {
                          editAddress: true,
                        });
                        // this.props.navigation.navigate('EditAddress')
                      }}
                      buttonText={Strings.button_add_new_address}
                    />
                  </View>
                  <LinearGradient
                    colors={['#ff0000', '#ff3300']}
                    style={[styles.button, {marginTop: 50, marginBottom: 20}]}>
                    <TouchableOpacity
                      style={{
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '100%',
                      }}
                      onPress={() => {
                        this.logout();
                      }}>
                      <Text style={styles.buttonText}>
                        {Strings.button_logout}
                      </Text>
                    </TouchableOpacity>
                  </LinearGradient>
                </View>
              ) : null}
            </View>
          </Content>
        </Container>
      );
    }
  }

  protected logout() {
    const alert = {
      shouldShowCancelButton: true,
      description: Strings.alert_logout_confirm,
      title: Strings.alert_logout_title,
      okButtonText: Strings.button_ok,
      onCancelPress: () => {
        this.viewModel.set('alertDetails', undefined);
      },
      onOkPress: async () => {
        await this.viewModel.logout();
        this.viewModel.set('alertDetails', undefined);
        this.props.navigation.navigate('Shop', {
          screen: 'ShopComponent',
          params: {isUpdated: false},
        });
      },
    };
    this.viewModel.set('alertDetails', alert);
  }

  private onAddressChange = index => {
    for (const address of this.state.addressType) {
      address.isActive = address.id === index ? true : false;
      if (address.title === AddressTypeEnum.Home) {
        address.imageSrc = address.isActive
          ? ImageAssets.home_white
          : ImageAssets.home_dark;
      } else if (address.title === AddressTypeEnum.Work) {
        address.imageSrc = address.isActive
          ? ImageAssets.work_white
          : ImageAssets.work_dark;
      } else {
        address.imageSrc = address.isActive
          ? ImageAssets.others_white
          : ImageAssets.others;
      }
    }

    this.viewModel.setMany({
      mode: this.state.addressType[index].title.toLowerCase(),
      pageIndex: 0,
      histories: [],
    });
  };
  public update(index, updateKey) {
    this.viewModel.updateProfile(index, updateKey);
  }

  protected _buildState() {
    return this.viewModel.getState();
  }
}

const styles = StyleSheet.create({
  addressList: {
    marginTop: 23,
    height: 38,
    width: 106.4,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#AAAAAA',
  },
  getlLocationTxt: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 50,
    borderRadius: 30,
    marginTop: 15,
  },
  getOtpTest: {
    color: '#ec2f23',
    fontFamily: 'Montserrat-Bold',
    fontWeight: 'bold',
    fontSize: viewportWidth < 450 ? 18 : 26,
  },
  addressTypeText: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 11,
  },
  buttonText: {
    color: '#FFF5F5',
    fontFamily: 'Montserrat-ExtraBold',
    fontSize: 16,
  },
  button: {
    flex: 1,
    marginTop: 25,
    height: 40,
    marginRight: 21,
    marginLeft: 21,
    borderRadius: 14,
  },
  header: {
    fontFamily: 'Montserrat-ExtraBold',
    fontSize: 24,
    color: '#888888',
  },
  locateimg: {
    height: 21,
    width: 30,
    tintColor: '#ec2f23',
  },
  headerText: {
    color: '#BBBBBB',
    fontSize: 12,
    fontFamily: 'Montserrat-Black',
  },
  mediumCuts: {
    color: '#555555',
    fontFamily: 'Montserrat-Bold',
    fontSize: 18,
  },
  welcomeText: {},
});
