//OrderStack
import * as React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {Component} from 'react';
import ScreenHeader from '../common-components/ScreenHeader';
import {View, Image, Text, StyleSheet} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import ImageAssets from '../../assets';
import AddOrEditAddressComponent from '../common-components/AddOrEditAddressComponent';
import {OrdersHistoryComponent} from '../home/Account/OrdersHistoryComponent';
import Colors from '../../resources/Colors';
import {OrderTrackingComponent} from '../order/OrderTrackingComponent';
import {Help} from '../order/Help';
import {HeaderRightComponent} from '../common-components/HeaderRightComponent';

export class OrderStack extends Component<any, {}> {
  constructor(props: any) {
    super(props);
  }
  render(): any {
    const Stack = createStackNavigator();
    return (
      <Stack.Navigator>
        <Stack.Screen
          options={({navigation, route}) => ({
            headerTitle: props => null,
            headerRight: props => (
              <ScreenHeader title="ORDERS" image={ImageAssets.cart_header} />
            ),
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
          name="OrdersHistoryComponent"
          component={OrdersHistoryComponent}
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
          name="Help"
          component={Help}
        />
      </Stack.Navigator>
    );
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
