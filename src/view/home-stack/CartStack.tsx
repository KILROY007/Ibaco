import * as React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import ScreenHeader from '../common-components/ScreenHeader';
import {View, Image, StyleSheet} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import ImageAssets from '../../assets';
import {CartComponent} from '../home/CartComponent';
import {LoginComponent} from '../auth/LoginComponent';
import Colors from '../../resources/Colors';
import AddOrEditAddressComponent from '../common-components/AddOrEditAddressComponent';
import {OrderTrackingComponent} from '../order/OrderTrackingComponent';
import {
  UserState,
  UserRepository,
} from '../../domain/repository/UserRepository';
import {DependencyInjector} from '../../dependency-injector/DependencyInjector';
import {ComponentBase} from 'resub';
import {HeaderRightComponent} from '../common-components/HeaderRightComponent';

export class CartStack extends ComponentBase<any, UserState> {
  private userRepository: UserRepository;
  constructor(props) {
    super(props);
    this.userRepository = DependencyInjector.default().provideUserRepository();
  }
  render() {
    const Stack = createStackNavigator();
    return (
      <Stack.Navigator>
        <Stack.Screen
          // component={CartComponent}
          options={({navigation, route}) => ({
            headerTitleAlign:"center",
            headerTitle:()=>(
              <ScreenHeader title="Cart" image={ImageAssets.cart_header}  />
            ),
            headerRight: () => <HeaderRightComponent isHeaderRight={true} />,
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
            headerBackground: () => (
              <LinearGradient
                colors={[Colors.white, Colors.white]}
                style={styles.Header}
                start={{x: 1, y: 1}}
                end={{x: 0, y: 1.0}}
              />
            ),
          })}
          name="CartComponent">
          {props => <CartComponent {...props} cart={this.state} />}
        </Stack.Screen>
        <Stack.Screen
          name="LoginComponent"
          component={LoginComponent}
          options={({navigation, route}) => ({
            headerBackground: () => (
              <LinearGradient
                colors={[Colors.white, Colors.white]}
                style={styles.Header}
                start={{x: 1, y: 1}}
                end={{x: 0, y: 1.0}}
              />
            ),
            headerTitle: props => <ScreenHeader title="Back" />,
          })}
        />
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
            headerRight: () => <HeaderRightComponent isHeaderRight={true} />,
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
