import { Image } from 'expo-image';
import * as React from 'react';
import { StyleSheet, View } from 'react-native';

export default function ImageBlurHashScreen() {
  (async () => {
    const hash = await global.expo.modules.ExpoImage.encodeBlurHashAsync(
      'https://picsum.photos/id/1069/700/466.jpg',
      6,
      4
    );
    console.log(hash);
  })();

  return (
    <View style={styles.container}>
      <Image style={styles.image} source="LEHV6nWB2yk8pyo0adR*.7kCMdnj" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  image: {},
});
