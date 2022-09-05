import * as React from 'react';
import {
  View,
  StyleSheet,
  Modal,
  Text,
  Keyboard,
  Dimensions,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Button } from 'native-base';
import LinearGradient from 'react-native-linear-gradient';
import Colors from '../../resources/Colors';
import ImageAssets from '../../assets';

const win = Dimensions.get('window');

export class ModalPopUp extends React.Component<any, {}> {
  public render() {
    return (
      <View style={styles.container}>
        <Modal
          animationType={'slide'}
          transparent={true}
          visible={this.props.showPopUp}
          onRequestClose={() => {
            if (this.props.closeModal) {
              this.props.closeModal();
            }
          }}
          presentationStyle={'formSheet'}>
          <View
            style={{
              flex: 1,
              justifyContent: 'flex-end',
              backgroundColor: 'rgba(1,1,1,0.5)',
            }}>
            <View
              style={{
                flex: 0.25,
                backgroundColor: Colors.white,
                borderTopRightRadius: 14,
                borderTopLeftRadius: 14,
              }}>
              <View
                style={[
                  styles.title,
                  {
                    flexDirection: 'row',
                    alignItems: 'center',
                    flex: 0.1,
                    marginBottom: 1,
                  },
                ]}>
                <Text style={styles.titleText}>{this.props.title}</Text>
                {this.props.closeModal ? (
                  <TouchableOpacity
                    style={{
                      flex: 0.06,
                      marginHorizontal: 22,
                    }}
                    onPress={() => {
                      if (this.props.closeModal) {
                        this.props.closeModal();
                      } else {
                        this.props.closeDisplay();
                      }
                    }}>
                    <Image source={ImageAssets.cross} />
                  </TouchableOpacity>
                ) : null}
              </View>
              <Text style={[styles.subTitle, { flex: 0.3, marginTop: 5 }]}>
                {this.props.question}
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  //   marginLeft: 13.5,
                  // marginBottom: 10,
                  // marginTop: -10,
                  flex: 0.3,
                  alignSelf: 'center',
                }}>
                <Button
                  style={styles.ButtonStyle}
                  onPress={() => {
                    Keyboard.dismiss();
                    if (this.props.closeModal) {
                      this.props.onPress(true, 'login');
                    }else if(this.props.changeAddress){
                        this.props.changeAddress();
                    }else{
                      this.props.closeDisplay();
                    }
                  }}>
                  <LinearGradient
                    colors={['#f29365', '#ec2f23']}
                    style={styles.gradient}
                  />
                  <Text style={styles.Text1Style}>
                    {this.props.buttonText1}
                  </Text>
                </Button>
                <View style={{ marginLeft: 15 }} />
                <Button
                  style={styles.ButtonStyle}
                  onPress={() => {
                    Keyboard.dismiss();
                    if (this.props.closeModal) {
                      this.props.onPress(false, 'signup');
                    } else if (this.props.cancelOrder) {
                      this.props.cancelOrder()
                    }else if(this.props.changeStore){
                      this.props.changeStore();
                  } else {
                      this.props.closeDisplay();
                    }
                  }}>
                  <LinearGradient
                    colors={[Colors.white, '#EEEEEE']}
                    style={styles.gradient}
                  />
                  <Text style={styles.Text1Style2}>
                    {this.props.buttonText2}
                  </Text>
                </Button>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    height: 20,
    flex: 1,
  },
  title: {
    color: '#555555',
    fontFamily: 'Muli-ExtraBold',
    fontSize: 15,
    alignSelf: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  titleText: {
    color: '#555555',
    fontFamily: 'Muli-ExtraBold',
    fontSize: 15,
    marginBottom: 10,
    flex: 0.94,
    textAlign: 'center',
    // marginLeft: '15%',
  },
  subTitle: {
    color: '#777777',
    fontFamily: 'Muli-Medium',
    fontSize: 16,
    alignSelf: 'center',
    textAlign: 'center',
    flex: 0.1,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 14,
  },
  ButtonStyle: {
    borderColor: '#ec2f23',
    height: '90%',
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderRadius: 16,
    elevation: 0,
    borderBottomColor: '#ec2f23',
    borderBottomWidth: 2,
    alignItems: 'center',
    flex: 0.42,
  },

  Text1Style: {
    color: Colors.white,
    width: '100%',
    fontFamily: 'Muli-ExtraBold',
    fontSize: 16,
    textAlign: 'center',
  },
  Text1Style2: {
    color: '#ec2f23',
    width: '100%',
    fontFamily: 'Muli-ExtraBold',
    fontSize: 16,
    textAlign: 'center',
  },
});
