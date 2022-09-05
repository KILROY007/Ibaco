import * as React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {Component} from 'react';
import ScreenHeader from '../common-components/ScreenHeader';
import {View, Image, Text, StyleSheet, Platform} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import ImageAssets from '../../assets';
import AddOrEditAddressComponent from '../common-components/AddOrEditAddressComponent';
import {TabBarComponent} from '../TabBarComponent';
import {HeaderRightComponent} from '../common-components/HeaderRightComponent';
import {Help} from '../order/Help';
import {Colors} from 'react-native/Libraries/NewAppScreen';

export class AccountStack extends Component<any, {}> {
  render() {
    const Stack = createStackNavigator();
    return (
      <Stack.Navigator>
        <Stack.Screen
          options={({navigation, route}) => ({
            headerTitle: props => null,
            headerRight: props => (
              <ScreenHeader image={ImageAssets.accounticon} title="ACCOUNT" />
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
          name="profile"
          component={TabBarComponent}
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
