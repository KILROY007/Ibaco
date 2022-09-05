import {BaseViewModel} from './BaseViewModel';
import {UserRepository} from '../domain/repository/UserRepository';
import {Platform} from 'react-native';
import ImageAssets from '../assets';
import {CartRepository} from '../domain/repository/CartRepository';
import {Rating} from 'react-native-ratings';

export interface ProductItemState {
  item_id: number;
  quantity: any;
  productName: String;
  numberOfLikes: any;
  productDescription: String;
  price: String;
  imageSrc: any;
  activeTab: any;
  isShowMore: boolean;
  selectedOptionsValue: any;
  selectedSku: string;
  ProductOptionsViewModels: any;
  relatedProducts: any;
  isProductsAvailable:boolean;
  rating: any;
  ratings: any[];
  nickname: any;
  review_title: any;
  review_detail: any;
  ratingsGiven: any;
  userReviews: any[];
  relatedProductsVM: any;
  currentIndex: number;
  isLoading: boolean;
  showLoginModal: boolean;
  pageLoadError?: Error;
  starRatingError?: Error;
  cartItems: any;
  totalRatings: any;
  isQtyUpdated:any;
  error?: Error;
  totalFavourites: number;
  alertDetails: any;
  customerreview: boolean;
  isLoggedIn: boolean;
  fav: boolean;
  totalreviews: any;
}

export class ProductItemViewModel extends BaseViewModel {
  protected state: ProductItemState;

  constructor(
    private userRepository: UserRepository,
    private cartRepository: CartRepository,
  ) {
    super();
    // this.state = this.defaultState()
    this.state = this.getDefaultState();
  }

  protected defaultState() {
    return {
      quantity: 0,
      ProductWeight: '',
      menuItems: [],
      productName: '',

      numberOfLikes: 0,
      productDescription: '',
      price: 0,
    };
  }

  public getDefaultState() {
    return {
      item_id: 0,
      quantity: 0,
      productName: '',
      numberOfLikes: 0,
      showLoginModal: false,
      totalFavourites: 0,
      productDescription: '',
      isLoggedIn: false,
      isQtyUpdated:true,
      price: '',
      imageSrc: '',
      activeTab: 0,
      totalRatings: 0,
      isShowMore: true,
      selectedOptionsValue: [],
      selectedSku: '',
      ProductOptionsViewModels: [],
      relatedProducts: [],
      currentIndex: 0,
      isReviewLoaded: false,
      showReview: false,
      ratings: [],
      products: [1, 2, 3],
      nickname: '',
      review_title: '',
      review_detail: '',
      ratingsGiven: {},
      userReviews: [],
      isReviewPosted: false,
      rating: 0,
      starRatingError: undefined,
      relatedProductsVM: [],
      isLoading: false,
      pageLoadError: undefined,
      cartItems: [],
      error: undefined,
      alertDetails: undefined,
      customerreview: false,
      fav: false,
      totalreviews: 0,
    };
  }
  public async loadData(isWished?: any) {
    const loggedInUser = await this.userRepository.getState().loggedInUser;
    if (loggedInUser && loggedInUser.id) {
      this.setState({
        ...this.state,
        isLoggedIn: true,
      });
      if(isWished){
        this.setState({
          ...this.state,
          fav:true,
        });
    }
    }
    
    // this.setState({
    //   ...this.state,
    //   fav: false,
    // });
    // const response = await this.userRepository.getFavouriteItems();
    // response.map((item: any) => {
    //   if (JSON.parse(item.product_id) === productId) {
    //     this.setState({
    //       ...this.state,
    //       fav: true,
    //     });
    //   }
    // });
  }

  public isUserLoggedIn = async () => {
    const loggedInUser = this.userRepository.getState().loggedInUser
    if (loggedInUser&&loggedInUser?.id) {
      this.setState({
        ...this.state,
        isLoggedIn: true,
      })
    }
      else{
        this.setState({
          ...this.state,
          isLoggedIn: false,
        })
      }
  };
  public getImageSource(model) {
    let imageSrc = '';
    if (model.media_gallery_entries && model.media_gallery_entries.length) {
      imageSrc = `http://15.206.227.103/magento/pub/media/catalog/product/${
        model.media_gallery_entries[0].file
      }`;
    } else {
      imageSrc = 'default';
    }
    return imageSrc;
  }

  public getproductDescription(model) {
    return model.custom_attributes.filter(
      (description: any) => description.attribute_code === 'description',
    ).length > 0
      ? model.custom_attributes.filter(
          (description: any) => description.attribute_code === 'description',
        )[0].value
      : 'Description';
  }
  public getProductOptionsViewModel(model) {
    let options;
    if (
      model.options &&
      model.options.length &&
      typeof model.options === 'string'
    ) {
      options = JSON.parse(model.options);
    } else {
      options = model.options;
    }
    const productOptionsViewModels: any = [];
    if (options && options.length) {
      for (const option of options) {
        const productOptionsViewModel = new ProductOptionsViewModel(option);
        productOptionsViewModels.push(productOptionsViewModel);
      }
    }
    this.setState({
      ...this.state,
      ProductOptionsViewModels: productOptionsViewModels,
    });
  }

  public setItemId = async (selectedSKU: string, cartItems: any) => {
    const result = cartItems.find((item: any) => item.sku === selectedSKU);
    if (result) {
      this.setState({...this.state, item_id: result.item_id});
    }
  };
 public async logAddtoCart(addToCartObject:any,isDecrease?){
   await this.userRepository.logAddToCart(addToCartObject,isDecrease)
 }
 public async logWishlist(wishedObject){
  await this.userRepository.logWishlist(wishedObject)
  }
  public async addToCart(cartItem, isNewProductAddedordeleted?) {
    this.setState({
      ...this.state,
      isLoading: true,
    });
    try {
      let response;
      if (this.userRepository.getState().loggedInToken) {
        const cartId = await this.userRepository.getCartId();
        cartItem.cartItem.quote_id = cartId;

        response = await this.userRepository.addToCart(cartItem);
        await this.updateCart(isNewProductAddedordeleted);
      } else {
        response = await this.addguestCart(
          cartItem,
          isNewProductAddedordeleted,
        );
      }
      this.setState({
        ...this.state,
        isLoading: false,
        quantity: response.qty,
        item_id: response.item_id,
      });
      return response;
    } catch (error) {
      this.setState({
        ...this.state,
        isLoading: false,
        error,
      });
      // throw error
    }
  }

  public async addguestCart(cartItem, isNewProductAddedordeleted?) {
    this.setState({
      ...this.state,
      isLoading: true,
    });
    try {
      const response = await this.userRepository.addToGuestCart(cartItem);
      await this.userRepository.getGuestCartSummary(isNewProductAddedordeleted);
      const cartResponse = await this.userRepository.getGuestCartItems();
      this.setState({
        ...this.state,
        isLoading: false,
        cartResponse,
      });
      return response;
    } catch (error) {
      throw error;
    }
  }
  async getUserReviews(productId: any) {
    const response = await this.userRepository.getUserReviews(productId);

    const ratings: any = [];
    response.map((res: any) => {
      if (res.rating && res.rating.length > 0) ratings.push(res.rating[1]);
    });
    response.map((res: any) => {
      this.setState({
        ...this.state,
        userReviews: [
          ...this.state.userReviews,
          {
            created_at: res.created_at,
            customer_id: res.customer_id,
            detail: res.detail,
            detail_id: res.detail_id,
            entity_code: res.entity_code,
            entity_id: res.entity_id,
            entity_pk_value: res.entity_pk_value,
            nickname: res.nickname,
            review_id: res.review_id,
            status_id: res.status_id,
            title: res.title,
            rating: res.rating,
          },
        ],
      });
    });

    this.setState({
      ratings,
      totalreviews: response.length,
    });
  }

  public changeRating = (newRating: any) => {
    // alert(newRating)
    this.setState({
      ...this.state,
      rating: newRating,
      ratingsGiven: {
        1: newRating,
        2: 4,
        3: 5,
      },
    });
  };
  async postUserReviews(productId: any) {
    try {
      // this.starValidate()
      // if (this.state.starRatingError) {
      //     return;
      // }
      const {nickname, review_detail, review_title, ratingsGiven} = this.state;
      const reviewData = {
        nickname,
        review_detail,
        review_title,
        ratings: ratingsGiven,
      };
      const response = await this.userRepository.postUserReviews(
        reviewData,
        productId,
      );
      response
        ? this.setState({
            ...this.state,
            isReviewPosted: true,
          })
        : this.setState({
            ...this.state,
            isReviewPosted: false,
          });
      return response;
    } catch (error) {
      console.log(error);
      this.setState({
        ...this.state,
        isupdatingQty: false,
        starRatingError: error,
      });
    }
  }
  starValidate = () => {
    if (!this.state.rating) {
      this.setState({
        ...this.state,
        starRatingError: Error('Please Rate Our Product'),
      });
    }
  };
  public async updateCart(isNewProductAddedordeleted?) {
    try {
      await this.userRepository.getCartDetails(isNewProductAddedordeleted);
      const cartResponse = await this.userRepository.getCartItems({});
      this.setState({
        ...this.state,
        cartResponse,
      });
    } catch (error) {
      this.setState({
        ...this.state,
        isLoading: false,
        error,
      });
    }
  }

  public async updateGuestCart() {
    try {
      await this.userRepository.getGuestCartSummary();
      const cartResponse = await this.userRepository.getGuestCartItems();
      this.setState({
        ...this.state,
        cartResponse,
      });
    } catch (error) {
      this.setState({
        ...this.state,
        isLoading: false,
        error,
      });
    }
  }

  public async productInCartAfterDecrease(data, id?) {
    this.setState({
      ...this.state,
      isLoading: true,
      isQtyUpdated:false,
    });
    try {
      let cartId;
      let itemId;

      if (data.cartItem.qty > 0) {
        let response;
        if (this.userRepository.getState().loggedInToken) {
          if (this.userRepository.getCartId()) {
            cartId = await this.userRepository.getCartId();
          }
          data.cartItem.quote_id = cartId;
          response = await this.userRepository.productInCartAfterDecrease(
            data,
            this.state.item_id,
          );
          await this.updateCart();
        } else {
          response = await this.userRepository.updateProductInGuestCart(
            data,
            this.state.item_id,
          );
          await this.updateGuestCart();
        }
        this.setState({
          ...this.state,
          isLoading: false,
          isQtyUpdated:true,
          quantity: response.qty,
        });
        return response;
      }
      if (data.cartItem.qty <= 0) {
        let response;
        if (this.userRepository.getState().loggedInToken) {
          response = await this.userRepository.deleteCartItem(
            this.state.item_id,
          );
          await this.updateCart();
        } else {
          response = await this.userRepository.deleteProductFromGuestCart(
            this.state.item_id,
          );
          await this.updateGuestCart();
        }
        this.setState({
          ...this.state,
          isLoading: false,
          isQtyUpdated:true,
          quantity: data.cartItem.qty,
        });
        return response;
      }
    } catch (error) {
      this.setState({
        ...this.state,
        isLoading: false,
        error,
      });
    }
  }
  async addToWishList(productId: any) {
    this.setState({
      ...this.state,
    fav:true
    });
    await this.userRepository.addToWishList(productId);
  }
  public async getRelatedProducts(linkedProducts) {
    this.setState({
      ...this.state,
      isLoading: true,
    });
    try {
      const relatedProducts: any = [];
      const inventoryItems = this.userRepository.getState().inventoryItems;
      for (const product of linkedProducts) {
        const response = await this.userRepository.getProductDescription(
          product.linked_product_sku,
        );
        inventoryItems &&
          inventoryItems &&
          inventoryItems.length > 0 &&
          inventoryItems.map((inventory: any) => {
            response.items.length > 0 &&
              response.items.map((item: any) => {
                item.sku === inventory.sku &&
                  inventory.quantity > 0 &&
                  inventory.status === 1 &&
                  item.status === 1 &&
                  relatedProducts.push(item);
              });
          });
      }
      this.setState({
        ...this.state,
        isLoading: false,
        relatedProducts,
      });
    } catch (error) {
      this.setState({
        ...this.state,
        isLoading: false,
        error,
      });
    }
  }
}

export interface ProductOptionsState {
  value: String;
}
export class ProductOptionsViewModel extends BaseViewModel {
  protected state: ProductOptionsState;

  constructor(model: any) {
    super();
    // this.state = this.defaultState()
    this.state = this.getDefaultState(model);
  }

  protected defaultState() {
    return {};
  }

  public getDefaultState(model) {
    return {
      value: model.value ? model.value : model.values[0].title,
    };
  }
}