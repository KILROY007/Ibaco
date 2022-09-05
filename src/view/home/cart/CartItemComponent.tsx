import React from 'react';
import { TouchableOpacity, View, StyleSheet, Image } from 'react-native';
import { ComponentBase } from 'resub';
import { Text, Item } from 'native-base';
import ImageAssets from '../../../assets';
import { CartItemState } from '../../../view-madel/CartViewModel';
import Colors from '../../../resources/Colors';

export class CartItemComponent extends ComponentBase<any, any> {
  constructor(props: any) {
    super(props);
  }

  getOptionString = () => {
    let optionString = ''
    const options = this.props.cartItem.options ? JSON.parse(this.props.cartItem.options) : [];
    if (options && options.length) {
      options.map((option: any, index: any) => {
        optionString += option.value + ' '
      })
    }
    return optionString
  };

  public render() {
    return (
      <View style={{ flexDirection: 'row' }}>
        <Item
          style={[
            styles.container,
            { flex: this.props.isOrderHistory ? 1 : 0.9 },
          ]}>
          <Item
            style={[
              styles.bottomBorder,
              { paddingTop: 8.7, paddingBottom: 8.7 },
            ]}>
            <View style={{ flex: 0.55 }}>
              <Item style={[styles.bottomBorder, { width: '100%' }]}>
                <View style={{ marginLeft: 2.8 }}>
                  <Item style={{ borderBottomWidth: 0 }}>
                    {/* <Image
                      source={ImageAssets.group}
                      style={{ height: 11, width: 11 }}
                    /> */}
                    <Text style={styles.productNameText}>
                      {this.props.item ? this.props.item.name : this.props.cartItem.name}
                    </Text>
                  </Item>
                  {/* <Text style={styles.subText}>
                    {this.props.item
                      ? this.props.item.sku.split('-').map(item => {
                        if (item !== this.props.item.name) {
                          return `${item} `;
                        }
                      })
                      : this.getOptionString()}
                  </Text> */}
                </View>
              </Item>
            </View>
            <View style={{ flex: 0.2, alignItems: 'center' }}>
              {this.props.isOrderHistory ? (
                <Text style={styles.qantity}>
                  x {this.props.item.qty_ordered}
                </Text>
              ) : (
                <Item style={styles.bottomBorder}>
                  <TouchableOpacity
                    style={styles.signButton}
                    onPress={() => {
                      this.updateCart(true)
                    }}>
                    <Text style={[styles.colorPrimary, styles.signText]}>
                      -
                    </Text>
                  </TouchableOpacity>
                  <Text
                    style={{
                      fontSize: 13.38,
                      fontFamily: 'Muli-SemiBold',
                      color: Colors.text_primary_light,
                    }}>
                    {this.props.cartItem.qty}
                  </Text>
                  <TouchableOpacity
                    style={styles.signButton}
                    onPress={() => {
                      this.updateCart(false);
                    }}>
                    <Text style={[styles.colorPrimary, styles.signText]}>
                      +
                    </Text>
                  </TouchableOpacity>
                </Item>
              )}
            </View>
            <View
              style={{
                flex: 0.25,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Text
                style={[
                  styles.colorPrimary,
                  { fontSize: 14.87, fontFamily: 'Muli-Bold' },
                ]}>
                ₹
                {this.props.item
                  ? (this.props.item.base_price*this.props.item.qty_ordered)
                  : (this.props.cartItem.price * this.props.cartItem.qty)}
              </Text>
            </View>
          </Item>
        </Item>
        {this.props.isOrderHistory ? null : (
          <TouchableOpacity
            style={{ flex: 0.1, justifyContent: 'center', alignItems: 'center' }}
            onPress={() => {
              this.props.handleDeleteItem(this.props.cartItem.item_id)
            }}>
            <Image source={ImageAssets.cross_small} />
          </TouchableOpacity>
        )}
      </View>
    );
  }

  protected _buildState() {
    if (this.props && this.props.viewModel) {
      return this.props.viewModel.getState();
    }
  }
  public updateCart = (isDecrease) => {
    if (this.props.addToCart) {
      this.props.addToCart(this.props.product, isDecrease);
    }
  };
  // public deletItemFromCart = () => {
  //   if (this.props.deletItemFromCart) {
  //     this.props.deletItemFromCart(this.props.viewModel);
  //   }
  // };
}

const styles = StyleSheet.create({
  container: {
    flex: 0.9,
    backgroundColor: Colors.primary_background_color,
    justifyContent: 'space-between',
    borderTopRightRadius: 14,
    borderBottomRightRadius: 14,
    borderBottomWidth: 0,
    marginTop: 6.5,
  },
  colorPrimary: {
    color: Colors.primary_color,
  },
  signText: {
    fontFamily: 'Muli-Regular',
    fontSize: 14.27,
  },
  productNameText: {
    fontSize: 11,
    fontFamily: 'Muli-Bold',
    color: Colors.text_primary_dark,
    marginLeft: 6.5,
  },
  subText: {
    fontFamily: 'Muli-Medium',
    fontSize: 10,
    color: Colors.text_Light,
    marginTop: 5,
    marginLeft: 23,
  },
  bottomBorder: { borderBottomWidth: 0 },
  qantity: {
    fontFamily: 'Muli-SemiBold',
    color: Colors.text_primary_light,
    fontSize: 12,
  },
  signButton: { justifyContent: 'center', alignItems: 'center', width: 20 },
});
