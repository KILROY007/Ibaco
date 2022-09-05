import React from 'react';
import {
  View,
  StyleSheet,
  Alert,
  RefreshControl,
  ScrollView,
  Image,
  Dimensions,
} from 'react-native';
import { ComponentBase } from 'resub';
import { Container, Text, Input, Item, Card, Content } from 'native-base';
import { OrderHistoryItemComponent } from './OrderHistoryItemComponent';
import { DependencyInjector } from '../../../dependency-injector/DependencyInjector';
import { Retry } from '../../common-components/Retry';
import { Loader } from '../../common-components/Loader';
import Colors from '../../../resources/Colors';
import {
  OrdersHistoryViewModel,
  OrdersHistoryState,
} from '../../../view-madel/OrdersHistoryViewModel';
import AlertComponent from '../../common-components/Alert/Alert';
import Strings from '../../../resources/String';
import ImageAssets from '../../../assets';
const { width: viewportWidth, height: viewportHeight } = Dimensions.get('window');

export class OrdersHistoryComponent extends ComponentBase<
  any,
  OrdersHistoryState
  > {
  viewModel: OrdersHistoryViewModel;
  constructor(props: any) {
    super(props);
    this.viewModel = DependencyInjector.default().provideOrdersHistoryViewModel();
  }
  componentDidMount() {
    this.viewModel.getOrderInfo();
  }

  componentWillReceiveProps(newprops) {
    if (newprops.route.params && newprops.route.params.isUpdated) {
      this.viewModel.getOrderInfo();
      this.props.navigation.setParams({ isUpdated: false })
    }
  }
  async componentDidUpdate() {
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
          this.props.navigation.goBack();
        },
      };
      this.viewModel.set('alertDetails', alert);
      this.viewModel.set('error', undefined);
    }
  }

  public reOrder = async orderItem => {
    await this.viewModel.reOrder(orderItem);
    // this.props.navigation.jumpTo('Cart');
    this.props.navigation.navigate('Cart', {
      screen: 'CartComponent',
    });
  };

  public render() {
    if (this.state.pageLoadError) {
      return (
        <Retry
          message={this.state.pageLoadError.message}
          onPress={() => {
            this.viewModel.set('pageLoadError', undefined);
            this.viewModel.getOrderInfo();
          }}
        />
      );
    } else {
      return (
        <Container style={styles.container}>
          {this.state.orderItems.length ? (
            <Content refreshControl={this.refreshControl()}>
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
              <View style={styles.mainView}>
                <View>
                  {this.state.orderItems.map((item, index) => {
                    return (
                      <OrderHistoryItemComponent
                        navigation={this.props.navigation}
                        key={index}
                        orderItem={item}
                        reOrder={this.reOrder}
                        getDeliveryFee={this.viewModel.getDeliveryFee}
                        navigateToHelp={this.navigateToHelp}
                      />
                    );
                  })}
                </View>
              </View>
            </Content>
          ) : (
              <ScrollView
                refreshControl={this.refreshControl()}
                contentContainerStyle={{
                  flex: 1,
                  justifyContent: 'space-between',
                }}>
                <View style={{ alignItems: 'center', }}>
                  <Image source={ImageAssets.no_order} style={{ marginTop: 82 }} />
                  <Text
                    style={{
                      color: Colors.address_text,
                      fontFamily: 'Muli-Light',
                      fontSize: 30,
                      marginTop: 22,
                    }}>
                    {Strings.text_no_order_greeting}
                  </Text>
                  <Text
                    style={{
                      color: Colors.text_Light,
                      fontSize: 20,
                      fontFamily: 'Muli-Bold',
                    }}>
                    {Strings.text_no_order_askQuestion}
                  </Text>
                </View>
                <View style={{ alignSelf: 'center', alignItems: 'center', marginBottom: 14 }}>
                  <Text
                    style={{
                      color: Colors.text_primary_dark,
                      fontFamily: 'Muli-Bold',
                      fontSize: 14,
                    }}>
                    {Strings.text_tapOn}
                    <Text style={{ color: Colors.primary_color }}>{Strings.text_shop}</Text>
                    {Strings.text_view_menu}
                  </Text>
                  <Image
                    source={ImageAssets.orderHistory_arrow}
                    style={{
                      marginTop: 8,
                    }}
                  />
                </View>
              </ScrollView>
            )}
          {this.state.isLoading ? <Loader /> : null}
        </Container>
      );
    }
  }

  refreshControl = () => {
    return (
      <RefreshControl
        refreshing={this.state.refreshing}
        enabled={true}
        onRefresh={() => {
          this.viewModel.set('refreshing', true);
          this.viewModel.getOrderInfo();
          this.viewModel.set('refreshing', false);
        }}
      />
    );
  };

  public navigateToHelp = (selectedOrder) => {
    this.props.navigation.navigate('Help', { selectedOrder });
  };

  protected _buildState() {
    return this.viewModel.getState();
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mainView: {
    marginLeft: 20,
    marginRight: 19,
    marginTop: 16,
  },
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
  billValueText: {
    color: Colors.primary_color,
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
