import React from 'react';
import {
  TouchableOpacity,
  View,
  StyleSheet,
  Image,
  Dimensions,
  ActivityIndicator, 
  ImageBackground,
  Alert,
  Keyboard,
  TextInput,
  FlatList,
} from 'react-native';
import {ComponentBase} from 'resub';
import {
  Container,
  Text,
  Item,
  Content,
  Tab,
  TabHeading,
  Tabs,
} from 'native-base';
import {DependencyInjector} from '../../../dependency-injector/DependencyInjector';
import ImageAssets from '../../../assets';
import {
  ProductDescriptionState,
  ProductDescriptionViewModel,
} from '../../../view-madel/ProductDescriptionViewModel';
import Colors from '../../../resources/Colors';
import {DropDown} from '../../common-components/DropDown';
import {ProductItemComponent} from '../../common-components/ProductItemComponent';
import {Snackbar} from 'react-native-paper';
import Carousel, {Pagination} from 'react-native-snap-carousel';
import ImageZoom from 'react-native-image-pan-zoom';
import {Loader} from '../../common-components/Loader';
import {Retry} from '../../common-components/Retry';
import {CategiriesList} from './CategiriesList';
import AlertComponent from '../../common-components/Alert/Alert';
import Strings from '../../../resources/String';

import _ from 'lodash';
import {DateUtils} from '../../../core/DateUtils';
import {StarIcon, RightAngledIcon} from '../../../assets/icons/common_svg';
import {Rating, AirbnbRating} from 'react-native-ratings';
import { UserRepository } from '../../../domain/repository/UserRepository';

export class ProductDescription extends ComponentBase<
  any,
  ProductDescriptionState
> {
  textInputRef: any;
  private dateUtils = new DateUtils();
  tabref: any;
  relatedProductsArray: any = [];
  public viewModel: ProductDescriptionViewModel;
  private windowWidth = Dimensions.get('window').width;

  constructor(props: any) {
    super(props);
    this.viewModel = DependencyInjector.default().provideProductDescriptionViewModel();
  }

  async componentDidMount() {
    // this.viewModel.set("customerreview", false)
   
    this.setDefaultDropdownValues();
    // await this.viewModel.getUserReviews(
    //   this.props.route.params.productDescriptionParams.product.id,
    // );
    this.viewModel.loadFavourites();
    // await this.calculateRatings();
    if (
      this.props.route.params.productDescriptionParams.product &&
      this.props.route.params.productDescriptionParams.product.product_links
        .length
    ) {
      this.getRelatedProducts();
    }
    await this.viewModel.getRecentProductsId();
  }
  calculateRatings = async () => {
    let rate = 0;
    this.state.ratings &&
      this.state.ratings.length > 0 &&
      this.state.ratings.map((item: any) => {
        rate += JSON.parse(item.value);
      });
    await this.viewModel.set('totalRatings', rate / this.state.ratings.length);
  };
  componentDidUpdate(prevProps,prevState) {
    if (this.state.error) {
      const alert = {
        description: this.state.error.message,
        title: Strings.alert_title,
        okButtonText: Strings.button_ok,
        onOkPress: async () => {
          this.viewModel.set('alertDetails', undefined);
          this.viewModel.set('error', undefined);
        },
      };
      // this.viewModel.set(
      //   'alertDetails',
      //   alert,
      // );
      this.viewModel.clearError();
    }
  }
  async componentWillUnmount() {
    await this.viewModel.createRecentProducts(
      this.props.route.params.productDescriptionParams.product.id,
    );
  }
  public setDefaultDropdownValues = async () => {
    const {productDescriptionParams} = this.props.route.params;
    let selectedSku = productDescriptionParams.product.sku;
    let price = productDescriptionParams.product.price;
    const quantity = await this.getQuantity(selectedSku);
    this.viewModel.setMany({
      selectedSku,
      quantity,
      price,
    });
    this.viewModel.setItemId(selectedSku, this.props.cartItems);
  };
  onDismissSnackBar=()=>{
    this.viewModel.set("isAddToCart",false)
  }
  isAddToCart=()=>{
    this.viewModel.set("isAddToCart",true)
  }

  private getRelatedProducts = async () => {
    await this.viewModel.getRelatedProducts(
      this.props.route.params.productDescriptionParams.product.product_links,
    );
  };

  private handleReviewSubmit = async () => {
    await this.viewModel.postUserReviews(
      this.props.route.params.productDescriptionParams.product.id,
    );
  };

  public getQuantity(selectedSku) {
    const cartItems = this.props.cartItems;
    let qty = 0;
    if (cartItems && cartItems.length) {
      for (const cartItem of cartItems) {
        if (cartItem.sku == selectedSku) {
          qty = cartItem.qty;
          break;
        }
      }
    }
    return qty;
  }

  private getSelectedOptionValue = (option: any) => {
    const selectedOptionsValue = _.find(
      this.state.selectedOptionsValue,
      (selectedValue: any) => selectedValue.optionId === option.option_id,
    );
    return selectedOptionsValue
      ? selectedOptionsValue.optionValue
      : option.values[0].option_type_id;
  };

  public render() {
    const {productDescriptionParams} = this.props.route.params;
    let recentProducts:any[]=[];
    this.state.recentProduct &&
      this.state.recentProduct.length > 0 &&
      this.state.recentProduct.map((product: any, index: any) => {
        if (product.sku!==productDescriptionParams.product.sku) {
          recentProducts.push(product);
        }
      });
    const qty = this.getQuantity(productDescriptionParams.product.sku);
    const inventoryItems = this.props.inventoryItems
      ? this.props.inventoryItems
      : [];
    let productInStockQty = 0;
    let productStatus = 0;
    inventoryItems.map((inventory: any) => {
      if (inventory.sku === productDescriptionParams.product.sku) {
        productInStockQty = inventory.quantity;
        productStatus = inventory.status;
      }
    });
    if (this.state.pageLoadError) {
      return (
        <Retry
          message={this.state.pageLoadError.message}
          onPress={() => {
            // this.getRelatedProducts();
          }}
        />
      );
    } else {
      return (
        <Container style={styles.container}>
          <Content style={{backgroundColor: Colors.white}}>
         
            {this.state.alertDetails && this.state.alertDetails.description ? (
              <AlertComponent
                visible={true}
                title={
                  this.state.alertDetails.title
                    ? this.state.alertDetails.title
                    : Strings.alert_title
                }
                description={this.state.alertDetails.description}
                okButtonText={
                  this.state.alertDetails.okButtonText
                    ? this.state.alertDetails.okButtonText
                    : 'ok'
                }

                cancelButtonText={Strings.text_cancel} 
                onOkPress={this.state.alertDetails.onOkPress}
                onCancelPress={async () => {
                  this.viewModel.set('alertDetails', undefined);
                }}
                shouldShowCancelButton={
                  this.state.alertDetails.shouldShowCancelButton
                }
              />
            ) : null}
            <View>
              <View
                style={{
                  height: 44,
                  backgroundColor: Colors.white,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                  
                <Image source={ImageAssets.search} style={{marginLeft: 11}} />
                <TextInput
                  placeholder={Strings.text_search}
                  style={styles.searchInput}
                  returnKeyType="search"
                  onChangeText={value => text => {}}
                  onSubmitEditing={event => {
                    this.props.navigation.navigate('Shop', {
                      screen: 'ShopComponent',
                      params: {
                        text: event.nativeEvent.text,
                      },
                    });
                  }}
                />
                {/* <TouchableOpacity
                                    onPress={() => {
                                        Keyboard.dismiss();
                                    }}>
                                    <Image source={ImageAssets.close} style={{ marginLeft: 11 }} />
                                </TouchableOpacity> */}
              </View>
              {this.props.route.params.tabItems &&
              this.props.route.params.tabItems.length > 0 ? (
                <CategiriesList
                  tabItems={this.props.route.params.tabItems}
                  getImageSource={item => {
                    for (let i = 0; i < item.custom_attributes.length; i++) {
                      if (
                        item.custom_attributes[i].attribute_code === 'image'
                      ) {
                        return `http://15.206.227.103/magento${
                          item.custom_attributes[i].value
                        }`;
                      } else if (i >= item.custom_attributes.length - 1) {
                        return 'default';
                      }
                    }
                  }}
                  onTabChange={index => {}}
                  onClickTabItem={(item, index) => {
                    this.props.navigation.navigate('Shop', {
                      screen: 'ShopComponent',
                      params: {
                        item,
                        index,
                        isUpdated: false,
                      },
                    });
                  }}
                />
              ) : null}
            </View>
            <View>
              <View style={[styles.imageView]}>
              <ImageZoom
                  cropWidth={Dimensions.get('window').width}
                  cropHeight={this.windowWidth > 600 ? 500 : 200}
                  imageWidth={Dimensions.get('window').width}
                  imageHeight={this.windowWidth > 600 ? 500 : 200}
                  style={{justifyContent: 'flex-end'}}>
                  {this.state.imageSrc === 'default' ? (
                    <ImageBackground
                      source={ImageAssets.egg_active}
                      style={{width: '100%', height: '100%'}}
                      imageStyle={{resizeMode: 'stretch'}}
                    />
                  ) : (
                    <ImageBackground
                      source={{
                        uri: productDescriptionParams.viewModel.getImageSource(
                          productDescriptionParams.product,
                        ),
                      }}
                      style={{width: '100%', height: '100%'}}
                      imageStyle={{resizeMode: 'stretch'}}
                    />
                  )}
                </ImageZoom>

                {/* <Image
                                    source={ImageAssets.zoom_image_icon}
                                    style={{ position: 'absolute', bottom: 0, right: 0 }}
                                /> */}
              </View>
              <View style={{backgroundColor: Colors.primary_background_color}}>
                <View
                  style={{
                    marginLeft: 10,
                    marginRight: 10,
                    marginTop: 11.34,
                    marginBottom: 30,
                  }}>
                  <Item
                    style={[
                      {justifyContent: 'space-between', borderBottomWidth: 0},
                    ]}>
                    <Item style={{borderBottomWidth: 0}}>
                      {/* <Image
                        source={ImageAssets.group}
                        style={{ height: 26, width: 26 }}
                      /> */}
                      <Text
                        style={[
                          styles.productName,
                          {marginLeft: 2.56, color: Colors.text_dark},
                        ]}
                        numberOfLines={2}>
                        {productDescriptionParams.product.name}
                      </Text>
                    </Item>
                    {/* <Item
                      style={[{alignSelf: 'flex-end', borderBottomWidth: 0}]}>
                      <Text style={[styles.likeText, {marginRight: 4.5}]}>
                        3 Likes
                      </Text>
                      <Image source={ImageAssets.favourites_icon_inactive} />
                    </Item> */}
                  </Item>
                  <Text style={[styles.descriptionText, {marginTop: 14}]}>
                    {productDescriptionParams.product.custom_attributes.filter(
                      (description: any) =>
                        description.attribute_code === 'description',
                    ).length > 0
                      ? productDescriptionParams.product.custom_attributes
                          .filter(
                            (description: any) =>
                              description.attribute_code === 'description',
                          )[0]
                          .value.replace(/<(.|\n)*?>/g, '')
                      : ''}
                  </Text>
                  <View style={[styles.subView, {flexDirection: 'row'}]}>
                    {/* <View style={styles.view}> */}
                    {/* <View style={styles.grossWeightView}>
                                            <View style={styles.grossView}>
                                                <Text style={[styles.likeText, { color: Colors.white }]}>Gross weight</Text>
                                                <Text style={[styles.grossWeightSubText, { color: Colors.white }]}>500gm <Image source={ImageAssets.gross_weight_down_arrow} style={{ paddingLeft: 7 }} /></Text>
                                            </View>
                                        </View>
                                        <View style={styles.piecesView}>
                                            <Text style={styles.likeText}>Pieces</Text>
                                            <Text style={styles.grossWeightSubText}>4-5</Text>
                                        </View>
                                        <View style={{ justifyContent: 'center', alignItems: 'center', paddingLeft: 37, paddingRight: 37 }}>
                                            <Text style={styles.likeText}>Serves</Text>
                                            <Text style={styles.grossWeightSubText}>2-3</Text>
                                        </View> */}
                    {productDescriptionParams.product &&
                    productDescriptionParams.product.options.length
                      ? productDescriptionParams.product.options.map(
                          (option, index) => {
                            return (
                              <View key={index} style={{marginRight: 15}}>
                                <DropDown
                                  item={option}
                                  viewModel={
                                    this.state.ProductOptionsViewModels[index]
                                  }
                                  default={this.getSelectedOptionValue}
                                  selectedDropdownValues={
                                    this.props.route.params
                                      .productDescriptionParams
                                      .getSelectedDropdownValues
                                  }
                                />
                              </View>
                            );
                          },
                        )
                      : null}
                    {/* </View> */}
                  </View>
                  <Item style={[styles.priceItem]}>
                    <Item style={{borderBottomWidth: 0}}>
                      <Text style={styles.price}>{Strings.text_price}</Text>
                      <Text style={[styles.priceText, {marginLeft: 11}]}>
                        ₹{this.props.route.params.productDescriptionParams.product.price}
                      </Text>
                    </Item>
                    {/* <Item style={[{ alignSelf: 'flex-end', borderBottomWidth: 0 }]}>
                                        <Text style={[styles.mediumCuts, { marginRight: 4.5 }]}>Medium Cuts</Text>
                                        <Image source={ImageAssets.shop_product_dropdown} />
                                    </Item> */}
                  </Item>
                  {productStatus !== 0 && productInStockQty !== 0 ? (
                    <Item style={styles.buttonItem}>
                      <TouchableOpacity
                        style={styles.button}
                        onPress={async () => {
                          await productDescriptionParams.addToCart();
                          await this.props.navigation.goBack();
                          // await this.props.navigation.jumpTo('Cart');
                          this.props.navigation.navigate('Cart', {
                            screen: 'CartComponent',
                          });
                        }}>
                        <Text style={[styles.buttonText]}>
                          {Strings.button_buyNow}
                        </Text>
                      </TouchableOpacity>
                      {qty > 0 ? (
                        <View
                          style={{
                            borderWidth: 1,
                            borderColor: Colors.primary_color,
                            flexDirection: 'row',
                            height: 34,
                            marginLeft: 18,
                          }}>
                          <TouchableOpacity
                            style={styles.signButton}
                            onPress={() => {
                              if(!this.state.isQtyUpdating)
                              this.productInCartAfterDecrease(
                                qty,
                              );
                            }}>
                               
                            <Text style={[styles.signText]}>
                              {Strings.button_decrease}
                            </Text>
                          </TouchableOpacity>
                          {this.state.isAdding ? (
                        <ActivityIndicator
                          size="small"
                          style={{paddingLeft: 12, paddingRight: 12}}
                          color={Colors.primary_color2}
                        />
                      ) : (
                          <Text
                            style={[
                              styles.grossWeightSubText,
                              {
                                paddingLeft: 10,
                                paddingRight: 10,
                                alignSelf: 'center',
                              },
                            ]}>
                            {qty}
                          </Text>
                      )}
                          <TouchableOpacity
                            style={styles.signButton}
                            onPress={() => {
                              this.addToCart();
                              this.isAddToCart()
                            }}>
                            <Text style={styles.signText}>
                              {Strings.button_increase}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      ) : this.state.isAdding ? (
                        <View style={[
                          styles.button,
                          {
                            marginLeft: 18,
                            backgroundColor: Colors.white,
                          },
                        ]}>
                        <ActivityIndicator
                          size="small"
                          style={{paddingLeft: 12, paddingRight: 12}}
                          color={Colors.primary_color}
                        />
                        </View>
                      ) : (
                        <TouchableOpacity
                          style={[
                            styles.button,
                            {
                              marginLeft: 18,
                              backgroundColor: Colors.white,
                            },
                          ]}
                          onPress={() => {
                            if (
                              productDescriptionParams.product.qty === undefined
                            ) {
                              this.addToCart(
                                productDescriptionParams.product,
                              );
                              // this.props.navigation.goBack()
                            } else {
                             this.addToCart();
                            }
                            this.isAddToCart()
                          }}>
                          <Text
                            style={[
                              styles.buttonText,
                              {
                                paddingLeft: 16,
                                paddingRight: 16,
                                color: Colors.primary_color,
                              },
                            ]}>
                            {Strings.button_add_toCart}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </Item>
                  ) : (
                    <Text
                      style={[
                        styles.productName,
                        {marginTop: 11, alignSelf: 'flex-end'},
                      ]}>
                      {Strings.text_out_of_stock}
                    </Text>
                  )}
                  {/* <View style={{flexDirection: 'row', marginTop: 20}}>
                    <AirbnbRating
                      isDisabled={true}
                      count={5}
                      selectedColor={Colors.primary_color}
                      showRating={false}
                      defaultRating={this.state.totalRatings}
                      size={25}
                    />
                    <Text
                      style={{fontSize: 18, marginTop: 4, marginLeft: 8}}>{`${
                      this.state.totalreviews
                    } Reviews`}</Text>
                  </View> */}
                </View>
              </View>
              {/* <View style={{ margin: 10 }}>
                <Tabs
                  tabContainerStyle={{
                    elevation: 0,
                  }}
                  style={{ shadowOpacity: 0, elevation: 0 }}
                  tabBarUnderlineStyle={{
                    backgroundColor: Colors.primary_color,
                    height: 1,
                  }}
                  onChangeTab={value => {
                    productDescriptionParams.viewModel.set(
                      'activeTab',
                      value.i,
                    );
                  }}>
                  <Tab
                    tabStyle={{ elevation: 0, shadowOpacity: 0 }}
                    heading={
                      <TabHeading
                        style={{ backgroundColor: Colors.white, elevation: 0 }}>
                        <Text
                          style={[
                            styles.tabHeader,
                            {
                              color:
                                this.state.activeTab === 0
                                  ? Colors.primary_color
                                  : Colors.text_Light,
                            },
                          ]}>
                          About the cuts
                        </Text>
                      </TabHeading>
                    }>
                    <View>
                      <Text style={[styles.descriptionText, { marginTop: 10 }]}>
                        Skinless whole chicken leg cut into large pieces with 2
                        whole drumsticks. Chicken leg tends to be extremely
                        succulent and moist when cooked, making this a great
                        choice to add to your curries and biryanis. Perfect for
                        a hearty meal for one.
                      </Text>
                      {this.state.isShowMore ? (
                        <TouchableOpacity
                          style={{ justifyContent: 'center', marginTop: 30 }}
                          onPress={() =>
                            productDescriptionParams.viewModel.set(
                              'isShowMore',
                              !this.state.isShowMore,
                            )
                          }>
                          <Text style={styles.showMore}>SHOW MORE</Text>
                        </TouchableOpacity>
                      ) : (
                          <View>
                            <Text style={[styles.cutStyle, { marginTop: 10 }]}>
                              Cut Styles
                          </Text>
                            <TouchableOpacity
                              style={{ justifyContent: 'center', marginTop: 30 }}
                              onPress={() =>
                                productDescriptionParams.viewModel.set(
                                  'isShowMore',
                                  !this.state.isShowMore,
                                )
                              }>
                              <Text style={styles.showMore}>SHOW LESS</Text>
                            </TouchableOpacity>
                          </View>
                        )}
                    </View>
                  </Tab>
                  <Tab
                    heading={
                      <TabHeading style={{ backgroundColor: Colors.white }}>
                        <Text
                          style={[
                            styles.tabHeader,
                            {
                              color:
                                this.state.activeTab === 1
                                  ? Colors.primary_color
                                  : Colors.text_Light,
                            },
                          ]}>
                          Sourcing
                        </Text>
                      </TabHeading>
                    }>
                    <Text style={[styles.descriptionText, { marginTop: 10 }]}>
                      Skinless whole chicken leg cut into large pieces with 2
                      whole drumsticks. Chicken leg tends to be extremely
                      succulent and moist when cooked, making this a great
                      choice to add to your curries and biryanis. Perfect for a
                      hearty meal for one.
                    </Text>
                  </Tab>
                </Tabs>
              </View> */}
              {/* <TouchableOpacity
                style={styles.exploreBlogView}
                onPress={() => {
                  this.props.navigation.navigate('Blog', {
                    screen: 'BlogComponent',
                    params: { categories: this.props.route.params.tabItems },
                  })
                }}>
                <Text style={styles.exploreBlog}>
                  EXPLORE BLOGS FOR THIS ITEM{' '}
                  <Image source={ImageAssets.red_arrow_icon_common} />
                </Text>
              </TouchableOpacity> */}

              {/*
              <View>
                <View style={{ flexDirection: "row", padding: 8 }}>
                  <Text>Customer Reviews</Text>
                  < Text>{`(${this.state.totalreviews})`}</Text>
                </View>
                {

                  this.state.userReviews && this.state.userReviews.length > 0 ? (

                    this.state.userReviews.map((user: any) => {

                      return (
                        <View style={{ marginVertical: 10, backgroundColor: "#F4F6F7", paddingBottom: 8, borderRadius: 8 }}>

                          <View style={{ flexDirection: "row", paddingLeft: 12, paddingRight: 12,marginVertical:10 }}>
                            <Text style={{ padding: 8, color: Colors.text_primary_light }}>{user.nickname}</Text>
                          </View>
                          <View style={{ marginLeft: 16, marginTop: -18, flexDirection: "row", }}>
                            <AirbnbRating
                              isDisabled={true}
                              count={5}
                              selectedColor={Colors.primary_color}
                              showRating={false}
                              defaultRating={user.rating.length > 0 ? JSON.parse(user.rating[1].value) : 0}
                              size={22}
                            />
                            <Text style={{ padding: 8, fontFamily: "Montserrat-Medium", color: Colors.text_primary_light }}>{user.rating[1].value}/5</Text>
                          </View>
                          <View style={{ flexDirection: "row", paddingLeft: 16, marginTop: 8, paddingRight: 16 }}>
                            <Text >{user.title}</Text>
                            <Text style={{ marginLeft: "auto", fontFamily: "Montserrat-Medium", fontSize: 14, color: Colors.text_primary_light }}>{this.dateUtils.format(
                              user.created_at,
                              'Do MMMM YYYY',
                            )}
              , {this.dateUtils.format(user.created_at, 'dddd')}{" "}{this.dateUtils.format(user.created_at, 'h:mm A')}</Text>
                          </View>
                          <View>
                            <Text style={{ paddingLeft: 16, marginTop: 5, fontFamily: "Montserrat-Medium", fontSize: 12, color: Colors.text_primary_light }}>{user.detail}</Text>
                          </View>
                        </View>
                      )
                    })
                  ) : (null)
                }

              </View>
               {
                // this.state.isLoggedIn == false ? (
                this.state.customerreview == false ? (
                  <View>
                    <TouchableOpacity onPress={() => {
                      this.setState({
                        customerreview: true,
                      });
                    }} style={{ backgroundColor: Colors.primary_color, width: 120, padding: 12, margin: 16 }}>
                      <Text style={{ color: Colors.white }}>Post A Review</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={{ padding: 12 }}>
                    <View style={{ flexDirection: "row", paddingLeft: 16, marginVertical: 8, paddingRight: 16 }}>
                      <Text style={{ paddingRight: 12 }}>Post Your Review :</Text>
                      <AirbnbRating
                        starContainerStyle={{ marginTop: -5 }}
                        count={5}
                        selectedColor={Colors.primary_color}
                        showRating={false}
                        defaultRating={0}
                        size={22}
                        onFinishRating={this.viewModel.changeRating}
                      />
                    </View>
                    <View style={{ paddingLeft: 12, paddingRight: 12, }}>
                      <TextInput
                        onChangeText={(value) => this.viewModel.set("nickname", value)}
                        style={{ borderWidth: 1, borderColor:"#ccc" , padding: 4,marginVertical:10 }}
                        placeholder="Your Nick name *"
                        keyboardType="default"
                      />
                      <TextInput
                        onChangeText={(value) => this.viewModel.set("review_title", value)}
                        style={{ borderWidth: 1, borderColor:"#ccc" , padding: 4,marginVertical:10  }}
                        placeholder="Review Title *"
                        keyboardType="default"
                      />
                      <TextInput
                        onChangeText={(value) => this.viewModel.set("review_detail", value)}
                        style={{ borderWidth: 1, borderColor:"#ccc" , padding: 4 ,marginVertical:10 }}
                        placeholder="Your Review *"
                        keyboardType="default"
                      />
                    </View>
                    <TouchableOpacity onPress={() => {
                      this.handleReviewSubmit()//save and check
                      this.setState({
                        customerreview: false,
                      });
                    }} style={{ backgroundColor: Colors.primary_color, width: 120, padding: 12, margin: 16 }}>
                      <Text style={{ color: Colors.white, textAlign: "center" }}>Post</Text>
                    </TouchableOpacity>
                  </View>
                )
                // ) : (null)

              } */}
              {recentProducts && recentProducts.length ? (
                <View
                  style={{backgroundColor: Colors.primary_background_color}}>
                  <View style={styles.peopleView}>
                    <Text
                      style={[
                        styles.tabHeader,
                        {marginTop: -10,padding:10, color: '#3A3333'},
                      ]}>
                      {Strings.text_recently_viewed}
                    </Text>
                    <FlatList
                      data={recentProducts}
                      keyExtractor={item => item.id.toString()}
                      horizontal={true}
                      renderItem={({item, index}) => (
                        <ProductItemComponent
                          key={`key-${index}-${item.sku}`}
                          item={item}
                          viewModel={item}
                          isAddToCart={this.isAddToCart}
                          addToWishList={this.viewModel.addToWishList}
                          navigateToProductPage={true}
                          isWished={this.state.favouriteProducts.find(
                            (catalog: any) => {
                              return item.id == catalog.product_id;
                            },
                          )}
                          listType="grid"
                          index={index}
                          navigation={this.props.navigation}
                          cartItems={this.props.cartItems}
                          inventoryItems={this.props.inventoryItems}
                          cartSummary={this.props.cartSummary}
                        />
                      )}
                    />
                  </View>
                </View>
              ) : null}
            
              {/* {this.state.relatedProducts &&
                this.state.relatedProducts.length ? (
                <View
                  style={{ backgroundColor: Colors.primary_background_color }}>
                  <View style={styles.peopleView}>
                    <Text
                      style={[
                        styles.tabHeader,
                        { marginTop: 20, color: '#3A3333' },
                      ]}>
                      {Strings.text_people_can_also_brought}
                    </Text>
                    <Carousel
                      sliderWidth={this.windowWidth}
                      itemWidth={this.windowWidth}
                      firstItem={0}
                      data={this.state.relatedProducts}
                      scrollEnabled={true}
                      layout={'default'}
                      renderItem={this._renderItem}
                      onSnapToItem={index => {
                        productDescriptionParams.viewModel.set(
                          'currentIndex',
                          index,
                        );
                      }}
                    />
                    <Pagination
                      dotsLength={this.state.relatedProducts.length}
                      activeDotIndex={this.state.currentIndex}
                      containerStyle={{ paddingVertical: 10 }}
                      dotStyle={{
                        width: 6,
                        height: 6,
                        borderRadius: 3,
                        marginHorizontal: 8,
                        marginBottom: 5,
                        backgroundColor: Colors.primary_color,
                      }}
                      inactiveDotOpacity={0.4}
                      inactiveDotScale={0.6}
                    />
                  </View>
                </View>
              ) : null} */}
            </View>
          </Content>
          {this.state.isLoading ? <Loader isTransperant={true} /> : null}
          {this.state.isAddToCart&&this.props.cartSummary?.items_qty>0&&
                (<Snackbar
                  visible={this.state.isAddToCart}
                  onDismiss={this.onDismissSnackBar}
                  duration={3000}
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
        </Container>
      );
    }
  }

  _renderItem = ({item, index}) => {
    return (
      <ProductItemComponent
        key={`key-${index}-${item.sku}`}
        item={item}
        viewModel={item}
        addToWishList={this.viewModel.addToWishList}
        listType="grid"
        index={index}
        cartItems={this.props.cartItems}
        inventoryItems={this.props.inventoryItems}
        cartSummary={this.props.cartSummary}
      />
    );
  };
  public addToCart = (isNewProductAddedordeleted?) => {
    const {productDescriptionParams} = this.props.route.params;
    let {sku,name,price,id} = productDescriptionParams.product
    const cartItem = {
      cartItem: {
        qty: 1,
        quote_id: 3,
        sku: sku,
        name: name,
        product_option: {
          extension_attributes: {
            custom_options: this.state.selectedOptionsValue,
          },
        },
        extension_attributes: {},
      },
    };
    let addToCartObject = {
      'currency': 'INR',
      'items': [{
          'quantity':1,
          'item_id':JSON.stringify(id),
          'item_name': name,
      }],
      'value':price
  };
    // if (this.props.addToCart) {
    this.viewModel.addToCart(cartItem, isNewProductAddedordeleted);
    this.viewModel.logAddtoCart(addToCartObject)
    // }
  };
  public productInCartAfterDecrease = qty => {
    const {productDescriptionParams} = this.props.route.params;
    let {sku,name,id,price} = productDescriptionParams.product
    const cartItem = {
      cartItem: {
        qty: qty - 1,
        quote_id: 84,
        sku: sku,
        name: name,
        product_option: {
          extension_attributes: {
            custom_options: this.state.selectedOptionsValue,
          },
        },
        extension_attributes: {},
      },
    };
    let addCartObject = {
      'currency': 'INR',
      'items': [{
          'quantity':qty-1,
          'item_id':JSON.stringify(id),
          'item_name': name,
      }],
      'value':price
  };
    this.viewModel.productInCartAfterDecrease(cartItem);
    this.viewModel.logAddtoCart(addCartObject,true);
  };
  protected _buildState() {
    if (this.viewModel) {
      return this.viewModel.getState();
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  imageView: {
    width: '100%',
    height: 185,
  },
  descriptionText: {
    color: Colors.text_primary_dark,
    fontFamily: 'Montserrat-Italic',
    fontSize: 14,
  },
  productName: {
    color: '#ec2f23',
    fontFamily: 'Montserrat-Bold',
    fontSize: 20,
  },
  likeText: {
    color: Colors.dark_gray,
    fontFamily: 'Montserrat-Bold',
    fontSize: 12,
  },
  price: {
    color: Colors.text_primary_dark,
    fontFamily: 'Montserrat-Italic',
    fontSize: 19.8,
  },
  priceText: {
    color: Colors.primary_color,
    fontFamily: 'Montserrat-Medium',
    fontSize: 23.4,
  },
  mediumCuts: {
    fontSize: 14,
    fontFamily: 'Montserrat-SemiBold',
    color: Colors.text_primary_light,
  },
  grossWeightSubText: {
    fontSize: 16,
    fontFamily: 'Montserrat-SemiBold',
    color: Colors.text_primary_light,
  },
  buttonText: {
    fontFamily: 'Montserrat-Black',
    fontSize: 14,
    color: Colors.white,
    paddingLeft: 30,
    paddingRight: 30,
  },
  button: {
    borderRadius: 12,
    padding: 12,
    height: 34,
    borderWidth: 1,
    borderColor: Colors.primary_color,
    backgroundColor: Colors.primary_color,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonItem: {
    alignSelf: 'center',
    borderBottomWidth: 0,
    marginTop: 16,
  },
  tabHeader: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 16,
  },
  cutStyle: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 18,
    color: Colors.text_primary_light,
  },
  subView: {
    marginLeft: 10,
    marginRight: 10,
    // alignItems: 'center',
    marginTop: 12,
  },
  view: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 100,
    height: 58,
    justifyContent: 'space-evenly',
  },
  grossWeightView: {
    backgroundColor: Colors.text_primary_light,
    flexDirection: 'row',
    borderTopLeftRadius: 100,
    borderBottomLeftRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  grossView: {
    paddingLeft: 18,
    paddingRight: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },
  piecesView: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 40,
    paddingRight: 39,
    borderRightWidth: 1,
  },
  priceItem: {
    justifyContent: 'space-between',
    borderBottomWidth: 0,
    marginTop: 12,
  },
  showMore: {
    color: Colors.primary_color,
    fontSize: 14,
    fontFamily: 'Montserrat-ExtraBold',
  },
  exploreBlog: {
    color: Colors.primary_color,
    fontSize: 14,
    fontFamily: 'Montserrat-ExtraBold',
    textDecorationLine: 'underline',
  },
  exploreBlogView: {
    justifyContent: 'center',
    marginTop: 20,
    marginLeft: 10,
  },
  peopleView: {
    marginLeft: 10,
    marginRight: 10,
    marginBottom: 59,
  },
  signButton: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.primary_color,
  },
  signText: {
    paddingLeft: 10,
    paddingRight: 10,
    color: Colors.white,
    fontSize: 16,
    fontFamily: 'Montserrat-Medium',
  },
  totalAmount: {
    color: Colors.primary_color,
    fontFamily: 'Muli-ExtraBold',
    fontSize: 14.95,
  },
  snackBarText:{
    fontFamily:'Montserrat-Medium',
    color:'#444444',
    marginHorizontal:20,
    fontSize:13
  },
  searchInput: {
    color: Colors.text_Light,
    fontFamily: 'Montserrat-Medium',
    fontSize: 12,
    marginLeft: 7,
    width: '83%',
  },
});
