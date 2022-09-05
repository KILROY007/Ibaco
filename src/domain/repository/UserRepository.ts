import { ApiManager } from '../api/ApiManager'
import { AutoSubscribeStore, StoreBase, autoSubscribe } from 'resub'
import analytics from '@react-native-firebase/analytics';
import firebase from '@react-native-firebase/app';
import constants from '../../resources/constants'
import AsyncStorage from '@react-native-community/async-storage'
import { ValidationUtils } from '../../core/ValidationUtils'
import _ from 'lodash'

export interface UserState {
    isAutoLoggingIn: boolean,
    loggedInToken?: string,
    loggedInUser?: any,
    autoLoginError?: any,
    guestUserToken: any,
    timeToCancel:number,
    pincode: any,
    inventoryItems: any,
    sourceLocationError?: Error,
    inventorySources: any,
    isDelivery: boolean,
    shouldShowAccountStack: boolean,
    isOpen: boolean,
    pickupLocation: any,
    pickupAddress: any,
    cartSummary: any
    cartItems: any
    isLoggedOut:boolean;
    cart_id: any,
    relatedCartItems: any,
    isCouponApplied: boolean,
    couponCode: string,
    isPincodeValid: boolean,
    categories: any,
    sourcePincode: string
    defaultStorePincode: string,
    walletBalance: any
}

@AutoSubscribeStore
export class UserRepository extends StoreBase {
    private apiManager: ApiManager
    private preferences: any
    private state: UserState = UserRepository.defaultState()
    private relevantProductsSku = new Set()

    static defaultState() {
        return {
            isAutoLoggingIn: true,
            loggedInToken: undefined,
            loggedInUser: undefined,
            autoLoginError: undefined,
            order_history: undefined,
            guestUserToken: undefined,
            pincode: '600091',
            timeToCancel:5,
            inventoryItems: [],
            sourceLocationError: undefined,
            inventorySources: [],
            isDelivery: true,
            shouldShowAccountStack: false,
            isLoggedOut:false,
            isOpen: false,
            pickupLocation: '',
            pickupAddress: [],
            cartSummary: undefined,
            cartItems: [],
            cart_id: undefined,
            relatedCartItems: [],
            isCouponApplied: false,
            couponCode: '',
            isPincodeValid: false,
            categories: [],
            sourcePincode: '',
            defaultStorePincode: 'default',
            walletBalance: 0,
        }
    }

    @autoSubscribe
    public getState() {
        return this.state
    }

    private setState(newState: any) {
        this.state = newState
        this.trigger()
    }
    public set(key: string, value: any) {
        const newState = {
            ...this.state,
        }
        newState[key] = value
        this.setState(newState)
    }

    public setMany(object) {
        const newState = {
            ...this.state,
        }
        for (const key in object) {
            if (object.hasOwnProperty(key)) {
                newState[key] = object[key]
            }
        }
        this.setState(newState)
    }

    constructor(apiManager: ApiManager, preferences: any, private validationUtils: ValidationUtils) {
        super()
        this.apiManager = apiManager
        this.preferences = preferences
    }

    public async saveFcm(data:any) {
        try {
            const response = await this.apiManager.saveFcm(data)
            this.setState({
                ...this.state,
            })
            return response
        } catch (error) {
            throw error
        }
    }

    public async signUp(data) {
        try {
            const response = await this.apiManager.signUp(data)
            this.logUserProperties(response)
            this.setState({
                ...this.state,
                loggedInUser: response,
            })
            return response
        } catch (error) {
            throw error
        }
    }
    // update mobile number 

    public async updateMobileNumber(data) {
        try {
            const response = await this.apiManager.updateMobileNumber(data)
            this.setState({
                ...this.state,
            })
            return response
        } catch (error) {
            throw error
        }
    }
    // OTP Generate
    public async generateOtp(data) {
        try {
            const response = await this.apiManager.generateOtp(data)
            this.setState({
                ...this.state,
            })
            return response
        } catch (error) {
            throw error
        }
    }
    // OTP Verify
    public async verifyotp(data) {
        try {
            const response = await this.apiManager.verifyotp(data)

            await this.preferences.setItem(constants.LOGGED_IN_TOKEN, response[0].token)
            const guestToken = await this.preferences.getItem(constants.GUEST_USER_TOKEN)
            if (guestToken) {
                await this.preferences.removeItem(constants.GUEST_USER_TOKEN)
            }
            if (response[0].token) {
                this.getProfileInfo();
            }
            this.setState({
                ...this.state,
                loggedInToken: response,
                guestUserToken: undefined,
            })
            return response
        } catch (error) {
            throw error
        }
    }
    // Login user 
    public async login(data) {
        try {
            const response = await this.apiManager.login(data)
            console.log("loginresponse", response)
            await this.preferences.setItem(constants.LOGGED_IN_TOKEN, response[0].token)
            const guestToken = await this.preferences.getItem(constants.GUEST_USER_TOKEN)
            if (guestToken) {
                await this.preferences.removeItem(constants.GUEST_USER_TOKEN)
            }
            this.getProfileInfo()
            this.setState({
                ...this.state,
                loggedInToken: response,
                guestUserToken: undefined,
            })
            return response
        } catch (error) {
            throw error
        }
    }

    public setShouldShowAccountStack() {
        this.setState({
            ...this.state,
            shouldShowAccountStack: true,
        })
    }

    // Logout user 
    public async logout() {
        try {
            await this.preferences.clear()
            this.emptyCart()
            const guestToken = await this.preferences.getItem(constants.GUEST_USER_TOKEN)
            if (guestToken) {
                await this.preferences.removeItem(constants.GUEST_USER_TOKEN)
            }
            this.setState({
                ...this.state,
                loggedInUser: undefined,
                shouldShowAccountStack: false,
                isAutoLoggingIn: false,
                isLoggedOut:true,
                loggedInToken: undefined,
            })
            await this.getGuestUserToken()
        } catch (error) {
            throw error
        }
    }
    public async getStores(postcode: any) {
        try {
            this.setState({
                ...this.state,
                isLoading: true,
            });
            //@ts-ignore
            const response = await this.apiManager.getStores(postcode);
            this.setState({
                ...this.state,
                isLoading: false,
            });
            return response;
        } catch (error) {
            throw error;
        }
    }
    setPickupAddress(item?: any) {
        if (item) {
            this.set('pickupAddress', item)
            this.preferences.setItem(constants.PICK_UP_ADDRESS, JSON.stringify(this.state.pickupAddress))
        } else {
            this.set('pickupAddress', undefined)
            this.preferences.removeItem(constants.PICK_UP_ADDRESS)
        }
    }

    setPincodeForDelivery(pincode) {
        this.set('pincode', pincode)
        this.preferences.setItem('pincode', pincode)
    }

    public validatePincode(pincode) {
        if (this.validationUtils.isValidPincode(pincode)) {
            this.setState({
                ...this.state,
                isPincodeValid: true,
            })
        } else {
            this.setState({
                ...this.state,
                isPincodeValid: false,
            })
        }
    }

    async autoSignIn() {
        
        const pickUpAddress = await this.preferences.getItem(constants.PICK_UP_ADDRESS)
        if (pickUpAddress) {
            const pickupAddress = JSON.parse(pickUpAddress)
            this.setState({
                ...this.state,
                pickupAddress,
                pincode: pickupAddress.postcode,
                isDelivery: false,
            })
        } else {
            const pincode = await AsyncStorage.getItem('pincode')
            if (pincode) {
                this.setState({ ...this.state, pincode, isDelivery: true })
            }
        }

        const token = await this.preferences.getItem(constants.LOGGED_IN_TOKEN)
        if (token) {
            try {
                this.setState({
                    ...this.state,
                    autoLoginError: undefined,
                    loggedInToken: token,
                })

                const response = await this.apiManager.getProfileInfo()
                this.logUserProperties(response)
                this.setState({
                    ...this.state,
                    loggedInUser: response,
                })

            } catch (error) {
                this.setState({
                    ...this.state,
                    autoLoginError: error,
                    isAutoLoggingIn: false,
                })
            }
        } else {
            const loggedInUser = { ...this.state.loggedInUser }
            this.setState({
                ...this.state,
                autoLoginError: undefined,
                isAutoLoggingIn: false,
                loggedInUser,
            })
        }
    }

    public async getCustomerToken(data) {
        try {
            const response = await this.apiManager.getCustomerToken(data)
            await this.preferences.setItem(constants.LOGGED_IN_TOKEN, response)
            this.setState({
                ...this.state,
                loggedInToken: response,
            })
            return response
        } catch (error) {
            throw error
        }
    }

    public async getGuestUserToken() {
        let response
        try {
            const guestToken = await this.preferences.getItem(constants.GUEST_USER_TOKEN)
            if (guestToken) {
                response = guestToken
                await this.getGuestCartSummary(true)
                await this.getGuestCartItems()
            } else {
                response = await this.apiManager.getGuestUserToken()
                await this.preferences.setItem(constants.GUEST_USER_TOKEN, response)
            }
            this.setState({
                ...this.state,
                guestUserToken: response,
            })
            return response
        } catch (error) {
            throw error
        }
    }

    public async getOrderHistoryList(data) {

        try {
            const response = await this.apiManager.getOrderHistoryList(data)
            this.setState({
                ...this.state,
                order_history: response,
            })
            return response
        } catch (error) {
            throw error
        }

    }
    public async updateProfileInfo(data) {
        try {
            const response = await this.apiManager.updateProfileInfo(data)
            this.logUserProperties(response)
            this.setState({
                ...this.state,
                loggedInUser: response,
            })
            return response

        } catch (error) {
            throw error
        }
    }
  
    public async getProducts(id, searchKey?) {
        try {
            const jsonValue = await AsyncStorage.getItem('storeSelectedPincode')
            const response = await this.apiManager.getProducts(id, jsonValue)
            return response
        } catch (error) {
            throw error
        }
    }
    public async estimateShippingMethods(data) {
        try {
            const response = await this.apiManager.estimateShippingMethods(data)
            return response

        } catch (error) {
            throw error
        }

    }
    public async getDeliveryFee(data) {
        try {
            const response = await this.apiManager.getDeliveryFee(data)
            return response

        } catch (error) {
            throw error
        }

    }

    //shippingInformation

    public async shippingInformation(data) {
        try {
            const response = await this.apiManager.shippingInformation(data)
            return response

        } catch (error) {
            throw error
        }

    }
    //paymentInformation

    public async paymentInformation(data) {
        try {
            const response = await this.apiManager.paymentInformation(data)
            return response

        } catch (error) {
            throw error
        }

    }
    //orderByPaymentId
    public async orderByPaymentId(data, addressType?) {
        try {
            const response = await this.apiManager.orderByPaymentId(data)
            if (addressType) {
                await this.preferences.setItem('OrderId', JSON.stringify(data))
                await this.preferences.setItem('OrderResponse', JSON.stringify(response))
            }
            return response

        } catch (error) {
            throw error
        }

    }

    //cancelOrder
    public async cancelOrder(data) {
        try {
            const response = await this.apiManager.cancelOrder(data)
            return response

        } catch (error) {
            throw error
        }

    }
    async updateCustomPaymentInfo(data: any) {
        try {
          const response = await this.apiManager.updateCustomPaymentInfo(data);
          return response;
        } catch (error) {
          throw error;
        }
      }
    async getTrackingId(orderId: any) {
        try {
          const response = await this.apiManager.getTrackingId(orderId);
          return response;
        } catch (error) {
          throw error;
        }
      }
    //getProfileInfo have to remove
    async getOrderStatus(trackId:any) {
        try { 
          const response =await this.apiManager.getOrderStatus(trackId);
          return response;
        } catch (error) {
          throw error;
        }
      }
    public async getProfileInfo(token?) {
        try {
            const response = await this.apiManager.getProfileInfo()
           this.logUserProperties(response);
            this.setState({
                ...this.state,
                loggedInUser: response,
            })
            return response
        } catch (error) {
            throw error
        }
    }
    public async getSources() {
        try {
            const response = await this.apiManager.getSources()
            return response
        } catch (error) {
            throw error
        }
    }

    public async getInventorySourceItems(pincode) {
        try {
            const response = await this.apiManager.getInventorySourceItems(pincode)
            return response
        } catch (error) {
            throw error
        }
    }

    public async getSourcePincode(pincode) {
        try {
            const response = await this.apiManager.getSourcePincode(pincode)
            return response
        } catch (error) {
            throw error
        }
    }

    public async getOrderId(useWalletBalance) {
        try {
            const response = await this.apiManager.getOrderId(useWalletBalance)
            return response
        } catch (error) {
            throw error
        }
    }
    public async getPaymentMethods() {
        try {
            const response = await this.apiManager.getPaymentMethods()
            return response
        } catch (error) {
            throw error
        }
    }

    public async getProductDescription(productSku) {
        try {
            const response = await this.apiManager.getProductDescription(productSku)
            return response
        } catch (error) {
            throw error
        }
    }

    public async getGuestCartItems() {
        try {
            let response: any
            response = await this.apiManager.getGuestCartItems()
            this.setState({
                ...this.state,
                cartItems: response,
            })
            return response
        } catch (error) {
            throw error
        }
    }

    public async getGuestCartSummary(isNewItemAddedOrDeleted?) {
        try {
            let response: any
            response = await this.apiManager.getGuestCartSummary()
            this.setState({
                ...this.state,
                cartSummary: response,
            })
            if (isNewItemAddedOrDeleted) {
                response && this.state.cartSummary !== undefined && this.state.cartSummary.items.map(async (item: any, index: any) => {
                    await this.getRelevantProducts(item.name)
                    index === this.state.cartSummary.items.length - 1 && await this.getRelevantProductDetails()
                })
            }
            return response
        } catch (error) {
            throw error
        }
    }

    public async activateCart() {
        try {
            const response = await this.apiManager.activateCart()
            this.setState({
                ...this.state,
                cart_id: response,
            })
            return response
        } catch (error) {
            throw error
        }
    }

    public async getCartDetails(isNewItemAddedOrDeleted?) {
        try {
            let response: any
            this.relevantProductsSku.clear()
            response = await this.apiManager.getCartDetails()
            this.setState({
                ...this.state,
                cartSummary: response,
                // relatedCartItems: [],
            })
            if (isNewItemAddedOrDeleted) {
                response && this.state.cartSummary !== undefined && this.state.cartSummary.items.map(async (item: any, index: any) => {
                    await this.getRelevantProducts(item.name)
                    index === this.state.cartSummary.items.length - 1 && await this.getRelevantProductDetails()
                })
            }
            return response
        } catch (error) {
            throw error
        }
    }

    public async getRelevantProducts(productName: string) {
        try {
            const response = await this.apiManager.getRelevantProductsName(productName)

            console.log(response,"guest")
            response.items.map((item: any, index: any) => {
                item.product_links.forEach((element: any, i: any) => {
                    this.relevantProductsSku.add(element.linked_product_sku)
                })
            })

        } catch (error) {
            throw error
        }
    }

    public async getRelevantProductDetails() {
        try {
            const productSku = Array.from(this.relevantProductsSku)
            if (productSku.length) {
                const response = await this.apiManager.getRelavantProductsDetails(productSku)
                const relatedItems = new Set()
                this.state.inventoryItems && this.state.inventoryItems.length > 0 && this.state.inventoryItems.map((inventory: any) => {
                    response.items.length > 0 && response.items.map((item: any) => {
                        item.sku === inventory.sku && inventory.quantity > 0 && inventory.status === 1 && item.status === 1 &&
                            relatedItems.add(item)
                    })
                })
                const related = Array.from(relatedItems)
                related && related.length && related.map((item: any) => {
                    const value = _.find(this.state.cartSummary.items,
                        (cartItem) => cartItem.name === item.name)

                    if (value) {
                        relatedItems.delete(item)
                    }
                })
                this.setState({
                    ...this.state,
                    relatedCartItems: Array.from(relatedItems),
                })
            } else {
                this.setState({
                    ...this.state,
                    relatedCartItems: [],
                })
            }
        } catch (error) {
            throw error
        }
    }

    public async getCartItems(data) {
        try {
            let response: any
            response = await this.apiManager.getCartItems()
            this.setState({
                ...this.state,
                cartItems: response,
            })
            return response
        } catch (error) {
            throw error
        }
    }

    public async addToCart(data) {
        try {
            const response = await this.apiManager.addToCart(data)
            return response
        } catch (error) {
            throw error
        }
    }
    public async productInCartAfterDecrease(data, itemId) {
        try {
            const response = await this.apiManager.productInCartAfterDecrease(data, itemId)
            return response

        } catch (error) {
            throw error
        }
    }

    public async deleteCartItem(itemId) {
        try {
            const response = await this.apiManager.deleteCartItem(itemId)
            return response
        } catch (error) {
            throw error
        }
    }
    public emptyCart() {
        this.setState({
            ...this.state,
            cartSummary: undefined,
            cartItems: [],
            cart_id: undefined,
            couponCode: '',
            isCouponApplied: false,
        })
    }
    public async getUserReviews(productId: any) {
        const response = await this.apiManager.getUserReviews(productId);
        return response
    }
    
    public async postUserReviews(reviewData: any, productId: any) {
        const response = await this.apiManager.postUserReviews(reviewData, productId, this.state.loggedInUser?.id);
        return response
    }
    public async getCartId() {
        if (this.state.cart_id) {
            return this.state.cart_id
        } else {
            await this.activateCart()
            return this.state.cart_id
        }
    }

    //coupon
    public async applyCoupon(couponCode) {
        try {
            let response
            if (this.state.cart_id) {
                response = await this.apiManager.applyCoupon(couponCode)
                await this.getCartDetails()
                // return response
            } else {
                response = await this.apiManager.applyGuestCartCoupon(couponCode)
                await this.getGuestCartSummary()
            }
            this.setState({ ...this.state, isCouponApplied: true })
            return response
        } catch (error) {
            throw error
        }
    }
    public async deletCouponCode() {
        try {
            let caetDetailsAfterCoupon
            let response
            if (this.state.cart_id) {
                response = await this.apiManager.deletCoupon()
            } else {
                response = await this.apiManager.deletGuestCoupon()
            }
            if (this.state.cart_id) {
                caetDetailsAfterCoupon = await this.getCartDetails()
            } else {
                caetDetailsAfterCoupon = await this.getGuestCartSummary()
            }
            this.setState({ ...this.state, isCouponApplied: false, couponCode: '' })
            return caetDetailsAfterCoupon
        } catch (error) {
            throw error
        }
    }

    public async getCouponCode() {
        try {
            let response
            if (this.state.cart_id) {
                response = await this.apiManager.getCouponCode()
            } else {
                response = await this.apiManager.getGuestCouponCode()
            }
            return response
        } catch (error) {
            throw error
        }

    }

    public async deleteProductFromGuestCart(id) {
        try {
            let response: any
            response = await this.apiManager.deleteProductFromGuestCart(id)
            return response
        } catch (error) {
            throw error
        }
    }

    public async updateProductInGuestCart(data, id) {
        try {
            let response: any
            response = await this.apiManager.updateProductInGuestCart(data, id)
            return response
        } catch (error) {
            throw error
        }
    }

    public async setCartGuestUsersCartDetails(data) {
        try {

            this.setState({
                ...this.state,
                cartItems: data.cartItems,
                cartSummary: data.cartSummary,
            })
        } catch (error) {
            throw error
        }
    }
   
    public async addToGuestCart(data) {
        try {
            
            const response = await this.apiManager.addToGuestCart(data)
            return response
        } catch (error) {
            throw error
        }
    }

    public async getRelevantProductsName(productName: string) {
        try {
            const response = await this.apiManager.getRelevantProductsName(productName)
            return response
        } catch (error) {
            throw error
        }
    }

    public async getRelavantProductsDetails(productRelevantSku?: any) {
        try {
            const response = await this.apiManager.getRelevantProductsDetails(productRelevantSku)
            this.setState({
                relatedCartItems: response.items,
            })
            return response
        } catch (error) {
            throw error
        }
    }
    public async getRecentProductsDetails(productId: any) {
        try {
            const response = await this.apiManager.getRecentProductsDetails(productId)
            
            return response
        } catch (error) {
            throw error
        }
    }
    public async getIWantStrings(id) {
        try {
            const response = await this.apiManager.getIWantStrings(id)
            return response
        } catch (error) {
            throw error
        }
    }

    public async sendEmailOnSubmit(data: any) {
        try {
            const response = await this.apiManager.sendEmailOnSubmit(data)
            return response
        } catch (error) {
            throw error
        }
    }
    async createRecentProducts(productId:any){
        try {
         if(this.state.loggedInUser){
          await this.apiManager.createRecentProducts(productId,this.state.loggedInUser?.id);
         }
        } catch (error) {
          throw error;
        }
      }
    
      public async getRecentProductsId() {
        try {
            if(this.state.loggedInUser){
          const response = await this.apiManager.getRecentProductsId(this.state.loggedInUser?.id);
             return response;
            }
        } catch (error) {
          throw error;
        }
      } 
    public async getCarousel() {
        try {
            const response = await this.apiManager.getCarousel()
            return response
        } catch (error) {
            throw error
        }
    }

    public async getLatLongByPincode(data) {
        try {
            const response = await this.apiManager.getLatLongByPincode(data)
            return response
        } catch (error) {
            throw error
        }
    }
    async getRelevantAddresses(value:any){
        try{
          return await this.apiManager.getRelevantAddresses(value)
        }catch(error){
          throw error
        }
      }
    public async checkWalletbalance() {
        try {
            const data = {
                param: {
                    user_id: this.state.loggedInUser?.id,
                }
            }
            const response = await this.apiManager.checkWalletbalance(data)
            return response
        } catch (error) {
            throw error
        }
    }

    public async updateWalletBalance(reqbody) {
        try {
            const data = {
                param: {
                    ...reqbody,
                },
            }
            const response = await this.apiManager.updateWalletBalance(data)
            return response
        } catch (error) {
            throw error
        }
    }

    public async getOrderIdForWallet(amount) {
        try {
            const data = {
                param: {
                    amount,
                },
            }
            const response = await this.apiManager.getOrderIdForWallet(data)
            return response
        } catch (error) {
            throw error
        }
    }

    public async addCustmization(data: any) {
        try {
            const response = await this.apiManager.addCustumization(data)
            return response
        } catch (error) {
            throw error
        }
    }

async saveLatLng(data:any){
    try {
      const response = await this.apiManager.saveLatLng(data);
      return response;
    } catch (error) {
      throw error;
    }
  
  }
  async postOrderDetails(orderId:any,storeId:any) {
    try {
      const response = this.apiManager.postOrderDetails(orderId,storeId);
      return response;
    } catch (error) {
      throw error;
    }
  }
    public async getBlogCategaries() {
        try {
            const response = await this.apiManager.getBlogCategaries()
            return response
        } catch (error) {
            throw error
        }
    }

    public async getBlogDetails(tag: any) {
        try {
            const response = await this.apiManager.getBlogDetails(tag)
            return response
        } catch (error) {
            throw error
        }
    }

    public async getTelyportId(orderId: any) {
        try {
            const response = await this.apiManager.getTelyportId(orderId)
            return response
        } catch (error) {
            throw error
        }
    }

    public async getTelyportOrderDetails(id: any) {
        try {
            const response = await this.apiManager.getTelyportOrderDetails(id)
            return response
        } catch (error) {
            throw error
        }
    }

    public async getFavouriteItems() {
        try {
            if(this.state.loggedInUser?.id){
            const response = await this.apiManager.getFavouriteItems(this.state.loggedInUser?.id)
            return response
            }
        } catch (error) {
            throw error
        }
    }
    public async createUserFromGoogle(userData: any) {
        try {
          this.setState({
            ...this.state,
            isLoading: true,
          });
          const response=await this.apiManager.createUserFromGoogle(userData);
          await this.preferences.setItem(constants.LOGGED_IN_TOKEN, JSON.parse(response.cust_token))
            const guestToken = await this.preferences.getItem(constants.GUEST_USER_TOKEN)
            if (guestToken) {
                await this.preferences.removeItem(constants.GUEST_USER_TOKEN)
            }
            this.getProfileInfo()
            this.setState({
                ...this.state,
                loggedInToken: response,
                guestUserToken: undefined,
            })
          this.setState({
            ...this.state,
            isLoading: false,
          });
          return response
        } catch (error) {
          throw error;
        }
      }
      public async checkUserFromGoogle(email: any) {
        try {
          this.setState({
            ...this.state,
            isLoading:true,
          });
          const response=await this.apiManager.checkUserFromGoogle(email);
          this.setState({
            ...this.state,
            isLoading: false,
          });
          return response
        } catch (error) {
          throw error;
        }
      }
    async getTimeToCancel(){
        try{
         const response=await this.apiManager.getTimeToCancel();
         return response
        }catch (error) {
         throw error;
       }
      }
    public async addToWishList(productId:any){
        try {
            if(this.state.loggedInUser){
            await this.apiManager.addToWishList(productId,this.state.loggedInUser?.id)
           }
    
        } catch (error) {
          throw error;
    
        }
      }
      public async removeWishListItems(productId:any){
        return await this.apiManager.removeWishListItems(productId,this.state.loggedInUser?.id); 
      }
      public async removeAllWishListItems(){
        return await this.apiManager.removeAllWishListItems(this.state.loggedInUser?.id); 
      }
      public getInventorySources() {
        return this.state.inventorySources
     }
      //-----------------------------logging in analytics-------------------------------------------//
      public async logAddToCart(addToCartObject:any,isDecrease?){
        try{
            if(isDecrease){
            analytics().logRemoveFromCart(addToCartObject).then(() => {
                    console.log(' ---------------- Logging remove from cart success ------------- ',addToCartObject);
                }); 
            }
            else{
            analytics().logAddToCart(addToCartObject).then(() => {
                console.log(' ---------------- Logging add to cart success ------------- ',addToCartObject);
            });
            }}
        catch (error) {
            throw error
          }
      }
    public logUserProperties=async(user:any)=>{
        try{
        await Promise.all([
            analytics().setUserId(JSON.stringify(user.id)),
            analytics().setUserProperty('name',user.firstname+" "+user.lastname),
         ]);
        }catch (error) {
            throw error
         }
     }
    public async logWishlist(wishObject:any){
     try{
            analytics().logAddToWishlist(wishObject).then(() => {
            console.log(' ---------------- Logging add to wish list success ------------- ',wishObject);
      });
     }catch (error) {
        throw error
     }
 }
}