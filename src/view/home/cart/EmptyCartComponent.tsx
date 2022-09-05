import React from 'react';
import {
  TouchableOpacity,
  View,
  StyleSheet,
  Keyboard,
  SafeAreaView,
  Image,
} from 'react-native';
import {ComponentBase} from 'resub';
import {Container, Text, Input, Item, Card, Content} from 'native-base';
import ImageAssets from '../../../assets';

export class EmptyCartComponent extends ComponentBase<any, any> {
  constructor(props: any) {
    super(props);
  }

  public render() {
    return (
      <Container style={styles.container}>
        <Image source={ImageAssets.empty_cart} />
        {/* <Image source={ImageAssets.go_grab} style={{ marginTop: 44 }} /> */}
        <Text style={styles.empty_cart}>Cart looks best with items in it</Text>
      </Container>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  empty_cart: {
    textAlign: 'center',
    marginTop: 44,
    fontFamily:"Montserrat-SemiBold",
    fontWeight: '400',
    opacity: 0.5,
    fontSize: 22,
  },
});
