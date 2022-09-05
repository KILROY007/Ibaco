import {BaseViewModel} from './BaseViewModel';
import AsyncStorage from '@react-native-community/async-storage';
import {UserRepository} from '../domain/repository/UserRepository';
import {ValidationUtils} from '../core/ValidationUtils';
import Strings from '../resources/String';
import Constants from '../resources/constants';

export interface ShopHeaderState {
  isDelivery: boolean;
  pincode: any;
  pickUpAddress: any;
  isOpen: boolean;
  isLoading: boolean;
  error?: Error;
  alertDetails: any;
  storeList: any[];
  pincodeError: boolean;
  pickupLocationName: string;
  sourcePincode: string;
  selectedStore: any;
  isPincodeSelected: boolean;
  shopdailog: boolean;
  storeInfo: any[];
  storeCheckbox: boolean;
  storeSelectedPincode: string;
}

export class ShopHeaderViewModel extends BaseViewModel {
  protected state: ShopHeaderState;
  SelectedAddressPinCode: any;

  constructor(
    private userRepository: UserRepository,
    private validationUtils: ValidationUtils,
  ) {
    super();
    this.state = this.defaultState();
  }

  protected defaultState() {
    return {
      isDelivery: true,
      pincode: '',
      pickUpAddress: '',
      isOpen: false,
      isLoading: false,
      error: undefined,
      alertDetails: undefined,
      pincodeError: false,
      isPincodeSelected: false,
      pickupLocationName: '',
      sourcePincode: '',
      selectedStore: [],
      shopdailog: false,
      storeList: [],
      storeInfo: [],
      storeCheckbox: false,
      storeSelectedPincode: '',
    };
  }

  public validatePincode() {
    if (!this.validationUtils.isValidPincode(this.state.pincode)) {
      const alert = {
        shouldShowCancelButton: false,
        description: Strings.error_invalid_pincode,
        title: Strings.alert_title,
        okButtonText: Strings.button_ok,
        onOkPress: async () => {
          this.set('alertDetails', undefined);
          this.set('isOpen', true);
          this.set('pincodeError', false);
        },
      };
      this.set('alertDetails', alert);
      this.set('pincodeError', true);
    } else if (this.state.selectedStore === undefined) {
      const alert = {
        shouldShowCancelButton: false,
        description: Strings.error_store_not_selected,
        title: Strings.alert_title,
        okButtonText: Strings.button_ok,
        onOkPress: async () => {
          this.set('alertDetails', undefined);
          this.set('isOpen', true);
          this.set('pincodeError', false);
        },
      };
      this.set('alertDetails', alert);
      this.set('pincodeError', true);
    }
    // else {
    //     this.setState({ isPincodeSelected: true })
    // }
  }
  async setDefaultStore(storeId) {
    try {
      const response = await this.userRepository.getSources();
      if (response && response.items.length) {
        const keys: any = [];
        response.items.length > 0 &&
          response.items.map((source: any, index: any) => {
            if (source.source_code == storeId && source.enabled) {
              keys.push(source);
            }
          });
        this.setState({
          ...this.state,
          storeId: keys[0].source_code,
          pincode: keys[0].postcode,
          selectedStore: keys[0],
        });
    }
  }catch(error) {
      throw error;
    }
  
}
  async setDefaultPincode() {
    try {
      const response = await this.userRepository.getSources();
      if (response && response.items.length) {
        const keys: any = [];
        response.items.length > 0 &&
          response.items.map((source: any, index: any) => {
            if (source.source_code !== 'default' && source.enabled) {
              keys.push(source);
            }
          });
        await AsyncStorage.setItem(
          Constants.NEAREST_STORE,
          keys[0].source_code,
        );
        await AsyncStorage.setItem(Constants.NEAREST_CODE, keys[0].postcode);
        this.userRepository.setPincodeForDelivery(keys[0].postcode);
        await AsyncStorage.setItem('storeSelectedPincode', keys[0].source_code);
        this.setState({
          ...this.state,
          storeId: keys[0].source_code,
          pincode: keys[0].postcode,
          selectedStore: keys[0],
        });
      } else {
        // await this.getLocation();
        this.setState({isOpen: true});
      }
    } catch (error) {
      throw error;
    }
  }
  public async checkForCartItems(cartItems) {
    if (!this.state.pincodeError) {
      this.userRepository.set('isDelivery', this.state.isDelivery);
      if (cartItems && cartItems.length) {
        const alert = {
          shouldShowCancelButton: true,
          description: Strings.alert_onRemoveItem_onChange_location,
          title: Strings.alert_title,
          okButtonText: Strings.button_ok,
          onCancelPress: async () => {
            this.set('alertDetails', undefined);
            const {pickupAddress, pincode} = this.userRepository.getState();
            this.setMany({
              pickUpAddress: pickupAddress,
              pincode,
            });
          },
          onOkPress: async () => {
            this.set('alertDetails', undefined);
            if (this.state.isDelivery) {
              this.setMany({
                pincodeError: false,
                pickUpAddress: undefined,
                pickupLocationName: '',
              });
              this.userRepository.setPincodeForDelivery(this.state.pincode);
              this.userRepository.setPickupAddress();
            } else {
              this.setMany({
                pincode: this.state.pickUpAddress.postcode,
              });
              this.userRepository.setPickupAddress(this.state.pickUpAddress);
              this.userRepository.set('pincode', this.state.pincode);
            }
            await this.emptyCart(cartItems);
            await this.getSourcePincode(this.state.pincode);
          },
        };
        this.set('alertDetails', alert);
      } else {
        if (this.state.isDelivery) {
          this.setMany({
            pincodeError: false,
            pickUpAddress: undefined,
            pickupLocationName: '',
          });
          this.userRepository.setPincodeForDelivery(this.state.pincode);
          this.userRepository.setPickupAddress();
        } else {
          this.setMany({
            pincode: this.state.pickUpAddress.postcode,
          });
          this.userRepository.setPickupAddress(this.state.pickUpAddress);
          this.userRepository.set('pincode', this.state.pincode);
        }
        this.getSourcePincode(this.state.pincode);
      }
    }
  }
  public async getStoreList(pincode: any) {
    try {
      this.setState({
        ...this.state,
        isLoading: true,
        storeInfo: [],
        selectedStore: '',
        storeSelectedPincode: '',
      });
      const response = await this.userRepository.getStores(pincode);

      // console.log(response);
      // console.log(response.items.length,"lengthhh")
      if (response.status === 0) {
        this.setState({
          ...this.state,
          isOpen: false,
          shopdailog: true,
          isLoading: false,
        });
      } else if (response[0].items.length) {
        response[0].items.map((items: any) => {
          this.setState({
            ...this.state,
            storeInfo: [...this.state.storeInfo, items],
          });
        });
      } else {
        this.setState({
          ...this.state,
          isOpen: false,
          shopdailog: true,
          isLoading: false,
        });
      }

      this.setState({
        ...this.state,
        isLoading: false,
      });
    } catch (error) {
      throw error;
    }
  }
  public async getStores() {
    try {
      this.setState({
        ...this.state,
        storeInfo: [],
        shopdailog: false,
        isLoading: true,
        isOpen: false,
      });
      //@ts-ignore
      const response = await this.userRepository.getStores(this.state.pincode);
      response.items.map((items: any) => {
        this.setState({
          ...this.state,
          storeInfo: [...this.state.storeInfo, items],
        });
      });
      this.setState({
        ...this.state,
        shopdailog: true,
        isLoading: false,
      });
      return response;
    } catch (error) {
      throw error;
    }
  }
  private async emptyCart(cartItems) {
    try {
      this.setState({
        ...this.state,
        isLoading: true,
      });
      const loggedInToken = this.userRepository.getState().loggedInToken;
      this.userRepository.emptyCart();
      for (const item of cartItems) {
        if (loggedInToken) {
          await this.userRepository.deleteCartItem(item.item_id);
          await this.updateCart();
        } else {
          await this.userRepository.deleteProductFromGuestCart(item.item_id);
          await this.updateGuestCart();
        }
      }
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

  public async updateCart(isNewItemAddedOrDeleted?) {
    try {
      await this.userRepository.getCartDetails(isNewItemAddedOrDeleted);
      await this.userRepository.getCartItems({});
    } catch (error) {
      this.setState({
        ...this.state,
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
        error,
      });
    }
  }

  public async getSourcePincode(pincode: any) {
    try {
      this.setState({
        ...this.state,
        isLoading: true,
      });
      const defaultStorePincode = await this.userRepository.getState()
        .defaultStorePincode;
      const response = await this.userRepository.getSourcePincode(pincode);
      if (response[0].source_pincode) {
        this.userRepository.set('sourcePincode', response[0].source_pincode);
        this.setState({
          ...this.state,
          sourcePincode: response[0].source_pincode,
        });
        await this.getSources();
      } else {
        this.userRepository.set('sourcePincode', defaultStorePincode);
        await this.getInventorySourceItems(defaultStorePincode);
      }
      this.setState({
        ...this.state,
        isLoading: false,
        isOpen: false,
      });
    } catch (error) {
      this.setState({
        ...this.state,
        isLoading: false,
        error,
      });
    }
  }

  public async getSources() {
    try {
      const response = this.userRepository.getState().inventorySources;
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
      const response = await this.userRepository.getInventorySourceItems(
        sourceCode,
      );
      this.userRepository.set('inventoryItems', response.items);
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
  public async getLocation(position: any) {
    try {
      const keys: any = [];

      const response = await this.userRepository.getSources();
      response.items.length > 0 &&
        response.items.map((source: any, index: any) => {
          if (source.source_code !== 'default' && source.enabled) {
            keys.push(source);
          }
        });
      let returnedValue = await keys.reduce((prevCord, thing) => {
        let dist = this.getDistance(
          position.coords.latitude,
          position.coords.longitude,
          thing.latitude,
          thing.longitude,
        );
        let prevDist = this.getDistance(
          position.coords.latitude,
          position.coords.longitude,
          prevCord.latitude,
          prevCord.longitude,
        );
        return dist < prevDist ? thing : prevCord;
      }, keys[0]);
      this.getStoreList(returnedValue.postcode);
      await AsyncStorage.setItem(
        Constants.NEAREST_STORE,
        returnedValue.source_code,
      );
      await AsyncStorage.setItem(
        Constants.NEAREST_CODE,
        returnedValue.postcode,
      );
      this.userRepository.setPincodeForDelivery(returnedValue.postcode);
      await AsyncStorage.setItem(
        'storeSelectedPincode',
        returnedValue.source_code,
      );
      this.setState({
        ...this.state,
        storeId: returnedValue.source_code,
        pincode: returnedValue.postcode,
        selectedStore: returnedValue,
      });
    } catch (error) {
      throw error;
    }
  }
  getDistance = (lat1: any, lon1: any, lat2: any, lon2: any) => {
    let R = 6371; // km
    let dLat = this.toRad(lat2 - lat1);
    let dLon = this.toRad(lon2 - lon1);
    let lat11 = this.toRad(lat1);
    let lat22 = this.toRad(lat2);

    let a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLon / 2) *
        Math.sin(dLon / 2) *
        Math.cos(lat11) *
        Math.cos(lat22);
    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    let d = R * c;
    return d;
  };

  // Converts numeric degrees to radians
  toRad = Value => {
    return (Value * Math.PI) / 180;
  };
}
