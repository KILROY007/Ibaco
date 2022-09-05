import React from 'react';
import {
  View,
  StyleSheet,
  Keyboard,
  StatusBar,
  ScrollView,
  Image,
  Linking,
  Clipboard,
  TouchableOpacity,
  RefreshControl,
  FlatList,
  Dimensions,
} from 'react-native';
import {ComponentBase} from 'resub';
import {Text, Button, Container, Content, Input, Toast} from 'native-base';
import {DependencyInjector} from '../dependency-injector/DependencyInjector';
import {
  FavouriteViewModel,
  FavouriteState,
} from '../view-madel/FavouriteViewModel';
import ImageAssets from '../assets';
import LinearGradient from 'react-native-linear-gradient';
import {Snackbar} from 'react-native-paper';
import Colors from '../resources/Colors';
import Strings from '../resources/String';
import {Retry} from './common-components/Retry';
import {Loader} from './common-components/Loader';
import {useFocusEffect} from '@react-navigation/native';
import {ProductItemComponent} from './common-components/ProductItemComponent';
import {Rating, AirbnbRating} from 'react-native-ratings';
import {StarIcon, RightAngledIcon} from '../assets/icons/common_svg';

function FetchUserData({doApiCall}) {
  useFocusEffect(
    React.useCallback(() => {
      doApiCall();
    }, []),
  );

  return null;
}

export class FavouriteComponent extends ComponentBase<any, FavouriteState> {
  viewModel: FavouriteViewModel;
  public productDescriptionParams;
  secondTextInput: any;
  DATA: any[] = [];
  constructor(props: any) {
    super(props);
    this.viewModel = DependencyInjector.default().providefavouriteViewModel();
  }
  onDismissSnackBar=()=>{
    this.viewModel.set("isAddToCart",false)
  }
  isAddToCart=()=>{
    this.viewModel.set("isAddToCart",true)
  }
  _doApiCall = () => {
    this.viewModel.set('isLoading', true);
    this.viewModel
      .getFavouriteItems()
      .then(() => this.viewModel.set('isLoading', false));
  };

  public render() {
    if (this.state.error) {
      return (
        <Retry
          message={this.state.error.message}
          onPress={() => {
            this.viewModel.set('error', undefined);
            this.viewModel.getFavouriteItems();
          }}
        />
      );
    } else {
      return (
        <Container style={{justifyContent: 'flex-start'}}>
          <FetchUserData doApiCall={this._doApiCall} />
          <StatusBar
            barStyle="default"
            backgroundColor={Colors.primary_gradient_color_header}
          />
           {this.state.isAddToCart&&this.props.cartSummary?.items_qty>0&&
               (<Snackbar
                visible={this.state.isAddToCart}
                onDismiss={this.onDismissSnackBar}
                duration={10000}
                theme={{ colors: {onSurface:Colors.white,surface: Colors.primary_color2, accent:Colors.white}}}
                action={{
                  label: 'View Cart',
                  labelStyle:{fontFamily:"Montserrat-SemiBold",fontSize:13,textTransform:"none"},
                    style:{backgroundColor:"#3c3c3c",borderRadius:14},
                  onPress: () => {
                    this.props.navigation.navigate('Cart')
                  },
                }}>
                  <Image source={ImageAssets.shopping_cart} style={{padding:12}}/>
                  <Text  style={styles.snackBarText}>
              {` ${this.props.cartSummary?.items_qty} item(s) added successfully`}
              
              <Text style={[styles.totalAmount]}>
                  {"\n    "} ₹{ this.props.cartSummary.base_subtotal +
                              this.props.cartSummary.base_discount_amount}
                    </Text>
                              </Text>
              </Snackbar>
              )
              }
          {this.state.isLoading ? <Loader /> : null}
          <Content
            style={{flex: 1}}
            contentContainerStyle={{flexGrow: 1}}
            refreshControl={this.refreshControl()}>
            <View style={{flexDirection: 'row', padding: 30}}>
              <Text style={{fontSize: 22, color: Colors.text_primary_dark}}>
                My Favourites
              </Text>
              <TouchableOpacity
                style={{paddingTop: 4, marginLeft: 12}}
                onPress={() => {
                  this.viewModel.removeAllWishListItems();
                }}>
                <Text style={{color: '#f9643b'}}>Clear Favourites</Text>
              </TouchableOpacity>
            </View>

            {/* {this.state.favouriteProducts.length !==0?this.addData(this.state.favouriteProducts[0]):null} */}
            {this.state.favouriteProducts &&
            this.state.favouriteProducts.length ? (
              <View
                style={{
                  backgroundColor: Colors.primary_light_color,
                  alignItems: 'center',
                }}>
                <View>
                  {!this.state.isLoading && (
                    <FlatList
                      style={{marginBottom: 20}}
                      data={this.state.favouriteProducts}
                      keyExtractor={(item, index) => item.sku.toString()}
                      renderItem={({item, index}) => {
                        return this.state.favouriteItems.map(
                          (product: any) =>
                            item.status === 1 &&
                            JSON.parse(product.product_id) === item.id && (
                              <ProductItemComponent
                                key={`key-${index}-${item.sku}`}
                                item={item}
                                listType="list"
                                model={this.viewModel}
                                isAddToCart={this.isAddToCart}
                                wishId={JSON.parse(product.wishlist_item_id)}
                                navigateToProductPage={true}
                                cartItems={this.props.cartItems}
                                navigation={this.props.navigation}
                                inventoryItems={this.props.inventoryItems}
                                cartSummary={this.props.cartSummary}
                              />
                            ),
                        );
                      }}
                    />
                  )}
                </View>
              </View>
            ) : (
              <ScrollView
                refreshControl={this.refreshControl()}
                contentContainerStyle={{
                  flex: 1,
                  justifyContent: 'space-between',
                }}>
                <View style={{alignItems: 'center'}}>
                  <Text
                    style={{
                      color: Colors.address_text,
                      fontFamily: 'Muli-Light',
                      fontSize: 40,
                      marginTop: 80,
                    }}>
                    {Strings.text_no_fav_greeting}
                  </Text>
                  <Text
                    style={{
                      color: Colors.text_Light,
                      fontSize: 20,
                      fontFamily: 'Muli-Bold',
                    }}>
                    {Strings.text_no_fav_askQuestion}
                  </Text>
                </View>
                <View
                  style={{
                    alignSelf: 'center',
                    alignItems: 'center',
                    marginBottom: 14,
                  }}>
                  <Text
                    style={{
                      color: Colors.text_primary_dark,
                      fontFamily: 'Muli-Bold',
                      fontSize: 14,
                    }}>
                    {Strings.text_tapOn}
                    <Text style={{color: Colors.primary_color}}>
                      {Strings.text_heart}
                    </Text>
                    {Strings.text_add_fav}
                  </Text>
                </View>
              </ScrollView>
            )}
         
          </Content>
        </Container>
      );
    }
  }
  refreshControl = () => {
    return (
      <RefreshControl
        refreshing={this.state.refreshing}
        enabled={true}
        onRefresh={async () => {
          this.viewModel.set('refreshing', true);
          await this.viewModel.getFavouriteItems();
          this.viewModel.set('refreshing', false);
        }}
      />
    );
  };

  protected _buildState() {
    return this.viewModel.getState();
  }
}
const styles = StyleSheet.create({
  priceText: {
    color: Colors.primary_color,
    fontFamily: 'Montserrat-Medium',
    fontSize: 15.4,
  },
  signButton: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.primary_color2,
  },
  quantity: {
    fontSize: 12.6,
    fontFamily: 'Montserrat-Black',
    color: Colors.primary_color2,
    paddingLeft: 18,
    paddingRight: 18,
  },
  signText: {
    paddingLeft: 9.1,
    paddingRight: 9.1,
    color: Colors.white,
    fontSize: 12.6,
    fontFamily: 'Montserrat-Medium',
  },
  totalAmount: {
    color: Colors.primary_color,
    fontFamily: 'Muli-ExtraBold',
    fontSize: 14.95,
  },
  AddButton: {
    color: Colors.add_button_text,
    fontFamily: 'Montserrat-Black',
    fontSize: 10,
  },
  snackBarText:{
    fontFamily:'Montserrat-Medium',
    color:'#444444',
    marginHorizontal:20,
    fontSize:13
  }
});
