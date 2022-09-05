import {BaseViewModel} from './BaseViewModel';
import {UserRepository} from '../domain/repository/UserRepository';
import AsyncStorage from '@react-native-community/async-storage';
import {CategoriesRepository} from '../domain/repository/CategoriesRepository';
import _ from 'lodash';
import ImageAssets from '../assets';

export interface CategoriesState {
  tabItems: any[];
  menuItems: any[];
  selectedValue: any;
  categoriesResponse: any;
  products: any[];
  isLoading: boolean;
  pageLoadError?: Error;
  error?: Error;
  banners: any[];
  currentIndex: any;
  isLoggedIn: boolean;
  favouriteProducts: any[];
  scrollToIndex: any;
  isDeliveryPressed: boolean;
  isPriceAscendingOrder: any;
  categoryId: any;
  subCatId: any;
  selectedPincode: string;
  isAddToCart: boolean;
  pickupAddress: any;
  sourcePincode: string;
  listType: string;
  totalFavourites: number;
  timeToCancel: number;
  searchKey: string;
  onAddToCartSuccess: boolean;
  onDecressToCartSuccess: boolean;
  refreshing: boolean;
  storeId: any;
  orderItemresponse: any;
  isNewUpdateAvailable: boolean;
  storeUrl: any;
  isProductsAvailable: boolean;
  orderStatus: any;
  alertDetails: any;
  refresh: boolean;
  icecreamSubCat: [];
  bannerImages: [];
}

export class CategoriesViewModel extends BaseViewModel {
  protected state: CategoriesState;

  constructor(
    private categariesRepository: CategoriesRepository,
    private userRepository: UserRepository,
  ) {
    super();
    this.state = this.defaultState();
    this.categariesRepository = categariesRepository;
  }

  public defaultState() {
    return {
      tabItems: [],
      menuItems: [],
      selectedValue: '',
      categoriesResponse: undefined,
      products: [],
      isLoading: false,
      isLoggedIn: false,
      pageLoadError: undefined,
      error: undefined,
      favouriteProducts: [],
      banners: [],
      currentIndex: 0,
      listType: 'grid',
      isProductsAvailable: true,
      totalFavourites: 0,
      isAddToCart: false,
      scrollToIndex: 0,
      timeToCancel: 5,
      isDeliveryPressed: true,
      isPriceAscendingOrder: undefined,
      categoryId: '',
      subCatId: '',
      selectedPincode: '',
      pickupAddress: '',
      isNewUpdateAvailable: false,
      storeUrl: '',
      sourcePincode: '',
      searchKey: '',
      onAddToCartSuccess: false,
      onDecressToCartSuccess: false,
      refreshing: false,
      storeId: 'default',
      orderItemresponse: undefined,
      orderStatus: undefined,
      alertDetails: undefined,
      refresh: false,
      icecreamSubCat: [],
    };
  }

  public onCategaryChange(item, response) {
    const menuItems: any = [];
    for (const categary of response.items) {
      if (item.id === categary.parent_id) {
        menuItems.push({key: categary.id, value: categary.name});
        this.setState({
          ...this.state,
          selectedValue: 'Filters',
        });
      }
    }

    this.setState({
      ...this.state,
      menuItems,
    });
  }
  public async loadData() {}
  public isFocusableOrNot = async () => {
    const loggedInUser = await this.userRepository.getState().loggedInUser;
    if (loggedInUser && loggedInUser.id) {
      this.setState({
        ...this.state,
        isLoggedIn: true,
      });
    }
    const {totalFavourites} = this.state;
    const response = await this.userRepository.getFavouriteItems();
    if (response && response.length !== totalFavourites) {
      this.setState({
        ...this.state,
        totalFavourites: response.length,
      });
      return true;
    }
  };
  private getActiveCategories(categories) {
    return categories.filter(
      (category: any) =>
        category.is_active === true && category.include_in_menu === true,
    );
  }

  public setSelectedPincode(newPincode) {
    const pincode = this.userRepository.getState().pincode;
    if (newPincode && pincode !== newPincode) {
      this.userRepository.set('pincode', newPincode);
      this.userRepository.set('pickupAddress', this.state.pickupAddress);
      this.setState({
        ...this.state,
        pickupAddress: '',
      });
    } else {
      this.userRepository.set('pincode', newPincode);
    }
  }
  addToWishList = async (productId: any) => {
    try {
      await this.userRepository.addToWishList(productId);
      await this.loadFavourites();
    } catch (error) {
      this.setState({
        ...this.state,
        error,
      });
    }
  };
  public async loadFavourites() {
    const response: any = await this.userRepository.getFavouriteItems();

    if (response) {
      this.setState({
        ...this.state,
        favouriteProducts: response,
        totalFavourites: response.length,
      });
    }
    return response;
  }
  public async isLoggedOut() {
    this.userRepository.set('isLoggedOut', false);
    this.setState({
      ...this.state,
      favouriteProducts: [],
      isLoggedIn: false,
    });
  }
  public async getCategories(checkForStocks?) {
    this.setState({
      ...this.state,
      isLoading: true,
    });
    try {
      this.getSources(true);
      if (!this.state.tabItems.length) {
        const tabItems: any = [];
        const subtabItems: any = [];

        const response = await this.categariesRepository.getCategories();
        console.log('category response', response);
        if (response && response.items) {
          const categories = this.getActiveCategories(response.items);
          const items: any = [];
          const icecreamSubCat: any = [];
          for (const categary of categories) {
            if (categary.parent_id === 1) {
              items.push(categary);
            } else if (categary.parent_id === 14) {
              icecreamSubCat.push(categary);
            }
          }
          for (let i = 0; i < items.length; i++) {
            const obj = {
              id: i,
              value: items[i],
              isActive: false,
            };
            tabItems.push(obj);
          }
          for (let i = 0; i < icecreamSubCat.length; i++) {
            const obj = {
              id: i,
              value: icecreamSubCat[i],
              isActive: false,
            };
            subtabItems.push(obj);
          }
          tabItems[0].isActive = true;
        }

        this.userRepository.set('categories', tabItems);
        await this.onCategaryChange(tabItems[0].value, response);
        await this.getProducts(tabItems[0].value.id, checkForStocks);
        const timeToCancel = await this.userRepository.getTimeToCancel();
        this.setState({
          ...this.state,
          categoriesResponse: response,
          tabItems,
          timeToCancel,
          categoryId: tabItems[0].value.id,
          isLoading: false,
          icecreamSubCat: subtabItems,
        });
      }
      const bannerImages = [
        ImageAssets.banner,
        ImageAssets.ibaco_carousel,
        ImageAssets.ibaco_carousel2,
      ];
      this.setState({
        ...this.state,
        isLoading: false,

        bannerImages,
      });
    } catch (error) {
      this.setState({
        ...this.state,
        isLoading: false,
        pageLoadError: error,
      });
    }
  }

  public async getProducts(id, checkForStocks?) {
    console.log('getProductsgetProducts', id);
    this.setState({
      ...this.state,
      isLoading: true,
    });
    try {
      const enabledProducts: any = [];
      const response = await this.userRepository.getProducts(
        id,
        this.state.searchKey,
      );
      console.log('pincode', response);
      for (const product of response.items) {
        if (product.status === 1) {
          enabledProducts.push(product);
        }
      }
      this.setState({
        ...this.state,
        products: enabledProducts,
        // isLoading: false,
      });
      if (checkForStocks) {
        await this.getSourcePincode();
      }
      this.setState({
        ...this.state,
        isLoading: false,
      });
    } catch (error) {
      this.setState({
        ...this.state,
        isLoading: false,
        pageLoadError: error,
      });
    }
  }

  public async sortProductList() {
    this.setState({
      ...this.state,
      isLoading: true,
    });
    const sortedProducts: any = this.state.products;
    if (this.state.isPriceAscendingOrder === true) {
      sortedProducts.sort((a, b) => a.totalPrice - b.totalPrice);
    } else if (this.state.isPriceAscendingOrder === false) {
      sortedProducts.sort((a, b) => b.totalPrice - a.totalPrice);
    }
    this.setState({
      ...this.state,
      isLoading: false,
      products: sortedProducts,
    });
  }

  public async updateCart(isNewItemAddedOrDeleted?) {
    try {
      // const cartid = await this.userRepository.getCartId();
      // await this.saveLatLng()
      await this.userRepository.getCartDetails(isNewItemAddedOrDeleted);
      await this.userRepository.getCartItems({});
    } catch (error) {
      this.setState({
        ...this.state,
        isLoading: false,
        error,
      });
    }
  }

  public async updateGuestCart(isNewItemAddedOrDeleted?) {
    try {
      await this.userRepository.getGuestCartSummary(isNewItemAddedOrDeleted);
      await this.userRepository.getGuestCartItems();
    } catch (error) {
      this.setState({
        ...this.state,
        isLoading: false,
        error,
      });
    }
  }

  public async getSourcePincode() {
    try {
      const {pincode, defaultStorePincode} = this.userRepository.getState();
      const response = await this.categariesRepository.getSourcePincode(
        pincode,
      );
      if (response[0].source_pincode) {
        this.userRepository.set('sourcePincode', response[0].source_pincode);
        this.setState({
          ...this.state,
          sourcePincode: response[0].source_pincode,
        });
        await this.getSources(false);
      } else {
        this.userRepository.set('sourcePincode', defaultStorePincode);
        await this.getInventorySourceItems(defaultStorePincode);
      }
    } catch (error) {
      this.setState({
        ...this.state,
        isLoading: false,
        error,
      });
    }
  }

  public async getSources(doApiCall) {
    try {
      let response;
      if (doApiCall) {
        response = await this.categariesRepository.getSources();
        this.userRepository.set('inventorySources', response);
      } else {
        response = this.userRepository.getState().inventorySources;
      }
      for (const item of response.items) {
        if (item.postcode === this.state.sourcePincode) {
          await this.getInventorySourceItems(item.postcode);
          break;
        }
      }
    } catch (error) {
      this.setState({
        ...this.state,
        isLoading: false,
        pageLoadError: error,
      });
    }
  }

  public async getInventorySourceItems(sourceCode) {
    try {
      const response = await this.categariesRepository.getInventorySourceItems(
        sourceCode,
      );
      if (this.userRepository.getState().loggedInToken) {
        await this.updateCart(true);
      } else {
        await this.updateGuestCart(true);
      }
      this.userRepository.set('inventoryItems', response.items);
      this.setState({
        ...this.state,
      });
    } catch (error) {
      this.setState({
        ...this.state,
        isLoading: false,
        error,
      });
    }
  }

  public async getAllProducts(searchKey) {
    this.setState({
      ...this.state,
      isLoading: true,
    });
    try {
      const sortList: any = [];
      if (searchKey.length === 0) {
        const {tabItems} = this.state;
        await this.getProducts(tabItems[0].value.id);
        tabItems[0].isActive = true;
        this.setState({
          ...this.state,
          tabItems,
          categoryId: tabItems[0].value.id,
          isLoading: false,
        });
      } else {
        const response = await this.categariesRepository.getAllProducts(
          searchKey,
        );
        if (response && response.items && response.items.length) {
          for (const product of response.items) {
            if (product.status === 1) {
              sortList.push(product);
            }
          }
          await this.getSourcePincode();
          this.setState({
            ...this.state,
            products: sortList,
            isLoading: false,
            isProductsAvailable: true,
            categoryId: '',
            menuItems: [],
          });
        } else {
          this.setState({
            ...this.state,
            products: sortList,
            isProductsAvailable: false,
            isLoading: false,
            categoryId: '',
            menuItems: [],
          });
        }
      }
    } catch (error) {
      this.setState({
        ...this.state,
        isLoading: false,
        pageLoadError: error,
      });
    }
  }

  public async getOrderTrackingUpdate(id: any) {
    try {
      const OrderItemresponse = await this.userRepository.orderByPaymentId(
        id,
        true,
      );
      this.setState({
        ...this.state,
        orderItemresponse: OrderItemresponse,
      });
    } catch (error) {
      this.setState({
        ...this.state,
        error,
        isLoading: false,
      });
    }
  }

  public setDelivertState(isDelivery) {
    this.userRepository.set('isDelivery', isDelivery);
  }

  public getCartItems() {
    const cartItems = this.userRepository.getState().cartItems;
    return cartItems;
  }

  public async getCarouselData() {
    const response = await this.userRepository.getCarousel();
    return response;
  }
  public async logoutAfterResponse() {
    try {
      this.setState({
        ...this.state,
        isLoading: true,
      });
      await this.userRepository.logout();
      this.userRepository.set('couponCode', '');
      this.userRepository.set('isCouponApplied', false);
      this.setState({
        ...this.state,
        isLoading: false,
      });
    } catch (error) {
      this.setState({
        ...this.state,
        isLoading: false,
        error,
      });
    }
  }
  public onClickCarouselButton(categaryId) {
    let value: any;
    let index: any;
    this.setMany({
      searchKey: '',
      isPriceAscendingOrder: undefined,
      categoryId: Number(categaryId),
    });
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < this.state.tabItems.length; i++) {
      const tab = this.state.tabItems[i];
      tab.isActive = tab.value.id == categaryId ? true : false;
      if (tab.value.id == categaryId) {
        value = tab.value;
        index = i;
        this.set('scrollToIndex', i - 1 >= 0 ? i - 1 : i);
      }
    }
    return {value, index};
  }
  saveLatLng = async () => {
    try {
      this.setState({
        ...this.state,
        isLoading: true,
      });
      const {isDelivery} = this.userRepository.getState();
      const userInfo = this.userRepository.getState().loggedInUser;
      const storeId = await AsyncStorage.getItem('storeSelectedPincode');
      let data: any = {};

      data.customerId = userInfo.id;
      data.quoteId = await this.userRepository.getCartId();
      data.shipping_option = isDelivery ? 'delivery' : 'pickup';
      data.is_checkout = 'no';

      const response = await this.userRepository.saveLatLng(data);
      console.log(response, data.storeId, '---savelatresponse');
      this.setState({
        ...this.state,
        isLoading: false,
      });
    } catch (error) {
      console.log(error);
      this.setState({
        ...this.state,
        isLoading: false,
      });
    }
  };
}
