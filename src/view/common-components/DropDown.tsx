import React from 'react';
import { ActivityIndicator, StyleSheet, View, Text, Image } from 'react-native';
import { ComponentBase } from 'resub';
import Colors from '../../resources/Colors';
import ImageAssets from '../../assets';
import ModalDropdown from '../../view/components/react-native-modal-dropdown';
import {
  ProductOptionsViewModel,
  ProductOptionsState,
} from '../../view-madel/ProductItemViewModel';
import _ from 'lodash'

export class DropDown extends ComponentBase<any, ProductOptionsState> {
  constructor(props: any) {
    super(props);
  }

  getDefaultValue = (defaultValueId) => {
      const selectedValues = _.find(
        this.props.item.values,
        (selectedValue: any) => selectedValue.option_type_id === defaultValueId,
      )
      return selectedValues ? selectedValues.title : this.props.item.values[0].title
  }

  public render() {
    const defaultValueId = this.props.default(this.props.item)
    return (
      <ModalDropdown
        style={{ marginTop: 5 }}
        dropdownStyle={{
          width: 150,
          elevation: 3,
          shadowOpacity: 0.75,
          shadowRadius: 5,
          marginTop: 5,
          height: this.props.item.values.length * 39,
        }}
        dropdownTextStyle={styles.text}
        renderSeparator={() => {
          return <View />;
        }}
        onSelect={(index, value) => {
          this.props.selectedDropdownValues(value, this.props.item);
        }}
        options={
          this.props.item.values &&
          this.props.item.values.length &&
          this.props.item.values.map((value, i) => {
            return value.title;
          })
        } >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={[styles.text, { marginRight: 4.3 }]}>
            {this.getDefaultValue(defaultValueId)}
          </Text>
          <Image source={ImageAssets.shop_product_dropdown} />
        </View>
      </ModalDropdown >
    );
  }

  // protected _buildState() {
  //   if (this.props.viewModel) {
  //     return this.props.viewModel.getState();
  //   }
  // }
}

const styles = StyleSheet.create({
  text: {
    color: Colors.text_primary_light,
    fontFamily: 'Muli-SemiBold',
    fontSize: 12,
  },
});