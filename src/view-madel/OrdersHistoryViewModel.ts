import {BaseViewModel} from './BaseViewModel';
import {UserRepository} from '../domain/repository/UserRepository';
import {Platform} from 'react-native';
import {CartRepository} from '../domain/repository/CartRepository';

export interface OrdersHistoryState {
  isLoading: boolean;
  error?: Error;
  pageLoadError?: Error;
  orderItems: any;
  refreshing: boolean;
  alertDetails: any;
}

export class OrdersHistoryViewModel extends BaseViewModel {
  protected state: OrdersHistoryState;

  constructor(
    private userRepository: UserRepository,
    private cartRepository: CartRepository,
  ) {
    super();
    this.state = this.defaultState();
    this.cartRepository = cartRepository;
  }

  protected defaultState() {
    return {
      isLoading: false,
      error: undefined,
      pageLoadError: undefined,
      orderItems: [],
      refreshing: false,
      alertDetails: undefined,
    };
  }

  public async getOrderInfo() {
    try {
      this.setState({
        ...this.state,
        isLoading: true,
      });
      const loggedInUser = await this.userRepository.getState().loggedInUser;
      if (loggedInUser) {
        const response = await this.userRepository.getOrderHistoryList(
          loggedInUser.id,
        );
        const reverseOrderItem = response.items.reverse();
        this.setState({
          ...this.state,
          orderItems: reverseOrderItem,
          isLoading: false,
        });
      }
      this.setState({
        ...this.state,
        isLoading: false,
      });
    } catch (error) {
      this.setState({
        ...this.state,
        pageLoadError: error,
        isLoading: false,
      });
    }
  }

  public async reOrder(orderItem) {
    try {
      this.setState({
        ...this.state,
        isLoading: true,
      });

      if (orderItem && orderItem.items && orderItem.items.length) {
        const cart_id = await this.userRepository.getCartId();
        for (const item of orderItem.items) {
          await this.addToCart(item, cart_id);
          if (item.name === orderItem.items[orderItem.items.length - 1].name) {
            await this.updateCart();
          }
        }
      }

      this.setState({
        ...this.state,
        isLoading: false,
      });
    } catch (error) {
      this.setState({
        ...this.state,
        error,
        isLoading: false,
      });
    }
  }
  public  getDeliveryFee=async(orderId)=>{
    try {
      const data = {
        orderId,
      };
      console.log(data, 'ress');
      const response = await this.userRepository.getDeliveryFee(data);
      return response;
    } catch (error) {
      this.setState({
        ...this.state,
        error,
        isLoading: false,
      });
    }
  }
  private async addToCart(productItem, cart_id) {
    try {
      let sku = '';
      const skus = productItem.sku.split('-');
      const oLength =
        productItem.product_option &&
        productItem.product_option.extension_attributes &&
        productItem.product_option.extension_attributes.custom_options &&
        productItem.product_option.extension_attributes.custom_options.length
          ? productItem.product_option.extension_attributes.custom_options
              .length
          : 0;
      if (oLength) {
        for (let i = 0; i < skus.length - oLength; i++) {
          sku = `${sku ? sku + '-' : sku}${skus[i]}`;
        }
        if (productItem.name === productItem.sku) {
          sku = productItem.sku;
        }
      } else {
        sku = productItem.sku;
      }
      const cartItem = {
        cartItem: {
          qty: productItem.qty_ordered,
          quote_id: cart_id,
          sku,
          name: productItem.name,
          product_option: productItem.product_option,
          extension_attributes: {},
        },
      };
      const response = await this.userRepository.addToCart(cartItem);
      let addToCartObject = {
        'currency': 'INR',
        'items': [{
            'quantity':1,
            'item_id':JSON.stringify(productItem.item_id),
            'item_name': productItem.name,
        }],
        'value': productItem.price
        };
       await this.userRepository.logAddToCart(addToCartObject)
    } catch (error) {
      this.setState({
        ...this.state,
        error,
        isLoading: false,
      });
    }
  }

  public async updateCart() {
    try {
      this.setState({
        ...this.state,
        isLoading: true,
      });
      await this.userRepository.getCartDetails();
      await this.userRepository.getCartItems({});

      this.setState({
        ...this.state,
        isLoading: false,
      });
    } catch (error) {
      throw error;
    }
  }
}
