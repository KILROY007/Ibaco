import React from 'react';
import {
  TouchableOpacity,
  View,
  StyleSheet,
  FlatList,
  TextInput,
  Modal,
  Image,
  Alert,
  Platform,
  StatusBar,
  Keyboard,
} from 'react-native';
import { ComponentBase } from 'resub';
import { Container, Text, Item, Content, Card } from 'native-base';
import { DependencyInjector } from '../../dependency-injector/DependencyInjector';
import { CartItemComponent } from './cart/CartItemComponent';
import LinearGradient from 'react-native-linear-gradient';
import { CheckoutPaymentComponent } from './cart/CheckoutPaymentComponent';
import { CheckoutAddressComponent } from './cart/CheckoutAddressComponent';
import { CartViewModel, CartState } from '../../view-madel/CartViewModel';
import { EmptyCartComponent } from './cart/EmptyCartComponent';
import { Loader } from '../common-components/Loader';
import ImageAssets from '../../assets';
import { ProductItemInsideCartComponent } from '../common-components/ProductItemComponent';
import { Retry } from '../common-components/Retry';
import Colors from '../../resources/Colors';
import { AddOrEditAddressViewModel } from '../../view-madel/AddOrEditAddressViewModel';
import { ModalPopUp } from '../common-components/ModalPopUp';
import AsyncStorage from '@react-native-community/async-storage';
import constants from '../../resources/constants';
import AlertComponent from '../common-components/Alert/Alert';
import Strings from '../../resources/String';

export class CartComponent extends ComponentBase<any, CartState> {
  public viewModel: CartViewModel;

  pickupAddress;
  constructor(props: any) {
    super(props);
    this.viewModel = DependencyInjector.default().provideCartViewModel();
  }

  async componentDidMount() {
    await this.viewModel.getCouponCode();
    await this.viewModel.checkShopTimings();
  }

  public ShouldOrderPlacedScreen = () => {
    this.viewModel.setMany({
      ...this.state,
      addressModal: false,
      paymentModal: false,
      shouldShowOrderPlacedState: true,
      customizationText: '',
    })

    setTimeout(async () => {
      this.viewModel.set('shouldShowOrderPlacedState', false);
      this.viewModel.set('couponButton', true);
      this.viewModel.set('couponCode', '');
      this.props.navigation.navigate('Shop', {
        screen: 'ShopComponent',
        params: { isUpdated: true },
      });
    }, 3000);
  };

  UNSAFE_componentWillReceiveProps(newProps) {
    if (newProps.route.params && newProps.route.params.newAddress) {
      const newAddress = newProps.route.params.newAddress;
      this.pickupAddress = null
      this.viewModel.setMany({
        ...this.state,
        addressValue: newAddress[0],
        addressId: newAddress[1],
        addressMethode: 1,
        paymentModal: true,
        addressModal: false,
      });
      this.props.navigation.setParams({ newAddress: undefined });
    }
  }

  async componentDidUpdate() {
    if (this.state.error) {
      const alert = {
        shouldShowCancelButton: false,
        description: this.state.error.message,
        title: Strings.alert_title,
        okButtonText: 'OK',
        onCancelPress: () => {
          this.viewModel.set('alertDetails', undefined);
        },
        onOkPress: async () => {
          this.viewModel.set('alertDetails', undefined);
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
        onCancelPress: () => {
          this.viewModel.set('alertDetails', undefined);
        },
        onOkPress: () => {
          this.viewModel.set('alertDetails', undefined);
          this.viewModel.set('validationError', undefined);
        },
      };
      this.viewModel.set('alertDetails', alert);
      this.viewModel.set('validationError', undefined);
    } else if (this.state.onSuccess) {
      const alert = {
        shouldShowCancelButton: false,
        description: `Coupon code ${this.state.couponCode
          } applied successfully`,
        title: Strings.alert_title,
        okButtonText: Strings.button_ok,
        onCancelPress: () => {
          this.viewModel.set('alertDetails', undefined);
        },
        onOkPress: () => {
          this.viewModel.set('alertDetails', undefined);
          this.viewModel.set('onSuccess', false);
        },
      };
      this.viewModel.set('alertDetails', alert);
      this.viewModel.set('onSuccess', false);
    } else if (this.state.onDeletSuccess) {
      const alert = {
        shouldShowCancelButton: false,
        description: Strings.alert_couponCode_delete_success,
        title: Strings.alert_title,
        okButtonText: Strings.button_ok,
        onCancelPress: () => {
          this.viewModel.set('alertDetails', undefined);
        },
        onOkPress: async () => {
          this.viewModel.set('alertDetails', undefined);
          this.viewModel.set('onDeletSuccess', false);
          this.viewModel.set('couponCode', '');
        },
      };
      this.viewModel.set('alertDetails', alert);
      this.viewModel.set('onDeletSuccess', false);
    } else if (this.state.couponError) {
      const alert = {
        shouldShowCancelButton: false,
        description: Strings.alert_invalid_couponCode,
        title: Strings.alert_title,
        okButtonText: Strings.button_ok,
        onCancelPress: () => {
          this.viewModel.set('alertDetails', undefined);
        },
        onOkPress: async () => {
          this.viewModel.set('alertDetails', undefined);
          this.viewModel.set('couponError', undefined);
        },
      };
      this.viewModel.set('alertDetails', alert);
      this.viewModel.set('couponError', undefined);
    } else if (this.state.addItemInCart) {
      const alert = {
        shouldShowCancelButton: true,
        description: Strings.alert_add_item_toCart,
        title: Strings.alert_title,
        okButtonText: Strings.button_ok,
        onCancelPress: () => {
          this.viewModel.set('alertDetails', undefined);
        },
        onOkPress: async () => {
          this.viewModel.set('alertDetails', undefined);
          this.viewModel.set('addItemInCart', false);
        },
      };
      this.viewModel.set('alertDetails', alert);
      this.viewModel.set('addItemInCart', false);
    } else if (this.state.deleteItemInCart) {
      const alert = {
        shouldShowCancelButton: true,
        description: Strings.alert_remove_item_fromCart,
        title: Strings.alert_title,
        okButtonText: Strings.button_ok,
        onCancelPress: () => {
          this.viewModel.set('alertDetails', undefined);
        },
        onOkPress: async () => {
          this.viewModel.set('alertDetails', undefined);
          this.viewModel.set('deleteItemInCart', false);
        },
      };
      this.viewModel.set('alertDetails', alert);
      this.viewModel.set('deleteItemInCart', false);
    }
  }

  private handleDeleteItem = async itemId => {
    await this.viewModel.deleteCartItem(itemId);
  };

  public openPaymentModal = (item, index, addressMethode) => {
    this.pickupAddress = null;
    this.viewModel.setMany({
      ...this.state,
      addressValue: item,
      addressId: index,
      addressMethode,
      paymentModal: !this.state.paymentModal,
      addressModal: !this.state.addressModal,
    });
  };
  public openAddresstModal = () => {
    this.viewModel.setMany({
      ...this.state,
      addressValue: undefined,
      addressId: undefined,
      addressMethode: undefined,
      paymentModal: !this.state.paymentModal,
      addressModal: !this.state.addressModal,
    });
  };

  public closeModal = () => {
    this.viewModel.set('addressModal', false);
    this.viewModel.set('paymentModal', false);
  };

  private addToCart = async (product, isDecrease) => {
    if (product.qty - 1 === 0 && isDecrease) {
      this.viewModel.deleteCartItem(product.item_id);
    } else {
      await this.viewModel.updateProductQuantityInCart(product, isDecrease);
    }
  };

  public addRelatedItemToCart = async (product, selectedOptionsValue) => {
    await this.viewModel.addRelatedItemsToCart(product, selectedOptionsValue);
  };

  private handleCouponCode = async () => {
    if (this.props.cart.isCouponApplied) {
      await this.viewModel.deletCouponCode();
      this.viewModel.set('couponCode', '');
    } else {
      await this.viewModel.applyCoupon();
    }
  };

  public render() {
    const cartItems = this.props.cart.cartItems
      ? this.props.cart.cartItems
      : [];
    const cartSummary = this.props.cart.cartSummary
      ? this.props.cart.cartSummary
      : [];
    const inventoryItems = this.props.cart.inventoryItems
      ? this.props.cart.inventoryItems
      : [];
    if (this.state.shouldShowOrderPlacedState) {
      return (
        <Container style={{ flex: 1 }}>
          <StatusBar barStyle="default" backgroundColor={Colors.primary_gradient_color_header} />
          <Content style={{ flex: 1 }}>
            <View style={styles.view1}>
              <Text style={styles.textHead1}>{Strings.text_order_status}</Text>
            </View>
            <View style={styles.view2}>
              <Text style={styles.textHurray}>{Strings.text_hurry}</Text>
              <Text style={styles.subTextHurray}>
                {Strings.text_order_placed}
              </Text>
            </View>
            <View style={{ marginTop: 59, alignItems: 'center' }}>
              {/* <Image
                source={ImageAssets.order_tracking_chef}
                style={styles.imageChef}
              /> */}
            </View>
          </Content>
        </Container>
      );
    } else {
      return (
        <Container style={styles.container}>
          {cartSummary === undefined && cartItems.length === 0 ? (
            <EmptyCartComponent />
          ) : cartSummary &&
            cartSummary.items &&
            cartSummary.items.length > 0 ? (
            <Content>
              {this.state.alertDetails &&
                this.state.alertDetails.description ? (
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
              <Text
                style={[
                  styles.letUsKnowButtonText,
                  { marginTop: 3, marginLeft: 18.95 },
                ]}>
                {cartSummary.items_qty} items
              </Text>
              <View>
                <FlatList
                  keyExtractor={(item, index) => index.toString()}
                  onEndReachedThreshold={0.1}
                  removeClippedSubviews={false}
                  onEndReached={this.props.handleLoadMore}
                  data={cartSummary.items}
                  renderItem={({ item, index, separators }) => (
                    <CartItemComponent
                      cartItem={item}
                      handleDeleteItem={this.handleDeleteItem}
                      addToCart={this.addToCart}
                      product={cartItems[index]}
                    />
                  )}
                />
              </View>
              <Text
                style={[styles.addMoreButton, styles.addMoreButtonText]}
                onPress={() => {
                  this.props.navigation.navigate('Shop', {
                    screen: 'ShopComponent',
                    params: { isUpdated: false },
                  });
                }}>
                {Strings.button_add_more}{' '}
              </Text>
              <View style={styles.buttonView}>
                {/* <TextInput
                  style={[styles.letUsKnowButton, styles.letUsKnowButtonText]}
                  placeholder='Any customization preference? Let us know here!'
                  onChangeText={text => {
                    this.viewModel.set('customizationText', text)
                  }} /> */}
                <View style={styles.applyButtonView}>
                  <TextInput
                    autoCapitalize="characters"
                    placeholder="Enter coupon code"
                    style={[styles.couponCode, { flex: 0.6 }]}
                    placeholderTextColor="#9E9E9E"
                    onChangeText={text => {
                      this.viewModel.set('couponCode', text);
                      this.viewModel.setCouponCode(text);
                    }}
                    value={this.props.cart.couponCode}
                  />
                  <TouchableOpacity
                    style={{
                      borderTopRightRadius: 14,
                      borderBottomRightRadius: 14,
                    }}
                    onPress={() => {
                      // if (this.state.isApplyButton) {
                      //     this.viewModel.applyCoupon()
                      // } else {
                      //     this.viewModel.deletCouponCode()
                      // }
                      Keyboard.dismiss();
                      this.handleCouponCode();
                    }}>
                    <LinearGradient
                      colors={[Colors.primary_color,Colors.primary_color]}
                      style={[styles.applyButtonGradient]}>
                      <Text
                        style={[
                          styles.letUsKnowButtonText,
                          this.state.isApplyButton
                            ? styles.applyButtonText
                            : styles.removeButtonText,
                        ]}>
                        {!this.props.cart.isCouponApplied
                          ? `APPLY`
                          : `REMOVE COUPON`}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
              <View style={{ marginTop: 35, marginLeft: 17, marginRight: 17 }}>
                <Text
                  style={[
                    styles.addMoreButtonText,
                    { color: Colors.text_primary_light },
                  ]}>
                  {Strings.text_bill_details}
                </Text>
                <View style={{ marginTop: 10 }}>
                  <Item style={styles.billDetailsItem}>
                    <Text
                      style={[
                        styles.billDetailsItemText,
                        { color: Colors.text_Light },
                      ]}>
                      {Strings.text_item_total}
                    </Text>
                    <Text style={styles.billDetailsItemText}>
                      {cartSummary.base_subtotal}
                    </Text>
                  </Item>
                  <Item style={styles.billDetailsItem}>
                    <Text
                      style={[
                        styles.billDetailsItemText,
                        { color: Colors.text_Light },
                      ]}>
                      {Strings.text_delivery_fee}
                    </Text>
                    <Text style={styles.billDetailsItemText}>
                      Calculated at the next step
                        </Text>
                  </Item>
                  <Item style={styles.billDetailsItem}>
                    <Text
                      style={[
                        styles.billDetailsItemText,
                        { color: Colors.text_Light },
                      ]}>
                      {Strings.text_discount_fee}
                    </Text>
                    <Text style={styles.billDetailsItemText}>
                      {cartSummary.base_discount_amount}
                    </Text>
                  </Item>
                  {/* <Item style={styles.billDetailsItem}>
                    <Text
                      style={[
                        styles.billDetailsItemText,
                        { color: Colors.text_Light },
                      ]}>
                      {Strings.text_taxes_charges}
                    </Text>
                    <Text style={styles.billDetailsItemText}>
                      Calculated at the next step
                        </Text>
                  </Item> */}
                  <Item style={styles.billDetailsItem}>
                    <Text
                      style={[
                        styles.billDetailsItemText,
                        { color: Colors.text_Light },
                      ]}>
                      {Strings.text_packaging}
                    </Text>
                    <Text style={styles.billDetailsItemText}>
                      Calculated at the next step
                        </Text>
                  </Item>
                </View>
                <View style={styles.line} />
                <View>
                  <Item style={styles.billDetailsItem}>
                    <Text style={[styles.total]}>
                      {Strings.text_total_pay_amount}{' '}
                    </Text>
                    <Text style={[styles.totalAmount]}>
                    ₹
                      {// cartSummary.base_grand_total
                        cartSummary.base_subtotal +
                        cartSummary.base_discount_amount}
                    </Text>
                  </Item>
                </View>
              </View>
              <LinearGradient
                colors={[Colors.primary_gradient_color, Colors.primary_color]}
                style={styles.proceedToCheckout}>
                <TouchableOpacity
                  style={{
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100%',
                  }}
                  onPress={async () => {
                    var time = new Date().getHours();
                    
                    // if(time >= 22 || time < 6 ){
                    //     this.viewModel.set("isShopOpen",false)
                    // }else{
                      if (this.props.cart && this.props.cart.cart_id) {
                        const pickupAddress = await AsyncStorage.getItem(
                          constants.PICK_UP_ADDRESS,
                        );
                        if (pickupAddress) {
                          this.pickupAddress = JSON.parse(pickupAddress);
                          this.viewModel.set('addressMethode', 2);
                          this.viewModel.set('paymentModal', true);
                        } else {
                          this.viewModel.set('addressMethode', 1);
                          this.viewModel.set('addressModal', true);
                        }
                      } else {
                        this.viewModel.set('showLoginModal', true);
                      }
                    // }
                  }}>
                  <Text style={styles.proceedToCheckOutText}>
                    {Strings.button_checkOut}{' '}
                    <Image source={ImageAssets.arrow_forward} />
                  </Text>
                </TouchableOpacity>
              </LinearGradient>
              <Modal
                      animationType="fade"
                      transparent={true}
                      visible={!this.state.isShopOpen}
                      onRequestClose={() => {
                        this.viewModel.set("isShopOpen",true)
                      }}>
                      <Item
                        style={styles.modelview}
                        onPress={() => {
                          this.viewModel.set("isShopOpen",true)
                        }}>
                        <View style={[styles.viewmodal]}>
                          <View style={{flexDirection: 'row'}}>
                            <Image
                              style={{width: 20, height: 20, marginLeft: 'auto'}}
                              source={ImageAssets.remove}
                            />
                          </View>
                            <View style={{flexDirection: 'column',}}>
                            <Image
                             source={ImageAssets.store_img}
                              style={{height: 140, width: 140,alignSelf: 'center',
                              justifyContent: 'center',}}
                            />
                                <Text
                                numberOfLines={2}
                                  style={{
                                    padding: 12,
                                    color: Colors.text_dark,
                                    fontFamily: 'Montserrat-Bold',
                                    marginTop: 15,
                                  }}>
                                    We are closed now.
                                    Shop will be open from 6 AM to 9PM Everyday
                                </Text>
                              {/* )} */}
                            </View>
                          </View>
                      </Item>
                    </Modal>
              {this.state.addressModal || this.state.paymentModal ? (
                <Modal
                  transparent={true}
                  // backdropColor='rgba(0,0,0,0.5)'
                  animationType={'slide'}
                  onRequestClose={() => {
                    this.setState({ ...this.state, addressModal: false });
                  }}>
                  <View
                    style={{
                      flex: 1,
                      // backdropColor:'rgba(0,0,0,0.5)'
                      backgroundColor: 'rgba(73,69,69,0.81)',
                      justifyContent: 'flex-end',
                    }}>
                    <View
                      style={{
                        height: this.state.paymentModal ? '100%' : '80%',
                      }}>
                      {this.state.addressModal ? (
                        <CheckoutAddressComponent
                          navigation={this.props.navigation}
                          openPaymentModal={this.openPaymentModal}
                          closeModal={this.closeModal}
                          customizationText={this.state.customizationText}
                        />
                      ) : this.state.paymentModal ? (
                        <CheckoutPaymentComponent
                          navigation={this.props.navigation}
                          closeModal={this.closeModal}
                          selectedDeliveryAddress={this.state.addressValue}
                          id={this.state.addressId}
                          openAddresstModal={this.openAddresstModal}
                          addressMethode={this.state.addressMethode}
                          ShouldOrderPlacedScreen={this.ShouldOrderPlacedScreen}
                          pickupAddress={this.pickupAddress}
                          customizationText={this.state.customizationText}
                        />
                      ) : null}
                    </View>
                  </View>
                </Modal>
              ) : null}
              {this.state.showLoginModal ? (
                <ModalPopUp
                  buttonText1={Strings.button_login}
                  buttonText2={Strings.button_signUp}
                  title={Strings.text_secure_checkout}
                  question={Strings.text_seure_checkout_login_confirm}
                  closeModal={() => {
                    this.viewModel.set('showLoginModal', false);
                  }}
                  onPress={async (isLogin, data) => {
                    this.viewModel.set('showLoginModal', false);
                    this.props.navigation.navigate('Login', { isLogin, data });
                  }}
                />
              ) : null}
              {this.props.cart.relatedCartItems &&
                this.props.cart.relatedCartItems.length ? (
                <View style={{ marginTop: 21.61 }}>
                  <Text
                    style={{
                      fontSize: 16,
                      fontFamily: 'Muli-SemiBold',
                      color: '#A0A0A0',
                      marginLeft: 24,
                    }}>
                    {Strings.text_you_may_also_add}
                  </Text>
                  <View
                    style={{
                      marginRight: 8,
                      flexDirection: 'row',
                      marginTop: 15,
                    }}>
                    <FlatList
                      horizontal={true}
                      showsHorizontalScrollIndicator={false}
                      keyExtractor={(item, index) => index.toString()}
                      onEndReachedThreshold={0.1}
                      removeClippedSubviews={false}
                      onEndReached={this.props.handleLoadMore}
                      data={this.props.cart.relatedCartItems}
                      renderItem={({ item, index, separators }) => (
                        <ProductItemInsideCartComponent
                          key={`key-${index}-${item.sku}`}
                          item={item}
                          addRelatedItemToCart={this.addRelatedItemToCart}
                          cartItems={cartItems}
                          cartSummary={cartSummary}
                          inventoryItems={inventoryItems}
                        />
                      )}
                    />
                  </View>
                </View>
              ) : null}
            </Content>
          ) : (
            <EmptyCartComponent />
          )}
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
  container: {
    flex: 1,
  },
  content: {
    margin: 10,
    flex: 1,
    marginTop: 20,
  },
  letUsKnowButtonText: {
    color: "#ca9e25",
    fontFamily: 'Muli-Bold',
    fontSize: 11.37,
  },
  couponCode: {
    color: '#9E9E9E',
    fontFamily: 'Muli-Medium',
    fontSize: 11.37,
    marginLeft: 10,
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
  letUsKnowButton: {
    height: 50.53,
    borderRadius: 14,
    borderWidth: 0.63,
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 12,
  },
  buttonView: {
    marginTop: 15.23,
    marginLeft: 17.6,
    marginRight: 17.6,
  },
  applyButtonText: {
    paddingLeft: 43,
    paddingRight: 43,
    color: Colors.white,
  },
  removeButtonText: {
    paddingLeft: 32,
    paddingRight: 32,
    color: Colors.white,
  },
  addMoreButton: {
    marginTop: 8.7,
    marginLeft: 16.95,
  },
  addMoreButtonText: {
    color: Colors.primary_color,
    fontFamily: 'Muli-Bold',
    fontSize: 12,
  },
  billDetailsItemText: {
    color: Colors.address_text,
    fontFamily: 'Muli-SemiBold',
    fontSize: 11,
  },
  billDetailsItem: {
    borderBottomWidth: 0,
    justifyContent: 'space-between',
  },
  applyButtonGradient: {
    flex: 1,
    borderTopRightRadius: 14,
    borderBottomRightRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    height: Platform.OS === 'android' ? 0 : 40,
  },
  applyButtonView: {
    borderWidth: 0.63,
    borderRadius: 14,
    marginTop: 8.37,
    flexDirection: 'row',
    borderColor: '#609160',
    justifyContent: 'space-between',
  },
  proceedToCheckout: {
    flex: 1,
    marginTop: 15,
    height: 40,
    marginRight: 21,
    marginBottom:20,
    marginLeft: 21,
    borderRadius: 14,
  },
  proceedToCheckOutText: {
    color: Colors.text_sec_color,
    fontFamily: 'Muli-ExtraBold',
    fontSize: 16,
  },
  total: {
    color: Colors.text_primary_light,
    fontFamily: 'Muli-Bold',
    fontSize: 13.89,
  },
  totalAmount: {
    color: Colors.primary_color,
    fontFamily: 'Muli-ExtraBold',
    fontSize: 18.95,
  },
  line: {
    height: 0.63,
    backgroundColor: Colors.address_text,
    marginTop: 5,
    marginBottom: 11,
  },
  AddButton: {
    color: Colors.add_button_text,
    fontFamily: 'Muli-Black',
    fontSize: 10,
  },

  view1: {
    marginTop: 40,
    marginLeft: 40,
  },
  view2: {
    marginTop: 40,
    alignItems: 'center',
  },
  textHead1: {
    color: '#888888',
    fontFamily: 'Muli-Bold',
    fontSize: 24,
  },
  textHurray: {
    color: '#EB6A6A',
    fontFamily: 'Muli-Medium',
    fontSize: 70,
  },
  subTextHurray: {
    color: 'rgba(73,69,69,0.81)',
    fontFamily: 'Muli-Bold',
    fontSize: 22,
  },
  imageChef: {
    height: 318,
    width: 342,
  },
});
