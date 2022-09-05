import React from 'react';
import {Card, Container, Item} from 'native-base';
import {
  View,
  Image,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Modal,
  TouchableWithoutFeedback,
  Dimensions,
  Platform,
} from 'react-native';
import ImageAssets from '../../assets';
import {ComponentBase} from 'resub';
import {
  ProductItemState,
  ProductItemViewModel,
} from '../../view-madel/ProductItemViewModel';
import {useFocusEffect} from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Colors from '../../resources/Colors';
import {ModalPopUp} from '../common-components/ModalPopUp';
import {DropDown} from './DropDown';
import {DependencyInjector} from '../../dependency-injector/DependencyInjector';
import Strings from '../../resources/String';
import _ from 'lodash';
import AlertComponent from './Alert/Alert';
import {
  horizontalScale,
  verticalScale,
  moderateScale,
} from '../../resources/scaling';
import {StarIcon, RightAngledIcon} from '../../assets/icons/common_svg';
import {Rating, AirbnbRating} from 'react-native-ratings';
import {TapGestureHandler} from 'react-native-gesture-handler';

function FetchUserData({isLoggedIn}) {
  useFocusEffect(
    React.useCallback(() => {
      isLoggedIn();
    }, []),
  );

  return null;
}

const {width: viewportWidth, height: viewportHeight} = Dimensions.get('window');
export class ProductItemComponent extends ComponentBase<any, ProductItemState> {
  public windowWidth = Dimensions.get('window').width;
  public windowHeight = Dimensions.get('window').height;
  public map = new Map();
  public productDescriptionParams;
  public subscribe;
  public viewModel: ProductItemViewModel;
  productOptionsViewModels: any = [];

  constructor(props) {
    super(props);
    this.viewModel = DependencyInjector.default().provideProductItemViewModel();
  }
  async componentDidMount() {
    this.setDefaultDropdownValues();
    this.viewModel.loadData(this.props.isWished);
    this.productDescriptionParams = {
      product: this.props.item,
      viewModel: this.viewModel,
      getSelectedDropdownValues: this.getSelectedDropdownValues,
      addRelatedProductToCart: this.props.addToCart,
      decreaseQuantityForRelatedProducts: this.props.productInCartAfterDecrease,
      productOptionsViewModels: this.state.ProductOptionsViewModels,
      addToCart: this.addToCart,
      productInCartAfterDecrease: this.productInCartAfterDecrease,
    };
    // await this.viewModel.getUserReviews(this.props.item.id);
    // await this.calculateRatings();
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
  componentDidUpdate(prevState, prevProps) {
    if(prevProps.cartItems.length!==this.props.cartItems.length){
      if(!this.state.item_id){
      this.viewModel.setItemId(this.props.item?.sku, this.props.cartItems);}
     }
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
      this.viewModel.set('alertDetails', alert);

      this.viewModel.clearError();
    }
  }
  _doApiCall = () => {
    this.viewModel.set('isLoading', true);
    this.viewModel
      .loadData(this.props.item.id)
      .then(() => this.viewModel.set('isLoading', false));
  };
  getProductName = name => {
    if (name.includes('-')) {
      const productName = name.split('-');
      return productName[0];
    }
    return name;
  };

  render() {
    this.props.item.totalPrice = this.state.price;
    const qty = this.getQuantity(this.state.selectedSku);
    const inventoryItems = this.props.inventoryItems
      ? this.props.inventoryItems
      : [];
    let productInStockQty = 0;    
    let productStatus = 0;
    inventoryItems.map((inventory: any) => {
      if (inventory.sku === this.props.item.sku) {
        productInStockQty = inventory.quantity;
        productStatus = inventory.status;
      }
    });
    return (
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => {
          if (this.props.navigateToProductPage) {
            this.props.navigation.navigate('ProductDescription', {
              productDescriptionParams: this.productDescriptionParams,
              tabItems: this.props.tabItems,
              key: Math.random() * 100,
            });
          }
        }}>
        <FetchUserData isLoggedIn={this.viewModel.isUserLoggedIn} />
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
              this.props.route.params.productDescriptionParams.viewModel.set(
                'alertDetails',
                undefined,
              );
            }}
            shouldShowCancelButton={
              this.state.alertDetails.shouldShowCancelButton
            }
          />
        ) : null}

        {this.state.showLoginModal ? (
          <ModalPopUp
            buttonText1={Strings.button_login}
            buttonText2={Strings.button_signUp}
            title={Strings.text_add_favourites}
            question={Strings.text_add_favourites_login_confirm}
            closeModal={() => {
              this.viewModel.set('showLoginModal', false);
            }}
            onPress={async (isLogin, data) => {
              this.viewModel.set('showLoginModal', false);
              this.props.navigation.navigate('Login', {isLogin, data});
            }}
          />
        ) : null}
        {this.props.listType === 'grid' && (
           <Card
           style={[
             // styles.cardStyle, { width: "100%" },
             styles.cardStyle,
             {
               width:
                 viewportWidth < 450
                   ? horizontalScale(this.windowWidth / 2.45)
                   : horizontalScale(this.windowWidth / 6.5),
             },
             // { opacity: productStatus !== 0 && productInStockQty !== 0 ? 1 : 0.8 },
             // , height: verticalScale(220)
           ]}>
            <View style={{flex: 1, backgroundColor: Colors.white}}>
              <Item
                style={[
                  styles.bottonBorderWidthZero,
                  {
                    width: '100%',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  },
                ]}>
                <Text
                  numberOfLines={2}
                  style={[
                    styles.productNameText,
                    {color: Colors.text_primary_dark, width: '70%', height: 30},
                  ]}>
                  {/* {this.getProductName(this.props.item.name)} */}
                  {this.props.item.name}
                </Text>
                <View style={{width: '15%', marginTop: -10}}>
                  {this.props.isWished ? (
                    <View style={{}}>
                      <Image
                        source={ImageAssets.favourites_icon_active
                        }
                      />
                    </View>
                  ) : this.state.fav == false ? (
                    <TouchableOpacity
                      onPress={() => {
                        if (this.state.isLoggedIn || this.props.isLoggedIn) {
                          this.addToWishList();
                        } else {
                          this.viewModel.set('showLoginModal', true);
                        }
                      }}>
                      <Image
                        source={ImageAssets.favourites_icon_inactive}
                        style={{height: 16, width: 16}}
                      />
                    </TouchableOpacity>
                  ) : (
                    <View>
                      <Image
                        source={ImageAssets.favourites_icon_active}
                        style={{height: 16, width: 16}}
                      />
                    </View>
                  )}
                </View>
              </Item>
              <View style={{height: verticalScale(80), marginTop: 7}}>
                <Image
                  source={{
                    uri: this.viewModel.getImageSource(this.props.item),
                  }}
                  style={styles.imageStyle}
                />
              </View>
              {/* <Text style={styles.descriptionText} numberOfLines={2}>
                            {this.props.item.custom_attributes.filter(
                                (description: any) =>
                                    description.attribute_code === 'short_description',
                            ).length > 0
                                ? this.props.item.custom_attributes.filter(
                                    (description: any) =>
                                        description.attribute_code === 'short_description',
                                )[0].value
                                : ''}
                        </Text> */}
              {/* <View
                style={{
                  height: 0.6,
                  marginTop: 4,
                  marginBottom: 2,
                  backgroundColor: Colors.text_Light,
                }}
              />

              {/* <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                }}>
                <View style={{flexDirection: 'row'}}>
                  <AirbnbRating
                    isDisabled={true}
                    count={5}
                    selectedColor={Colors.primary_color}
                    showRating={false}
                    defaultRating={this.state.totalRatings}
                    size={10}
                    starContainerStyle={{width: '60%'}}
                  /> */}
              {/* <StarIcon width={10} height={10} />
                                <StarIcon width={10} height={10} />
                                <StarIcon width={10} height={10} />
                                <StarIcon width={10} height={10} />
                                <StarIcon width={10} height={10} /> */}
              {/* </View> */}

              {/* <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '40%',
                  }}>
                  <Text numberOfLines={1} style={{fontSize: 10}}>{`${
                    this.state.totalreviews
                  } Reviews`}</Text>
                  <RightAngledIcon width={10} height={8} fill={'#777777'} />
                </View> */}
              {/* </View> */}

              {/* <View
                style={{
                  height: 0.6,
                  marginTop: 4,
                  marginBottom: 2,
                  backgroundColor: Colors.text_Light,
                }}
              /> */}

              {/* <Text style={{ fontSize: 12, color: '#555555', fontFamily: 'Montserrat-Medium', }}>
                            500 ml
                        </Text> */}

              <View style={{marginTop: 16}}>
                <Item
                  style={[
                    styles.bottonBorderWidthZero,
                    {justifyContent: 'space-between'},
                  ]}>
                  <View>
                    <View>
                      {this.props.item.options && this.props.item.options.length
                        ? this.props.item.options.map((option, index) => {
                            return (
                              <DropDown
                                key={index}
                                item={option}
                                default={this.getSelectedOptionValue}
                                selectedDropdownValues={
                                  this.getSelectedDropdownValues
                                }
                                viewModel={
                                  this.state.ProductOptionsViewModels[index]
                                }
                              />
                            );
                          })
                        : null}
                    </View>
                    <Text style={[styles.priceText]}>₹{this.state.price}</Text>
                  </View>

                  {productStatus !== 0 && productInStockQty !== 0 ? (
                    qty > 0 ? (
                      <View
                        style={{
                          borderWidth: 1,
                          borderColor: Colors.primary_color,
                          flexDirection: 'row',
                        }}>
                        <LinearGradient
                          start={{x: 0, y: 0}} end={{x: 1, y: 0}} 
                        colors={Colors.add_button_gradient}
                          style={styles.signButton}>
                          <TouchableOpacity
                            onPress={() => {
                              if(this.state.isQtyUpdated)
                              this.productInCartAfterDecrease(qty);
                            }}>
                            <Text style={[styles.signText]}>
                              {Strings.button_decrease}
                            </Text>
                          </TouchableOpacity>
                        </LinearGradient>
                        {this.state.isLoading ? (
                          <ActivityIndicator
                            size="small"
                            style={{paddingLeft: 12, paddingRight: 12}}
                            color={Colors.primary_color}
                          />
                        ) : (
                          <Text style={styles.quantity}>{qty}</Text>
                        )}
                        <LinearGradient
                          start={{x: 0, y: 0}} end={{x: 1, y: 0}} 
                        colors={Colors.add_button_gradient}
                          style={styles.signButton}>
                          <TouchableOpacity
                            onPress={() => {
                              // this.props.viewModel.set('quantity', this.state.quantity + 1)
                              this.addToCart();
                              this.props.isAddToCart();
                            }}>
                            <Text style={styles.signText}>
                              {Strings.button_increase}
                            </Text>
                          </TouchableOpacity>
                        </LinearGradient>
                      </View>
                    ) : this.state.isLoading ? (
                      <ActivityIndicator
                        size="small"
                        style={{paddingLeft: 12, paddingRight: 12}}
                        color={Colors.primary_color}
                      />
                    ) : (
                      <LinearGradient
                        start={{x: 0, y: 0}} end={{x: 1, y: 0}} 
                        colors={Colors.add_button_gradient}
                        style={styles.buttonStyle}>
                        <TouchableOpacity
                          onPress={() => {
                            // this.props.viewModel.set('quantity', 1)
                            this.addToCart(true);
                            this.props.isAddToCart();
                          }}>
                          <Text style={styles.buttonText}>
                            {Strings.button_add}
                          </Text>
                        </TouchableOpacity>
                      </LinearGradient>
                    )
                  ) : (
                    <Text style={styles.productNameText}>
                      {Strings.button_outOfStock}
                    </Text>
                  )}
                </Item>
              </View>
            </View>
          </Card>
        )}
        {this.props.listType === 'list' && (
          <View
            style={{
              margin: 8,
              padding: 12,
              backgroundColor: '#fbfbfb',
              borderRadius: 8,
            }}>
            <View style={{flexDirection: 'row', width: '100%'}}>
              <Image
                source={{uri: this.viewModel.getImageSource(this.props.item)}}
                style={{height: 80, width: '30%', resizeMode: 'cover'}}
              />

              <View
                style={{flexDirection: 'row', width: '64%', paddingLeft: 8}}>
                <Text
                  numberOfLines={1}
                  style={[
                    styles.productNameText,
                    {color: Colors.text_primary_dark, width: '70%'},
                  ]}>
                  {this.props.item.name}
                </Text>
                {this.props.wishId && (
                  <TouchableOpacity
                    style={{
                      marginTop: -3,
                      alignItems: 'flex-start',
                      width: '31%',
                    }}
                    onPress={() => {
                      this.removeWishListItems(
                        this.props.item.id,
                        this.props.wishId,
                      );
                    }}>
                    <Text style={{color: '#f9643b'}}>Clear</Text>
                  </TouchableOpacity>
                )}
              </View>

              {this.props.wishId || this.props.isWished ? (
                <View style={{width: '34%'}}>
                  <Image source={ImageAssets.favourites_icon_active} />
                </View>
              ) : (
                <View style={{width: '5%', marginStart: '0%'}}>
                  {this.state.fav == false ? (
                    <TouchableOpacity
                      onPress={() => {
                        if (this.state.isLoggedIn || this.props.isLoggedIn) {
                          this.addToWishList()
                        } else {
                          this.viewModel.set('showLoginModal', true);
                        }
                      }}>
                      <Image
                        source={ImageAssets.favourites_icon_inactive}
                        style={{height: 16, width: 16}}
                      />
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      onPress={() => {
                        // this.setState({
                        //     fav: false
                        // })
                      }}>
                      <Image
                        source={ImageAssets.favourites_icon_active}
                        style={{height: 16, width: 16}}
                      />
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>
            <View style={{flexDirection: 'row', width: '100%', marginTop: 10}}>
              <View style={{width: '35%', flexDirection: 'row'}}>
                {/* <AirbnbRating
                  isDisabled={true}
                  count={5}
                  selectedColor={Colors.primary_color}
                  showRating={false}
                  defaultRating={this.state.totalRatings}
                  size={10}
                  starContainerStyle={{width: '60%'}}
                /> */}
                {/* <View style={{marginLeft: 12, top: 3}}>
                  <RightAngledIcon width={10} height={8} fill={'#777777'} />
                </View> */}
              </View>
              <Text style={{marginTop: -30, width: '35%', color: '#f9643b'}}>
                ₹{this.props.item.price}
              </Text>
              <View style={{marginTop: -25}}>
                {productStatus !== 0 && productInStockQty !== 0 ? (
                  qty > 0 ? (
                    <View
                      style={{
                        borderWidth: 1,
                        borderColor: Colors.primary_color,
                        flexDirection: 'row',
                      }}>
                      <LinearGradient
                        start={{x: 0, y: 0}} end={{x: 1, y: 0}} 
                        colors={Colors.add_button_gradient}
                        style={styles.signButton}>
                        <TouchableOpacity
                          onPress={() => {
                            if(this.state.isQtyUpdated)
                            this.productInCartAfterDecrease(qty);
                          }}>
                          <Text style={[styles.signText]}>
                            {Strings.button_decrease}
                          </Text>
                        </TouchableOpacity>
                      </LinearGradient>
                      {this.state.isLoading ? (
                        <ActivityIndicator
                          size="small"
                          style={{paddingLeft: 12, paddingRight: 12}}
                          color={Colors.primary_color2}
                        />
                      ) : (
                        <Text style={styles.quantity}>{qty}</Text>
                      )}
                      <LinearGradient
                        start={{x: 0, y: 0}} end={{x: 1, y: 0}} 
                        colors={Colors.add_button_gradient}
                        style={styles.signButton}>
                        <TouchableOpacity
                          style={styles.signButton}
                          onPress={() => {
                            // this.props.viewModel.set('quantity', this.state.quantity + 1)
                            this.addToCart();
                            this.props.isAddToCart();
                          }}>
                          <Text style={styles.signText}>
                            {Strings.button_increase}
                          </Text>
                        </TouchableOpacity>
                      </LinearGradient>
                    </View>
                  ) : this.state.isLoading ? (
                    <ActivityIndicator
                      size="small"
                      style={{paddingLeft: 12, paddingRight: 12}}
                      color={Colors.primary_color}
                    />
                  ) : (
                    <LinearGradient
                      start={{x: 0, y: 0}} end={{x: 1, y: 0}} 
                        colors={Colors.add_button_gradient}
                      style={styles.buttonStyle}>
                      <TouchableOpacity
                        onPress={() => {
                          // this.props.viewModel.set('quantity', 1)
                          this.addToCart(true);
                          this.props.isAddToCart();
                        }}>
                        <Text style={styles.buttonText}>
                          {Strings.button_add}
                        </Text>
                      </TouchableOpacity>
                    </LinearGradient>
                  )
                ) : null
                //   <Text style={styles.productNameText}>
                //     {Strings.button_outOfStock}
                //   </Text>
                }
              </View>
            </View>
          </View>
        )}
      </TouchableOpacity>
    );
  }

  public setDefaultDropdownValues = async () => {
    let selectedSku = this.props.item.sku;
    let price = this.props.item.price;
    const selectedOptionsValue: any = [];
    const cartSummary = this.props.cartSummary
      ? this.props.cartSummary.items
      : [];
    let value;

    if (this.props.item.options && this.props.item.options.length) {
      if (cartSummary && cartSummary.length) {
        value = _.find(
          cartSummary,
          (cartItem: any) => cartItem.name == this.props.item.name,
        );
      }
      if (value) {
        const item = _.find(
          this.props.cartItems,
          (cartItem: any) => cartItem.item_id == value.item_id,
        );
        const selectedOptionsValues =
          item.product_option &&
          item.product_option.extension_attributes &&
          item.product_option.extension_attributes.custom_options &&
          item.product_option.extension_attributes.custom_options.length
            ? item.product_option.extension_attributes.custom_options
            : [];
        selectedSku = item.sku;
        for (const selectedOptionsvalue of selectedOptionsValues) {
          selectedOptionsValue.push({
            // tslint:disable-next-line: radix
            optionId: parseInt(selectedOptionsvalue.option_id),
            // tslint:disable-next-line: radix
            optionValue: parseInt(selectedOptionsvalue.option_value),
          });
        }
        price = value.price;
      } else {
        for (const option of this.props.item.options) {
          this.map.set(option.option_id, option.values[0].option_type_id);
          if (option.values[0].sku) {
            selectedSku += `-${option.values[0].sku}`;
          }
          if (option.values[0].price_type === 'fixed') {
            price += option.values[0].price;
          } else {
            const priceValue =
              (option.values[0].price * this.props.item.price) / 100;
            price += priceValue;
          }
        }

        for (const [key, value] of this.map.entries()) {
          selectedOptionsValue.push({
            optionId: key,
            optionValue: value,
          });
        }
        // this.viewModel.getProductOptionsViewModel(this.props.item)
      }
    }
    const quantity = await this.getQuantity(selectedSku);
    this.viewModel.setMany({
      selectedSku,
      selectedOptionsValue,
      quantity,
      price,
    });
    // this.viewModel.getProductOptionsViewModel(value ? value : this.props.item)
    this.viewModel.setItemId(selectedSku, this.props.cartItems);
  };

  public getSelectedDropdownValues = async (title, item) => {
    let selectedSku = this.props.item.sku;
    let price = this.props.item.price;

    const selectedOptionsValue = this.state.selectedOptionsValue.map(
      (option, index) => {
        if (item.option_id == option.optionId) {
          for (const value of item.values) {
            if (value.title === title) {
              option.optionValue = value.option_type_id;
            }
          }
        }
        const optionValue = this.getSku(option);
        selectedSku += `-${optionValue.sku}`;
        if (optionValue.price_type === 'fixed') {
          price += optionValue.price;
        } else {
          const priceValue = (optionValue.price * this.props.item.price) / 100;
          price += priceValue;
        }
        return option;
      },
    );
    const quantity = await this.getQuantity(selectedSku);
    this.viewModel.setMany({
      selectedSku,
      selectedOptionsValue,
      quantity,
      price,
    });
    this.viewModel.setItemId(selectedSku, this.props.cartItems);
  };

  private getSku = ({optionId, optionValue}) => {
    const product_option = this.getOptions(optionId);
    const optionvalue = this.getOptionValue(optionValue, product_option.values);
    return optionvalue;
  };

  private getOptions = optionId => {
    for (const option of this.props.item.options) {
      if (option.option_id === optionId) {
        return option;
      }
    }
  };

  private getOptionValue = (valueId, optionValues) => {
    for (const value of optionValues) {
      if (value.option_type_id === valueId) {
        return value;
      }
    }
  };
  private removeWishListItems = async (productId: any, wishId: any) => {
    this.props.model.removeWishListItems(productId, wishId);
  };
  private getSelectedOptionValue = (option: any) => {
    const selectedOptionsValue = _.find(
      this.state.selectedOptionsValue,
      (selectedValue: any) => selectedValue.optionId === option.option_id,
    );
    return selectedOptionsValue
      ? selectedOptionsValue.optionValue
      : option.values[0].option_type_id;
  };

  public getQuantity(selectedSku) {
    const cartItems = this.props.cartItems;
    let qty = 0;
    if (cartItems && cartItems.length) {
      for (const cartItem of cartItems) {
        if (cartItem.sku === selectedSku) {
          qty = cartItem.qty;
          break;
        }
      }
    }
    return qty;
  }

  public addToCart = (isNewProductAddedordeleted?) => {
    const cartItem = {
      cartItem: {
        qty: 1,
        quote_id: 3,
        sku: this.props.item.sku,
        name: this.props.item.name,
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
          'item_id': JSON.stringify(this.props.item.id),
          'item_name': this.props.item.name,
      }],
      'value': this.props.item.price
  };
      this.viewModel.addToCart(cartItem, isNewProductAddedordeleted);
      this.viewModel.logAddtoCart(addToCartObject)
  
  };
  public addToWishList(){
    let wishedObject = {
      'currency': 'INR',
      'items': [{
          'quantity':1,
          'item_id': JSON.stringify(this.props.item.id),
          'item_name': this.props.item.name
      }],
      'value': this.props.item.price
      };  
      this.viewModel.set("fav",true)
      this.props.addToWishList(this.props.item.id)
      this.viewModel.logWishlist(wishedObject)
  }
  public productInCartAfterDecrease = qty => {
    const cartItem = {
      cartItem: {
        qty: qty - 1,
        quote_id: 84,
        sku: this.state.selectedSku,
        name: this.props.item.name,
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
          'item_id': JSON.stringify(this.props.item.id),
          'item_name': this.props.item.name,
      }],
      'value': this.props.item.price
  };
    this.viewModel.productInCartAfterDecrease(cartItem);
    this.viewModel.logAddtoCart(addToCartObject,true)
  };
  protected _buildState() {
    return this.viewModel.getState();
  }
}

export class ProductItemInsideCartComponent extends ComponentBase<any, any> {
  constructor(props) {
    super(props);
    this.state = {
      isAddPressed: false,
    };
  }

  render() {
    return (
      <Card style={{borderRadius: 14}}>
        <View>
          <Item style={{borderBottomWidth: 0}}>
            <View style={{padding: 7, overflow: 'hidden'}}>
              <Image
                source={{
                  uri: `https://prodbackend.chopserve.com/pub/media/catalog/product/${
                    this.props.item.media_gallery_entries[0].file
                  }`,
                }}
                style={{
                  resizeMode: 'stretch',
                  height: 46,
                  width: 46,
                  borderRadius: 14,
                }}
              />
            </View>
            <View style={{margin: 6}}>
              <Item style={{borderBottomWidth: 0}}>
                <Image
                  source={ImageAssets.group}
                  style={{height: 8.4, width: 8.4, marginRight: 4}}
                />
                <Text
                  style={{
                    fontSize: 10,
                    fontFamily: 'Montserrat-Bold',
                    color: Colors.text_primary_dark,
                  }}>
                  {this.props.item.name}
                </Text>
              </Item>
              <Item
                style={{
                  borderBottomWidth: 0,
                  justifyContent: 'space-between',
                  marginTop: 15,
                }}>
                <Text
                  style={{
                    fontSize: 13.2,
                    fontFamily: 'Montserrat-Medium',
                    color: Colors.price_text,
                    marginRight: 15,
                  }}>
                  {/* ₹{this.props.item.price} */}
                </Text>
                <TouchableOpacity
                  style={{
                    height: 20,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                  onPress={() => {
                    this.setState({
                      ...this.state,
                      isAddPressed: true,
                    });
                  }}>
                  <Text style={styles.AddButton}>{Strings.button_add}</Text>
                </TouchableOpacity>
              </Item>
            </View>
          </Item>
        </View>
        {this.state.isAddPressed ? (
          <Modal
            transparent={true}
            animationType={'fade'}
            onRequestClose={() => {
              this.setState({...this.state, isAddPressed: false});
            }}>
            <TouchableWithoutFeedback
              onPress={() => {
                this.setState({...this.state, isAddPressed: false});
              }}
              style={{alignItems: 'center'}}>
              <View
                style={{
                  flex: 1,
                  backgroundColor: 'rgba(73,69,69,0.81)',
                  justifyContent: 'center',
                }}>
                <View style={{backgroundColor: Colors.white}}>
                  <View style={{marginBottom: 10}}>
                    <TouchableOpacity
                      style={{
                        alignSelf: 'flex-end',
                        marginRight: 10,
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: 40,
                      }}
                      onPress={() => {
                        this.setState({...this.state, isAddPressed: false});
                      }}>
                      <Image source={ImageAssets.cross} />
                    </TouchableOpacity>
                    <ProductItemComponent
                      key={`key-${this.props.item.sku}`}
                      item={this.props.item}
                      listType="grid"
                      cartItems={this.props.cartItems}
                      navigation={this.props.navigation}
                      inventoryItems={this.props.inventoryItems}
                      cartSummary={this.props.cartSummary}
                    />
                  </View>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </Modal>
        ) : null}
      </Card>
    );
  }
}

const styles = StyleSheet.create({
  cardStyle: {
    padding: 12,
    borderRadius: 10,
    elevation:5,
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowRadius:5,
    shadowOpacity:0.2
  },
  bottonBorderWidthZero: {borderBottomWidth: 0},
  buttonStyle: {
    height: 23,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 6,
  },
  imageStyle: {
    width: '100%',
    height: '100%',
    resizeMode: 'stretch',
  },
  productNameText: {
    color: '#ec2f23',
    fontFamily: 'Montserrat-Bold',
    fontSize: moderateScale(9),
  },
  likeText: {
    color: Colors.dark_gray,
    fontFamily: 'Montserrat-Bold',
    fontSize: 8.4,
  },
  descriptionText: {
    color: Colors.dark_gray,
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 9.1,
  },
  mediumCuts: {
    color: Colors.text_primary_light,
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 12,
  },
  buttonText: {
    color: Colors.white,
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 13,
    paddingLeft: Dimensions.get('window').width / 15,
    paddingRight: Dimensions.get('window').width / 15,
  },
  priceText: {
    color: Colors.primary_color,
    fontFamily: 'Montserrat-Medium',
    fontSize: 15.4,
  },
  signButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantity: {
    fontSize: 14.8,
    fontFamily: 'Montserrat-SemiBold',
    color: Colors.primary_color2,
    paddingLeft: Dimensions.get('window').width / 45,
    paddingRight: Dimensions.get('window').width / 45,
  },
  signText: {
    paddingLeft: Dimensions.get('window').width / 45,
    paddingRight: Dimensions.get('window').width / 45,
    color: Colors.white,
    fontSize: 12.6,
    fontFamily: 'Montserrat-Medium',
  },
  AddButton: {
    color: Colors.add_button_text,
    fontFamily: 'Montserrat-Black',
    fontSize: 10,
  },
});
