import React from 'react';
import {
  TouchableOpacity,
  View,
  StyleSheet,
  Keyboard,
  SafeAreaView,
  Image,
} from 'react-native';
import { ComponentBase } from 'resub';
import { Container, Text, Input, Item, Card, Content } from 'native-base';
import ImageAssets from '../../../assets';
import { AddressItemComponent } from './AddressItemComponent';
import Colors from '../../../resources/Colors';
import {
  AddOrEditAddressViewModel,
  AddOrEditAddressState,
} from '../../../view-madel/AddOrEditAddressViewModel';
import { DependencyInjector } from '../../../dependency-injector/DependencyInjector';
import { Retry } from '../../common-components/Retry';
import { Loader } from '../../common-components/Loader';
import { DeleveryAddressTypeEnum } from '../../../domain/enumerations/DeleveryAddressTypeEnum';
import {
  CheckoutViewModel,
  CheckoutState,
} from '../../../view-madel/CheckoutViewModel';
import Strings from '../../../resources/String';
import AlertComponent from '../../common-components/Alert/Alert';

export class CheckoutAddressComponent extends ComponentBase<
  any,
  CheckoutState
  > {
  public viewModel: CheckoutViewModel;
  constructor(props: any) {
    super(props);
    this.viewModel = DependencyInjector.default().provideCheckoutViewModel();

    // this.state = {
    //     address: [1, 2, 3],
    // }
  }
  componentDidMount() {
    this.viewModel.load();
  }

  public render() {
    if (this.state.loadError) {
      return (
        <Retry
          message={this.state.loadError.message}
          onPress={() => {
            this.viewModel.set('loadError', undefined);
            this.viewModel.load();
          }}
        />
      );
    } else if (this.state.isLoading) {
      return <Loader />;
    } else {
      return (
        <Container style={styles.container}>
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
            <View
              style={{
                backgroundColor: Colors.primary_background_color,
                flex: 1,
                marginTop: 21,
              }}>
              <View style={{ marginTop: 0 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{ flex: 0.9, alignItems: 'center' }}>
                    <Text style={[styles.secureText, { paddingLeft: '7%' }]}>
                      {Strings.text_secure_checkout}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={{ flex: 0.1 }}
                    onPress={() => {
                      this.props.closeModal();
                    }}>
                    <Image source={ImageAssets.cross} />
                  </TouchableOpacity>
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    borderBottomWidth: 0,
                    justifyContent: 'center',
                  }}>
                  <TouchableOpacity
                    style={{ marginTop: 20 }}
                    onPress={() => {
                      this.viewModel.set(
                        'deliveryMode',
                        DeleveryAddressTypeEnum.DELIVERY,
                      );
                    }}>
                    <View style={{ flexDirection: 'row' }}>
                      <Image
                        source={
                          this.state.deliveryMode ===
                            DeleveryAddressTypeEnum.DELIVERY
                            ? ImageAssets.radio_active_icon
                            : ImageAssets.radio_inactive_icon
                        }
                        style={{ alignSelf: 'center' }}
                      />
                      <Text
                        style={[
                          styles.readioText,
                          {
                            color:
                              this.state.deliveryMode ===
                                DeleveryAddressTypeEnum.DELIVERY
                                ? Colors.add_button_text
                                : '#777777',
                          },
                        ]}>
                        {Strings.button_delivery}
                      </Text>
                    </View>
                  </TouchableOpacity>
                  {/* <TouchableOpacity
                    style={{ marginTop: 20, marginLeft: 24 }}
                    onPress={() => {
                      this.viewModel.set(
                        'deliveryMode',
                        DeleveryAddressTypeEnum.PICKUP,
                      );
                    }}>
                    <View style={{ flexDirection: 'row' }}>
                      <Image
                        source={
                          this.state.deliveryMode ===
                            DeleveryAddressTypeEnum.PICKUP
                            ? ImageAssets.radio_active_icon
                            : ImageAssets.radio_inactive_icon
                        }
                        style={{ alignSelf: 'center' }}
                      />
                      <Text
                        style={[
                          styles.readioText,
                          {
                            color:
                              this.state.deliveryMode ===
                                DeleveryAddressTypeEnum.PICKUP
                                ? Colors.add_button_text
                                : '#777777',
                          },
                        ]}>
                        {Strings.button_pickUp}
                      </Text>
                    </View>
                  </TouchableOpacity> */}
                </View>
              </View>
              {this.state.deliveryMode === DeleveryAddressTypeEnum.PICKUP ? <Text style={[styles.readioText, { color: Colors.text_dark, textAlign: 'center', marginTop: 15 }]}>
                Store nearest to the entered pincode is shown. To show other stores, please change the pincode</Text> : null}
              <View style={{ marginTop: 22, marginLeft: 21, marginRight: 21 }}>
                <Text style={styles.selectLocationText}>
                  {this.state.deliveryMode === DeleveryAddressTypeEnum.DELIVERY
                    ? Strings.text_select_delivery_location
                    : Strings.text_select_pickup_location}
                </Text>
                {this.state.deliveryMode !== 2 && (
                  <Text style={[{ marginTop: 10 }, styles.addressBook]}>
                    {Strings.text_address_book}
                  </Text>
                )}
              </View>
              <Content style={{ marginTop: 10 }}>
                <View>
                  {this.state.deliveryMode === 1 ?
                    this.state.adressItem.map((item, index) => {
                    
                      return (
                        <AddressItemComponent
                          key={index}
                          OnPress={() => {
                            this.viewModel.set('selectedDeliveryAddress', item.key)
                            this.props.openPaymentModal(
                              item,
                              this.state.customerId[index],
                              this.state.deliveryMode,
                            );
                          }}
                          buttonText={Strings.button_checkout_deliveryHere}
                          data={item.value}
                          SelectedAddressPinCode={
                            this.viewModel.SelectedAddressPinCode
                          }
                        />
                      );
                    }) :
                    this.state.pickUpAddressItemsIs.map((item, index) => {
                      let id;
                      return (
                        <AddressItemComponent
                          key={index}
                          OnPress={() => {
                            this.viewModel.set('selectedDeliveryAddress', item.key)
                            this.props.openPaymentModal(
                              item,
                              id,
                              this.state.deliveryMode,
                            );
                          }}
                          buttonText={Strings.button_checkout_pickupHere}
                          data={item.value}
                        />
                      );
                    })}
                </View>
                {this.state.deliveryMode !== 2 && (
                  <View>
                    <AddressItemComponent
                      isNewAddress={true}
                      key={this.state.adressItem.length}
                      OnPress={() => {
                        this.props.closeModal();
                        this.props.navigation.navigate('EditAddress', {
                          editAddress: true,
                          key: undefined,
                          keyParrent: 'checkout',
                        });
                      }}
                      buttonText={Strings.button_add_new_address}
                    />
                  </View>
                )}
              </Content>
            </View>
          </Content>
        </Container>
      );
    }
  }
  protected _buildState() {
    return this.viewModel.getState();
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderTopRightRadius: 14,
    borderTopLeftRadius: 14,
    backgroundColor: Colors.primary_background_color,
  },
  secureText: {
    color: Colors.text_primary_light,
    fontFamily: 'Muli-Bold',
    fontSize: 13.89,
  },
  readioText: {
    color: Colors.add_button_text, // #AAAAAA
    fontSize: 14,
    fontFamily: 'Muli-Bold',
    marginLeft: 6,
  },
  addressBook: {
    fontFamily: 'Muli-Black',
    fontSize: 12,
    color: Colors.address_primary_header,
  },
  selectLocationText: {
    fontSize: 14,
    fontFamily: 'Muli-SemiBold',
    color: Colors.text_dark,
  },
});
