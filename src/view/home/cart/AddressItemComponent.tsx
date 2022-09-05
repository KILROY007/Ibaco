import React from 'react';
import { TouchableOpacity, View, StyleSheet, Image } from 'react-native';
import { ComponentBase } from 'resub';
import { Text, Item, Card } from 'native-base';
import ImageAssets from '../../../assets';
import Strings from '../../../resources/String';

export class AddressItemComponent extends ComponentBase<any, any> {
  private pincode;
  constructor(props: any) {
    super(props);
  }
  public imageofAddresstype(items) {
    let data;
    items.map(item => {
      if (item.label === 'AddressType') {
        if (item.value == '1') {
          data = ImageAssets.checkout_home;
        } else if (item.value == '2') {
          data = ImageAssets.checkout_work;
        } else if (item.value == '3') {
          data = ImageAssets.checkout_others;
        }
      } else {
        data = ImageAssets.checkout_others;
      }
    });
    return data;
  }
  public textOfAddresstype(items) {
    let data;
    items.map(item => {
      if (item.label === 'AddressType') {
        if (item.value == '1') {
          data = Strings.text_home;
        } else if (item.value == '2') {
          data = Strings.text_work;
        } else if (item.value == '3') {
          data = Strings.text_others_place;
        }
      } else {
        if (item.label === 'name') {
          data = `${item.value}`;
        }
      }
    });
    return data;
  }

  public render() {
    let imadeData;
    const data2 = this.props.data;
    this.props.data &&
      this.props.data.map((item, key) => {
        if (item.label === 'PinCode') {
          this.pincode = item.value;
        }
      });
    return (
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => {
          if (this.props.isNewAddress) {
            this.props.OnPress();
          }
        }}>
        <Card
          style={[
            styles.container,
            { backgroundColor: this.props.isNewAddress ? '#FFF5F5' : '#ffffff' },
          ]}>
          {/* // marginTop: 13, */}

          <View
            style={[
              this.props.isNewAddress ? styles.mainViewForNew : styles.mainView,
            ]}>
            <View
              style={{
                flexDirection: 'row',
                marginLeft: 10,
                alignItems: 'center',
              }}>
              <Image
                source={
                  this.props.isNewAddress
                    ? ImageAssets.new_address
                    : this.props.data
                      ? this.imageofAddresstype(this.props.data)
                      : ImageAssets.checkout_home
                }
                style={{ marginLeft: this.props.isNewAddress && 10 }}
              />
              <Text
                style={[
                  this.props.isNewAddress
                    ? styles.newheaderText
                    : styles.headerText,
                  { color: this.props.isNewAddress ? '#ec2f23' : '#555555' },
                ]}>
                {this.props.isNewAddress
                  ? Strings.button_add_new_address
                  : this.props.data
                    ? this.textOfAddresstype(this.props.data)
                    : Strings.button_home}
              </Text>
            </View>
            <View
              style={{
                marginLeft: 35,
                marginTop: this.props.isNewAddress ? 7 : 3,
              }}>
              <Text
                style={[
                  styles.addressText,
                  { color: this.props.isNewAddress ? '#BE9F9F' : '#999999' },
                ]}>
                {this.props.data
                  ? this.props.data.map((item, key) => {
                    if (
                      item.label !== 'AddressType' &&
                      item.label !== 'name'
                    ) {
                      if (data2.indexOf(item) < data2.length - 2) {
                        return item.value != 'undefined'
                          ? `${item.value} ,`
                          : '';
                      } else {
                        return item.value != 'undefined'
                          ? `${item.value} ,`
                          : '';
                      }
                    }
                  })
                  : Strings.text_cart_new_address_content}
              </Text>
              <View style={styles.deliveryButtonItem}>
                <Text
                  style={[
                    styles.hrsText,
                    { color: this.props.isNewAddress ? '#AE8B8B' : '#555555' },
                  ]}>
                  {Strings.text_hours}
                </Text>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                  }}>
                  {!this.props.isNewAddress && this.props.buttonText ? (
                    <TouchableOpacity
                      // disabled={
                      //   this.props.SelectedAddressPinCode
                      //     ? this.props.SelectedAddressPinCode != this.pincode
                      //       ? true
                      //       : false
                      //     : false
                      // }
                      onPress={() => {
                        this.props.OnPress();
                      }}>
                      <Text
                        style={[
                          styles.deliveryButton,
                          {
                            color:
                              this.props.SelectedAddressPinCode &&
                                this.props.SelectedAddressPinCode != this.pincode
                                ? '#EB6A6A'
                                : '#EB6A6A',
                          },
                        ]}>
                        {this.props.buttonText}
                      </Text>
                    </TouchableOpacity>
                  ) : null}
                  {!this.props.isNewAddress && this.props.deletButtonText && (
                    <View style={{ marginLeft: 10, marginRight: 10 }} />
                  )}
                  {!this.props.isNewAddress && this.props.deletButtonText ? (
                    <TouchableOpacity
                      onPress={() => {
                        this.props.onDeletePress();
                      }}>
                      <Text
                        style={[
                          styles.deliveryButton,
                          {
                            color: '#EB6A6A',
                          },
                        ]}>
                        {this.props.deletButtonText}
                      </Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              </View>
            </View>
          </View>
        </Card>
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    marginLeft: 21,
    marginRight: 21,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#DDDDDD',
  },
  headerText: {
    fontFamily: 'Muli-Bold',
    fontSize: 14,
  },
  newheaderText: {
    fontFamily: 'Muli-Bold',
    fontSize: 14,
    marginLeft: 15,
  },
  addressText: {
    color: '#999999',
    fontFamily: 'Muli-SemiBold',
    fontSize: 14,
  },
  hrsText: {
    color: '#555555',
    fontFamily: 'Muli-Bold',
    fontSize: 14,
  },
  deliveryButton: {
    color: '#EB6A6A',
    fontFamily: 'Muli-Black',
    fontSize: 14,
  },
  deliveryButtonItem: {
    borderBottomWidth: 0,
    justifyContent: 'space-between',
    marginTop: 17,
    flexDirection: 'row',
  },
  mainView: {
    marginRight: 14,
    // marginTop: 13,
    marginBottom: 13,
  },
  mainViewForNew: {
    marginRight: 14,
    marginTop: 13,
    marginBottom: 13,
  },
});
