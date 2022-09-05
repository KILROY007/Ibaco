import * as React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {Component} from 'react';
import ScreenHeader from '../common-components/ScreenHeader';
import {View, Image} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import ImageAssets from '../../assets';
import {CartComponent} from '../home/CartComponent';
import {LoginComponent} from '../auth/LoginComponent';

export class LoginStack extends Component<any, {}> {
  render() {    
    const Stack = createStackNavigator();
    return (
      <Stack.Navigator>
        <Stack.Screen
          options={({navigation, route}) => ({
            headerShown: false,
          })}
          name="LoginComponent"
          component={(props)=><LoginComponent {...this.props} />}
        />
      </Stack.Navigator>
    );
  }
}
