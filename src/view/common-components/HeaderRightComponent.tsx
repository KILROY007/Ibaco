import * as React from 'react';
import { View, Image, TouchableOpacity, Text,StyleSheet } from 'react-native';
import ImageAssets from '../../assets';
import { Badge } from 'native-base';
import Colors from '../../resources/Colors';

export class HeaderRightComponent extends React.Component<any, {}> {
  public render() {
    return (
      <View style={{ flexDirection: 'row' }}>
        <TouchableOpacity
          activeOpacity={1}
          style={{
            marginRight: this.props.displayCart ? 15 : 10,
          }}
          onPress={() => {
            if (this.props.displayCart) {
              this.props.navigation.navigate('Cart')
            }
          }}
          >
          {this.props.displayCart ?
            <Image
             source={ImageAssets.cart}
           /> 
           :
           <>
           <Image
             source={ImageAssets.ibacologo}
             style={this.props.isHeaderRight?styles.isHeaderRight:styles.isHeaderLeft}
           /> 
          {/* <Text style={{
            color: "#707070", fontWeight: "bold", fontSize: 23, marginTop: -5, fontFamily: 'Muli-Bold',
          }}>HAP </Text>
          <Text style={{ color: "#707070", fontSize: 12, marginTop: -4, marginLeft: 6 }}>Daily</Text> */}
          </>
        }
          {this.props.displayCart && this.props.cartSummary && this.props.cartSummary.items_qty > 0 ?
            <Badge style={{ position: 'absolute', top: -8, right: -13, justifyContent: 'center', alignItems: 'center', height: 18, width: 24, backgroundColor: Colors.primary_color }}>
              <Text style={{ fontSize: 10, color: Colors.white }}>{this.props.cartSummary.items_qty}</Text>
            </Badge> : null}
        </TouchableOpacity>
      </View>
    );
  }
}
const styles = StyleSheet.create({
 isHeaderRight: {
  height:"100%",
  width:100,
   marginRight:-10,
   marginBottom:-10,
   borderTopLeftRadius:10,
   borderBottomLeftRadius:10
 },
 isHeaderLeft:{
  height:"100%",
  marginBottom:-10,
  width:100,
  borderTopRightRadius:10,
  borderBottomRightRadius:10
 }
})