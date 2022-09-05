import { UserRepository } from '../domain/repository/UserRepository'
import { ApiManager } from '../domain/api/ApiManager'
import { LoginViewModel } from '../view-madel/LoginViewModel'
import { CategoriesRepository } from '../domain/repository/CategoriesRepository'
import { CategoriesViewModel } from '../view-madel/CategoriesViewModel'
import { AddOrEditAddressViewModel } from '../view-madel/AddOrEditAddressViewModel'
import { CartViewModel } from '../view-madel/CartViewModel'
import { OrderTrackingViewModel } from '../view-madel/OrderTrackingViewModel'
import { UserWalletViewModel } from '../view-madel/UserWalletViewModel'
import { FavouriteViewModel } from '../view-madel/FavouriteViewModel'
import { BlogViewModel } from '../view-madel/BlogViewModel'
import { CartRepository } from '../domain/repository/CartRepository'
import { OrdersHistoryViewModel } from '../view-madel/OrdersHistoryViewModel'
import { CheckoutViewModel } from '../view-madel/CheckoutViewModel'
import { ValidationUtils } from '../core/ValidationUtils'
import { ProductItemViewModel } from '../view-madel/ProductItemViewModel'
import { ProductDescriptionViewModel } from '../view-madel/ProductDescriptionViewModel'
import { HelpViewModel } from '../view-madel/HelpViewModel'
import { ShopHeaderViewModel } from '../view-madel/ShopHeaderViewModel'
export class DependencyInjector {

    private static shared: DependencyInjector
    private apiManager: ApiManager
    private userRepository: UserRepository
    private categariesRepository: CategoriesRepository
    private cartRepository: CartRepository
    private storage: any
    private validationUtils: ValidationUtils

    public static initialize(storage: any) {
        if (!this.shared) {
            this.shared = new DependencyInjector(storage)
        }
    }

    public static default() {
        return this.shared
    }

    constructor(storage: any) {

        this.storage = storage
        this.apiManager = new ApiManager(this.storage)
        this.validationUtils = new ValidationUtils()
        this.userRepository = new UserRepository(this.apiManager, this.storage, this.validationUtils)
        this.categariesRepository = new CategoriesRepository(this.apiManager)
        this.cartRepository = new CartRepository(this.apiManager, this.storage, this.validationUtils)

    }

    public provideUserRepository() {
        return this.userRepository
    }

    public provideCartRepository() {
        return this.cartRepository
    }

    public provideLoginViewModel() {
        return new LoginViewModel(this.userRepository, this.validationUtils, this.cartRepository)
    }

    public provideCategoriesViewModel() {
        return new CategoriesViewModel(this.categariesRepository, this.userRepository)
    }

    public provideAddOrEditAddressViewModel() {
        return new AddOrEditAddressViewModel(this.userRepository, this.validationUtils, this.cartRepository)
    }

    public provideCartViewModel() {
        return new CartViewModel(this.cartRepository, this.userRepository)
    }

    public provideOrderTrackingViewModel() {
        return new OrderTrackingViewModel(this.userRepository)
    }
    public provideUserWalletViewModel() {
        return new UserWalletViewModel(this.userRepository)
    }
    public providefavouriteViewModel() {
        return new FavouriteViewModel(this.userRepository)
    }
    public provideBlogViewModell() {
        return new BlogViewModel(this.userRepository)
    }

    public provideOrdersHistoryViewModel() {
        return new OrdersHistoryViewModel(this.userRepository, this.cartRepository)
    }

    public provideCheckoutViewModel() {
        return new CheckoutViewModel(this.userRepository, this.cartRepository)
    }

    public provideProductItemViewModel() {
        return new ProductItemViewModel(this.userRepository, this.cartRepository)
    }
    public provideProductDescriptionViewModel() {
        return new ProductDescriptionViewModel(this.userRepository, this.cartRepository)
    }

    public provideHelpViewModel() {
        return new HelpViewModel(this.userRepository)
    }

    public provideShopHeaderViewModel() {
        return new ShopHeaderViewModel(this.userRepository, this.validationUtils)
    }
}
