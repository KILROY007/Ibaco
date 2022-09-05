import React from 'react';
import {
  TouchableOpacity,
  View,
  StyleSheet,
  Image,
  TextInput,
  Modal,
} from 'react-native';
import { ComponentBase } from 'resub';
import { Text, Card } from 'native-base';
import Colors from '../../resources/Colors';
import ImageAssets from '../../assets';
import LinearGradient from 'react-native-linear-gradient';
import Strings from '../../resources/String';

export class HelpItem extends ComponentBase<any, any> {
  constructor(props: any) {
    super(props);
    this.state = {
      isHeaderPressed: false,
      radioItems: this.props.radioItems ? this.props.radioItems : [],
      openSubmitModal: false,
    };
  }

  public render() {
    return (
      <View style={styles.mainView}>
        <Card style={{ borderRadius: 14 }}>
          <TouchableOpacity
            onPress={() => {
              this.setState({
                ...this.state,
                isHeaderPressed: !this.state.isHeaderPressed,
              });
              this.props.setSelectedHeaderIndex(this.props.index);
            }}>
            <View style={styles.headerView}>
              <Text style={[styles.headerText, { marginLeft: 20 }]}>
                I want {this.props.helpItem.excerpt.rendered}
              </Text>
              <Image
                source={ImageAssets.order_tracking_colaps_icon}
                style={{ marginRight: 30 }}
              />
            </View>
          </TouchableOpacity>

          {this.props.helpItem.isActive ? (
            <View>
              <View style={styles.line} />
              <View style={{ marginLeft: 20 }}>
                <Text style={[styles.subHeaderText, { marginTop: 18 }]}>
                  {Strings.text_help_went_wrong}
                </Text>
                <View style={{ marginTop: 6, marginBottom: 30 }}>
                  {this.state.radioItems && this.state.radioItems.length
                    ? this.state.radioItems.map((radioItem, index) => {
                      return (
                        <View key={index}>
                          <TouchableOpacity
                            style={styles.radioButton}
                            onPress={() => {
                              const isOthers = radioItem.excerpt.rendered !== 'Others' ? false : true
                              this.props.onRadioItemChange(radioItem.id, this.props.index, isOthers)

                            }}>
                            <Image
                              source={
                                radioItem.isActive
                                  ? ImageAssets.radio_active_icon
                                  : ImageAssets.radio_inactive_icon
                              }
                              style={styles.radioImage}
                            />
                            <Text
                              style={[
                                styles.radioActive,
                                {
                                  color: radioItem.isActive
                                    ? Colors.text_primary_dark
                                    : Colors.dark_gray,
                                },
                              ]}>
                              {radioItem.excerpt.rendered}
                            </Text>
                          </TouchableOpacity>
                          {radioItem.excerpt.rendered === 'Others' &&
                            radioItem.isActive ? (
                            <View style={{ marginTop: 5 }}>
                              <TextInput
                                style={{
                                  borderBottomWidth: 1,
                                  borderBottomColor: '#cccccc',
                                  marginLeft: 8,
                                  marginRight: 25,
                                }}
                                placeholder="Type your issue here"
                                onChange={text => {
                                  this.props.viewModel.set('othersText', text)
                                }}
                              />
                            </View>
                          ) : null}
                        </View>
                      );
                    })
                    : null}
                </View>
              </View>
              {/* <TouchableOpacity
                style={styles.submit}
                onPress={async () => {
                  this.setState({
                    ...this.state,
                    openSubmitModal: true,
                  });
                }}>
                <LinearGradient
                  colors={[Colors.primary_gradient_color, Colors.primary_color]}
                  style={styles.submitGradient}>
                  <Text
                    style={[
                      styles.buttonText,
                      {
                        paddingLeft: 37,
                        paddingRight: 35,
                      },
                    ]}>
                    {Strings.button_submit}
                  </Text>
                </LinearGradient>
              </TouchableOpacity> */}
            </View>
          ) : null}
          {this.state.openSubmitModal ? (
            <Modal
              transparent={true}
              animationType={'slide'}
              onRequestClose={() => {
                this.setState({
                  ...this.state,
                  openSubmitModal: false,
                });
              }}>
              <View
                style={{
                  flex: 1,
                  backgroundColor: 'rgba(73,69,69,0.81)',
                  justifyContent: 'center',
                }}>
                <View style={{ marginRight: 14, marginLeft: 14 }}>
                  <Card style={styles.modalCard}>
                    <Image
                      source={ImageAssets.help_email_icon}
                      style={styles.email}
                    />
                    <View style={styles.view}>
                      <View style={styles.modalHeader}>
                        <View style={styles.checkView}>
                          <Image source={ImageAssets.check_icon} />
                        </View>
                        <Text
                          style={[
                            styles.radioActive,
                            { marginRight: 20, color: '#727272' },
                          ]}>
                          {Strings.text_help_model_header}
                        </Text>
                      </View>
                      <View style={styles.modalSubtext}>
                        <View style={{ margin: 12, alignItems: 'center' }}>
                          <Text style={styles.subText}>
                            {Strings.text_help_model_header_subtitle}
                          </Text>
                          <Text style={[styles.subText, { marginTop: 15 }]}>
                            {Strings.text_help_thank}
                          </Text>
                        </View>
                      </View>
                      <TouchableOpacity
                        style={styles.okButton}
                        onPress={async () => {
                          this.setState({
                            ...this.state,
                            openSubmitModal: false,
                          });
                        }}>
                        <LinearGradient
                          colors={[
                            Colors.primary_gradient_color,
                            Colors.primary_color,
                          ]}
                          style={styles.submitGradient}>
                          <Text
                            style={[
                              styles.buttonText,
                              {
                                paddingLeft: 37,
                                paddingRight: 35,
                              },
                            ]}>
                            {Strings.button_ok}
                          </Text>
                        </LinearGradient>
                      </TouchableOpacity>
                    </View>
                  </Card>
                </View>
              </View>
            </Modal>
          ) : null}
        </Card>
      </View>
    );
  }

  public onRadioItemChange = index => {
    for (let i = 0; i < this.props.radioItems.length; i++) {
      this.props.radioItems[i].isActive = i === index ? true : false;
    }
    this.setState({
      ...this.state,
      radioItems: this.props.radioItems,
    });
  };
}

const styles = StyleSheet.create({
  mainView: {
    marginLeft: 20,
    marginRight: 20,
    marginTop: 16,
  },
  headerView: {
    marginTop: 20,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  line: {
    height: 0.7,
    backgroundColor: Colors.text_Light,
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  submit: {
    height: 40,
    alignSelf: 'center',
    marginTop: 30,
    marginBottom: 30,
  },
  okButton: {
    height: 34,
    alignSelf: 'center',
    marginTop: 22,
    marginBottom: 27,
    width: 176,
  },
  submitGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ec2f23',
    borderRadius: 14,
  },
  radioImage: {
    width: 14,
    height: 14,
    marginRight: 8,
  },
  headerText: {
    fontFamily: 'Muli-SemiBold',
    fontSize: 14,
    color: Colors.text_primary_dark,
  },
  subHeaderText: {
    fontFamily: 'Muli-SemiBold',
    fontSize: 10,
    color: Colors.text_Light,
  },
  radioActive: {
    fontFamily: 'Muli-Medium',
    fontSize: 12,
    color: Colors.text_primary_dark,
  },
  buttonText: {
    fontFamily: 'Muli-ExtraBold',
    fontSize: 14,
    color: '#fff5f5',
  },
  subText: {
    fontFamily: 'Muli-Regular',
    fontSize: 10,
    color: '#727272',
  },
  modalCard: {
    backgroundColor: '#f7f7f7',
    borderRadius: 14,
  },
  email: {
    alignSelf: 'center',
    position: 'absolute',
    marginTop: -28,
  },
  view: {
    marginLeft: 20,
    marginRight: 20,
  },
  modalHeader: {
    marginTop: 69,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  checkView: {
    height: 43,
    width: 43,
    borderRadius: 21.5,
    borderColor: '#6dce6d',
    borderWidth: 0.8,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalSubtext: {
    marginTop: 24,
    backgroundColor: '#eeeeee',
    borderRadius: 13,
  },
});
