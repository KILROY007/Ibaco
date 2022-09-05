import React from 'react';
import { TouchableOpacity, View, StyleSheet, Image, Modal, Linking } from 'react-native';
import { ComponentBase } from 'resub';
import { Container, Text, Input, Item, Card, Content } from 'native-base';
import { DependencyInjector } from '../../dependency-injector/DependencyInjector';
import { LoginViewModel, LoginState } from '../../view-madel/LoginViewModel';
import { HelpViewModel, HelpState } from '../../view-madel/HelpViewModel';
import { Loader } from '../common-components/Loader';
import Colors from '../../resources/Colors';
import ImageAssets from '../../assets';
import { HelpItem } from './HelpItem';
import Strings from '../../resources/String';
import LinearGradient from 'react-native-linear-gradient';
import AlertComponent from '../common-components/Alert/Alert';
import constants from '../../resources/constants';

export class Help extends ComponentBase<any, HelpState> {
  public viewModel: HelpViewModel;
  constructor(props: any) {
    super(props);
    this.viewModel = DependencyInjector.default().provideHelpViewModel();
  }

  componentDidMount() {
    this.viewModel.getIWantStrings();
  }

  public render() {
    if (this.state.isLoading) {
      return <Loader />;
    } else {
      return (
        <Container style={styles.container}>
          {/* {this.state.isLoading ? <Loader /> : null} */}
          <Content>
            {this.state.alertDetails && this.state.alertDetails.description ? (
              <AlertComponent
                visible={true}
                title={Strings.alert_title}
                description={this.state.alertDetails.description}
                okButtonText={Strings.button_ok}
                cancelButtonText={Strings.text_cancel}
                onOkPress={() => {
                  this.viewModel.set('alertDetails', undefined);
                }}
                onCancelPress={() => {
                  this.viewModel.set('alertDetails', undefined);
                }}
                shouldShowCancelButton={false}
              />
            ) : null}
            <View style={styles.headerView}>
              <Image
                source={ImageAssets.help_question_icon}
                style={{ marginRight: 12 }}
              />
              <Text style={styles.headerText}>
                {Strings.text_help_assistance}
              </Text>
            </View>
            <View style={{ marginTop: 9 }}>
              {this.state.iwantResponse && this.state.iwantToItems.length
                ? this.state.iwantResponse.map((item, index) => {
                  return (
                    <HelpItem
                      key={index}
                      index={index}
                      helpItem={item}
                      radioItems={this.state.iwantToItems[index]}
                      setSelectedHeaderIndex={this.setSelectedHeaderIndex}
                      onRadioItemChange={this.onRadioItemChange}
                      viewModel={this.viewModel}
                    />
                  );
                })
                : null}
            </View>
            {this.props.route.params.selectedOrder.status !== 'closed' && (
              <TouchableOpacity
                style={{ marginLeft: 15, marginTop: 10, height: 30 }}
                onPress={() => {
                  const selectedOrder = this.props.route.params.selectedOrder;
                  this.props.navigation.navigate('OrderTrackingComponent', {
                    isOnlinePayment:
                      selectedOrder.extension_attributes
                        .payment_additional_info[0].value ===
                        'Check / Money order'
                        ? false
                        : true,
                    orderItem: selectedOrder,
                    response: selectedOrder.entity_id,
                    isUpdateTrackOrder:
                      selectedOrder.shipping_description === 'Flat Rate - Fixed'
                        ? true
                        : false,
                  });
                }}>
                <Text
                  style={[styles.buttonText, { color: Colors.primary_color }]}>
                  Where is my Order?
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              disabled={!this.state.enableSubmit}
              style={styles.submit}
              onPress={async () => {
                const radioItems = this.state.iwantToItems[
                  this.state.selectedHeaderIndex
                ];
                for (const radioItem of radioItems) {
                  if (
                    radioItem.isActive &&
                    radioItem.excerpt.rendered === 'Others' &&
                    this.state.othersText === ''
                  ) {
                    const alert = {
                      shouldShowCancelButton: true,
                      description: 'Please enter text',
                      title: Strings.alert_title,
                      okButtonText: Strings.button_ok,
                      onOkPress: async () => {
                        this.viewModel.set('alertDetails', undefined);
                      },
                    };
                    this.viewModel.set('alertDetails', alert);
                    break;
                  } else if (radioItem.isActive) {
                    this.viewModel.sendEmailOnSubmit(
                      this.props.route.params.selectedOrder,
                    );
                  }
                }
              }}>
              <LinearGradient
                colors={
                  this.state.enableSubmit
                    ? [Colors.primary_gradient_color, Colors.primary_color]
                    : [Colors.primary_gradient_color, Colors.primary_color]
                }
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
            </TouchableOpacity>
            {this.state.openSubmitModal ? (
              <Modal
                transparent={true}
                animationType={'slide'}
                onRequestClose={() => { }}>
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
                            <View>
                              <Text style={[styles.subText, { marginTop: 5 }]}>
                                {Strings.text_for_queries}
                              </Text>
                              <TouchableOpacity onPress={() => Linking.openURL(`mailto:${constants.MAIL}`)}>
                                <Text style={[styles.subText, { color: Colors.primary_color, marginTop: 5, textAlign:"center" }]}>{constants.MAIL}</Text>
                              </TouchableOpacity>
                            </View>
                            <Text style={[styles.subText, { marginTop: 15 }]}>
                              {Strings.text_help_thank}
                            </Text>
                          </View>
                        </View>
                        <TouchableOpacity
                          style={styles.okButton}
                          onPress={async () => {
                            this.viewModel.set('openSubmitModal', false);
                            this.props.navigation.navigate('orders', {
                              screen: 'OrdersHistoryComponent',
                              params: { isUpdated: true },
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
          </Content>
        </Container>
      );
    }
  }

  public setSelectedHeaderIndex = index => {
    for (let i = 0; i < this.state.iwantResponse.length; i++) {
      const item = this.state.iwantResponse[i];
      item.isActive = i === index ? true : false;
    }
    this.viewModel.setMany({
      selectedHeaderIndex: index,
      selectedHeader: this.state.iwantResponse[index].excerpt.rendered,
    });
  };

  public onRadioItemChange = (id, selectedHeaderIndex, isOthers) => {
    const iwantToItems: any = [];
    let selectedOption: any;
    // if (!isOthers) {
    //     for (let i = 0; i < this.state.iwantResponse.length; i++) {
    //         const item = this.state.iwantResponse[i]
    //         item.isActive = i === selectedHeaderIndex ? false : false
    //     }
    // }

    for (const radioItems of this.state.iwantToItems) {
      for (const radioItem of radioItems) {
        radioItem.isActive = radioItem.id === id ? true : false;
        if (radioItem.id === id) {
          selectedOption = radioItem.excerpt.rendered;
        }
      }
      iwantToItems.push(radioItems);
    }
    this.viewModel.setMany({
      iwantToItems,
      enableSubmit: true,
      selectedOption,
    });
  };

  protected _buildState() {
    return this.viewModel.getState();
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerView: {
    marginLeft: 49,
    marginRight: 49,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 25,
  },
  headerText: {
    fontFamily: 'Muli-SemiBold',
    fontSize: 13,
    color: Colors.text_Light,
    marginRight: 49,
  },
  submit: {
    height: 40,
    // alignSelf: 'center',
    marginTop: 30,
    marginBottom: 30,
    marginLeft: 30,
    marginRight: 30,
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