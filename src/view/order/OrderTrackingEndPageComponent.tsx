import React from 'react';
import { ComponentBase } from 'resub';
import { DependencyInjector } from '../../dependency-injector/DependencyInjector';
import {
  Dimensions,
  StyleSheet,
  StatusBar,
  Keyboard,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Container, Text, Content, Button, View } from 'native-base';
import {
  OrderTrackingViewModel,
  OrderTrackingState,
} from '../../view-madel/OrderTrackingViewModel';
import ImageAssets from '../../assets';
import LinearGradient from 'react-native-linear-gradient';
import Strings from '../../resources/String';
import Colors from '../../resources/Colors';

const { width: viewportWidth } = Dimensions.get('window');
export class OrderTrackingEndPageComponent extends ComponentBase<
  any,
  OrderTrackingState
> {
  viewModel: OrderTrackingViewModel;
  secondTextInput: any;

  constructor(props: any) {
    super(props);
    this.viewModel = DependencyInjector.default().provideOrderTrackingViewModel();
  }

  public render() {
    return (
      <Container style={{ justifyContent: 'flex-start' }}>
        <StatusBar barStyle="light-content" backgroundColor="#1B1B1B" />
        <Content style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }}>
          <View style={{ marginBottom: 450 }}>
            <View style={styles.view1}>
              <Text style={styles.textHead}>{Strings.text_order_status}</Text>
              <TouchableOpacity
                style={styles.crossButton}
                onPress={() => {
                  this.props.ShouldOrderPlacedScreen();
                }}>
                <Image source={ImageAssets.cross} />
              </TouchableOpacity>
            </View>
            <View style={{ flexDirection: 'row' }}>
              <View style={{ flex: 0.3 }}>
                  <Image
                    source={ImageAssets.delivered}
                    style={{ resizeMode: 'cover' ,width:"100%",height:"80%"}}
                  />
              </View>
              <View style={{ flex: 0.7,marginTop:"10%" }}>
                <View>
                  <Text style={styles.orderDeliverHeader}>
                    {Strings.text_order_delivered}
                  </Text>
                  <Text style={styles.orderDeliverdDescription}>
                    {Strings.text_order_deliver_description}
                  </Text>
                </View>
              </View>
            </View>
            {/* <View style={{ marginTop: 43 }}>
              <TouchableOpacity
                style={{ height: 40, alignSelf: 'center' }}
                onPress={() => {
                  this.props.ShouldOrderPlacedScreen();
                }}>
                <LinearGradient
                  colors={['#EEEEEE', '#FFFFFF']}
                  style={[styles.buttonStyle]}>
                  <Text style={styles.orderReviewText}>
                    {Strings.button_review_order}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View> */}
          </View>
        </Content>
      </Container>
    );
  }

  protected _buildState() {
    return this.viewModel.getState();
  }
}

const styles = StyleSheet.create({
  view1: {
    marginTop: 25,
    marginLeft: 20,
    justifyContent: 'space-between',
    marginBottom: 35,
    flexDirection: 'row',
  },
  textHead: {
    color: '#888888',
    fontFamily: 'Montserrat-Light',
    fontSize: 24,
    fontWeight: 'bold',
  },
  crossButton: {
    marginRight: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 14,
  },
  orderReviewText: {
    fontSize: 16,
    fontFamily: 'Montserrat-ExtraBold',
    color: Colors.primary_color,
    paddingLeft: 21,
    paddingRight: 20,
  },
  buttonStyle: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ec2f23',
    borderRadius: 14,
  },
  orderDeliverdDescription: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 13,
    color: '#000',
    marginTop: 11,
  },
  orderDeliverHeader: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 22,
    color: Colors.primary_color,
  },
});
