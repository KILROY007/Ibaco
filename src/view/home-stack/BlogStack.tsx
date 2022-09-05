import * as React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {Component} from 'react';
import ScreenHeader from '../common-components/ScreenHeader';
import {View, Image, StyleSheet} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import ImageAssets from '../../assets';
import ImageAssets1 from '../../assets';
import {OTPComponent} from '../Sample';
import {HeaderLeftComponent} from '../common-components/HeaderLeftComponent';
import {HeaderRightComponent} from '../common-components/HeaderRightComponent';
import {BlogComponent} from '../blog/BlogComponent';
import {SingleBlogComponent} from '../blog/SingleBlogComponent';

export class BlogStack extends Component<any, {}> {
  render() {
    const Stack = createStackNavigator();
    return (
      <Stack.Navigator>
        <Stack.Screen
          options={({navigation, route}) => ({
            headerTitle: props => (
              <ScreenHeader
                title="BLOGS"
                goBack={() => {
                  navigation.goBack();
                }}
                image2={ImageAssets.arrow_backword}
                image={ImageAssets.blog_header_active}
              />
            ),
            headerRight: () => <HeaderRightComponent />,

            headerBackground: () => (
              <LinearGradient
                colors={['#f48187', '#e54a51']}
                start={{x: 1, y: 1}}
                end={{x: 0, y: 0}}
                locations={[0.0, 0.99]}
                style={styles.gradient}
              />
            ),
          })}
          name="BlogComponent"
          component={BlogComponent}
        />
        <Stack.Screen
          options={({navigation, route}) => ({
            headerTitle: props => null,
            headerRight: () => <HeaderRightComponent isHeaderRight={true}  />,

            headerBackground: () => (
              <LinearGradient
                colors={['#f48187', '#e54a51']}
                start={{x: 1, y: 1}}
                end={{x: 0, y: 0}}
                locations={[0.0, 0.99]}
                style={styles.gradient}
              />
            ),
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
          })}
          name="SingleBlogComponent"
          component={SingleBlogComponent}
        />
        <Stack.Screen
          name="OTPComponents"
          component={OTPComponent}
          options={({navigation, route}) => ({
            header: props => <LinearGradient colors={['red', 'blue']} />,
            headerTitle: props => <ScreenHeader title="LoginComponent" />,
            headerStyle: {backgroundColor: 'blue'},
            headerTitleStyle: {
              fontWeight: 'bold',
            },
            headerRight: () => (
              <View style={{marginRight: 10}}>
                <Image source={ImageAssets1.search} />
              </View>
            ),
            headerLeft: () => (
              <HeaderLeftComponent onBackPress={() => navigation.goBack()} />
            ),
          })}
        />
      </Stack.Navigator>
    );
  }
}

const styles = StyleSheet.create({
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
});
