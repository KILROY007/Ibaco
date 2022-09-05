import React, { Component } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import ImageAssets from '../../assets';
import Colors from '../../resources/Colors';

export default class ScreenHeader extends Component<any, {}> {
    /**
     * Send style props to change the style of the text wrapper.
     * Send textStyle props to change the style of the text itself.
     */

    public render() {
        return (
            <TouchableOpacity
                style={[{ flexDirection: 'row', justifyContent: 'center', width: '100%', alignItems: 'center' }]}
                onPress={() => { if (this.props.goBack) { this.props.goBack() } }}
            >
                <View><Image source={this.props.image ? this.props.image : ImageAssets.arrow_backword} style={{tintColor:!this.props.image &&Colors.primary_color}}/></View>
                <Text
                    style={styles.titleStyle}
                    numberOfLines={1}
                >
                    {this.props.title}
                </Text>
            </TouchableOpacity>
        )
    }
}

const styles = StyleSheet.create({
    titleStyle: {
        color: Colors.text_dark,
        fontFamily: 'Montserrat',
        fontSize: 14,
        fontWeight: 'bold',
        marginLeft: 6,
        marginRight:6
    },
})
