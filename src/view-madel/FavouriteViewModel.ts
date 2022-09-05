import { BaseViewModel } from './BaseViewModel'
import { UserRepository } from '../domain/repository/UserRepository'
import { Platform } from 'react-native'

export interface FavouriteState {
    isLoading: boolean,
    favouriteItems: any[],
    showToast: boolean,
    favouriteProducts:any[],
    refreshing: boolean;
    isAddToCart:boolean;
    pageLoadError?:Error,
    error?: Error
}

export class FavouriteViewModel extends BaseViewModel {

    protected state: FavouriteState

    constructor(private userRepository: UserRepository) {
        super()
        this.state = this.defaultState()
    }

    protected defaultState() {
        return {
            isLoading: false,
            favouriteItems:[],
            error: undefined,
            refreshing: false,
            favouriteProducts:[],
            isAddToCart:false,
            pageLoadError:undefined,
            showToast: false,
        }
    }

    public async getFavouriteItems() {
        try {
            this.setState({
                ...this.state,
                favouriteProducts:[],
                favouriteItems:[],
                isLoading: true,
            })
            const response = await this.userRepository.getFavouriteItems()
            response.map(async(res:any)=>{
                await this.getProducts(res.product)
            })
            this.setState({
                ...this.state,
                isLoading: false,
                favouriteItems: response,
            })
        } catch (error) {
            this.setState({
                ...this.state,
                error,
                isLoading: false,
            })
        }
    }
    public async getProducts(product) {
        this.setState({
            ...this.state,
            isLoading: true,
        })
        try {
            const response = await this.userRepository.getProductDescription(product.sku)
            const favouriteProducts=await [...this.state.favouriteProducts,response.items[0]]
                
            console.log(favouriteProducts);
            this.setState({
                ...this.state,
                isLoading: false,
                favouriteProducts,
            })
        } catch (error) {
            this.setState({
                ...this.state,
                isLoading: false,
                error,
            })

        }
}
public removeAllWishListItems= async()=>{
    try {
    this.setState({
      ...this.state,
      isLoading:true
    })
    const response=await this.userRepository.removeAllWishListItems();
    this.setState({
      ...this.state,
      isLoading:false,
      favouriteProducts:[]
    })
    return response;
  }
    catch (error) {
      this.setState({ ...this.state, isLoading: false });
    }
  
  }
  async removeWishListItems(productId:any,wishId:any){
      await this.userRepository.removeWishListItems(wishId);
      let favouriteProducts=this.state.favouriteProducts.filter((item)=>{ return item.id!==productId});
      let favouriteItems=this.state.favouriteItems.filter((item)=>{ return item.product_id!==productId});
      this.setState({
        ...this.state, 
          favouriteProducts,
          favouriteItems
      })
  
  }
}