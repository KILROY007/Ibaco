import { BaseViewModel } from './BaseViewModel'
import { UserRepository } from '../domain/repository/UserRepository'
import { Platform } from 'react-native'
import { CartRepository } from '../domain/repository/CartRepository'

export interface CartState {
    paymentModal: boolean
    addressModal: boolean
    addressValue: any
    addressId: any,
    couponCode: string,
    validationError?: Error,
    error?: Error,
    onSuccess: boolean,
    isApplyButton: boolean,
    onDeletSuccess: boolean,
    couponError?: Error,
    addItemInCart: boolean,
    deleteItemInCart: boolean,
    addressMethode: string,
    showLoginModal: boolean,
    relatedCartItems: any,
    shouldShowOrderPlacedState: boolean,
    alertDetails: any,
    isLoading: boolean,
    customizationText: string,
    isShopOpen: boolean
}

export class CartViewModel extends BaseViewModel {

    protected state: CartState
    private relevantProductsSku = new Set()

    constructor(private cartRepository: CartRepository, private userRepository: UserRepository) {
        super()
        this.state = this.defaultState()
        this.userRepository = userRepository
    }

    protected defaultState() {
        return {
            paymentModal: false,
            addressModal: false,
            addressValue: undefined,
            addressId: undefined,
            couponCode: '',
            validationError: undefined,
            error: undefined,
            onSuccess: false,
            isApplyButton: true,
            onDeletSuccess: false,
            couponError: undefined,
            addItemInCart: false,
            addressMethode: '',
            showLoginModal: false,
            deleteItemInCart: false,
            relatedCartItems: [],
            shouldShowOrderPlacedState: false,
            alertDetails: undefined,
            isLoading: false,
            customizationText: '',
            isShopOpen: true
        }
    }

    public getUserRepository() {
        // return this.userRepository.isLoggedIn()
        return true
    }

    public async updateProductQuantityInCart(product, isDecrease) {
        try {
            this.setState({
                ...this.state,
                isLoading: true,
            })
            const cart_id = this.userRepository.getState().cart_id
            let sku = ''
            const skus = product.sku.split('-')
            const oLength = product.product_option && product.product_option.extension_attributes && product.product_option.extension_attributes.custom_options && product.product_option.extension_attributes.custom_options.length ?
                product.product_option.extension_attributes.custom_options.length : 0
            if (oLength) {
                for (let i = 0; i < skus.length - oLength; i++) {
                    sku = `${sku ? sku + '-' : sku}${skus[i]}`
                }
                if (product.name === product.sku) {
                    sku = product.sku
                }
            } else {
                sku = product.sku
            }
            const cartItem = {
                cartItem: {
                    qty: !isDecrease ? product.qty + 1 : product.qty - 1,
                    quote_id: cart_id,
                    sku,
                    name: product.name,
                    product_option: product.product_option,
                    extension_attributes: {},
                },
            }
            
            let res
            if (cart_id) {
                res = await this.userRepository.productInCartAfterDecrease(cartItem, product.item_id)
                await this.updateCart()
            } else {
                res = await this.userRepository.updateProductInGuestCart(cartItem, product.item_id)
                await this.updateGuestCart()
            }
            let addToCartObject = {
                'currency': 'INR',
                'items': [{
                    'quantity':!isDecrease ? product.qty + 1 : product.qty - 1,
                    'item_id':JSON.stringify(product.item_id),
                    'item_name': product.name,
                }],
                'value': product.price
            };
            this.userRepository.logAddToCart(addToCartObject,isDecrease)
            this.setState({
                ...this.state,
                isLoading: false,
            })
            return res
        } catch (error) {
            this.setState({
                ...this.state,
                pageLoadError: error,
                isLoading: false,
            })
        }
    }

    public async updateCartDetails() {
        const cart_id = this.userRepository.getState().cart_id
        if (cart_id) {
            await this.updateCart()
        } else {
            await this.updateGuestCart()
        }
    }

    public async updateCart(isNewItemAddedOrDeleted?) {
        try {
            this.setState({
                ...this.state,
                isLoading: true,
            })
            await this.userRepository.getCartDetails(isNewItemAddedOrDeleted)
            await this.userRepository.getCartItems({})
            this.setState({
                ...this.state,
                isLoading: false,
            })
        } catch (error) {

            this.setState({
                ...this.state,
                isLoading: false,
                error,
            })

        }
    }

    public async updateGuestCart(isNewItemAddedOrDeleted?) {
        try {
            this.setState({
                ...this.state,
                isLoading: true,
            })

            await this.userRepository.getGuestCartSummary(isNewItemAddedOrDeleted)
            await this.userRepository.getGuestCartItems()
            this.setState({
                ...this.state,
                isLoading: false,
            })
        } catch (error) {
            this.setState({
                ...this.state,
                isLoading: false,
                error,
            })

        }
    }

    public async deleteCartItem(itemId) {
        try {
            this.setState({
                ...this.state,
                isLoading: true,
            })
            const cart_id = this.userRepository.getState().cart_id
            let response
            if (cart_id) {
                response = await this.userRepository.deleteCartItem(itemId)
                await this.updateCart(true)
            } else {
                response = await this.userRepository.deleteProductFromGuestCart(itemId)
                await this.updateGuestCart(true)
            }
            this.setState({
                ...this.state,
                isLoading: false,
            })
            return response
        } catch (error) {
            this.setState({
                ...this.state,
                isLoading: false,
                error,
            })
        }
    }

    public async getCouponCode() {
        try {
            this.setState({
                ...this.state,
                isLoading: true,
            })
            let response
            let isApplyButton
            response = await this.userRepository.getCouponCode()
            const typeOfResponse = typeof (response)
            if (typeOfResponse === 'string') {
                isApplyButton = false
                this.userRepository.set('isCouponApplied', true)
                this.userRepository.set('couponCode', response)
            } else {
                isApplyButton = true
                this.userRepository.set('isCouponApplied', false)
            }

            this.setState({
                ...this.state,
                couponCode: response,
                isLoading: false,
                isApplyButton,
            })
            return response
        } catch (error) {
            this.setState({
                ...this.state,
                isLoading: false,
                error,
            })
        }

    }

    async applyCoupon() {
        try {
            // this.isValid()
            this.setState({
                ...this.state,
                isLoading: true,
            })
            if (this.state.validationError) {
                return
            }
            const response = await this.userRepository.applyCoupon(this.state.couponCode)
            await this.getCouponCode()
            this.userRepository.set('isApplyButton', false)
            if (response) {
                this.setState({
                    ...this.state,
                    onSuccess: true,
                    isApplyButton: false,
                    isLoading: false,
                })
            }
            this.setState({
                ...this.state,
                isLoading: false,
            })

        } catch (error) {
            this.setState({
                ...this.state,
                couponError: error,
                isLoading: false,
            })
        }
    }

    async deletCouponCode() {

        try {
            this.setState({
                ...this.state,
                isLoading: true,
            })
            const response = await this.userRepository.deletCouponCode()
            this.userRepository.set('isApplyButton', true)
            if (response) {
                this.setState({
                    ...this.state,
                    couponCode: '',
                    onDeletSuccess: true,
                    isApplyButton: true,
                    isLoading: false,
                })
            }
            this.setState({
                ...this.state,
                isLoading: false,
            })
        } catch (error) {
            this.setState({
                ...this.state,
                error,
                isLoading: false,
            })
        }

    }

    public checkShopTimings(){
        // var time = new Date().getHours();
        // if(time >= 21 || time < 6){
        //     return false
        // }else{
        //     return true
        // }
        return true
    }

    public setCouponCode(text) {
        this.userRepository.set('couponCode', text)
    }

    public async getRelevantProducts(productName: string) {
        try {
            this.setState({
                ...this.state,
                isLoading: true,
            })
            this.relevantProductsSku.clear()
            const response = await this.userRepository.getRelevantProductsName(productName)

            response.items.map((item: any, index: any) => {
                item.product_links.forEach((element: any, i: any) => {
                    this.relevantProductsSku.add(element.linked_product_sku)
                })
            })

        } catch (error) {
            this.setState({
                ...this.state,
                isLoading: false,
            })
        }
    }

    public async getRelevantProductDetails() {
        try {
            this.setState({
                ...this.state,
                isLoading: true,
            })
            const productSku = Array.from(this.relevantProductsSku)
            const response = await this.userRepository.getRelavantProductsDetails(productSku)
            const inventoryItems = this.userRepository.getState().inventoryItems
            const relatedItems = new Set()
            inventoryItems.items.length > 0 && inventoryItems.items.map((inventory: any) => {
                response.items.length > 0 && response.items.map((item: any) => {
                    item.sku === inventory.sku && inventory.quantity > 0 && inventory.status === 1 && item.status === 1 &&
                        relatedItems.add(item)
                })
            })

            this.setState({
                ...this.state,
                relatedCartItems: Array.from(relatedItems),
                isLoading: false,
            })
        } catch (error) {
            this.setState({
                ...this.state,
                isLoading: false,
            })
        }
    }

    public addRelatedItemsToCart = async (product, selectedOptionsValue) => {
        this.setState({
            ...this.state,
            isLoading: true,
        })
        const cartId = this.userRepository.getState().cart_id
        let sku = ''
        const skus = product.sku.split('-')
        const oLength = product.product_option && product.product_option.extension_attributes && product.product_option.extension_attributes.custom_options && product.product_option.extension_attributes.custom_options.length ?
            product.product_option.extension_attributes.custom_options.length : 0
        if (oLength) {
            for (let i = 0; i < skus.length - oLength; i++) {
                sku = `${sku ? sku + '-' : sku}${skus[i]}`
            }
            if (product.name === product.sku) {
                sku = product.sku
            }
        } else {
            sku = product.sku
        }
       
        const cartItem = {
            cartItem: {
                qty: 1,
                quote_id: cartId,
                sku,
                name: product.name,
                product_option: {
                    extension_attributes: {
                        custom_options: selectedOptionsValue,
                    },
                },
                extension_attributes: {},
            },
        }
        if (cartId) {
            await this.userRepository.addToCart(cartItem)
            await this.updateCart(true)
        } else {
            await this.userRepository.addToGuestCart(cartItem)
            this.updateGuestCart(true)
        }
        let addToCartObject = {
            'currency': 'INR',
            'items': [{
                'quantity':1,
                'item_id': JSON.stringify(product.item_id),
                'item_name': product.name,
            }],
            'value': product.price
        };
        this.userRepository.logAddToCart(addToCartObject)
        this.setState({
            ...this.state,
            isLoading: false,
        })
    }

}