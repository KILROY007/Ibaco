import React from 'react';
import {TouchableOpacity, View, StyleSheet, Image} from 'react-native';
import {ComponentBase} from 'resub';
import {Text, Item, Card} from 'native-base';
import ImageAssets from '../../../assets';
import {CartItemComponent} from '../cart/CartItemComponent';
import Colors from '../../../resources/Colors';
import {DateUtils} from '../../../core/DateUtils';
import Strings from '../../../resources/String';

export class OrderHistoryItemComponent extends ComponentBase<any, any> {
  private dateUtils = new DateUtils();
  constructor(props: any) {
    super(props);
    this.state = {
      isBillDetailsPressed: false,
      packageCharges: 0,
      deliveryCharge: 0,
    };
  }
  async componentDidMount() {
    const response = await this.props.getDeliveryFee(
      this.props.orderItem.entity_id,
    );
    if (response.length) {
      this.setState({
        packageCharges: response[0].package_fee,
        deliveryCharge: response[0].dunzo_delivery_fee,
      });
    }
  }

  public render() {
    return (
      <Card>
        <View style={styles.cardView}>
          <Item style={styles.itemStyle}>
            <Text style={styles.dateTimeText}>
              {this.dateUtils.format(
                this.props.orderItem.created_at,
                'DD MMMM YYYY, dddd',
              )}
            </Text>
            <Text style={[styles.dateTimeText, {color: Colors.text_Light}]}>
              {this.dateUtils.format(this.props.orderItem.created_at, 'h:mm A')}
            </Text>
          </Item>
          <Text style={[{marginTop: 11.46}, styles.orderId]}>
            {Strings.text_order_id} {this.props.orderItem.increment_id}
          </Text>
          <View style={{flexDirection:"row",marginTop: 15}}>
          {this.state.packageCharges > 0 && (
            <Text style={[styles.billValue2]}>
              {Strings.text_packaging}{': '}
              <Text style={styles.billValueText2}>
              ₹{this.state.packageCharges} 
              </Text>
            </Text>
          )}
          {this.props.orderItem.shipping_description !==
            'storepickup - storepickup' &&
            this.state.deliveryCharge > 0 && (
              <Text style={styles.billValue2}>
                {" ,"}{Strings.text_delivery_fee}{': '}
                <Text style={styles.billValueText2}>
                ₹{this.state.deliveryCharge}
                </Text>
              </Text>
            )}
                </View>

          <Text style={[{marginTop: 15.61}, styles.billValue]}>
            {Strings.text_bill_value}{' '}
            <Text style={styles.billValueText}>
            ₹{this.props.orderItem.grand_total}
            </Text>
          </Text>

          <Text style={styles.paidVia}>
            {Strings.text_paid_via}{' '}
            {this.props.orderItem.extension_attributes
              .payment_additional_info[0].value === 'Check / Money order'
              ? Strings.text_cash_on_delivery
              : Strings.text_online_payment}
          </Text>
          {this.props.orderItem.status !== 'canceled' && (
            <Text style={[{marginTop: 21.46}, styles.address]}>
              {this.props.orderItem.total_qty_ordered} Items.{' '}
              {this.props.orderItem.status === 'complete'
                ? 'Delivered'
                : this.props.orderItem.status === 'canceled'
                ? 'Canceled'
                : this.props.orderItem.status === 'closed' && 'Refunded'}
            </Text>
          )}
          {this.props.orderItem.status === 'canceled' && (
            <Text style={[{marginTop: 21.46}, styles.address2]}>
              {'Order Cancelled'}
            </Text>
          )}

          <Text style={[{marginTop: 12.46}, styles.address]}>
            Address:{' '}
            <Text style={styles.addressText}>
              {this.props.orderItem.billing_address.street.map(
                (item, index) => {
                  if (
                    index !=
                    this.props.orderItem.billing_address.street.length - 1
                  ) {
                    return `${item}, `;
                  } else {
                    return item;
                  }
                },
              )}{' '}
              ,{this.props.orderItem.billing_address.city},{' '}
              {this.props.orderItem.billing_address.region},{' '}
              {this.props.orderItem.billing_address.postcode}{' '}
            </Text>
          </Text>
          <Item style={[{marginTop: 46}, styles.itemStyle]}>
            <Item style={styles.borderBottomWidthZero}>
              <TouchableOpacity
                onPress={() => {
                  this.setState({
                    ...this.state,
                    isBillDetailsPressed: !this.state.isBillDetailsPressed,
                  });
                }}>
                <Text style={[{marginRight: 5.5}, styles.billDetails]}>
                  {Strings.button_bill_details}
                </Text>
              </TouchableOpacity>
              <Image
                source={ImageAssets.bill_details_arrow}
                style={{
                  transform: [
                    {
                      rotate: !this.state.isBillDetailsPressed
                        ? '180deg'
                        : '0deg',
                    },
                  ],
                }}
              />
            </Item>
            {!this.state.isBillDetailsPressed ? (
              <Item style={[styles.borderBottomWidthZero, {marginTop: 10}]}>
                {this.props.orderItem.status !== 'complete' &&
                this.props.orderItem.status !== 'closed' ? (
                  <TouchableOpacity
                    style={{marginLeft: 3}}
                    onPress={() => {
                      if (this.props.orderItem.status !== 'canceled') {
                        this.props.navigation.navigate(
                          'OrderTrackingComponent',
                          {
                            isOnlinePayment:
                              this.props.orderItem.extension_attributes
                                .payment_additional_info[0].value ===
                              'Check / Money order'
                                ? false
                                : true,
                            orderItem: this.props.orderItem,
                            response: this.props.orderItem.entity_id,
                            isUpdateTrackOrder:
                              this.props.orderItem.shipping_description ===
                              'storepickup - storepickup'
                                ? false
                                : true,
                          },
                        );
                      }
                    }}>
                    <Text style={styles.buttonText}>
                      {this.props.orderItem.status !== 'canceled' &&
                        Strings.button_order_status}
                    </Text>
                  </TouchableOpacity>
                ) : this.props.orderItem.status !== 'closed' ? (
                  <TouchableOpacity
                    style={styles.center}
                    onPress={() => this.props.reOrder(this.props.orderItem)}>
                    <Text style={styles.buttonText}>
                      {Strings.button_reorder}
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity style={styles.center} disabled={true}>
                    <Text style={styles.buttonText}>
                      {Strings.button_refunded}
                    </Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={[{marginLeft: 20}, styles.center]}
                  onPress={() =>
                    this.props.navigateToHelp(this.props.orderItem)
                  }>
                  <Text style={styles.buttonText}>{Strings.button_help}</Text>
                </TouchableOpacity>
              </Item>
            ) : null}
          </Item>
          {this.state.isBillDetailsPressed ? (
            <View>
              <View
                style={{height: 1, backgroundColor: '#979797', marginTop: 5}}
              />
              {this.props.orderItem.items.map((item, key) => {
                return (
                  <View style={{marginTop: 13}} key={key}>
                    <CartItemComponent
                      isOrderHistory={true}
                      item={item}
                      key={key}
                    />
                  </View>
                );
              })}
              <Item
                style={[
                  styles.borderBottomWidthZero,
                  {alignSelf: 'flex-end', marginTop: 20},
                ]}>
                {this.props.orderItem.status !== 'complete' &&
                this.props.orderItem.status !== 'closed' ? (
                  <TouchableOpacity
                    style={{marginLeft: 3}}
                    onPress={() => {
                      if (this.props.orderItem.status !== 'canceled') {
                        this.props.navigation.navigate(
                          'OrderTrackingComponent',
                          {
                            isOnlinePayment:
                              this.props.orderItem.extension_attributes
                                .payment_additional_info[0].value ===
                              'Check / Money order'
                                ? false
                                : true,
                            orderItem: this.props.orderItem,
                            response: this.props.orderItem.entity_id,
                            isUpdateTrackOrder:
                              this.props.orderItem.shipping_description ===
                              'storepickup - storepickup'
                                ? false
                                : true,
                          },
                        );
                      }
                      // this.setState({
                      //   ...this.state,
                      //   isBillDetailsPressed: !this.state.isBillDetailsPressed,
                      // });
                    }}>
                    <Text style={styles.buttonText}>
                      {this.props.orderItem.status !== 'canceled' &&
                        Strings.button_order_status
                      // : Strings.button_order_cancel
                      // this.props.orderItem.shipping_description ===
                      //   'Flat Rate - Fixed' &&
                      // this.props.orderItem.status === 'canceled'
                      // ?
                      // : `ORDER STATUS`
                      }
                    </Text>
                  </TouchableOpacity>
                ) : this.props.orderItem.status !== 'closed' ? (
                  <TouchableOpacity
                    style={styles.center}
                    onPress={() => this.props.reOrder(this.props.orderItem)}>
                    <Text style={styles.buttonText}>
                      {Strings.button_reorder}
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity style={styles.center} disabled={true}>
                    <Text style={styles.buttonText}>
                      {Strings.button_refunded}
                    </Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={[{marginLeft: 20}, styles.center]}
                  onPress={() =>
                    this.props.navigateToHelp(this.props.orderItem)
                  }>
                  <Text style={styles.buttonText}>{Strings.button_help}</Text>
                </TouchableOpacity>
              </Item>
            </View>
          ) : null}
        </View>
      </Card>
    );
  }
}

const styles = StyleSheet.create({
  cardView: {
    paddingLeft: 11,
    paddingRight: 11,
    paddingTop: 20,
    paddingBottom: 19,
  },
  itemStyle: {
    borderBottomWidth: 0,
    justifyContent: 'space-between',
  },
  dateTimeText: {
    color: Colors.text_primary_light,
    fontFamily: 'Muli-Bold',
    fontSize: 14,
  },
  orderId: {
    fontFamily: 'Muli-ExtraBold',
    fontSize: 12,
    color: Colors.dark_gray,
  },
  billValue: {
    fontSize: 16,
    fontFamily: 'Muli-Medium',
    color: Colors.text_Light,
  },
  billValue2: {
    fontSize: 12,
    fontFamily: 'Muli-Medium',
    color: Colors.text_Light,
  },
  billValueText: {
    color: Colors.primary_color,
    fontFamily: 'Muli-ExtraBold',
  },
  billValueText2: {
    color: Colors.primary_color,
    fontSize: 12,
    fontFamily: 'Muli-ExtraBold',
  },
  paidVia: {
    fontFamily: 'Muli-ExtraBold',
    fontSize: 12,
    color: Colors.dark_gray,
    
  },
  address: {
    fontSize: 12,
    fontFamily: 'Muli-Bold',
    color: Colors.address_text,
  },
  address2: {
    fontSize: 12,
    fontFamily: 'Muli-Bold',
    color: Colors.primary_color,
  },
  borderBottomWidthZero: {
    borderBottomWidth: 0,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 14,
    fontFamily: 'Muli-Black',
    color: Colors.add_button_text,
  },
  billDetails: {
    fontFamily: 'Muli-Medium',
    color: Colors.bill_details,
    fontSize: 14,
  },
  addressText: {
    fontFamily: 'Muli-SemiBold',
    color: Colors.text_Light,
    fontSize: 12,
  },
});
