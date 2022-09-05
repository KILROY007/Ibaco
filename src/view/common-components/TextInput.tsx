import * as React from 'react';
import {View, StyleSheet, KeyboardAvoidingView} from 'react-native';
import {TextField} from '../components/react-native-material-textfield';
import {ComponentBase, key} from 'resub';
import ModalDropdown from '../../view/components/react-native-modal-dropdown';
import {Input} from 'react-native-elements';
import {GooglePlacesAutocomplete} from 'react-native-google-places-autocomplete';
import {TextInputState} from '../../view-madel/AddOrEditAddressViewModel';
import Colors from '../../resources/Colors';
import _ from 'lodash';
import constants from '../../resources/constants';

export default class TextInput extends ComponentBase<any, TextInputState> {
  modalDropdownRef: any;
  textInputRef = React.createRef<TextField>();
  keyboardType;
  valueIs;
  actualValue;
  constructor(props: any) {
    super(props);
  }

  public async handleAddressSelect(data, details, isAddress) {
    
    const latlng = details.geometry.location;
    if (details) {
      const {long_name: PostalCode = ''} =
        details.address_components.find(c => c.types.includes('postal_code')) ||
        {};
      const {long_name: City = ''} =
        details.address_components.find(c => c.types.includes('locality')) ||
        {};
      const {long_name: Locality = ''} =
        details.address_components.find(c =>
          c.types.includes('sublocality_level_1'),
        ) || {};
      let addressDetails = {
        Locality,
        Address: data.description ,
        City,
        PinCode: PostalCode,
      };
      this.setState({
        value: data.description + ' ' + PostalCode,
      });
      this.props.model.set("inputAddress", data.description)
      await this.props.model.getInputFieldAutoComplete(addressDetails, latlng);
      // this.props.setCoordinateDelta({latitudeDelta: 0.00012, longitudeDelta: 0.00011})
      this.props.setCoordinateDelta({latitudeDelta: 0.00172, longitudeDelta: 0.00171})
    }

    
  }
  public async validateInput(text) {}

  public render() {
    if (this.state.label === 'PinCode') {
      this.keyboardType = 'number-pad';
    } else if (this.state.label === 'Phone Number') {
      this.keyboardType = 'number-pad';
    } else {
      this.keyboardType = 'default';
    }
    return (
      <View style={{width: '100%'}}>
        <View>
          {this.state.label === 'Address' ? (
            <KeyboardAvoidingView behavior="padding" keyboardVerticalOffset={10}>
            <GooglePlacesAutocomplete
              query={{
                key: constants.GOOGLE_PLACES_API_KEY,
                language: 'en',
                location: '13.067439, 80.237617',
                radius: '90000',
                strictbounds: true,
                components: 'country:in',
              }}
              fetchDetails={true}
              onPress={(data, details = null) =>
                this.handleAddressSelect(data, details)
              }
              
              textInputProps={{
                InputComp: Input, //caret-down
                // rightIcon: { type: 'font-awesome', name: 'caret-down' },
                errorStyle: {color: 'red'},
                containerStyle: {
                  borderWidth: 1,
                  borderBottomWidth: 0.5,
                  borderColor: '#AAAAAA',
                },

                editable: true,
                textAlignVertical: 'bottom',
                inputContainerStyle: {borderBottomWidth: 0},
                multiline: true,
                placeholder: this.state.label,
                fontSize: 18,
                keyboardType: this.keyboardType,
                style: {fontSize: 18, fontFamily: 'Muli-Bold'},
                textColor: '#555555',
                baseColor: 'rgba(163, 178, 191, 1)',
                tintColor: '#AAAAAA',
                ref: this.textInputRef,
                value: this.state.value,
                autoCompleteType:"off",
                onChangeText: text => {
                  if(this.state.isUpdated){
                    this.props.viewModel.set('value',this.state.value);
                    // this.props.model.set("inputAddress",this.state.value)
                    // this.props.viewModel.set('userAddress', this.state.value);
                    this.props.viewModel.set('isUpdated',false)
                  }
                  else{
                    this.props.viewModel.set('value', text)
                    this.props.model.set("inputAddress",text.length>5?text:"")
                  }},
                activeLineWidth: 0,
                highlightColor: 'rgb(29,29,38)',
                animationDuration: 225,
                placeholderTextColor: '#AAAAAA',
                lineWidth: 0,
              }}
              onFail={error => console.error(error)}
              />
              </KeyboardAvoidingView>
              ) : (
                <TextField
            containerStyle={[this.state.label === 'First Name'&&styles.topRadius,this.state.label === 'Email'&&styles.bottomRadius,{
              borderWidth: 1,
              borderBottomWidth: 0.5,
              borderColor: '#AAAAAA'}
              ]}
              inputContainerStyle={{marginLeft: 16}}
              multiline={false}
              labelFontSize={12}
              labelTextStyle={{fontFamily: 'Muli-Bold'}}
              fontSize={18}
              keyboardType={this.keyboardType}
              style={{fontSize: 18, fontFamily: 'Muli-Bold'}}
              textColor={'#555555'}
              baseColor={'rgba(163, 178, 191, 1)'}
              tintColor={'#AAAAAA'}
              label={this.state.label}
              value={
                this.state.label === 'Phone Number'&& this.state.value.length===10
                  ? '+91' + this.state.value
                  : this.state.value
              }
              onChangeText={text => {
                if (this.state.label === 'Phone Number') {
                  this.valueIs = text.replace(/\s/g, '');
                  if (this.valueIs.indexOf('+91') != -1) {
                    this.actualValue = this.valueIs.replace('+91', '');
                    this.props.viewModel.set('value', this.actualValue);
                  } else {
                    this.props.viewModel.set('value', this.valueIs);
                  }
                } else if (
                  this.state.label === 'PinCode' &&
                  text.length === 6
                ) {                 
                  this.props.getLatLongByPincode(text);                  
                  this.props.viewModel.set('value', text);

                } else if(this.state.label==='Locality'&&text.length>3){
                  this.props.model.set("inputLocality",text)
                  this.props.viewModel.set('value', text);
                }else {
                  this.props.viewModel.set('value', text);
                }
              }}
              activeLineWidth={0}
              highlightColor={'rgb(29,29,38)'}
              animationDuration={225}
              placeholderTextColor={'#AAAAAA'}
              ref={this.textInputRef}
              lineWidth={0}
              editable={this.state.label === 'Phone Number' ? false : true}
            />
          )}

        </View>
      </View>
    );
  }

  protected _buildState() {
    if (this.props.viewModel) {
      return this.props.viewModel.getState();
    }
  }
}
const styles = StyleSheet.create({
  dropDownText: {
    fontSize: 12,
    fontFamily: 'Muli-SemiBold',
    color: Colors.text_dark,
  },
  topRadius:{
  borderTopStartRadius:10,
  borderTopEndRadius:10
  },
  bottomRadius:{
    borderBottomStartRadius:10,
    borderBottomEndRadius:10
  }
});
