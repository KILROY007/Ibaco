import * as React from 'react';
import 'react-native-gesture-handler';
import {DependencyInjector} from './dependency-injector/DependencyInjector';
import {ComponentBase} from 'resub';
import {UserRepository, UserState} from './domain/repository/UserRepository';
import AsyncStorage from '@react-native-community/async-storage';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {ShopStack} from './view/home-stack/ShopStack';
import {CartStack} from './view/home-stack/CartStack';
import {AccountStack} from './view/home-stack/AccountStack';
import {
  Image,
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Easing,
} from 'react-native';
import ImageAssets from './assets';
import {LoginStack} from './view/home-stack/LoginStack';
import {OrderStack} from './view/home-stack/OrderStack';
import Colors from './resources/Colors';
import analytics from '@react-native-firebase/analytics';
import firebase from '@react-native-firebase/app';
import {BlogStack} from './view/home-stack/BlogStack';
import {CartRepository} from './domain/repository/CartRepository';
import LinearGradient from 'react-native-linear-gradient';
import {Root} from 'native-base';
import {StatusBar} from 'react-native';
import PushNotification from 'react-native-push-notification';
import Firebase from '@react-native-firebase/app';

export default class App extends ComponentBase<any, UserState> {
  private userRepository: UserRepository;
  private cartRepository: CartRepository;
  private routeNameRef:any;
  private navigationRef:any;
  order: any;
  cart: any;
  shop: any;
  account: any;
  blog: any;
  constructor(props: {}) {
    super(props);
    DependencyInjector.initialize(AsyncStorage);
     this.routeNameRef = React.createRef()
     this.navigationRef = React.createRef();
    this.userRepository = DependencyInjector.default().provideUserRepository();
    this.cartRepository = DependencyInjector.default().provideCartRepository();
    this.order = new Animated.Value(0);
    this.cart = new Animated.Value(0);
    this.shop = new Animated.Value(0);
    this.account = new Animated.Value(0);
    this.blog = new Animated.Value(0);
  }
  moveOrderWhenFocus = () => {
    Animated.timing(this.order, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
      easing: Easing.elastic(1),
    }).start();
  };

  moveOrder = () => {
    Animated.timing(this.order, {
      toValue: 0,
      duration: 800,
      useNativeDriver: true,
      easing: Easing.elastic(1),
    }).start();
  };

  moveCartWhenFocus = () => {
    Animated.timing(this.cart, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
      easing: Easing.elastic(1),
    }).start();
  };

  moveCart = () => {
    Animated.timing(this.cart, {
      toValue: 0,
      duration: 800,
      useNativeDriver: true,
      easing: Easing.elastic(1),
    }).start();
  };

  moveShopWhenFocus = () => {
    Animated.timing(this.shop, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
      easing: Easing.elastic(1),
    }).start();
  };

  moveShop = () => {
    Animated.timing(this.shop, {
      toValue: 0,
      duration: 800,
      useNativeDriver: true,
      easing: Easing.elastic(1),
    }).start();
  };

  moveAccountWhenFocus = () => {
    Animated.timing(this.account, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
      easing: Easing.elastic(1),
    }).start();
  };

  moveAccount = () => {
    Animated.timing(this.account, {
      toValue: 0,
      duration: 800,
      useNativeDriver: true,
      easing: Easing.elastic(1),
    }).start();
  };

  moveBlogWhenFocus = () => {
    Animated.timing(this.blog, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
      easing: Easing.elastic(1),
    }).start();
  };

  moveBlog = () => {
    Animated.timing(this.blog, {
      toValue: 0,
      duration: 800,
      useNativeDriver: true,
      easing: Easing.elastic(1),
    }).start();
  };

  async componentDidMount() {
    await firebase.analytics().logAppOpen();
    await this.userRepository.autoSignIn();
    if (this.state.isAutoLoggingIn) {
      this.load();
    } else if (!this.state.loggedInToken) {
      await this.userRepository.getGuestUserToken();
    }

    const loggedToken = this.state.loggedInToken;
    const userId = this.state.loggedInUser.id;
    const callFcm = async (data: any) => {
      await this.userRepository.saveFcm(data);
    };
    //@ts-ignore
    Firebase.initializeApp(this);
    // Must be outside of any component LifeCycle (such as `componentDidMount`).
    PushNotification.configure({
      // (optional) Called when Token is generated (iOS and Android)
      onRegister: async function(token) {
        const storedToken = await AsyncStorage.getItem('FCMToken');
        console.log("stored token",storedToken);
        const newToken = token !== storedToken ? true : false;
        if (userId && newToken) {
          console.log("FCM key",token.token);
          await AsyncStorage.setItem('FCMToken', token.token);
          const data = {
            customer_id: userId,
            fcm_key: token.token,
          };
          callFcm(data);
        }
      },

      // (required) Called when a remote is received or opened, or local notification is opened
      onNotification: function(notification) {
        console.log('NOTIFICATION:', notification);
        notification.vibration = '300';
        PushNotification.localNotification(notification);
        // process the notification

        // (required) Called when a remote is received or opened, or local notification is opened
        // notification.finish(PushNotificationIOS.FetchResult.NoData);
      },

      // (optional) Called when Registered Action is pressed and invokeApp is false, if true onNotification will be called (Android)
      onAction: function(notification) {
        console.log('ACTION:', notification.action);
        console.log('NOTIFICATION:', notification);

        // process the action
      },

      // (optional) Called when the user fails to register for remote notifications. Typically occurs when APNS is having issues, or the device is a simulator. (iOS)
      onRegistrationError: function(err) {
        console.error(err.message, err);
      },

      // IOS ONLY (optional): default: all - Permissions to register.
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },

      // Should the initial notification be popped automatically
      // default: true
      popInitialNotification: true,

      /**
       * (optional) default: true
       * - Specified if permissions (ios) and token (android and ios) will requested or not,
       * - if not, you must call PushNotificationsHandler.requestPermissions() later
       * - if you are not using remote notification or do not have Firebase installed, use this:
       *     requestPermissions: Platform.OS === 'ios'
       */
      requestPermissions: true,
    });
  }

  public load = async () => {
    await this.userRepository.getCartId();
    // await this.userRepository.getCartDetails(true)
    // await this.userRepository.getCartItems({})
  };

  render(): any {
    const yMoveDownOrder = this.order.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 15],
    });

    const yMoveUpOrder = this.order.interpolate({
      inputRange: [0, 1],
      outputRange: [0, -15],
    });

    const animUpStyleOrder = {
      transform: [
        {
          translateY: yMoveUpOrder,
        },
      ],
    };

    const animDownStyleOrder = {
      transform: [
        {
          translateY: yMoveDownOrder,
        },
      ],
    };

    const yMoveDownCart = this.cart.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 17],
    });

    const yMoveUpCart = this.cart.interpolate({
      inputRange: [0, 1],
      outputRange: [0, -17],
    });

    const animUpStyleCart = {
      transform: [
        {
          translateY: yMoveUpCart,
        },
      ],
    };

    const animDownStyleCart = {
      transform: [
        {
          translateY: yMoveDownCart,
        },
      ],
    };

    const yMoveDownShop = this.shop.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 15],
    });

    const yMoveUpShop = this.shop.interpolate({
      inputRange: [0, 1],
      outputRange: [0, -15],
    });

    const animUpStyleShop = {
      transform: [
        {
          translateY: yMoveUpShop,
        },
      ],
    };

    const animDownStyleShop = {
      transform: [
        {
          translateY: yMoveDownShop,
        },
      ],
    };

    const yMoveDownAccount = this.account.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 15],
    });

    const yMoveUpAccount = this.account.interpolate({
      inputRange: [0, 1],
      outputRange: [0, -15],
    });

    const animUpStyleAccount = {
      transform: [
        {
          translateY: yMoveUpAccount,
        },
      ],
    };

    const animDownStyleAccount = {
      transform: [
        {
          translateY: yMoveDownAccount,
        },
      ],
    };

    const yMoveDownBlog = this.blog.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 15],
    });

    const yMoveUpBlog = this.blog.interpolate({
      inputRange: [0, 1],
      outputRange: [0, -15],
    });

    const animUpStyleBlog = {
      transform: [
        {
          translateY: yMoveUpBlog,
        },
      ],
    };

    const animDownStyleBlog = {
      transform: [
        {
          translateY: yMoveDownBlog,
        },
      ],
    };

    const Tab = createBottomTabNavigator();
    // onPress={this.moveBall}
    return (
      <Root>
        <StatusBar barStyle="light-content" backgroundColor="transparent" />
        <NavigationContainer
        ref={this.navigationRef}
        onReady={() => {
          this.routeNameRef.current = this.navigationRef.current.getCurrentRoute().name;
        }}
        onStateChange={async () => {
          const previousRouteName = this.routeNameRef.current;
          const currentRouteName = this.navigationRef.current.getCurrentRoute().name;
  
          if (previousRouteName !== currentRouteName) {
            await analytics().logScreenView({
              screen_name: currentRouteName,
              screen_class: currentRouteName,
            });
          }
          this.routeNameRef.current = currentRouteName;
        }}
        >
          <Tab.Navigator
            tabBarOptions={{
              style: {
                // borderTopRightRadius: 20,
                // borderTopLeftRadius: 20,
              },
            }}
            initialRouteName={'Shop'}
            labeled={false}>
            <Tab.Screen
              name="orders"
              component={OrderStack}
              options={({navigation, route}) => ({
                tabBarOptions: {showIcon: false},
                tabBarLabel: focused => {
                  if (focused.focused) {
                    this.moveOrderWhenFocus();
                  } else {
                    this.moveOrder();
                  }
                  return (
                    <TouchableOpacity
                      {...this.props}
                      onPress={() => {
                        navigation.navigate('orders', {
                          screen: 'OrdersHistoryComponent',
                          params: {isUpdated: focused.focused ? false : true},
                        });
                      }}
                      style={{
                        marginBottom: 5,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                      <View style={{marginTop: -5, alignItems: 'center'}}>
                        <Animated.View style={[animDownStyleOrder]}>
                          <Image
                            source={
                              focused.focused
                                ? ImageAssets.order_bottom_tab_active
                                : ImageAssets.order_bottom_tab_inactive
                            }
                          />
                        </Animated.View>
                        <Animated.View style={[animUpStyleOrder]}>
                          <Text
                            style={{
                              color: focused.focused
                                ? Colors.primary_color
                                : Colors.text_Light,
                            }}>
                            Orders
                          </Text>
                        </Animated.View>
                      </View>
                    </TouchableOpacity>
                  );
                },
              })}
            />
            {/* <Tab.Screen
                        name="Cart"
                        component={CartStack}
                        options={({ navigation, route }) => ({
                            tabBarOptions: { showIcon: true },
                            tabBarLabel: focused => {
                                if (focused.focused) {
                                    this.moveCartWhenFocus()
                                } else {
                                    this.moveCart()
                                }
                                return (
                                    <TouchableOpacity
                                        {...this.props}
                                        onPress={() => {
                                            navigation.navigate('Cart', {
                                                screen: 'CartComponent',
                                                params: { isUpdated: true },
                                            })
                                        }}
                                        style={{
                                            marginBottom: 5,
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <View style={{ marginTop: -5, alignItems: 'center' }}>

                                            <Animated.View style={[animDownStyleCart]}>
                                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                    <Image source={focused.focused ? ImageAssets.cart_bottom_tab_active : ImageAssets.cart_bottom_tab_inactive} />
                                                    <Text style={{ fontFamily: 'Muli-Bold', fontSize: 14, color: focused.focused ? Colors.primary_color : Colors.dark_gray }}>{this.userRepository.getState().cartSummary && this.userRepository.getState().cartSummary.items_qty > 0 ? ` ${this.userRepository.getState().cartSummary.items_qty}` : ''}</Text>
                                                </View>
                                            </Animated.View>
                                            <Animated.View style={[animUpStyleCart]}>
                                                <Text style={{ color: focused.focused ? Colors.primary_color : Colors.text_Light }}>Cart</Text>
                                            </Animated.View>

                                        </View>
                                    </TouchableOpacity>
                                )
                            },
                        })}
                    /> */}
            <Tab.Screen
              name="Shop"
              component={ShopStack}
              options={({navigation, route}) => ({
                tabBarOptions: {showIcon: false},
                tabBarLabel: focused => {
                  if (focused.focused) {
                    this.moveShopWhenFocus();
                  } else {
                    this.moveShop();
                  }
                  return (
                    <TouchableOpacity
                      {...this.props}
                      onPress={() => {
                        navigation.navigate('Shop', {
                          screen: 'ShopComponent',
                          params: {isUpdated: true},
                        });
                      }}
                      style={{
                        width: '80%',
                        height: focused.focused ? 56 : 50,
                      }}>
                      <LinearGradient
                        colors={
                          focused.focused
                            ? [
                                Colors.primary_gradient_color,
                                Colors.primary_color,
                              ]
                            : [Colors.white, Colors.white]
                        }
                        style={{
                          flex: 1,
                          justifyContent: 'center',
                          borderTopLeftRadius: 9,
                          borderTopRightRadius: 9,
                        }}
                        start={{x: 0, y: 0}}
                        end={{x: 0, y: 1}}>
                        <View
                          style={{
                            marginTop: 5,
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}>
                          <Animated.View style={[animDownStyleShop]}>
                            <Image
                              style={{height: 15, width: 8}}
                              source={
                                !focused.focused
                                  ? ImageAssets.shop_bottom_tab_active_new
                                  : ImageAssets.shop_bottom_tab_inactive
                              }
                            />
                          </Animated.View>
                          <Animated.View style={[animUpStyleShop]}>
                            <Text
                              style={{
                                color: focused.focused
                                  ? Colors.white
                                  : Colors.text_Light,
                                fontSize: 11,
                              }}>
                              Shop
                            </Text>
                          </Animated.View>
                        </View>
                      </LinearGradient>
                    </TouchableOpacity>
                  );
                },
              })}
            />
            {/* <Tab.Screen
                            name='Blog'
                            component={BlogStack}
                            options={({ navigation, route }) => ({
                                tabBarOptions: { showIcon: false },
                                tabBarLabel: focused => {
                                    if (focused.focused) {
                                        this.moveBlogWhenFocus()
                                    } else {
                                        this.moveBlog()
                                    }
                                    return (
                                        <TouchableOpacity
                                            {...this.props}
                                            onPress={() => {
                                                navigation.navigate('Blog', {
                                                    screen: 'BlogComponent',
                                                    params: { categories: this.state.categories }
                                                })
                                            }}
                                            style={{
                                                marginBottom: 5,
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}
                                        >
                                            <View style={{ marginTop: -5, alignItems: 'center' }}>

                                                <Animated.View style={[animDownStyleBlog]}>
                                                    <Image source={focused.focused ? ImageAssets.blog_bottom_tab_active : ImageAssets.blog_bottom_tab_inactive} />
                                                </Animated.View>
                                                <Animated.View style={[animUpStyleBlog]}>
                                                    <Text style={{ color: focused.focused ? Colors.primary_color : Colors.text_Light }}>Blog</Text>
                                                </Animated.View>

                                            </View>
                                        </TouchableOpacity>
                                    )
                                },
                            })}
                        /> */}
            {this.state.shouldShowAccountStack || this.state.isAutoLoggingIn ? (
              <Tab.Screen
                name={'Account'}
                component={AccountStack}
                options={({navigation, route}) => ({
                  tabBarOptions: {showIcon: false, keyboardHidesTabBar: true},
                  tabBarLabel: focused => {
                    if (focused.focused) {
                      this.moveAccountWhenFocus();
                    } else {
                      this.moveAccount();
                    }
                    return (
                      <TouchableOpacity
                        {...this.props}
                        onPress={() => {
                          navigation.navigate('Account', {
                            screen: 'profile',
                          });
                        }}
                        style={{
                          marginBottom: 5,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                        <View style={{marginTop: -5, alignItems: 'center'}}>
                          <Animated.View style={[animDownStyleAccount]}>
                            <Image
                              source={
                                focused.focused
                                  ? ImageAssets.account_bottom_tab_active
                                  : ImageAssets.account_bottom_tab_inactive
                              }
                            />
                          </Animated.View>
                          <Animated.View style={[animUpStyleAccount]}>
                            <Text
                              style={{
                                color: focused.focused
                                  ? Colors.primary_color
                                  : Colors.text_Light,
                              }}>
                              Account
                            </Text>
                          </Animated.View>
                        </View>
                      </TouchableOpacity>
                    );
                  },
                })}
              />
            ) : (
              <Tab.Screen
                name={'Login'}
                component={LoginStack}
                options={({navigation, route}) => ({
                  headerShown: false,
                  tabBarOptions: {showIcon: false},
                  tabBarVisible: false,
                  tabBarLabel: focused => {
                    return (
                      <View
                        style={{
                          marginBottom: 5,
                          flexDirection: 'row',
                          alignItems: 'center',
                        }}>
                        <View style={{marginRight: 3.5}}>
                          <Text
                            style={{
                              color: Colors.primary_color,
                              fontFamily: 'Muli-Bold',
                              fontSize: 10,
                            }}>
                            Login
                          </Text>
                          <Text
                            style={{
                              color: Colors.primary_color,
                              fontFamily: 'Muli-Bold',
                              fontSize: 10,
                            }}>
                            Sign Up
                          </Text>
                        </View>
                        <Image source={ImageAssets.login_bottom_tab_arrow} />
                      </View>
                    );
                  },
                })}
              />
            )}
          </Tab.Navigator>
        </NavigationContainer>
      </Root>
    );
  }

  protected _buildState() {
    return this.userRepository.getState();
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  ball: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'red',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: 'bold',
    color: 'white',
    fontSize: 32,
  },
});
