import React from 'react'
import { View, StyleSheet, Keyboard, Dimensions, StatusBar, TextInput, RefreshControl } from 'react-native'
import { ComponentBase } from 'resub'
import { Text, Button, Container, Content, Item } from 'native-base'
import { DependencyInjector } from '../dependency-injector/DependencyInjector'
import {
    UserWalletViewModel,
    UserWalletState,
} from '../view-madel/UserWalletViewModel'
import LinearGradient from 'react-native-linear-gradient'
import { Loader } from './common-components/Loader'
import AlertComponent from './common-components/Alert/Alert'
import Strings from '../resources/String'
import RazorpayCheckout from 'react-native-razorpay'
import Colors from '../resources/Colors'
import { Retry } from './common-components/Retry'
import constants from '../resources/constants'
import ImageAssets from '../assets'

const { width: viewportWidth } = Dimensions.get('window')

export class WalletComponent extends ComponentBase<any, UserWalletState> {
    viewModel: UserWalletViewModel
    secondTextInput: any

    constructor(props: any) {
        super(props)
        this.viewModel = DependencyInjector.default().provideUserWalletViewModel()
    }
    componentDidMount() {
        this.viewModel.checkWalletbalance()
    }

    componentDidUpdate() {
        if (this.state.error) {
            const alert = {
                shouldShowCancelButton: false,
                description: this.state.error.message,
                okButtonText: 'OK',
                onOkPress: async () => {
                    this.viewModel.set('alertDetails', undefined)
                    this.viewModel.set('error', undefined)
                },
            }
            this.viewModel.set('alertDetails', alert)
            this.viewModel.set('error', undefined)
        }

        if (this.state.response) {
            const alert = {
                shouldShowCancelButton: false,
                description: this.state.response,
                okButtonText: 'OK',
                onOkPress: async () => {
                    this.viewModel.set('alertDetails', undefined)
                    this.viewModel.set('response', undefined)
                },
            }
            this.viewModel.set('alertDetails', alert)
            this.viewModel.set('response', undefined)
        }
    }

    public render() {
        if (this.state.error) {
            return (
                <Retry
                    message={this.state.error.message}
                    onPress={() => {
                        this.viewModel.set('error', undefined)
                        this.viewModel.checkWalletbalance()
                    }}
                />
            );
        } else {
            return (
                <Container style={{ justifyContent: 'flex-start' }}>
                    <StatusBar barStyle="default" backgroundColor={Colors.primary_gradient_color_header} />
                    <Content style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }} refreshControl={this.refreshControl()}>
                        {this.state.alertDetails &&
                            this.state.alertDetails.description ? (
                            <AlertComponent
                                visible={true}
                                title={''}
                                description={this.state.alertDetails.description}
                                okButtonText={Strings.button_ok}
                                cancelButtonText={Strings.text_cancel} 
                                onOkPress={this.state.alertDetails.onOkPress}
                                shouldShowCancelButton={false}
                            />
                        ) : null}
                        <View>
                            <Text style={styles.headerText}>Balance</Text>
                            <Text style={styles.priceText}>₹&nbsp;{this.props.walletBalance}</Text>
                            <Text style={styles.description}>Add money to wallet</Text>
                            <View style={styles.inputField}>
                                <Text style={styles.enterAmount}>Enter amount</Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Text style={styles.inputText1}>₹</Text>
                                    <TextInput
                                        onChangeText={value => {
                                            this.viewModel.set('updatedBalance', value)
                                        }}
                                        value={this.state.updatedBalance}
                                        style={[styles.inputText1, { marginLeft: 0, width: '80%' }]}
                                    />
                                </View>
                            </View>
                            <Text style={[styles.enterAmount, { marginLeft: 20 }]}>Amount should be between ₹1 to ₹10,000</Text>
                            <Text style={styles.chooseText}>or choose from below</Text>

                            <View style={{ flexDirection: 'row', marginTop: 20,alignSelf:"center"}}>
                                {this.state.amountArrayIs.map((data, key) => {
                                    return (
                                        <Button
                                            key={key}
                                            style={[
                                                styles.priceButton,
                                                this.state.updatedBalance == data.price
                                                    ? { borderColor: '#c8960f', borderBottomColor: '#c8960f' }
                                                    : {
                                                        borderColor: '#BBBBBB',
                                                        borderBottomColor: '#BBBBBB',
                                                    },
                                                    key>0&&{marginLeft: 10,}
                                            ]}
                                            onPress={() => {
                                                this.viewModel.set('updatedBalance', data.price)
                                                Keyboard.dismiss()
                                            }}>
                                            <LinearGradient
                                                colors={['#FFFFFF', '#EEEEEE']}
                                                style={styles.gradient}
                                            />
                                            <Text
                                                style={[
                                                    styles.helpText,
                                                    data.price == '1000'
                                                        ? { marginLeft: 20 }
                                                        : { marginLeft: 21 },
                                                    this.state.updatedBalance == data.price
                                                        ? { color: '#c8960f' }
                                                        : { color: '#BBBBBB' },
                                                ]}>
                                                {data.price}
                                            </Text>
                                        </Button>
                                    )
                                })}
                            </View>
                            <Button
                                style={styles.helpButton1}
                                onPress={() => {
                                    Keyboard.dismiss()
                                    if (Number(this.state.updatedBalance) > 0 && Number(this.state.updatedBalance) < 10000) {
                                        this.navigateToPaymentGateway()
                                    } else {
                                        const alert = {
                                            description: 'Please enter the amount between ₹1 to ₹10,000',
                                            title: Strings.alert_title,
                                            okButtonText: Strings.button_ok,
                                            onOkPress: () => {
                                                this.viewModel.set(
                                                    'alertDetails',
                                                    undefined,
                                                )
                                            },
                                        }
                                        this.viewModel.set(
                                            'alertDetails',
                                            alert,
                                        )
                                    }
                                }}>
                                <LinearGradient
                                    colors={['#f29365', '#ec2f23']}
                                    style={styles.gradient}
                                />
                                <Text style={styles.helpText1}>
                                    PROCEED TO ADD ₹{this.state.updatedBalance}
                                </Text>
                            </Button>
                        </View>
                    </Content>
                    {this.state.isLoading ? <Loader /> : null}
                </Container>
            )
        }
    }

    public navigateToPaymentGateway = async () => {
        this.viewModel.set('isLoading', true)
        this.viewModel
            .getOrderIdForWallet()
            .then(res => {
                const options = {
                    description: 'Checkout Transaction',
                    image:"https://www.ibaco.in/assets/img/ibaco-logo-new.png",
                    currency: res.quote_currency,
                    // key: constants.PRODUCTION_RAZORPAY_API_KEY,
                    key: constants.TEST_RAZORPAY_API_KEY,
                    amount: res.amount,
                    name: `Ibaco`,
                    theme: { color: Colors.primary_color },
                    order_id: res.rzp_order,
                    prefill:{
                    name: this.state.userInfo.name,
                    email: this.state.userInfo.email,
                    contact: this.state.userInfo.phone_number
                    }
                  
                }
                RazorpayCheckout.open(options)
                    .then(async data => {
                        this.viewModel.updateWalletBalance(data, res.rzp_order)
                    })
                    .catch(error => {
                        const alert = {
                            shouldShowCancelButton: false,
                            description: 'Payment Cancelled',
                            title: Strings.alert_title,
                            okButtonText: 'OK',
                            onOkPress: async () => {
                                this.viewModel.set('alertDetails', undefined)
                            },
                        }
                        this.viewModel.set('alertDetails', alert)
                    })
            })
            .catch(error => {
                const alert = {
                    shouldShowCancelButton: false,
                    description: 'Payment Cancelled',
                    title: Strings.alert_title,
                    okButtonText: 'OK',
                    onOkPress: async () => {
                        this.viewModel.set('alertDetails', undefined)
                    },
                }
                this.viewModel.set('alertDetails', alert)
            })
    }

    refreshControl = () => {
        return (
            <RefreshControl
                refreshing={this.state.refreshing}
                enabled={true}
                onRefresh={() => {
                    this.viewModel.set('refreshing', true);
                    this.viewModel.checkWalletbalance();
                    this.viewModel.set('refreshing', false);
                }}
            />
        );
    };


    protected _buildState() {
        return this.viewModel.getState()
    }
}

const styles = StyleSheet.create({
    headerText: {
        color: '#777777',
        fontFamily: 'Montserrat-Bold',
        fontSize: 20.8,
        marginTop: 30,
        marginLeft: 20,
    },
    priceText: {
        marginLeft: 20,
        fontSize: 46.4,
        fontFamily: 'Montserrat-Bold',
        color: '#ec2f23',
    },
    description: {
        color: '#777777',
        fontFamily: 'Montserrat-Bold',
        fontSize: 21,
        marginLeft: 20,
        marginTop: 20,
    },
    inputField: {
        flexDirection: 'column',
        height: 80,
        alignContent: 'center',
        justifyContent: 'center',
        borderColor: '#ec2f23',
        borderWidth: 2,
        marginLeft: 27,
        marginRight: 27,
        marginTop: 20,
    },
    inputText1: {
        color: '#555555',
        fontFamily: 'Montserrat-Medium',
        fontSize: 22,
        borderBottomWidth: 0,
        marginLeft: 20,
        marginTop: -5,
    },
    chooseText: {
        color: '#777777',
        fontFamily: 'Montserrat-Bold',
        fontSize: 18,
        marginLeft: 20,
        marginTop: 20,
    },
    enterAmount: {
        color: '#777777',
        fontFamily: 'Montserrat-Bold',
        marginLeft: 15,
        fontSize: 14,
        marginTop: 10,
    },
    priceButton: {
        height: 40,
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderRadius: 14,
        elevation: 0,
        borderBottomWidth: 2,
    },
    gradient: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: 14,
    },
    helpText: {
        height: 20,
        width: 84,
        fontFamily: 'Montserrat-Light',
        fontSize: 16,
        marginBottom: 2,
        fontWeight: 'bold',
    },
    helpButton1: {
        height: 50,
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderRadius: 18,
        elevation: 0,
        marginHorizontal: 25,
        alignItems:'center',
        justifyContent:'center',
        borderBottomColor: '#ec2f23',
        borderBottomWidth: 2,
        marginVertical: 30,
        borderColor: 'transparent',
    },
    helpText1: {
        color: '#FFFFFF',
        width: 284,
        fontFamily: 'Montserrat-Light',
        fontSize: 16,
        marginBottom: 2,
        textAlign:'center',
        fontWeight: 'bold',
    },
})
