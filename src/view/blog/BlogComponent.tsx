import React from 'react'
import { ComponentBase } from 'resub'
import {
    Dimensions,
    StyleSheet,
    StatusBar,
    Image,
    TouchableOpacity,
    FlatList,
    TextInput,
} from 'react-native'
import {
    Container,
    Text,
    Content,
    View,
    Card,
} from 'native-base'
import ImageAssets from '../../assets'
import { DependencyInjector } from '../../dependency-injector/DependencyInjector'
import { BlogViewModel, BlogState } from '../../view-madel/BlogViewModel'
import Colors from '../../resources/Colors'
import { CategiriesList } from '../home/shop/CategiriesList'
import { Loader } from '../common-components/Loader'
import { Retry } from '../common-components/Retry'

// const { width: viewportWidth } = Dimensions.get('window')
export class BlogComponent extends ComponentBase<any, BlogState> {

    viewModel: BlogViewModel

    constructor(props: any) {
        super(props)
        this.viewModel = DependencyInjector.default().provideBlogViewModell()
    }

    componentDidMount() {
        this.viewModel.getBlogCategaries()
    }

    navigateToBlogDetails = item => {
        const indexOfItem = this.state.blogData.indexOf(item)
        this.props.navigation.navigate('SingleBlogComponent', {
            data: item,
            key: item.key,
        })
    }

    public onClickTabItem = async (item, index) => {
        for (const category of this.state.blogCategories) {
            category.isActive = category.id === item.id ? true : false
        }
        this.viewModel.set('selectedCategoryName', item.name)
        await this.viewModel.getBlogDetails(item.slug)
    }

    public render() {
        if (this.state.error) {
            return (
                <Retry
                    message={this.state.error.message}
                    onPress={() => {
                        this.viewModel.set('error', undefined)
                        this.viewModel.getBlogCategaries()
                    }}
                />
            );
        } else {
            return (
                <Container style={{ justifyContent: 'flex-start', flex: 1 }}>
                    <StatusBar barStyle="default" backgroundColor={Colors.primary_gradient_color_header} />
                    <Content style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }}>
                        <View style={styles.header}>
                            <View style={{ marginTop: 12, marginBottom: 10, flexDirection: 'row', flex: 1 }}>
                                <View style={{ flex: 0.4 }}>
                                    <Image source={ImageAssets.blog_ledy} style={styles.blogLady} />
                                </View>
                                <View style={styles.texContent}>
                                    <Text style={styles.title}>Introducing HAPDailyBlogs</Text>
                                    <Text style={styles.subLines}>Want to know new recipes?</Text>
                                    <Text style={styles.subLines}>Want to read more about different meats?</Text>
                                    <Text style={styles.subLines}>You have come to the right place!</Text>
                                    <Text style={styles.subLines}>Start exploring our blogs today</Text>
                                </View>
                            </View>
                        </View>
                        {/* <View
                        style={{
                            height: 44,
                            backgroundColor: Colors.white,
                            flexDirection: 'row',
                            alignItems: 'center',
                        }}>
                        <Image source={ImageAssets.search} style={{ marginLeft: 11 }} />
                        <TextInput
                            placeholder={'Search for a recipe, or information, or anything'}
                            style={styles.searchInput}
                            returnKeyType='search'
                            onChangeText={text => { }}
                            onSubmitEditing={event => {
                                this.props.navigation.navigate('Shop', {
                                    screen: 'ShopComponent',
                                    params: { text: event.nativeEvent.text },
                                })
                            }}
                        />
                    </View> */}
                        {this.state.blogCategories &&
                            this.state.blogCategories.length > 0 ? (
                            <CategiriesList
                                tabItems={this.state.blogCategories}
                                onTabChange={(index, item) => {
                                    this.onClickTabItem(item, index)
                                }}
                                onClickTabItem={(item, index) => {
                                }}
                                isBlog={true}
                            />
                        ) : null}

                        <View style={{ flex: 0.3 }}>
                            {this.state.blogData.length === 0 ?
                                <View style={{ marginTop: 25, alignItems: 'center' }}>
                                    <Text style={{ fontSize: 18, color: '#999999', fontFamily: 'Montserrat-Regular' }}>No Blogs Found</Text>
                                </View>
                                : this.state.blogData.map((item, key) => {
                                    if (key == 0) {
                                        return (
                                            <View key={key} style={styles.bigCatView}>
                                                <Card style={styles.cardView}>
                                                    <View style={{ marginLeft: 14, marginRight: 14, marginTop: 12.6 }}>
                                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                                            <Text style={styles.productHeaderText}>{item.title.rendered}</Text>
                                                            {/* <View style={{ flexDirection: 'row', alignSelf: 'flex-end' }}>
                                                        <Text style={styles.likeText}>3 likes</Text>
                                                        <Image
                                                            source={ImageAssets.favourites_icon_inactive}
                                                            style={styles.bigCartHeart}
                                                        />
                                                    </View> */}
                                                        </View>
                                                        <View style={{ marginTop: 13.7 }}>
                                                            <Image
                                                                source={{ uri: item.thumbnail }}
                                                                style={styles.image}
                                                            />
                                                        </View>
                                                        <TouchableOpacity
                                                            style={{ marginTop: 18.5, marginBottom: 17 }}
                                                            onPress={() => {
                                                                this.props.navigation.navigate(
                                                                    'SingleBlogComponent',
                                                                    { data: item, key },
                                                                )
                                                            }}>
                                                            <Text style={styles.buttonText}>
                                                                READ THIS BLOG >
                          </Text>
                                                        </TouchableOpacity>
                                                    </View>
                                                </Card>
                                            </View>
                                        )
                                    }
                                })}
                        </View>
                        {this.state.blogData.length > 0 && <Text style={styles.moreBlogText}>More blogs on {this.state.selectedCategoryName}</Text>}
                        <View style={{ alignItems: 'center' }}>
                            <FlatList
                                columnWrapperStyle={{
                                    flex: 1,
                                    justifyContent: 'space-around',
                                }}
                                data={this.state.blogData}
                                renderItem={({ item, index }) => (
                                    <TouchableOpacity
                                        activeOpacity={1}
                                        style={styles.smallBlogView}
                                        onPress={() => this.navigateToBlogDetails(item)}>
                                        <Card style={styles.smallCard} key={index}>
                                            <View style={{ padding: 9 }}>
                                                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                                    <Image
                                                        source={{ uri: item.thumbnail }}
                                                        style={{ height: 31, width: 50, resizeMode: 'contain' }}
                                                    />
                                                    {/* <View style={{ flexDirection: 'row', paddingLeft: 10 }}>
                                                    <Text style={[styles.smallCartLikeText]}>3 likes</Text>
                                                    <Image
                                                        source={ImageAssets.favourites_icon_inactive}
                                                        style={[styles.smallCartHeartIcon]}
                                                    />
                                                </View> */}
                                                </View>
                                                <Text style={styles.smallCardTitle} numberOfLines={2} >{item.title.rendered}</Text>
                                            </View>
                                        </Card>
                                    </TouchableOpacity>
                                )}
                                numColumns={2}
                            />
                        </View>
                    </Content>
                    {this.state.isLoading ? (
                        <Loader
                            isTransperant={this.state.blogCategories.length > 0 ? true : false}
                        />
                    ) : null}
                </Container>
            )
        }
    }
    protected _buildState() {
        return this.viewModel.getState()
    }
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        backgroundColor: '#f7f7f7',
        flex: 0.3,
    },
    blogLady: {
        height: '100%',
        width: '100%',
        resizeMode: 'contain'
    },
    title: {
        color: '#555555',
        fontFamily: 'Montserrat-Bold',
        fontSize: 12,
        marginBottom: 10,
    },
    subLines: {
        fontSize: 10,
        fontFamily: 'Montserrat-SemiBold',
        color: '#777777',
        marginBottom: 2,
    },
    texContent: {
        marginLeft: 15,
        flex: 0.6,
    },
    inputText: {
        height: 18,
        width: 140,
        color: '#999999',
        fontFamily: 'Montserrat-Light',
        fontSize: 18,
        flexDirection: 'column',
        alignContent: 'flex-start',
        marginLeft: 0,
    },
    inputField: {
        flexDirection: 'column',
        height: 20,
        width: 327,
        justifyContent: 'flex-start',
        marginTop: -20,
        marginLeft: 15,
        marginBottom: 50,
    },
    cardView: {
        backgroundColor: '#FFFFFF',
        borderRadius: 15,
    },
    labelText: {
        color: '#999999',
        fontFamily: 'Montserrat-SemiBold',
        height: 16,
        width: 360,
        marginTop: 2,
    },
    bigCatView: {
        padding: 10,
    },
    productHeaderText: {
        color: Colors.text_primary_light,
        fontFamily: 'Montserrat-Bold',
        fontSize: 14,
    },
    likeText: {
        fontSize: 10.58,
        fontFamily: 'Montserrat-Bold',
        color: '#AAAAAA',
    },
    bigCartHeart: {
        height: 19,
        width: 21,
        marginLeft: 6.22,
    },
    image: {
        borderRadius: 14,
        height: 147,
        width: '100%',
        resizeMode: 'stretch',
    },
    buttonText: {
        color: Colors.primary_color,
        fontFamily: 'Montserrat-ExtraBold',
        fontSize: 14,
        alignSelf: 'flex-end',
    },
    smallBlogView: {
        padding: 11,
    },
    smallCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 15,
    },
    smallCardTitle: {
        fontSize: 11,
        fontFamily: 'Montserrat-SemiBold',
        marginTop: 9.76,
        color: Colors.address_text,
        width: 120,
    },
    smallCartLikeText: {
        fontSize: 10,
        fontFamily: 'Montserrat-Bold',
        color: Colors.dark_gray,
    },
    smallCartHeartIcon: {
        height: 16,
        width: 17,
        marginLeft: 10.11,
    },
    moreBlogText: {
        color: Colors.address_text,
        fontFamily: 'Montserrat-SemiBold',
        fontSize: 11,
        marginLeft: 11,
        marginTop: 28,
    },
    searchInput: {
        color: Colors.text_Light,
        fontFamily: 'Montserrat-Medium',
        fontSize: 12,
        marginLeft: 7,
        width: '83%',
    },
})