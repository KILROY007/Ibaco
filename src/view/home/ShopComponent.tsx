import React from 'react';
import {
  TouchableOpacity,
  View,
  StyleSheet,
  Keyboard,
  SafeAreaView,
  Image,
  Platform,
  Dimensions,
  TextInput,
  Linking,
  RefreshControl,
  Alert,
  ImageBackground,
  FlatList,
} from 'react-native';
import { ComponentBase } from 'resub';
import { useFocusEffect } from '@react-navigation/native';
import { Container, Text, Item, Content } from 'native-base';
import Carousel, { Pagination } from 'react-native-snap-carousel';
import { Snackbar } from 'react-native-paper';
import { DependencyInjector } from '../../dependency-injector/DependencyInjector';
import ImageAssets from '../../assets';
import { ProductItemComponent } from '../common-components/ProductItemComponent';
import {
  CategoriesViewModel,
  CategoriesState,
} from '../../view-madel/CategoriesViewModel';
import { Loader } from '../common-components/Loader';
import ModalDropdown from '../../view/components/react-native-modal-dropdown';
import { Retry } from '../common-components/Retry';
import Colors from '../../resources/Colors';
import { CategiriesList } from './shop/CategiriesList';
import _ from 'lodash';
import AsyncStorage from '@react-native-community/async-storage';
import AlertComponent from '../common-components/Alert/Alert';
import Strings from '../../resources/String';
import Constants from '../../resources/constants';
import LinearGradient from 'react-native-linear-gradient';
import VersionCheck from 'react-native-version-check';

function FetchUserData({ doApiCall, isFocusableOrNot }) {
  useFocusEffect(
    React.useCallback(() => {
      isFocusableOrNot().then(res => {
        if (res) doApiCall();
      });
    }, []),
  );

  return null;
}

const windowWidth1 = Dimensions.get('window').width;

export class ShopComponent extends ComponentBase<any, CategoriesState> {
  private windowWidth = Dimensions.get('window').width;
  public viewModel: CategoriesViewModel;
  tabView: any;
  ref: any;
  subcatRed:any;
  viewabilityConfig: any;
  constructor(props: any) {
    super(props);
    this.viewModel = DependencyInjector.default().provideCategoriesViewModel();
    this.handleViewableItemsChanged = this.handleViewableItemsChanged.bind(
      this,
    );
    this.viewabilityConfig = { viewAreaCoveragePercentThreshold: 50 };
  }
  async componentDidMount() {
    VersionCheck.needUpdate()
      .then(async res => {
        if (res.isNeeded) {
          this.viewModel.set("isNewUpdateAvailable", true)
          this.viewModel.set("storeUrl", res.storeUrl)
        }
      });
    await this.viewModel.loadData();
    this.viewModel.getCategories(true);
    await this.viewModel.loadFavourites();

    const orderId: any = await AsyncStorage.getItem('OrderId');
    if (orderId) {
      await this.viewModel.getOrderTrackingUpdate(JSON.parse(orderId));
    }
    const oStatus: any = await AsyncStorage.getItem('OrderResponse');
    this.viewModel.set('orderStatus', JSON.parse(oStatus));
  }
  _doApiCall = () => {
    this.viewModel.set('isLoading', true);
    this.viewModel
      .loadFavourites()
      .then(() => this.viewModel.set('isLoading', false));
  };
  handleViewableItemsChanged(info) {
    this.viewModel.set(
      'scrollToIndex',
      info.viewableItems[info.viewableItems.length - 1].index + 1,
    );
  }

  _renderItem = ({ item, index }) => {
    return (
      <TouchableOpacity
        key={item.slug}
        activeOpacity={1}
        onPress={() => { }}
        style={[styles.bannerImageHolder, { justifyContent: 'center' }]}>
        <ImageBackground
          // source={item.thumbnail ? { uri: item.thumbnail } : ImageAssets.carousel}
          source={ item}

          style={styles.bannerImage}
          imageStyle={{ resizeMode: 'stretch' }}
        />
        {/* <View style={styles.offerView}>
                    <View style={{ padding: item.text || item.offer || item.sub_text ? 8 : 0, paddingLeft: item.text || item.offer || item.sub_text ? 8 : 0, paddingRight: item.text || item.offer || item.sub_text ? 8 : 0, flexDirection: 'row' }}> */}
        {/* <View style={{ marginRight: item.text || item.offer || item.sub_text ? 15 : 0 }}>
                            <Text style={[styles.offerHeaderText, { overflow: 'hidden', width: item.text ? 200 : 0 }]} numberOfLines={2}>{item.text}</Text>
                            <Text style={styles.offerText}>{item.offer}</Text>
                            <Text style={styles.offerSubText}>{item.sub_text}</Text>
                        </View> */}
        {/* {item.url ? <TouchableOpacity
                            style={styles.offerButton}
                            onPress={() => {
                                if (item.categorycode) {
                                    const value = _.find(
                                        this.state.tabItems,
                                        (tab: any) => {
                                            const custom_attribute = _.find(
                                                tab.value.custom_attributes,
                                                (attribute: any) => attribute.attribute_code === 'category_code' && attribute.value == item.categorycode ,
                                            )
                                            return custom_attribute
                                        },
                                    )
                                    value && this.onTabChange(value.id)
                                    value && this.onClickTabItem(value.value)
                                }
                            }}
                        > */}
        {/* <Text
                                style={[
                                    styles.offerSubText,
                                    { paddingLeft: 5, paddingRight: 5, color: Colors.white },
                                ]}>
                                {item.url.title ? item.url.title : 'Click here'}
                //             </Text> */}
        {/*         </TouchableOpacity> : null} */}
        {/*      </View> */}
        {/* </View> */}
      </TouchableOpacity>
    );
  };

  async componentWillReceiveProps(newprops) {
    if (newprops.route.params && newprops.route.params.item) {
      if (this.state.categoryId !== newprops.route.params.item.id) {
        this.onTabChange(newprops.route.params.index);
        this.onClickTabItem(newprops.route.params.item);
        this.props.navigation.setParams({ item: undefined, index: undefined });
      }
    }
    if (newprops.route.params && newprops.route.params.text) {
      this.viewModel.set('searchKey', newprops.route.params.text);
      const tabItem = _.find(this.state.tabItems, (tab: any) => {
        if (tab.isActive === true) {
          return tab;
        }
      });
      tabItem ? (tabItem.isActive = false) : null;
      this.viewModel.getAllProducts(newprops.route.params.text);
      this.props.navigation.setParams({ text: undefined });
    }
    if (newprops.route.params && newprops.route.params.isUpdated) {
      this.checkForOrderId();
    }
  }

  public async checkForOrderId() {
    const orderId: any = await AsyncStorage.getItem('OrderId');
    if (orderId) {
      await this.viewModel.getOrderTrackingUpdate(JSON.parse(orderId));
    }
    const oStatus: any = await AsyncStorage.getItem('OrderResponse');
    this.viewModel.set('orderStatus', JSON.parse(oStatus));
    this.props.navigation.setParams({ isUpdated: false });
  }
  onDismissSnackBar = () => {
    this.viewModel.set("isAddToCart", false)
  }
  isAddToCart = () => {
    this.viewModel.set("isAddToCart", true)
  }
  async componentDidUpdate(prevProps, prevState) {
    const store = await AsyncStorage.getItem('storeSelectedPincode');
    if (store !== prevState.storeId) {
      this.viewModel.set('storeId', store);
      await this.viewModel.getProducts(this.state.categoryId);
    }
    if(this.props.loggedInUser?.id!==prevProps.loggedInUser?.id){
      this.viewModel.set("isLoggedIn",true)
      await this.viewModel.loadFavourites();
    }else if(this.props.isLoggedOut){
      this.viewModel.isLoggedOut()
    }

    if (this.state.error) {
      const alert = {
        shouldShowCancelButton: false,
        description: this.state.error.message,
        title: Strings.alert_empty_title,
        okButtonText: Strings.button_ok,
        onOkPress: async () => {
          this.viewModel.set('alertDetails', undefined);
          this.viewModel.clearError();
          this.viewModel.logoutAfterResponse();
          // this.props.navigation.navigate('Login', {isLogin, data});
        },
      };
      this.viewModel.set('alertDetails', alert);
      this.viewModel.clearError();
    }
    if (this.state.onAddToCartSuccess) {
      const alert = {
        shouldShowCancelButton: true,
        description: Strings.alert_add_item_toCart,
        title: Strings.alert_title,
        okButtonText: Strings.button_ok,
        onCancelPress: () => {
          this.viewModel.set('alertDetails', undefined);
        },
        onOkPress: async () => {
          this.viewModel.set('alertDetails', undefined);
          this.viewModel.set('onAddToCartSuccess', false);
        },
      };
      this.viewModel.set('alertDetails', alert);
      this.viewModel.set('onAddToCartSuccess', false);
    } else if (this.state.onDecressToCartSuccess) {
      const alert = {
        shouldShowCancelButton: true,
        description: Strings.alert_remove_item_fromCart,
        title: Strings.alert_title,
        okButtonText: Strings.button_ok,
        onCancelPress: () => {
          this.viewModel.set('alertDetails', undefined);
        },
        onOkPress: async () => {
          this.viewModel.set('alertDetails', undefined);
          this.viewModel.set('onDecressToCartSuccess', false);
        },
      };
      this.viewModel.set('alertDetails', alert);
      this.viewModel.set('onDecressToCartSuccess', false);
    }
    else if (this.state.isNewUpdateAvailable) {
      const alert = {
        shouldShowCancelButton: true,
        description: "New update available",
        title: Strings.alert_title,
        okButtonText: "Update now",
        cancelButtonText: "Later",
        onCancelPress: () => {
          this.viewModel.set('alertDetails', undefined);
        },
        onOkPress: async () => {
          Linking.openURL(this.state.storeUrl)
          this.viewModel.set('alertDetails', undefined);
          this.viewModel.set('isNewUpdateAvailable', false);
        },
      };
      this.viewModel.set('alertDetails', alert);
      this.viewModel.set('isNewUpdateAvailable', false);
    }
  }

  onClickTabItem = async item => {
    this.viewModel.set('selectedValue', '');
    if (this.state.categoryId === item.id) {
      this.viewModel.set('selectedValue', 'Filters');
    } else {
      this.viewModel.set('categoryId', item.id);
      await this.viewModel.onCategaryChange(
        item,
        this.state.categoriesResponse,
      );
      if (this.state.selectedValue && this.state.selectedValue !== 'Filters') {
        this.onSubCategoryChange(this.state.selectedValue);
      } else if (item.id === 14 && this.state.icecreamSubCat.length >0 ) {
            this.subTabChange(0);
            this.onClickSubCatTabItem(this.state.icecreamSubCat[0].value);
                        // await this.viewModel.getProducts(item.id);
      }else{
                await this.viewModel.getProducts(item.id);

      }
    }
  };
   onClickSubCatTabItem = async item => {
    this.viewModel.set('selectedValue', '');
    this.viewModel.set('subCatId', item.id);

    if (this.state.categoryId === item.id) {
      this.viewModel.set('selectedValue', 'Filters');
    } else {
        await this.viewModel.getProducts(item.id);
    }
  };

  public getImageSource = item => {
    for (let i = 0; i < item.custom_attributes.length; i++) {
      if (item.custom_attributes[i].attribute_code === 'image') {
        return `http://15.206.227.103/magento/${item.custom_attributes[i].value
          }`;
      } else if (i >= item.custom_attributes.length - 1) {
        return 'default';
      }
    }
  };
   public renderSubCategoriesList = () => {
    return (
      <View>
        <LinearGradient
          colors={[Colors.white, Colors.primary_light_color]}
          style={{ flex: 1 }}>
          <View
            style={{
              backgroundColor: Colors.primary_background_color,
              flexDirection: 'row',
            }}>
            {this.state.icecreamSubCat.length > 0 ? (
              <FlatList
                ref={component => {
                  this.subcatRed = component;
                }}
                horizontal={true}
                keyExtractor={(item, index) => index.toString()}
                onEndReachedThreshold={0.1}
                removeClippedSubviews={false}
                viewabilityConfig={this.viewabilityConfig}
                data={this.state.icecreamSubCat}
                renderItem={({ item, index, separators }) => {
                  return (
                    <TouchableOpacity
                      key={index}
                      style={{
                        height: 52,
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                      onPress={() => {
                        // handle change in sub tab
                        this.subTabChange(index);
                        this.onClickSubCatTabItem(item.value);
                      }}>
                      <LinearGradient
                        colors={
                          item.isActive
                            ? [Colors.white, Colors.primary_light_color]
                            : [
                              Colors.primary_background_color,
                              Colors.primary_background_color,
                            ]
                        }
                        style={{
                          flex: 1,
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}>
                        <View
                          style={{
                            justifyContent: 'center',
                            alignItems: 'center',
                            paddingLeft: 27,
                            paddingRight: 24,
                          }}>
                          <View style={{ height: 20, width: 20 }}>
                            {this.getImageSource(item.value) === 'default' ? (
                              <Image
                                source={ImageAssets.egg_active}
                                style={{
                                  height: '100%',
                                  width: '100%',
                                  resizeMode: 'contain',
                                }}
                              />
                            ) : (
                              <Image
                                source={{
                                  uri: this.getImageSource(item.value),
                                }}
                                style={{
                                  height: '100%',
                                  width: '100%',
                                  resizeMode: 'contain',
                                }}
                              />
                            )}
                          </View>
                          <Text
                            style={[
                              styles.tabHeaderText,
                              {
                                color: item.isActive
                                  ? Colors.primary_color
                                  : Colors.dark_gray,
                                fontFamily: item.isActive
                                  ? 'Muli-ExtraBold'
                                  : 'Muli-Medium',
                              },
                            ]}>
                            {item.value.name}
                          </Text>
                        </View>
                      </LinearGradient>
                    </TouchableOpacity>
                  );
                }}
                showsHorizontalScrollIndicator={false}
              />
            ) : null}
            <TouchableOpacity
              style={styles.scrollButton}
              onPress={() => {
                if (
                  this.subcatRed &&
                  this.state.scrollToIndex <= this.state.tabItems.length - 1
                ) {
                  this.subcatRed.scrollToIndex({
                    animated: true,
                    index: this.state.scrollToIndex,
                  });
                  if(this.state.scrollToIndex===this.state.tabItems.length-1){
                    this.viewModel.set(
                      'scrollToIndex',
                      this.state.tabItems.length
                    );
                  }
                }
                else {
                  this.viewModel.set(
                    'scrollToIndex',
                    0
                  );
                }
              }}>
              <Image source={ImageAssets.scroll_arrow} />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    );
  };

  public renderCategoriesList = () => {
    return (
      <View>
        <LinearGradient
          colors={[Colors.white, Colors.primary_light_color]}
          style={{ flex: 1 }}>
          <View
            style={{
              backgroundColor: Colors.primary_background_color,
              flexDirection: 'row',
            }}>
            {this.state.tabItems.length > 0 ? (
              <FlatList
                ref={component => {
                  this.ref = component;
                }}
                horizontal={true}
                keyExtractor={(item, index) => index.toString()}
                onEndReachedThreshold={0.1}
                removeClippedSubviews={false}
                onViewableItemsChanged={this.handleViewableItemsChanged}
                viewabilityConfig={this.viewabilityConfig}
                data={this.state.tabItems}
                renderItem={({ item, index, separators }) => {
                  return (
                    <TouchableOpacity
                      key={index}
                      style={{
                        height: 52,
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                      onPress={() => {
                        this.onTabChange(index);
                        this.onClickTabItem(item.value);
                      }}>
                      <LinearGradient
                        colors={
                          item.isActive
                            ? [Colors.white, Colors.primary_light_color]
                            : [
                              Colors.primary_background_color,
                              Colors.primary_background_color,
                            ]
                        }
                        style={{
                          flex: 1,
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}>
                        <View
                          style={{
                            justifyContent: 'center',
                            alignItems: 'center',
                            paddingLeft: 27,
                            paddingRight: 24,
                          }}>
                          <View style={{ height: 20, width: 20 }}>
                            {this.getImageSource(item.value) === 'default' ? (
                              <Image
                                source={ImageAssets.egg_active}
                                style={{
                                  height: '100%',
                                  width: '100%',
                                  resizeMode: 'contain',
                                }}
                              />
                            ) : (
                              <Image
                                source={{
                                  uri: this.getImageSource(item.value),
                                }}
                                style={{
                                  height: '100%',
                                  width: '100%',
                                  resizeMode: 'contain',
                                }}
                              />
                            )}
                          </View>
                          <Text
                            style={[
                              styles.tabHeaderText,
                              {
                                color: item.isActive
                                  ? Colors.primary_color
                                  : Colors.dark_gray,
                                fontFamily: item.isActive
                                  ? 'Muli-ExtraBold'
                                  : 'Muli-Medium',
                              },
                            ]}>
                            {item.value.name}
                          </Text>
                        </View>
                      </LinearGradient>
                    </TouchableOpacity>
                  );
                }}
                showsHorizontalScrollIndicator={false}
              />
            ) : null}
            <TouchableOpacity
              style={styles.scrollButton}
              onPress={() => {
                if (
                  this.ref &&
                  this.state.scrollToIndex <= this.state.tabItems.length - 1
                ) {
                  this.ref.scrollToIndex({
                    animated: true,
                    index: this.state.scrollToIndex,
                  });
                  if(this.state.scrollToIndex===this.state.tabItems.length-1){
                    this.viewModel.set(
                      'scrollToIndex',
                      this.state.tabItems.length
                    );
                  }
                }
                else {
                  this.viewModel.set(
                    'scrollToIndex',
                    0
                  );
                }
              }}>
              <Image source={ImageAssets.scroll_arrow} />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    );
  };

  public render() {

    const { alertDetails, timeToCancel } = this.state;
    if (this.state.pageLoadError) {
      return (
        <Retry
          message={this.state.pageLoadError.message}
          onPress={() => {
            this.viewModel.set('pageLoadError', undefined);
            this.viewModel.getCategories();
          }}
        />
      );
    } else {
      return (
        <Container style={styles.container}>
          <Content refreshControl={this.refreshControl()}>
            <FetchUserData
              doApiCall={this._doApiCall}
              isFocusableOrNot={this.viewModel.isFocusableOrNot}
            />
            {alertDetails && alertDetails.description ? (
              <AlertComponent
                visible={true}
                title={
                  alertDetails.title ? alertDetails.title : Strings.alert_title
                }
                description={alertDetails.description}
                okButtonText={
                  alertDetails.okButtonText
                    ? alertDetails.okButtonText
                    : Strings.button_ok
                }
                cancelButtonText={
                  alertDetails.cancelButtonText
                    ? alertDetails.cancelButtonText
                    : Strings.text_cancel
                }
                onOkPress={
                  alertDetails.onOkPress
                    ? alertDetails.onOkPress
                    : () => {
                      this.viewModel.set('alertDetails', undefined);
                    }
                }
                onCancelPress={alertDetails.onCancelPress}
                shouldShowCancelButton={alertDetails.shouldShowCancelButton}
              />
            ) : null}
            {
            this.state.bannerImages && this.state.bannerImages.length > 0 ? (
              <View style={[styles.bannerHolder, { flexDirection: 'row' }]}>
                <Carousel
                  sliderWidth={this.windowWidth}
                  itemWidth={this.windowWidth}
                  firstItem={0}
                  data={this.state.bannerImages}
                  autoplay={true}
                  autoplayInterval={3000}
                  scrollEnabled={true}
                  loop={true}
                  layout={'default'}
                  renderItem={this._renderItem}
                  onSnapToItem={index => {
                    this.viewModel.set('currentIndex', index);
                  }}
                />
                <View
                  style={{
                    position: 'absolute',
                    alignSelf: 'flex-end',
                    width: '100%',
                  }}>
                  <Pagination
                    dotsLength={this.state.bannerImages.length}
                    activeDotIndex={this.state.currentIndex}
                    containerStyle={{ paddingVertical: 0, alignSelf: 'center' }}
                    dotStyle={{
                      width: 6,
                      height: 6,
                      borderRadius: 3,
                      marginRight: 14.52,
                      marginBottom: 5,
                      backgroundColor: '#C9C9C9',
                    }}
                    dotElement={
                      <View
                        style={{
                          backgroundColor: '#C9C9C9',
                          marginBottom: 5,
                          height: 6,
                          marginRight: 14.52,
                          width: 18,
                          borderRadius: 2.64,
                        }}
                      />
                    }
                    inactiveDotOpacity={0.4}
                    inactiveDotScale={0.6}
                  />
                </View>
              </View>
            ) : (
              <Image
                style={{ width: this.windowWidth, height: windowWidth1 > 500 ? 280 : 140 }}
                resizeMode="stretch"
                source={ImageAssets.banner}
              />
            )}

            <View>
              <View
                style={{
                  height: 44,
                  backgroundColor: Colors.white,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                <Image source={ImageAssets.search} style={{ marginLeft: 11 }} />
                <TextInput
                  value={this.state.searchKey}
                  placeholder={Strings.text_search}
                  style={styles.searchInput}
                  onChangeText={text => {
                    if (text.length === 0) {
                      this.viewModel.set('searchKey', '');
                      const tabItem = _.find(
                        this.state.tabItems,
                        (tab: any) => {
                          if (tab.isActive === true) {
                            return tab;
                          }
                        },
                      );
                      tabItem ? (tabItem.isActive = false) : null;
                      this.viewModel.getAllProducts(text);
                      return;
                    }
                    this.viewModel.set('searchKey', text);
                  }}
                  returnKeyType="search"
                  onSubmitEditing={() => {
                    const tabItem = _.find(this.state.tabItems, (tab: any) => {
                      if (tab.isActive === true) {
                        return tab;
                      }
                    });
                    tabItem ? (tabItem.isActive = false) : null;
                    this.viewModel.getAllProducts(this.state.searchKey);
                  }}
                />
                {this.state.searchKey ? (
                  <TouchableOpacity
                    onPress={() => {
                      if (this.state.searchKey.length) {
                        this.viewModel.set('searchKey', '');
                        Keyboard.dismiss();
                        const tabItem = _.find(
                          this.state.tabItems,
                          (tab: any) => {
                            if (tab.isActive === true) {
                              return tab;
                            }
                          },
                        );
                        tabItem ? (tabItem.isActive = false) : null;
                        this.viewModel.getAllProducts('');
                      }
                    }}>
                    <Image
                      source={ImageAssets.close}
                      style={{marginLeft:"5%",marginRight:"5%"}}
                    />
                  </TouchableOpacity>
                ) : null}
              </View>
              {this.state.tabItems.length > 0
                ? this.renderCategoriesList()
                : // <CategiriesList
                //     onTabChange={this.onTabChange}
                //     onClickTabItem={this.onClickTabItem}
                //     getImageSource={this.getImageSource}
                //     tabItems={this.state.tabItems}
                // />
                null}
            </View>
            <Item
              style={{
                borderBottomWidth: 0,
                flexDirection: 'row',
                padding: 10,
                backgroundColor: Colors.primary_light_color,
                paddingBottom: 5,
              }}>
              <Item style={{ borderBottomWidth: 0 }}>
                <TouchableOpacity
                  style={{ flexDirection: 'row' }}
                  onPress={() => {
                    this.viewModel.set(
                      'isPriceAscendingOrder',
                      !this.state.isPriceAscendingOrder,
                    );
                    this.sortProductList();
                  }}>
                  <Text style={styles.priceText}>{Strings.button_price}</Text>
                  {this.state.isPriceAscendingOrder !== undefined ? (
                    <Image
                      source={
                        this.state.isPriceAscendingOrder
                          ? ImageAssets.up_arrow
                          : ImageAssets.arrow_down
                      }
                      style={{ alignSelf: 'center' }}
                    />
                  ) : null}
                </TouchableOpacity>
                {/* <Text style={[styles.popularityText, { marginLeft: 30 }]}>
                  popularity
                </Text> */}
                <TouchableOpacity
                  onPress={() => {
                    this.viewModel.set('listType', 'grid');
                  }}>
                  <Image
                    source={`${this.state.listType === 'grid'
                        ? ImageAssets.grid_active
                        : ImageAssets.grid_inactive
                      }`}
                    style={{
                      height: 16,
                      width: 16,
                      marginLeft: this.windowWidth / 1.6,
                    }}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    this.viewModel.set('listType', 'list');
                  }}>
                  <Image
                    source={`${this.state.listType === 'list'
                        ? ImageAssets.list_active
                        : ImageAssets.list_inactive
                      }`}
                    style={{ height: 16, width: 16, marginLeft: 10 }}
                  />
                </TouchableOpacity>
              </Item>
              <View style={{ marginLeft: 30 }}>
                {this.state.menuItems.length ? (
                  <ModalDropdown
                    dropdownStyle={{
                      width: 150,
                      elevation: 3,
                      shadowOpacity: 0.75,
                      shadowRadius: 5,
                      marginTop: 5,
                      height: this.state.menuItems.length * 35,
                    }}
                    dropdownTextStyle={[styles.priceText, { fontSize: 14 }]}
                    renderSeparator={() => {
                      return <View />;
                    }}
                    onSelect={async (index, value) => {
                      this.viewModel.set('selectedValue', value);
                      this.onSubCategoryChange(value);
                    }}
                    options={this.getOptions()}>
                    <View style={{ flexDirection: 'row' }}>
                      <Text
                        style={[
                          styles.priceText,
                          { marginRight: 5, fontSize: 14 },
                        ]}>
                        {this.state.selectedValue}
                      </Text>
                      <Image
                        source={ImageAssets.shop_product_dropdown}
                        style={{ alignSelf: 'center', marginTop: 4 }}
                      />
                    </View>
                  </ModalDropdown>
                ) : null}
              </View>
            </Item>
            <View >
              
            {this.state.categoryId === 14 && this.state.icecreamSubCat.length > 0 ? this.renderSubCategoriesList() : null}

            </View>
            <View
              style={{
                backgroundColor: Colors.primary_light_color,
                alignItems: this.state.listType === 'grid' ? 'center' : null,
              }}>
              {!this.state.isProductsAvailable ? (
                <Text style={{ marginTop: 20, alignSelf: 'center' }}>
                  {Strings.text_noProduct_found}
                </Text>
              ) : (
                !this.state.isLoading && (
                  <FlatList
                    key={this.state.listType}
                    style={{ marginBottom: 20 }}
                    data={this.state.products}
                    showsVerticalScrollIndicator={false}
                    keyExtractor={(item, index) => item.sku.toString()}
                    numColumns={this.state.listType === 'grid' ? 2 : 1}
                    renderItem={({ item, index }) => {
                      return (
                        <ProductItemComponent
                          key={`key-${index}-${item.sku}`}
                          item={item}
                          listType={this.state.listType}
                          isWished={this.state.favouriteProducts.find(
                            (catalog: any) => {
                              return item.id == catalog.product_id;
                            },
                          )}
                          addToWishList={this.viewModel.addToWishList}
                          isLoggedIn={this.state.isLoggedIn}
                          navigateToProductPage={true}
                          isAddToCart={this.isAddToCart}
                          cartItems={this.props.cartItems}
                          navigation={this.props.navigation}
                          tabItems={this.state.tabItems}
                          inventoryItems={this.props.inventoryItems}
                          cartSummary={this.props.cartSummary}
                        />
                      );
                    }}
                  />
                )
              )}
            </View>
          </Content>
          {/* {this.state.orderStatus &&
          this.state.orderStatus.status !== 'complete'&&this.state.orderStatus.status !== 'closed' ? (
            <TouchableOpacity
              onPress={async () => {
                this.viewModel.set('openSubmitModal', false);
                this.props.navigation.navigate('orders', {
                  screen: 'OrdersHistoryComponent',
                  params: {isUpdated: true},
                });
              }}>
              <View
                style={{
                  height:
                    this.state.orderStatus.status !== 'picked_up'
                      ? '18%'
                      : '15%',
                  backgroundColor: '#ffffff',
                }}>
                <View
                  style={{
                    flex: 1,
                    flexDirection: 'row',
                    margin: 10,
                    justifyContent: 'space-between',
                  }}>
                  <View style={{flexDirection: 'row', flex: 0.97}}>
                    <View
                      style={{
                        // marginLeft: 15,
                        marginTop: 5,
                      }}>
                      <Image
                        source={
                          this.state.orderStatus.status === 'pending'
                            ? ImageAssets.order_tracking_radiobutton_complete
                            : this.state.orderStatus.status !== 'picked_up'
                            ? ImageAssets.order_tracking_radiobutton_complete
                            : ImageAssets.order_tracking_radiobutton_itemOnWay
                        }
                      />
                    </View>
                    <View style={{marginLeft: 15}}>
                      <Text
                        style={{
                          fontSize: 18,
                          color: '#EB6A6A',
                          fontFamily: 'Muli-Bold',
                        }}>
                        {this.state.orderStatus.status === 'pending'
                          ? Strings.text_order_recived
                          : this.state.orderStatus.status !== 'picked_up'
                          ? Strings.text_order_confirm
                          : Strings.text_order_onThe_way}
                      </Text>
                      {timeToCancel > 0 ? (
                        <Text
                          numberOfLines={3}
                          style={[
                            styles.orderSubtext,
                            {
                              width: undefined,
                            },
                          ]}>
                          {this.state.orderStatus.status === 'pending'
                            ? Strings.text_order_recived_subTitle +
                              `, cancelling is allowed within ${timeToCancel} minutes of order placing`
                            : this.state.orderStatus.status !== 'picked_up'
                            ? Strings.text_order_confirm_subTitle +
                              `, cancelling is allowed within ${timeToCancel} minutes of order placing`
                            : Strings.text_order_onThe_way_subTitle}
                        </Text>
                      ) : (
                        <Text
                          numberOfLines={3}
                          style={[
                            styles.orderSubtext,
                            {
                              width: undefined,
                            },
                          ]}>
                          {this.state.orderStatus.status === 'pending'
                            ? Strings.text_order_recived_subTitle
                            : this.state.orderStatus.status !== 'picked_up'
                            ? Strings.text_order_confirm_subTitle
                            : Strings.text_order_onThe_way_subTitle}
                        </Text>
                      )}
                    </View>
                  </View>
                  <View style={{flex: 0.08}}>
                    <TouchableOpacity
                      style={{
                        paddingRight:
                          this.state.orderStatus.status === 'processing'
                            ? '50%'
                            : undefined,
                      }}
                      onPress={async () => {
                        await AsyncStorage.removeItem('OrderId');
                        await AsyncStorage.removeItem('OrderResponse');
                        this.viewModel.set('orderStatus', undefined);
                      }}>
                      <Image
                        source={ImageAssets.close}
                        style={{height: 30, width: 30}}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ) : null} */}
          {this.state.isLoading ? (
            <Loader
              isTransperant={this.state.tabItems.length > 0 ? true : false}
            />
          ) : null}
          {this.state.isAddToCart && this.props.cartSummary?.items_qty > 0 &&
            (<Snackbar
              visible={this.state.isAddToCart}
              onDismiss={this.onDismissSnackBar}
              duration={3000}
              theme={{ colors: { onSurface: Colors.white, surface: Colors.primary_color2, accent: Colors.white } }}
              action={{
                label: 'View Cart',
                labelStyle: { fontFamily: "Montserrat-SemiBold", fontSize: 13, textTransform: "none" },
                style: { backgroundColor: "#3c3c3c", borderRadius: 14 },
                onPress: () => {
                  this.props.navigation.navigate('Cart')
                },
              }}>
              <Image source={ImageAssets.shopping_cart} style={{ padding: 12 }} />
              <Text style={styles.snackBarText}>
                {` ${this.props.cartSummary?.items_qty} item(s) added successfully`}

                <Text style={[styles.totalAmount]}>
                  {"\n    "} ₹{this.props.cartSummary.base_subtotal +
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

  getProductVM = vm => {
    let viewModel;
    this.state.products.map((item, i) => {
      if (item.name === vm.state.productName) {
        viewModel = item;
      }
    });
    return viewModel;
  };

  public sortProductList = () => {
    this.viewModel.sortProductList();
  };

  public onSubCategoryChange = async value => {
    let id;
    if (value) {
      this.state.menuItems.map((item, i) => {
        if (item.value === value) {
          id = item.key;
        }
      });
    } else {
      id = this.state.categoryId;
    }
    await this.viewModel.getProducts(id);
  };

  public getOptions() {
    const options: any = [];
    if (this.state.menuItems.length) {
      for (const item of this.state.menuItems) {
        options.push(item.value);
      }
    }
    return options;
  }

  private onTabChange = index => {
    this.viewModel.set('searchKey', '');
    this.viewModel.set('isPriceAscendingOrder', undefined);
    for (const tab of this.state.tabItems) {
      tab.isActive = tab.id === index ? true : false;
    }
  };
  private subTabChange = index => {
    this.viewModel.set('searchKey', '');
    for (const tab of this.state.icecreamSubCat) {
      tab.isActive = tab.id === index ? true : false;
    }
  };
  

  _handleLoadMore = distanceFromEnd => {
    // this.viewModel.set('pageIndex', this.state.pageIndex + 1)
    // if (this.state.totalPages !== this.state.pageIndex + 1) {
    // this.viewModel.getProducts(this.state.categoryId, 9)
    // }
  };

  refreshControl = () => {
    return (
      <RefreshControl
        refreshing={this.state.refreshing}
        enabled={true}
        onRefresh={async () => {
          this.viewModel.set('refreshing', true);
          const orderId: any = await AsyncStorage.getItem('OrderId');
          if (orderId) {
            await this.viewModel.getOrderTrackingUpdate(JSON.parse(orderId));
          }
          const oStatus: any = await AsyncStorage.getItem('OrderResponse');

          this.viewModel.set('orderStatus', JSON.parse(oStatus));
          this.viewModel.getCategories(true);
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
  container: {
    flex: 1,
    backgroundColor: Colors.primary_light_color,
  },
  content: {
    margin: 10,
    flex: 1,
    marginTop: 20,
  },
  bannerHolder: {
    flex: 1,
    height: windowWidth1 > 500 ? 280 : 140,
    // paddingTop: 10,
    // paddingBottom: 2,
    backgroundColor: '#414141',
    shadowColor: '#000000',
    // shadowOffset: { width: 0, height: 2 },
    shadowOpacity: Platform.OS === 'ios' ? 0.1 : 0.5,
    // shadowRadius: 38,
    elevation: 5,
  },
  bannerImageHolder: {
    flex: 1,
    height: windowWidth1 > 500 ? 280 : 140,
    // paddingTop: 10,
    // paddingBottom: 2,
    // marginHorizontal: 10,
    flexDirection: 'row',
  },
  bannerImage: {
    // resizeMode: 'stretch',
    width: '100%',
    height: '100%',
    // borderRadius: 8,
  },
  searchInput: {
    color: Colors.text_Light,
    fontFamily: 'Muli-Medium',
    fontSize: 12,
    marginLeft: 7,
    width: '80%',
  },
  popularityText: {
    color: Colors.text_Light,
    fontFamily: 'Muli-Bold',
    fontSize: 10.09,
  },
  priceText: {
    color: Colors.text_dark,
    fontFamily: 'Muli-Bold',
    fontSize: 10.09,
    marginRight: 3,
  },
  tabHeaderText: {
    color: Colors.primary_color,
    fontFamily: 'Muli-ExtraBold',
    fontSize: 10,
  },
  scrollButton: {
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginRight: 9,
    height: 40,
    width: 25,
  },
  totalAmount: {
    color: Colors.primary_color,
    fontFamily: 'Muli-ExtraBold',
    fontSize: 15,
    marginLeft: 12
  },
  orderSubtext: {
    color: Colors.text_dark,
    fontFamily: 'Muli-Bold',
    fontSize: 11,
  },
  offerView: {
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    position: 'absolute',
    alignSelf: 'flex-end',
    bottom: 20,
  },
  offerHeaderText: {
    color: Colors.primary_color,
    fontFamily: 'Muli-Bold',
    fontSize: 14,
  },
  offerText: {
    color: Colors.text_dark,
    fontFamily: 'Muli-Bold',
    fontSize: 12,
  },
  offerSubText: {
    color: Colors.text_primary_light,
    fontFamily: 'Muli-Bold',
    fontSize: 10,
  },
  offerButton: {
    alignSelf: 'center',
    backgroundColor: '#000',
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  snackBarText: {
    fontFamily: 'Montserrat-Medium',
    color: '#444444',
    marginHorizontal: 20,
    fontSize: 13
  }
});
