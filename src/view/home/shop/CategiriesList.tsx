import React, {Component} from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import {ComponentBase} from 'resub';
import Colors from '../../../resources/Colors';
import ImageAssets from '../../../assets';
import LinearGradient from 'react-native-linear-gradient';

export class CategiriesList extends ComponentBase<any, any> {
  ref: any;
  viewabilityConfig: any;
  constructor(props: any) {
    super(props);
    this.handleViewableItemsChanged = this.handleViewableItemsChanged.bind(
      this,
    );
    this.viewabilityConfig = {viewAreaCoveragePercentThreshold: 50};
  }
  state = {
    scrollToIndex: 0,
    index: 0,
  };
  public render() {
    return (
      <View>
        <LinearGradient
          colors={[Colors.white, Colors.primary_light_color]}
          style={{flex: 1}}>
          <View
            style={{
              backgroundColor: Colors.primary_background_color,
              flexDirection: 'row',
            }}>
            
            {this.props.tabItems.length > 0 ? (
              <FlatList
                // contentContainerStyle={styles.flatlistContent}
                ref={component => {
                  this.ref = component;
                }}
                horizontal={true}
                keyExtractor={(item, index) => index.toString()}
                onEndReachedThreshold={0.1}
                removeClippedSubviews={false}
                onViewableItemsChanged={this.handleViewableItemsChanged}
                viewabilityConfig={this.viewabilityConfig}
                data={this.props.tabItems}
                renderItem={({item, index, separators}) => {
                  return (
                    <TouchableOpacity
                      key={index}
                      style={{
                        height: 52,
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                      onPress={() => {
                        this.props.onTabChange(index, item);
                        this.props.onClickTabItem(item.value, index);
                      }}>
                      <LinearGradient
                        colors={
                          item.isActive
                            ? [Colors.white, Colors.primary_light_color]
                            : [
                                Colors.primary_background_color,
                                Colors.primary_background_color,
                              ]
                        }
                        style={{
                          flex: 1,
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}>
                        <View
                          style={{
                            justifyContent: 'center',
                            alignItems: 'center',
                            paddingLeft: 27,
                            paddingRight: 24,
                          }}>
                          {this.props.getImageSource ? (
                            <View style={{height: 20, width: 20}}>
                              {this.props.getImageSource(item.value) ===
                              'default' ? (
                                <Image
                                  source={ImageAssets.egg_active}
                                  style={{
                                    height: '100%',
                                    width: '100%',
                                    resizeMode: 'contain',
                                  }}
                                />
                              ) : (
                                this.props.getImageSource && (
                                  <Image
                                    source={{
                                      uri: this.props.getImageSource(
                                        item.value,
                                      ),
                                    }}
                                    style={{
                                      height: '100%',
                                      width: '100%',
                                      resizeMode: 'contain',
                                    }}
                                  />
                                )
                              )}
                            </View>
                          ) : null}
                          <Text
                            style={[
                              styles.tabHeaderText,
                              {
                                color: item.isActive
                                  ? Colors.primary_color
                                  : Colors.dark_gray,
                                fontFamily: item.isActive
                                  ? 'Muli-ExtraBold'
                                  : 'Muli-Medium',
                              },
                            ]}>
                            {this.props.isBlog && item.slug
                              ? item.slug.toUpperCase()
                              : item.name
                              ? item.name
                              : item.value.name}
                          </Text>
                        </View>
                      </LinearGradient>
                    </TouchableOpacity>
                  );
                }}
                showsHorizontalScrollIndicator={false}
              />
            ) : null}
            <TouchableOpacity
              style={styles.scrollButton}
              onPress={() => {
                if (
                  this.ref &&
                  this.state.scrollToIndex < this.props.tabItems.length - 1
                ) {
                  this.ref.scrollToIndex({
                    animated: true,
                    index: this.state.scrollToIndex,
                  });
                } else {
                  this.setState({
                    scrollToIndex: 0,
                  });
                }
              }}>
              <Image source={ImageAssets.scroll_arrow} />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    );
  }

  handleViewableItemsChanged(info) {
    this.setState({
      ...this.state,
      scrollToIndex:
        info.viewableItems[info.viewableItems.length - 1].index + 1,
    });
  }
}
const styles = StyleSheet.create({
  searchInput: {
    color: Colors.text_Light,
    fontFamily: 'Muli-Medium',
    fontSize: 12,
    marginLeft: 7,
  },
  tabHeaderText: {
    color: Colors.primary_color,
    fontFamily: 'Muli-ExtraBold',
    fontSize: 10,
  },
  scrollButton: {
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginRight: 9,
    height: 40,
    width: 25,
  },
});
