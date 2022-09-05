import * as React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {Component} from 'react';
import ScreenHeader from '../common-components/ScreenHeader';
import {View, Image, StyleSheet, Platform} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import ImageAssets from '../../assets';
import {ShopComponent} from '../home/ShopComponent';
import {ProductDescription} from '../home/shop/ProductDescription';
import Colors from '../../resources/Colors';
import {
  UserRepository,
  UserState,
} from '../../domain/repository/UserRepository';
import {DependencyInjector} from '../../dependency-injector/DependencyInjector';
import {ComponentBase} from 'resub';
import AddOrEditAddressComponent from '../common-components/AddOrEditAddressComponent';
import {OrderTrackingComponent} from '../order/OrderTrackingComponent';
import {ShopHeaderComponent} from '../home/shop/ShopHeaderComponent';
import {HeaderRightComponent} from '../common-components/HeaderRightComponent';
import {CartStack} from './CartStack';

export class ShopStack extends ComponentBase<any, UserState> {
  modalDropdownRef: any;
  private userRepository: UserRepository;
  constructor(props) {
    super(props);
    this.userRepository = DependencyInjector.default().provideUserRepository();
  }

  render() {
    const Stack = createStackNavigator();
    const inventorySources =
      this.state.inventorySources && this.state.inventorySources.items
        ? this.state.inventorySources.items
        : [];
    return (
      <Stack.Navigator>
        <Stack.Screen
          options={({navigation, route}: any) => ({
            header: props => (
              <ShopHeaderComponent
                inventorySources={inventorySources}
                navigation={navigation}
                route={route}
                pickupAddress={this.state.pickupAddress}
                pincode={this.state.pincode}
                cartItems={this.state.cartItems}
                isDelivery={this.state.isDelivery}
                cartSummary={this.state.cartSummary}
              />
            ),
          })}
          name="ShopComponent"
          // component={ShopComponent}
        >
          {props => (
            <ShopComponent
              {...props}
              cartItems={this.state.cartItems}
              inventoryItems={this.state.inventoryItems}
              cartSummary={this.state.cartSummary}
              loggedInUser={this.state.loggedInUser}
              isLoggedOut={this.state.isLoggedOut}
            />
          )}
        </Stack.Screen>
        <Stack.Screen
          name="ProductDescription"
          // component={ProductDescription}
          options={({navigation, route}) => ({
            headerTitle: props => null,
            headerLeft: props => (
              <View style={{marginLeft: 10}}>
                <ScreenHeader
                  title="BACK"
                  goBack={() => {
                    navigation.goBack();
                  }}
                />
              </View>
            ),
            headerRight: () => (
              <HeaderRightComponent
                displayCart={true}
                navigation={navigation}
                cartSummary={this.state.cartSummary}
              />
            ),
            headerBackground: () => (
              <LinearGradient
                colors={[Colors.white, Colors.white]}
                style={styles.Header}
                start={{x: 1, y: 1}}
                end={{x: 0, y: 1.0}}
              />
            ),
          })}>
          {props => (
            <ProductDescription
              {...props}
              cartItems={this.state.cartItems}
              inventoryItems={this.state.inventoryItems}
              cartSummary={this.state.cartSummary}
            />
          )}
        </Stack.Screen>
        <Stack.Screen
          options={({navigation, route}) => ({
            headerTitle: props => null,
            headerLeft: props => (
              <View style={{marginLeft: 10}}>
                <ScreenHeader
                  title="BACK"
                  goBack={() => {
                    navigation.goBack();
                  }}
                />
              </View>
            ),
            headerRight: () => <HeaderRightComponent />,
            headerBackground: () => (
              <LinearGradient
                colors={[Colors.white, Colors.white]}
                style={styles.Header}
                start={{x: 1, y: 1}}
                end={{x: 0, y: 1.0}}
              />
            ),
          })}
          name="EditAddress"
          component={AddOrEditAddressComponent}
        />
        <Stack.Screen
          options={({navigation, route}) => ({
            headerTitle: props => null,
            headerRight: props => null,
            headerLeft: () => <HeaderRightComponent />,
            headerBackground: () => (
              <LinearGradient
              colors={[Colors.white, Colors.white]}
                style={styles.Header}
                start={{x: 1, y: 1}}
                end={{x: 0, y: 1.0}}
              />
            ),
          })}
          name="OrderTrackingComponent"
          component={OrderTrackingComponent}
        />
        <Stack.Screen
          options={({navigation, route}) => ({
            header: props => null,
          })}
          name="Cart"
          component={CartStack}
        />
      </Stack.Navigator>
    );
  }

  protected _buildState() {
    return this.userRepository.getState();
  }
}
const styles = StyleSheet.create({
    Header: {
      flex: 1,
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
    },
  });
