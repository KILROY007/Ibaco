//BlogViewMode
import { BaseViewModel } from './BaseViewModel'
import { UserRepository } from '../domain/repository/UserRepository'
import { Platform } from 'react-native'
import ImageAssets from '../assets';

export interface BlogState {
    isLoading: boolean,
    search: string,
    blogData: any[],
    blogCategories: any,
    selectedCategoryName: string,
    error?: Error
}

export class BlogViewModel extends BaseViewModel {

    protected state: BlogState

    constructor(private userRepository: UserRepository) {
        super()
        this.state = this.defaultState()
    }

    protected defaultState() {
        return {
            isLoading: false,
            search: '',
            blogCategories: [],
            blogData: [],
            selectedCategoryName: '',
            error: undefined,
        }
    }

    public async getBlogCategaries() {
        try {
            this.setState({
                ...this.state,
                isLoading: true,
            })
            const response = await this.userRepository.getBlogCategaries()
            if (response && response.length) {
                response[0].isActive = true
                this.set('selectedCategoryName', response[0].name)
                await this.getBlogDetails(response[0].slug)
            }
            this.setState({
                ...this.state,
                isLoading: false,
                blogCategories: response,
            });
        } catch (error) {
            this.setState({
                ...this.state,
                isLoading: false,
                error,
            });
        }
    }

    public async getBlogDetails(tag) {
        try {
            this.setState({
                ...this.state,
                isLoading: true,
            })
            const response = await this.userRepository.getBlogDetails(tag)
            this.setState({
                ...this.state,
                isLoading: false,
                blogData: response,
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