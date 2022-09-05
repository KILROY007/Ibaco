import * as React from 'react';
import {View, Image, TouchableOpacity} from 'react-native';
import ImageAssets from '../../assets';

export class HeaderLeftComponent extends React.Component<any, {}> {
  public render() {
    return (
      <View style={{flexDirection: 'row'}}>
        <TouchableOpacity
          style={{
            paddingLeft: 16,
            paddingRight: 22,
            paddingVertical: 16,
          }}
          onPress={() => this.props.onBackPress()}>
          <Image
            style={{height: 11.09, width: 19.02}}
            source={this.props.image ? this.props.image : ImageAssets.search}
          />
        </TouchableOpacity>
      </View>
    );
  }
}
