import { ApiManager } from '../api/ApiManager'
import { CancelTokenSource } from 'axios'
import AsyncStorage from '@react-native-community/async-storage';

export class CategoriesRepository {

    private apiManager: ApiManager

    constructor(apiManager: ApiManager) {
        this.apiManager = apiManager
    }

    public async getCategories() {
        try {
            const response = await this.apiManager.getCategories()
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

    public async getAllProducts(searchKey) {
        try {
            const response = await this.apiManager.getAllProducts(searchKey)
            return response
        } catch (error) {
            throw error
        }
    }

    public async getProductDescription(sku) {
        try {
            const response = await this.apiManager.getProductDescription(sku)
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
}
