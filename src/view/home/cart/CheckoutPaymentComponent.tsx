import React from 'react';
import {
    TouchableOpacity,
    View,
    StyleSheet,
    Image,
    Modal,
    TouchableWithoutFeedback,
} from 'react-native';
import { ComponentBase } from 'resub';
import { Container, Text, Input, Item, Card, Content } from 'native-base';
import LinearGradient from 'react-native-linear-gradient';
import Colors from '../../../resources/Colors';
import {
    CheckoutViewModel,
    CheckoutState,
} from '../../../view-madel/CheckoutViewModel';
import { DependencyInjector } from '../../../dependency-injector/DependencyInjector';
import RazorpayCheckout from 'react-native-razorpay';
import { PaymentMethodEnum } from '../../../domain/enumerations/PaymentMethodEnum';
import { Loader } from '../../common-components/Loader';
import { Retry } from '../../common-components/Retry';
import AlertComponent from '../../common-components/Alert/Alert';
import {ModalPopUp} from '../../common-components/ModalPopUp';
import _ from 'lodash';
import Strings from '../../../resources/String';
import ImageAssets from '../../../assets';
import constants from '../../../resources/constants';

export class CheckoutPaymentComponent extends ComponentBase<
    any,
    CheckoutState
> {
    public viewModel: CheckoutViewModel;

    constructor(props: any) {
        super(props);
        this.viewModel = DependencyInjector.default().provideCheckoutViewModel();
    }
   async componentDidMount() {
        await this.viewModel.setMany({
            selectedDeliveryAddress: this.props.pickupAddress ? this.props.pickupAddress : this.props.selectedDeliveryAddress.key,
            deliveryMode: this.props.addressMethode,
            customizationText: this.props.customizationText,
        })
        await this.viewModel.loadForCheckoutPayment()
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
                    this.viewModel.set('alertDetails', undefined);
                },
            };
            this.viewModel.set('alertDetails', alert);
            this.viewModel.set('error', undefined);
        } else if (this.state.onSuccess) {
            this.props.closeModal();
            this.props.ShouldOrderPlacedScreen();
            this.viewModel.set('onSuccess', false);
        }
    }

    public render() {
        if (this.state.loadError) {
            return (
                <Retry
                    message={this.state.loadError.message}
                    onPress={() => {
                        this.viewModel.set('loadError', undefined);
                        this.viewModel.loadForCheckoutPayment();
                    }}
                />
            );
        } else {
            return (
                <Container style={styles.container}>
                    <View style={{ flex: 0.15, justifyContent: 'center' }}>

                        <View style={styles.priceDetailsView}>
                            {/* {!this.state.isPriceDetailsPressed ? ( */}
                                <View style={styles.youArePayingView}>
                                    <Text style={styles.youArePaying}>
                                        You are paying ₹
                    {this.state.shippingInfoResponse?
                                            this.state.shippingInfoResponse?.base_grand_total
                                            : ''}
                                    </Text>
                                    {/* <TouchableOpacity
                                        style={{ alignSelf: 'flex-end' }}
                                        onPress={() => {
                                            this.viewModel.set(
                                                'isPriceDetailsPressed',
                                                !this.state.isPriceDetailsPressed,
                                            );
                                        }}>
                                        <Text style={styles.priceDetailsText}>Price Details </Text>
                                    </TouchableOpacity>
                                </View>
                            ) : this.state.isPriceDetailsPressed &&
                                this.state.shippingInfoResponse? (
                                <Modal
                                    transparent={true}
                                    animationType={'fade'}
                                    onRequestClose={() => {
                                        this.viewModel.set('isPriceDetailsPressed', false);
                                    }}>
                                    <TouchableWithoutFeedback
                                        onPress={() => {
                                            this.viewModel.set('isPriceDetailsPressed', false);
                                        }}
                                        style={{ alignItems: 'center' }}>
                                        <View
                                            style={{
                                                flex: 1,
                                                backgroundColor: 'rgba(73,69,69,0.4)',
                                            }}>
                                            <View style={styles.popUp}>
                                                <View style={styles.popUpView}>
                                                    <View
                                                        style={{
                                                            flexDirection: 'row',
                                                            alignItems: 'center',
                                                            justifyContent: 'space-between',
                                                        }}>
                                                        <Text
                                                            style={[
                                                                styles.addMoreButtonText,
                                                                { color: Colors.text_primary_light },
                                                            ]}>
                                                            {Strings.text_bill_details}
                                                        </Text>
                                                        <View style={styles.billDetailsLine} />
                                                    </View>
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
                                                                {this.state.shippingInfoResponse?.base_subtotal}
                                                            </Text>
                                                        </Item>
                                                        <Item
                                                            style={[
                                                                styles.billDetailsItem,
                                                                { marginTop: 5.8 },
                                                            ]}>
                                                            <Text
                                                                style={[
                                                                    styles.billDetailsItemText,
                                                                    { color: Colors.text_Light },
                                                                ]}>
                                                                {Strings.text_delivery_fee}
                                                            </Text>
                                                            {this.props.addressMethode === 1 &&
                                                            <Text style={styles.billDetailsItemText}>
                                                                {
                                                                    this.state.shippingInfoResponse?.total_segments
                                                                        ? this.state.shippingInfoResponse?.total_segments[1]["code"].includes("Dunzo")
                                                                          ?this.state.shippingInfoResponse?.total_segments[1]["value"]
                                                                          : null
                                                                        : null
                                                                }
                                                            </Text>
                                                                }
                                                        </Item>
                                                        <Item
                                                            style={[
                                                                styles.billDetailsItem,
                                                                { marginTop: 5.8 },
                                                            ]}>
                                                            <Text
                                                                style={[
                                                                    styles.billDetailsItemText,
                                                                    { color: Colors.text_Light },
                                                                ]}>
                                                                {Strings.text_discount_fee}
                                                            </Text>
                                                            <Text style={styles.billDetailsItemText}>
                                                                {
                                                                    this.state.shippingInfoResponse?.base_discount_amount
                                                                }
                                                            </Text>
                                                        </Item>
                                                        <Item
                                                            style={[
                                                                styles.billDetailsItem,
                                                                { marginTop: 5.8 },
                                                            ]}>
                                                            <Text
                                                                style={[
                                                                    styles.billDetailsItemText,
                                                                    { color: Colors.text_Light },
                                                                ]}>
                                                                {Strings.text_taxes_charges}
                                                            </Text>
                                                            <Text style={styles.billDetailsItemText}>
                                                                {this.state.shippingInfoResponse?.tax_amount}
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
                                {
                                                                    this.state.shippingInfoResponse?.base_grand_total
                                                                }
                                                            </Text>
                                                        </Item>
                                                    </View>
                                                </View>
                                            </View>
                                        </View>
                                    </TouchableWithoutFeedback>
                                </Modal>
                            ) : null}
                             */}
                             </View>
                        </View>
                    </View>
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
                          {this.state.showChangeDelivery  && !this.state.showStorePopup && (
                            <View>
                                <ModalPopUp
                                    title={this.state.deliveryError ? this.state.deliveryError[0]:Strings.text_cannot_deliver}
                                    question={Strings.text_do_u_want_to_change}
                                    buttonText1={Strings.text_CHANGE_DEL_ADD}
                                    buttonText2={Strings.text_CHANGE_STORE}
                                    display={this.state.showChangeDelivery}
                                    changeAddress={() => {
                                        this.viewModel.set('showChangeDelivery', false)
                                        this.props.openAddresstModal();
                                        }
                                    }
                                    changeStore={()=>{
                                    this.props.navigation.navigate('Shop', {
                                        screen: 'ShopComponent',
                                        params: { isUpdated: false,changeStore:true },
                                    });}}
                                    closeDisplay={() => {
                                        this.viewModel.set('showChangeDelivery', false)
                                    }}
                                    onPress={() => { }}
                                />
                            </View>
                        )}
                         {this.state.showStorePopup && (
                            <View>
                          <AlertComponent
                                visible={true}
                                description={Strings.text_store_not_seleted}
                                okButtonText={"Select store"}
                                onOkPress={()=>{
                                    this.props.navigation.navigate('Shop', {
                                    screen: 'ShopComponent',
                                    params: { isUpdated: false,changeStore:true },
                                });}}
                                cancelButtonText={Strings.text_cancel} 
                                shouldShowCancelButton={false}
                            />
                            </View>
                        )}
                        <View
                            style={{
                                marginTop: 1,
                                borderTopLeftRadius: 14,
                                borderTopRightRadius: 14,
                                backgroundColor: Colors.primary_background_color,
                            }}>
                            <View style={{ alignItems: 'center', marginTop: 24 }}>
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
                            </View>
                            <View style={{ marginLeft: 7, marginRight: 7, marginTop: 23 }}>
                                <Card style={{ borderRadius: 14 }}>
                                    <Item style={styles.item}>
                                        <View>
                                            <Text style={styles.itemHeader}>
                                                {Strings.text_loggedIn_as}
                                            </Text>
                                            <Text style={styles.itemSubText}>
                                                {this.state.loggedInUser}
                                            </Text>
                                        </View>
                                        {/* <TouchableOpacity
                      onPress={() => {
                        this.logout();
                      }}>
                      <Text style={styles.logOut}>LOGOUT</Text>
                    </TouchableOpacity> */}
                                    </Item>
                                </Card>
                              <Card style={{ marginTop: 10, borderRadius: 14 }}>
                                    <Item style={styles.item}>
                                        <View>
                                            <Text style={styles.itemHeader}>
                                                {this.props.addressMethode === 1
                                                    ? Strings.text_delivery_to
                                                    : Strings.text_pickup_from}
                                            </Text>
                                            <Item style={{ borderBottomWidth: 0 }}>
                                                {this.state.selectedDeliveryAddress && this.state.selectedDeliveryAddress.street ?
                                                    <Text
                                                        style={[
                                                            { marginLeft: 10, width: '85%' },
                                                            styles.itemSubText,
                                                        ]}>

                                                        <Text style={styles.itemSubText}>{Array.isArray(this.state.selectedDeliveryAddress.street) ? this.state.selectedDeliveryAddress.street.map((item: any) => item + ',') : this.state.selectedDeliveryAddress.street + ','}</Text>
                                                        <Text style={styles.itemSubText}>{this.state.selectedDeliveryAddress.city},</Text>
                                                        <Text style={styles.itemSubText}>{this.state.deliveryMode === 1 ? `${this.state.selectedDeliveryAddress.region.region}` : this.state.selectedDeliveryAddress.region},</Text>
                                                        <Text style={styles.itemSubText}>{this.state.selectedDeliveryAddress.country_id},</Text>
                                                        <Text style={styles.itemSubText}>{this.state.selectedDeliveryAddress.postcode}</Text>
                                                    </Text> : null}
                                            </Item>
                                        </View>
                                        <TouchableOpacity
                                            style={{
                                                alignSelf: 'center',
                                                // marginTop: -15,
                                            }}
                                            onPress={() => {
                                                this.props.openAddresstModal();
                                            }}>
                                            <Text style={styles.logOut}>{Strings.button_change}</Text>
                                        </TouchableOpacity>
                                    </Item>
                                </Card>
                                <Card style={{ marginTop: 10, borderRadius: 14}}>
                                    <Item style={styles.item}>
                                          <View
                                            style={{
                                                flex: 1.2,
                                            }}>
                                            <View style={styles.billList}>
                                                <View style={styles.billListView}>
                                                    <View
                                                        style={{
                                                            flexDirection: 'row',
                                                            alignItems: 'center',
                                                            justifyContent: 'space-between',
                                                        }}>
                                                            <Text  style={[styles.billDetailsText]}>
                                                            {Strings.text_bill_details}
                                            </Text>
                                                       
                                                    </View>
                                                    <View style={styles.cardCenter}>
                                                        <Item style={styles.billDetailsItem}>
                                                            <Text
                                                                style={[
                                                                    styles.billDetailsItemText,
                                                                    { color: Colors.text_Light },
                                                                ]}>
                                                                {Strings.text_item_total}
                                                            </Text>
                                                            <Text style={styles.billDetailsItemText}>
                                                                {this.state.shippingInfoResponse?.base_subtotal?this.state.shippingInfoResponse?.base_subtotal:"Calculating..."}
                                                            </Text>
                                                        </Item>
                                                        {this.state.deliveryMode === 1 &&
                                                        <Item
                                                            style={[
                                                                styles.billDetailsItem,
                                                                { marginTop: 5.8 },
                                                            ]}>
                                                            <Text
                                                                style={[
                                                                    styles.billDetailsItemText,
                                                                    { color: Colors.text_Light },
                                                                ]}>
                                                                {Strings.text_delivery_fee}
                                                            </Text>
                                                            {this.props.addressMethode === 1 &&
                                                            <Text style={styles.billDetailsItemText}>
                                                                {
                                                                    this.state.shippingInfoResponse?.total_segments
                                                                        ? this.state.shippingInfoResponse?.total_segments[1]["code"].includes("Dunzo")
                                                                          ?this.state.shippingInfoResponse?.total_segments[1]["value"]
                                                                          :"Calculating..."
                                                                          :"Calculating..."
                                                                }
                                                            </Text>
                                                                }
                                                        </Item>
                                                         }
                                                        <Item
                                                            style={[
                                                                styles.billDetailsItem,
                                                                { marginTop: 5.8 },
                                                            ]}>
                                                            <Text
                                                                style={[
                                                                    styles.billDetailsItemText,
                                                                    { color: Colors.text_Light },
                                                                ]}>
                                                                {Strings.text_discount_fee}
                                                            </Text>
                                                            <Text style={styles.billDetailsItemText}>
                                                                {
                                                                    this.state.shippingInfoResponse?.base_discount_amount>=0?this.state.shippingInfoResponse?.base_discount_amount:"Calculating..."
                                                                }
                                                            </Text>
                                                        </Item>
                                                       
                                                        {/* <Item
                                                            style={[
                                                                styles.billDetailsItem,
                                                                { marginTop: 5.8 },
                                                            ]}>
                                                            <Text
                                                                style={[
                                                                    styles.billDetailsItemText,
                                                                    { color: Colors.text_Light },
                                                                ]}>
                                                                {Strings.text_taxes_charges}
                                                            </Text>
                                                            <Text style={styles.billDetailsItemText}>
                                                                {this.state.shippingInfoResponse?.tax_amount>=0?this.state.shippingInfoResponse?.tax_amount:"Calculating..."}
                                                            </Text>
                                                        </Item> */}
                                                        <Item
                                                            style={[
                                                                styles.billDetailsItem,
                                                                { marginTop: 5.8 },
                                                            ]}>
                                                            <Text
                                                                style={[
                                                                    styles.billDetailsItemText,
                                                                    { color: Colors.text_Light },
                                                                ]}>
                                                                {Strings.text_packaging}
                                                            </Text>
                                                            <Text style={styles.billDetailsItemText}>
                                                                {this.state.shippingInfoResponse?.total_segments
                                                                        ? this.state.shippingInfoResponse?.total_segments[2]["code"].includes("package")
                                                                          ?this.state.shippingInfoResponse?.total_segments[2]["value"]
                                                                          :"Calculating..."
                                                                          :"Calculating..."}
                                                            </Text>
                                                        </Item>
                                                        
                                                        <View style={styles.line} />
                                                    <View>
                                                        <Item style={styles.billDetailsItem}>
                                                            <Text style={[styles.total]}>
                                                                {Strings.text_total_pay_amount}{' '}
                                                            </Text>
                                                            {this.state.shippingInfoResponse?.base_grand_total?
                                                            <Text style={[styles.totalAmount]}>
                                                             {"₹"+this.state.shippingInfoResponse?.base_grand_total}
                                                            </Text>
                                                            :
                                                            <Text style={styles.billDetailsItemText}>Calculating...</Text>
                                                        }
                                                        </Item>
                                                    </View>
                                                </View>
                                                    </View>
                                                    
                                            </View>
                                        </View>
                                        </Item>
                                        </Card>
                                
                            </View>
                            <Card style={styles.paymentCard}>
                                <View style={{ marginLeft: 20, marginTop: 10 }}>
                                    <Text style={styles.paymentText}>{Strings.text_payment}</Text>
                                   
                                    <View style={{ marginTop: 28 }}>
                                        <Item
                                            style={{
                                                borderBottomWidth: 0,
                                                // flexDirection: 'row',
                                            }}>
                                            <TouchableOpacity
                                                onPress={() => {
                                                    this.viewModel.setMany({
                                                        walletButton: !this.state.walletButton,
                                                        paymentMethod: !this.state.walletButton ? PaymentMethodEnum.RAZORPAY : this.state.paymentMethod,
                                                    }
                                                    );
                                                }}>
                                                <Image
                                                    source={
                                                        this.state.walletButton
                                                            ? ImageAssets.radio_square_button_active
                                                            : ImageAssets.radio_square_button_inactive
                                                    }
                                                />
                                            </TouchableOpacity>
                                            <Text style={[{ marginLeft: 11 }, styles.walletText]}>
                                                Use Ibaco Wallet Balance
                                             </Text>
                                        </Item>
                                        <Text
                                            style={[
                                                styles.paymentText,
                                                { marginLeft: 28, fontSize: 14 },
                                            ]}>
                                            Available Balance: ₹{this.state.walletBalance}
                                        </Text>
                                    </View>
                                </View>
                                <View style={{ marginLeft: 12, marginTop: 15 }}>
                                    <Text style={styles.paymentMode}>
                                        {Strings.text_selet_payment_mode}
                                    </Text>
                                    <TouchableOpacity
                                        style={{ marginTop: 19 }}
                                        onPress={() => {
                                            this.viewModel.set(
                                                'paymentMethod',
                                                PaymentMethodEnum.RAZORPAY,
                                            );
                                        }}>
                                        <View style={{ flexDirection: 'row' }}>
                                            <Image
                                                source={
                                                    this.state.paymentMethod ===
                                                        PaymentMethodEnum.RAZORPAY
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
                                                            this.state.paymentMethod ===
                                                                PaymentMethodEnum.RAZORPAY
                                                                ? Colors.add_button_text
                                                                : '#777777',
                                                    },
                                                ]}>
                                                {Strings.button_payment_getway}
                                            </Text>
                                        </View>
                                        <Text style={styles.radioSubText}>
                                            {Strings.button_payment_getway_substring}
                                        </Text>
                                    </TouchableOpacity>
                                    {this.props.addressMethode !== 1 &&
                                    <TouchableOpacity
                                        // disabled={this.state.walletButton}
                                        style={{ marginTop: 24 }}
                                        onPress={() => {
                                            this.viewModel.set(
                                                'paymentMethod',
                                                PaymentMethodEnum.CHECKMO,
                                            );
                                            this.viewModel.set('walletButton', false)
                                        }}>
                                        <View style={{ flexDirection: 'row' }}>
                                            <Image
                                                source={
                                                    this.state.paymentMethod === PaymentMethodEnum.CHECKMO
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
                                                            this.state.paymentMethod ===
                                                                PaymentMethodEnum.CHECKMO
                                                                ? Colors.add_button_text
                                                                : '#777777',
                                                    },
                                                ]}>
                                                {Strings.button_cashON_delivery}
                                            </Text>
                                        </View>
                                        <Text style={styles.radioSubText}>
                                            {Strings.button_cashOn_delivery_substring}
                                        </Text>
                                    </TouchableOpacity>
        }
                                </View>
                                <View style={styles.buttonView}>
                                    <TouchableOpacity
                                        disabled={this.state.isLoading}
                                        style={styles.button}
                                        onPress={async () => {
                                            if (
                                                this.state.paymentMethod === PaymentMethodEnum.RAZORPAY
                                            ) {
                                                if (this.state.walletButton && this.state.shippingInfoResponse&& this.state.shippingInfoResponse?.base_grand_total - this.state.walletBalance <= 0) {
                                                    this.placeOrder()
                                                } else {
                                                    await this.navigateToPaymentGateway()
                                                }
                                            } else {
                                                await this.orderPlaced(true, this.props.addressMethode);
                                            }
                                        }}>
                                        <LinearGradient
                                            colors={[
                                                Colors.primary_gradient_color,
                                                Colors.primary_color,
                                            ]}
                                            style={styles.buttonGradient}>
                                            <Text
                                                style={[
                                                    styles.paymentMode,
                                                    { color: Colors.text_sec_color },
                                                ]}>
                                                {Strings.button_order_placed}
                                            </Text>
                                        </LinearGradient>
                                    </TouchableOpacity>
                                </View>
                            </Card>
                        </View>
                    </Content>
                    {this.state.isLoading ? <Loader isTransperant={true} /> : null}
                </Container>
            );
        }
    }

    public logout() {
        const alert = {
            shouldShowCancelButton: true,
            description: Strings.alert_logout_confirm,
            title: Strings.alert_title,
            okButtonText: Strings.button_ok,
            onCancelPress: () => {
                this.viewModel.set('alertDetails', undefined);
            },
            onOkPress: async () => {
                this.viewModel.set('alertDetails', undefined);
                this.viewModel.logout();
                this.props.navigation.navigate('Shop', {
                    screen: 'ShopComponent',
                    params: { isUpdated: true },
                });
            },
        };
        this.viewModel.set('alertDetails', alert);
    }

    public navigateToPaymentGateway = async () => {
        this.viewModel.set('isLoading', true);
        this.viewModel
            .getOrderDetails()
            .then(res => {
                if (res.message) {
                    const alert = {
                        shouldShowCancelButton: false,
                        description: res.message,
                        title: Strings.alert_title,
                        okButtonText: 'OK',
                        onOkPress: () => {
                            this.viewModel.set('alertDetails', undefined);
                        },
                    };
                    this.viewModel.set('alertDetails', alert);
                } else {
                    const options = {
                        description: 'Checkout Transaction',
                        image:"https://www.ibaco.in/assets/img/ibaco-logo-new.png",
                        currency: res.quote_currency,
                        //key:constants.PRODUCTION_RAZORPAY_API_KEY, 
                        key:constants.TEST_RAZORPAY_API_KEY,
                        amount: res.amount,
                        name: `IBACO`,
                        theme: { color: Colors.primary_color },
                        order_id: res.rzp_order,
                        prefill: {
                            name: this.state.userInfo.firstname,
                            email: this.state.userInfo.email,
                            contact: this.state.userInfo.phone_number
                          },
                    };
                    RazorpayCheckout.open(options)
                        .then(async data => {
                            await this.orderPlaced(
                                false,
                                this.props.addressMethode,
                                data,
                                { res, rzp_order: res.rzp_order }
                            );
                            // this.viewModel.updateWalletBalance(res, res.rzp_order)
                        })
                        .catch(error => {
                            const alert = {
                                shouldShowCancelButton: false,
                                description: 'Payment Cancelled',
                                title: Strings.alert_title,
                                okButtonText: 'OK',
                                onOkPress: () => {
                                    this.viewModel.set('alertDetails', undefined);
                                },
                            };
                            this.viewModel.set('alertDetails', alert);
                        });
                }
            })
            .catch(error => {
                const alert = {
                    shouldShowCancelButton: false,
                    description: 'Payment Cancelled',
                    title: Strings.alert_title,
                    okButtonText: 'OK',
                    onOkPress: () => {
                        this.viewModel.set('alertDetails', undefined);
                    },
                };
                this.viewModel.set('alertDetails', alert);
            });
    };

    placeOrder = async () => {
        this.viewModel
            .getOrderDetails()
            .then(async data => {
                await this.orderPlaced(
                    true,
                    this.props.addressMethode,
                    data,
                    { res: {}, rzp_order: data.rzp_order },
                );
                // this.viewModel.updateWalletBalance({}, data.rzp_order)
            })
            .catch(error => {
                const alert = {
                    shouldShowCancelButton: false,
                    description: 'Payment Cancelled',
                    title: Strings.alert_title,
                    okButtonText: 'OK',
                    onOkPress: async () => {
                        this.viewModel.set('alertDetails', undefined);
                    },
                };
                this.viewModel.set('alertDetails', alert);
            });
    }

    public orderPlaced(cod, addressMethode, data?, walletUpdateData?) {
        if (this.props.pickupAddress) {
            addressMethode = 2
        }
        this.viewModel.orderPlaced(cod, addressMethode, data, walletUpdateData)
    }
    protected _buildState() {
        return this.viewModel.getState();
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'rgba(73,69,69,0.30)',
    },
    secureText: {
        color: Colors.text_primary_light,
        fontFamily: 'Muli-Bold',
        fontSize: 13.89,
    },
    readioText: {
        color: Colors.add_button_text, // #777777
        fontSize: 15.88,
        fontFamily: 'Muli-Bold',
        marginLeft: 9.7,
    },
    itemHeader: {
        fontFamily: 'Muli-Medium',
        fontSize: 12,
        color: Colors.text_Light,
    },
    itemSubText: {
        fontSize: 14,
        fontFamily: 'Muli-Bold',
        color: Colors.address_text,
    },
    logOut: {
        color: Colors.add_button_text,
        fontFamily: 'Muli-Black',
        fontSize: 10,
    },
    billDetailsText: {
        color: Colors.dark_gray,
        fontFamily: 'Muli-Bold',
        fontSize: 20,
        marginLeft:"15%"
    },
    paymentText: {
        color: Colors.dark_gray,
        fontFamily: 'Muli-Bold',
        fontSize: 32,
    },
    walletText: {
        color: Colors.text_primary_dark,
        fontFamily: 'Muli-Medium',
        fontSize: 18,
    },
    paymentMode: {
        color: Colors.dark_gray,
        fontFamily: 'Muli-ExtraBold',
        fontSize: 16,
    },
    radioSubText: {
        color: '#9D9D9D',
        fontFamily: 'Muli-Bold',
        fontSize: 12.35,
        marginLeft: 28,
    },
    button: {
        height: 40,
        borderRadius: 14,
        width: '100%',
    },
    buttonView: {
        marginLeft: 21,
        marginRight: 21,
        marginTop: 40,
        marginBottom: 32,
    },
    paymentCard: {
        marginTop: 10,
        borderRadius: 14,
        marginLeft: 7,
        marginRight: 7,
        backgroundColor: Colors.white,
    },
    item: {
        borderBottomWidth: 0,
        borderRadius: 14,
        justifyContent: 'space-between',
        padding: 10,
        backgroundColor: Colors.white,
    },
    buttonGradient: {
        flex: 1,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
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
        marginTop: 13,
        marginBottom: 11,
    },
    popUp: {
        marginLeft: 37,
        marginRight: 37,
        backgroundColor: Colors.white,
        marginTop: 20,
        borderRadius: 14,
    },
    billList: {
        marginRight: 37,
        backgroundColor: Colors.white,
        borderRadius: 14,
    },
    billListView: {
        marginRight: 17,
        marginTop: 2,
        marginBottom: 12,
    },
    popUpView: {
        marginLeft: 17,
        marginRight: 17,
        marginTop: 12,
        marginBottom: 12,
    },
    priceDetailsView: {
        marginLeft: 20,
        marginRight: 20,
        backgroundColor: Colors.white,
        borderRadius: 14,
    },
    youArePaying: {
        fontSize: 16,
        fontFamily: 'Muli-SemiBold',
        color: Colors.text_primary_light,
    },
    youArePayingView: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        justifyContent: 'center',
    },
    cardCenter: {
       marginTop:10,
       paddingLeft:"15%"
    },
    priceDetailsText: {
        textDecorationLine: 'underline',
        fontSize: 14,
        fontFamily: 'Muli-Medium',
        color: Colors.text_primary_light,
    },
    billDetailsLine: {
        height: 1,
        backgroundColor: '#979797',
        width: 10,
    },
});
