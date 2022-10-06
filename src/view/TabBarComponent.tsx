import React from 'react';
import 'react-native-gesture-handler';
import { View, StyleSheet, Dimensions, Image } from 'react-native';
import { ComponentBase } from 'resub';
import { Text } from 'native-base';
import ImageAssets from '../assets';
import { WalletComponent } from './WalletComponent';
import { FavouriteComponent } from './FavouriteComponent';
import AddOrEditAddressComponent from './common-components/AddOrEditAddressComponent';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { OrdersHistoryComponent } from '../view/home/Account/OrdersHistoryComponent';
import { UserState, UserRepository } from '../domain/repository/UserRepository';
import { DependencyInjector } from '../dependency-injector/DependencyInjector';
const { width: viewportWidth } = Dimensions.get('window');

export class TabBarComponent extends ComponentBase<any, UserState> {
  secondTextInput: any;
  private userRepository: UserRepository

  constructor(props: any) {
    super(props);
    this.userRepository = DependencyInjector.default().provideUserRepository()
  }

  public render(): any {
    const Tab = createMaterialTopTabNavigator();
    return (
      <Tab.Navigator
        initialRouteName="Profile"
        tabBarOptions={{
          showLabel: false,
          showIcon: true,
          activeTintColor: '#ec2f23',
          inactiveTintColor: '#777777',
          style: {
            backgroundColor: '#f0eeef',
            width: viewportWidth,
            height: 61,
          },
          labelStyle: {
            textAlign: 'center',
          },
          indicatorStyle: {
            backgroundColor: '#FFFFFF',
            height: '110%',
            bottom: -3,
            left: 0,
            right: 0,
            borderBottomColor: 'transparent',
          },
        }}>
        <Tab.Screen
          name="Profile"
          initialParams={{ isUpdated: false, isPersonalDetails: true }}
          options={({ navigation, route }) => ({
            tabBarLabel: 'Profile',
            tabBarOptions: { showIcon: true },
            tabBarIcon: ({ focused }) => (
              <View style={styles.iconView2}>
                {focused ? (
                  <Image
                    source={ImageAssets.profile}
                    style={[styles.icon]}
                  />
                ) : (
                  <Image
                    source={ImageAssets.profile_inactive}
                    style={[styles.icon]}
                  />
                )}
                <Text
                  style={{
                    color: focused ? '#c8960f' : '#777777',
                    fontFamily: 'Montserrat-Bold',
                    fontSize: 11.63
                  }}>
                  Profile
                  </Text>
              </View>
            ),
          })}
        >
          {(props) => <AddOrEditAddressComponent {...props} walletBalance={this.state.walletBalance} />}
        </Tab.Screen>

        <Tab.Screen
          name="Favourites"
        
          // component={FavouriteComponent}
          options={({ navigation, route }) => ({
            tabBarLabel: 'Favourites',
            tabBarOptions: { showIcon: true },
            tabBarIcon: ({ focused }) => (
              <View style={styles.iconView2}>
                {focused ? (
                  <Image
                    source={ImageAssets.favourites_icon_active}
                    style={[styles.icon2]}
                  />
                ) : (
                  <Image
                    source={ImageAssets.favourites_icon_inactive}
                    style={[styles.icon2]}
                  />
                )}
                <Text
                  style={{
                    color: focused ? '#c8960f' : '#777777',
                    fontFamily: 'Montserrat-Bold',
                    fontSize: 11.63,
                  }}>
                 Favourites
                  </Text>
              </View>
            ),
          })}
        >
           {(props) => <FavouriteComponent {...props} {...this.state} />}
        </Tab.Screen>
        <Tab.Screen
          name="Orders"
          component={OrdersHistoryComponent}
          options={({ navigation, route }) => ({
            tabBarLabel: 'Orders',
            tabBarOptions: { showIcon: true },
            tabBarIcon: ({ focused }) => (
              <View style={styles.iconView2}>
                {focused ? (
                  <Image
                    source={ImageAssets.order_active}
                    style={[styles.icon2]}
                  />
                ) : (
                  <Image
                    source={ImageAssets.order_inactive}
                    style={[styles.icon2]}
                  />
                )}
                <Text
                  style={{
                    color: focused ? '#c8960f' : '#777777',
                    fontFamily: 'Montserrat-Bold',
                    fontSize: 11.63,
                  }}>
                  Orders
                  </Text>
              </View>
            ),
          })}
        />
        {/* <Tab.Screen
          name="Wallet"
          // component={() => <WalletComponent {...this.props} walletBalance={this.state.walletBalance} />}
          options={({ navigation, route }) => ({
            tabBarLabel: 'Wallet',
            tabBarOptions: { showIcon: true },
            tabBarIcon: ({ focused }) => (
              <View style={styles.iconView2}>
                {focused ? (
                  <Image
                    source={ImageAssets.wallet_active}
                    style={[styles.icon]}
                  />
                ) : (
                  <Image
                    source={ImageAssets.wallet_inactive}
                    style={[styles.icon]}
                  />
                )}
                <Text
                  style={{
                    color: focused ? '#c8960f' : '#777777',
                    fontFamily: 'Montserrat-Bold',
                    fontSize: 11.63,
                  }}>
                  Wallet
                  </Text>
              </View>
            ),
          })}
        >
          {(props) => <WalletComponent {...props} walletBalance={this.state.walletBalance} />}
        </Tab.Screen> */}
        {/* <Tab.Screen
            name="Favourite"
            component={FavouriteComponent}
            options={({navigation, route}) => ({
              tabBarLabel: 'Favourite',
              tabBarOptions: {showIcon: true},
              tabBarIcon: ({focused}) => (
                <View style={styles.iconView2}>
                  {focused ? (
                    <Image
                      source={ImageAssets.favourite_active}
                      style={[styles.icon2]}
                    />
                  ) : (
                    <Image
                      source={ImageAssets.favourite_inactive}
                      style={[styles.icon2]}
                    />
                  )}
                  <Text
                    style={{
                      color: focused ? '#ec2f23' : '#777777',
                      fontFamily: 'Montserrat-Bold',
                      fontSize: 14,
                    }}>
                    Favourite
                  </Text>
                </View>
              ),
            })}
          /> */}
      </Tab.Navigator>
    );
  }

  protected _buildState() {
    return this.userRepository.getState()
  }
}

const styles = StyleSheet.create({
  icon: {
    width: 19,
    height: 21,
  },
  iconView1: {
    height: 61,
    width: 64,
    alignItems: 'center',
    marginLeft: -20,
    marginRight: 5,
    marginTop: -2.4,
  },
  iconView2: {
    height: 62,
    width: 65,
    alignItems: 'center',
    marginLeft: -20,
    marginTop: -3.5,
  },
  icon2: {
    width: 21,
    height: 20,
  },
});
