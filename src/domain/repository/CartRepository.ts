import { ApiManager } from '../api/ApiManager'
import { AutoSubscribeStore, StoreBase, autoSubscribe } from 'resub'
import constants from '../../resources/constants'
import { CartItemViewModel } from '../../view-madel/CartViewModel'
import { ValidationUtils } from '../../core/ValidationUtils'
import { UserRepository } from './UserRepository'

export interface CartState {
    cartSummary: any
    cartItems: any
    cartItemsViewModel: any
    cart_id: any,
    paymentModal: boolean
    addressModal: boolean
    addressValue: any
    addressId: any,
    couponCode: string,
    validationError?: Error,
    error?: Error,
    onSuccess: boolean,
    couponButton: boolean,
    onDeletSuccess: boolean,
    getCouponCode: string,
    couponError?: Error,
    addItemInCart: boolean,
    deleteItemInCart: boolean,
    addressMethode: string,
    actualCouponCode: string,
    couponCodeIs: String,
    showLoginModal: boolean,
    relatedCartItems: any,
    shouldShowOrderPlacedState: boolean,
    alertDetails: any,
    isLoading: boolean
}

@AutoSubscribeStore
export class CartRepository extends StoreBase {
    private apiManager: ApiManager
    private preferences: any
    private state: CartState = CartRepository.defaultState()
    private relevantProductsSku = new Set()

    static defaultState() {
        return {
            cartSummary: undefined,
            cartItems: [],
            cartItemsViewModel: [],
            paymentModal: false,
            addressModal: false,
            addressValue: undefined,
            addressId: undefined,
            cart_id: undefined,
            couponCode: '',
            validationError: undefined,
            error: undefined,
            onSuccess: false,
            couponButton: true,
            onDeletSuccess: false,
            getCouponCode: '',
            couponError: undefined,
            addItemInCart: false,
            addressMethode: '',
            actualCouponCode: '',
            couponCodeIs: '',
            showLoginModal: false,
            deleteItemInCart: false,
            relatedCartItems: [],
            shouldShowOrderPlacedState: false,
            alertDetails: undefined,
            isLoading: false,
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

    public async getCartDetails() {
        try {
            this.setState({
                ...this.state,
                isLoading: true,
            })
            let response: any
            const cartItems: any = []
            this.relevantProductsSku.clear()
            response = await this.apiManager.getCartDetails()
            for (const item of response.items) {
                const cartItemViewModel = new CartItemViewModel(item)
                cartItems.push(cartItemViewModel)
            }
            this.setState({
                ...this.state,
                cartSummary: response,
                cartItemsViewModel: cartItems,
                // relatedCartItems: [],
            })
            response && this.state.cartSummary !== undefined && this.state.cartSummary.items.map(async (item: any, index: any) => {
                await this.getRelevantProducts(item.name)
                index === this.state.cartSummary.items.length - 1 && await this.getRelevantProductDetails()
            })
            if (!this.state.cartItemsViewModel.length) {

                this.setState({
                    ...this.state,
                    isLoading: false,
                    couponButton: true,
                    couponCode: '',
                    actualCouponCode: ''
                })
            } else {
                this.setState({
                    ...this.state,
                    isLoading: false,
                })
            }


            return response
        } catch (error) {
            this.setState({
                ...this.state,
                isLoading: false,
            })
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
            this.setState({
                ...this.state,
                shouldShowOrderPlacedState: false,
                isLoading: true,
            })
            
            const response = await this.apiManager.addToCart(data)
            this.setState({
                ...this.state,
                isLoading: false,
            })
            return response
        } catch (error) {
            this.setState({
                ...this.state,
                isLoading: false,
            })
            throw error
        }
    }
    public async productInCartAfterDecrease(data, itemId) {
        try {
            this.setState({
                ...this.state,
                isLoading: true,
            })
            const response = await this.apiManager.productInCartAfterDecrease(data, itemId)
            this.setState({
                ...this.state,
                isLoading: false,
            })
            return response

        } catch (error) {
            this.setState({
                ...this.state,
                isLoading: false,
            })
            throw error
        }
    }

    public async deleteCartItem(itemId) {
        try {
            this.setState({
                ...this.state,
                isLoading: true,
            })
            const response = await this.apiManager.deleteCartItem(itemId)
            this.setState({
                ...this.state,
                isLoading: false,
            })
            return response
        } catch (error) {
            this.setState({
                ...this.state,
                isLoading: false,
            })
            throw error
        }
    }
    public emptyCart() {
        this.setState({
            ...this.state,
            cartSummary: undefined,
            cartItemsViewModel: [],
            cartItems: [],
            cart_id: undefined,
        })
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
                return response
            } else {
                response = await this.apiManager.applyGuestCartCoupon(couponCode)
                return response
            }
        } catch (error) {
            throw error
        }
    }
    public async deletCoupon() {
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
            this.setState({
                ...this.state,
                couponButton: true,
                actualCouponCode: '',
                couponCode: '',
            })
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
            this.setState({
                ...this.state,
                actualCouponCode: response,
            })
            return response
        } catch (error) {
            throw error
        }

    }

    private isValid() {
        let error
        if (this.validationUtils.isEmpty(this.state.couponCode) === true) {
            error = Error(`Please enter a valid coupon code to apply`)

            this.setState({
                ...this.state,
                validationError: error,
            })
        }
    }
    async getCoupon() {
        try {
            let caetDetailsAfterCoupon
            this.isValid()
            if (this.state.validationError) {
                return
            }

            const response = await this.applyCoupon(this.state.couponCode)
            const getCoupon = await this.getCouponCode()
            if (response) {
                if (this.state.cart_id) {
                    caetDetailsAfterCoupon = await this.getCartDetails()
                } else {
                    caetDetailsAfterCoupon = await this.getGuestCartSummary()
                }
                if (caetDetailsAfterCoupon) {
                    this.setState({
                        ...this.state,
                        onSuccess: true,
                        couponButton: false,
                        getCouponCode: getCoupon,
                        actualCouponCode: getCoupon
                    })
                }
            }

        } catch (error) {
            this.setState({
                ...this.state,
                couponError: error,
            })
        }
    }
    async deletCouponCode() {

        try {
            let caetDetailsAfterCoupon
            const response = await this.deletCoupon()
            const getCoupon = await this.getCouponCode()
            if (response) {

                // if (caetDetailsAfterCoupon) {
                this.setState({
                    ...this.state,
                    couponCode: '',
                    onDeletSuccess: true,
                    couponButton: true,
                    getCouponCode: '',
                })
                // }
            }

        } catch (error) {
            this.setState({
                ...this.state,
                error,
            })
        }

    }

    // Guest cart
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

    public async getGuestCartSummary() {
        try {
            let response: any
            const cartItems: any = []
            response = await this.apiManager.getGuestCartSummary()
            for (const item of response.items) {
                const cartItemViewModel = new CartItemViewModel(item)
                cartItems.push(cartItemViewModel)
            }
            this.setState({
                ...this.state,
                cartSummary: response,
                cartItemsViewModel: cartItems,
            })
            response && this.state.cartSummary !== undefined && this.state.cartSummary.items.map(async (item: any, index: any) => {
                await this.getRelevantProducts(item.name)
                index === this.state.cartSummary.items.length - 1 && await this.getRelevantProductDetails()
            })
            if (!this.state.cartItemsViewModel.length) {

                this.setState({
                    ...this.state,
                    isLoading: false,
                    couponButton: true,
                    couponCode: '',
                    actualCouponCode: ''
                })
            } else {
                this.setState({
                    ...this.state,
                })
            }
            return response
        } catch (error) {
            throw error
        }
    }

    public async deleteProductFromGuestCart(id) {
        try {
            this.setState({
                ...this.state,
                isLoading: true,
            })
            let response: any
            response = await this.apiManager.deleteProductFromGuestCart(id)
            this.setState({
                ...this.state,
                isLoading: false,
            })
            return response
        } catch (error) {
            this.setState({
                ...this.state,
                isLoading: false,
            })
            throw error
        }
    }

    public async updateProductInGuestCart(data, id) {
        try {
            this.setState({
                ...this.state,
                isLoading: true,
            })
            let response: any
            response = await this.apiManager.updateProductInGuestCart(data, id)
            this.setState({
                ...this.state,
                // isLoading: false,
            })
            return response
        } catch (error) {
            this.setState({
                ...this.state,
                isLoading: false,
            })
            throw error
        }
    }

    public async setCartGuestUsersCartDetails(data) {
        try {
            const cartItems: any = []
            for (const item of data.cartSummary.items) {
                const cartItemViewModel = new CartItemViewModel(item)
                cartItems.push(cartItemViewModel)
            }

            this.setState({
                ...this.state,
                cartItems: data.cartItems,
                cartSummary: data.cartSummary,
                cartItemsViewModel: cartItems
            })
        } catch (error) {
            throw error
        }
    }

    public async addToGuestCart(data) {
        try {
            this.setState({
                ...this.state,
                isLoading: true,
            })
            const response = await this.apiManager.addToGuestCart(data)
            this.setState({
                ...this.state,
                // isLoading: false,
            })
            return response
        } catch (error) {
            this.setState({
                ...this.state,
                isLoading: false,
            })
            throw error
        }
    }

    public async getRelevantProducts(productName: string) {
        try {
            this.setState({
                ...this.state,
                isLoading: true,
            })

            const response = await this.apiManager.getRelevantProductsName(productName)

            response.items.map((item: any, index: any) => {
                item.product_links.forEach((element: any, i: any) => {
                    this.relevantProductsSku.add(element.linked_product_sku)
                })
            })
            // this.setState({
            //     ...this.state,
            //     isLoading: false,
            // })

        } catch (error) {
            this.setState({
                ...this.state,
                isLoading: false,
            })
        }
    }

    public async getRelevantProductDetails() {
        try {
            const productSku = Array.from(this.relevantProductsSku)

            const response = await this.apiManager.getRelavantProductsDetails(productSku)

            this.setState({
                ...this.state,
                isLoading: false,
                relatedCartItems: response.items,
            })
        } catch (error) {
            this.setState({
                ...this.state,
                isLoading: false,
            })
        }
    }

}
