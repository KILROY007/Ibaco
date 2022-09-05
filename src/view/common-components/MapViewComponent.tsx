import React, {Component} from 'react';
import {StyleSheet, View, Dimensions} from 'react-native';
import Colors from '../../resources/Colors';
import MapView, {Marker} from 'react-native-maps';
import ImageAssets from '../../assets';
import Geocoder from 'react-native-geocoder';
import {Loader} from './Loader';
const {width, height} = Dimensions.get('window');
export default class MapViewComponent extends Component<any, any> {
  mapRef: any;
  constructor(props: any) {
    super(props);
    this.mapRef = React.createRef();
    this.state = {
      coordinate: this.props.coordinate,
      description: '',
      coordinateDelta:this.props.coordinateDelta,
      isLoading: false,
    };
  }
  getDescription = async (e: any) => {
    const region = {
      lat: e.nativeEvent.coordinate.latitude,
      lng: e.nativeEvent.coordinate.longitude,
    };
  //  this.props.setCoordinateDelta({latitudeDelta: 0.00012, longitudeDelta: 0.00011})
    this.props.setCoordinateDelta({latitudeDelta: 0.00172, longitudeDelta: 0.00171})
    await this.props.model.getAddressByLatLng(region);
  };

  public render() {
    return (
      <View style={styles.homeComponent}>
        <MapView
          style={styles.map}
          region={{
            ...this.props.coordinate,
            ...this.props.coordinateDelta,
          }}
          onPoiClick={e => {
            this.getDescription(e);
          }}
          onPress={e => {
            this.getDescription(e);
          }}>
          <Marker
            // image ={ImageAssets.iconmap}
            draggable
            coordinate={this.props.coordinate}
            title={`${this.props.description ? 'details' : ''}`}
            description={this.props.description}
            onDragEnd={(e)=>this.getDescription(e)}
          />
        </MapView>
        {this.state.isLoading ? <Loader isTransperant={true} /> : null}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  homeComponent: {
    height: 300,
    width: '100%',
    marginTop: 10,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});
