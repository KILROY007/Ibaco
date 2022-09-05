import React from 'react';
import { ComponentBase } from 'resub';
import { Dimensions, StyleSheet, StatusBar, Image } from 'react-native';
import {
  Container,
  Text,
  Content,
  View,
  Card,
  CardItem,
  Body,
  Tab,
  TabHeading,
  Tabs,
} from 'native-base';
import ImageAssets from '../../assets';
import { IngredientsComponent } from './IngredientsComponent';
import { MethodsComponent } from './MethodsComponent';

const { width: viewportWidth, height: viewportHeight } = Dimensions.get('window');

export class SingleBlogComponent extends ComponentBase<any, any> {
  constructor(props: any) {
    super(props);
    this.state = {
      selectTab: 0,
    };
  }

  public render() {
    return (
      <Container style={{ justifyContent: 'flex-start' }}>
        <StatusBar barStyle='dark-content' backgroundColor='white' />
        <Content style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }}>
          <View style={{ flex: 0.3, backgroundColor: '#eeeeee' }}>
            <View key={this.props.route.params.key} style={styles.bigCatView}>
              <Card style={styles.cardView}>
                <CardItem
                  style={{
                    borderRadius: 20,
                    flex: 0.1,
                  }}>
                  <View style={{ flexDirection: 'row', display: 'flex' }}>
                    <Text style={styles.header1} numberOfLines={2}>
                      {this.props.route.params.data.title.rendered}
                    </Text>
                    {/* <Text style={styles.likeText}>
                      3 likes
                      <Image
                        source={ImageAssets.favourites_icon_inactive}
                        style={styles.bigCartHeart}
                      />
                    </Text> */}
                  </View>
                </CardItem>
                <CardItem
                  style={{
                    borderRadius: 10,
                    marginTop: -10,
                    flex: 0.2,
                  }}>
                  <Body>
                    <Image
                      source={{ uri: this.props.route.params.data.thumbnail }}
                      style={styles.cartBodyImage}
                    />
                  </Body>
                </CardItem>
              </Card>
            </View>
          </View>
          <View style={{ flex: 0.7, backgroundColor: '#FFFFFF', marginTop: 15 }}>
            {this.props.route.params.data && this.props.route.params.data.ingredients_1 ? <Text style={styles.bolgDescriptionHeader}>About this recipe</Text> : null}
            <Text style={styles.blogDescription}>
              {this.props.route.params.data.content.rendered}
            </Text>
            {this.props.route.params.data.recipe_type || this.props.route.params.data.cooking_time || this.props.route.params.data.serves ? <View
              style={{
                flexDirection: 'row',
                alignSelf: 'center',
                flex: 0.2,
                width: '92%',
                height: viewportHeight * 0.092,
              }}>
              <View style={[styles.imfomationText, { flex: 0.35 }]}>
                <Text style={styles.descriptionText}>Type</Text>
                <Text style={styles.subDescription}>{this.props.route.params.data.recipe_type}</Text>
              </View>
              <View style={[styles.imfomationText2, { flex: 0.3 }]}>
                <Text style={styles.descriptionText1}>Cooking Time</Text>
                <Text style={styles.subDescription2}>{this.props.route.params.data.cooking_time}</Text>
              </View>
              <View style={[styles.imfomationText3, { flex: 0.35 }]}>
                <Text style={styles.descriptionText3}>Serves</Text>
                <Text style={styles.subDescription3}>{this.props.route.params.data.serves}</Text>
              </View>
            </View> : null}
            {this.props.route.params.data && this.props.route.params.data.ingredients_1 ? <View style={{ marginTop: 20, flex: 0.6 }}>
              <Tabs
                tabContainerStyle={{
                  elevation: 0,
                  backgroundColor: 'transparent',
                  flex: 1,
                }}
                style={{ shadowOpacity: 0, elevation: 0 }}
                tabBarUnderlineStyle={{ backgroundColor: '#ec2f23', height: 1 }}
                onChangeTab={value => {
                  this.setState({
                    selectTab: value.i,
                  });
                }}>
                <Tab
                  tabStyle={{
                    elevation: 0,
                    shadowOpacity: 0,
                    backgroundColor: 'transparent',
                  }}
                  heading={
                    <TabHeading
                      style={{
                        backgroundColor: 'transparent',
                        elevation: 0,
                      }}>
                      <Text
                        style={[
                          styles.ingreadientText,
                          {
                            color:
                              this.state.selectTab === 0
                                ? '#ec2f23'
                                : '#777777',
                          },
                        ]}>
                        Ingredients
                      </Text>
                    </TabHeading>
                  }>
                  <View style={{ flex: 1 }}>
                    <IngredientsComponent data={this.props.route.params.data} />
                  </View>
                </Tab>
                <Tab
                  heading={
                    <TabHeading style={{ backgroundColor: 'transparent' }}>
                      <Text
                        style={[
                          styles.ingreadientText,
                          {
                            color:
                              this.state.selectTab === 1
                                ? '#ec2f23'
                                : '#777777',
                          },
                        ]}>
                        Method
                      </Text>
                    </TabHeading>
                  }>
                  <View>
                    <MethodsComponent data={this.props.route.params.data} />
                  </View>
                </Tab>
              </Tabs>
            </View> : null}
          </View>
        </Content>
      </Container>
    );
  }
}

const styles = StyleSheet.create({
  bigCatView: {
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  cardView: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
  },
  header1: {
    color: '#555555',
    fontFamily: 'Montserrat-Bold',
    fontSize: 15,
    marginLeft: 0,
    marginTop: 0,
    flex: 1,
  },
  likeText: {
    fontSize: viewportWidth < 450 ? 10.58 : 16,
    fontFamily: 'Montserrat-Bold',
    color: '#AAAAAA',
    marginTop: viewportWidth < 450 ? 3 : 8,
    marginLeft: viewportWidth < 450 ? 80 : viewportWidth * 0.07,
    flexDirection: 'row',
    marginBottom: 4,
  },

  bigCartHeart: {
    tintColor: '#999999',
    alignSelf: 'flex-end',
  },
  cartBodyImage: {
    height: viewportHeight * 0.25,
    width: viewportWidth * 0.9,
    flex: 1,
    borderRadius: 15,
    alignSelf: 'center',
  },
  bolgDescriptionHeader: {
    color: '#555555',
    fontFamily: 'Montserrat-Bold',
    fontSize: viewportWidth < 450 ? 17 : 24,
    marginTop: 12,
    marginLeft: 14,
    flex: 0.1,
  },
  blogDescription: {
    marginLeft: 14,
    marginTop: 10,
    color: '#555555',
    fontFamily: 'Montserrat-Italic',
    fontSize: 14,
    marginRight: 10,
    margin: 20,
    flex: 0.1,
    lineHeight: 25,
  },
  imfomationText2: {
    borderColor: '#AAAAAA',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  imfomationText3: {
    borderColor: '#AAAAAA',
    borderWidth: 1,
    borderBottomRightRadius: 28,
    borderTopRightRadius: 28,
    alignItems: 'center',
  },
  imfomationText: {
    borderColor: '#AAAAAA',
    borderWidth: 1,
    borderBottomLeftRadius: 28,
    borderTopLeftRadius: 28,
    alignItems: 'center',
  },
  descriptionText: {
    textAlign: 'center',
    marginVertical: 7,
    color: '#AAAAAA',
    fontFamily: 'Montserrat-Bold',
    fontSize: viewportWidth < 450 ? 12 : 16,
  },
  subDescription: {
    color: '#555555',
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 16,
    marginTop: -5,
    textAlign: 'center',
  },
  descriptionText1: {
    marginVertical: 7,
    color: '#AAAAAA',
    fontFamily: 'Montserrat-Bold',
    fontSize: viewportWidth < 450 ? 12 : 16,
    textAlign: 'center',
  },
  subDescription2: {
    color: '#555555',
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 16,
    marginTop: -5,
    textAlign: 'center',
  },
  descriptionText3: {
    textAlign: 'center',
    marginVertical: 7,
    color: '#AAAAAA',
    fontFamily: 'Montserrat-Bold',
    fontSize: viewportWidth < 450 ? 12 : 16,
  },
  subDescription3: {
    color: '#555555',
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 16,
    marginTop: -5,
    textAlign: 'center',
  },

  ingreadientText: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 14,
  },
});
