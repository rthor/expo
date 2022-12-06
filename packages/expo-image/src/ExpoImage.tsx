import { requireNativeViewManager, requireNativeModule } from 'expo-modules-core';
import React from 'react';
import { Image, NativeSyntheticEvent, StyleSheet, Platform, processColor } from 'react-native';

import {
  ImageErrorEventData,
  ImageLoadEventData,
  ImageProgressEventData,
  ImageProps,
  ImageSource,
} from './Image.types';
import { resolveContentFit, resolveContentPosition } from './utils';

const NativeExpoImage = requireNativeViewManager('ExpoImage');

const ExpoImageModule = requireNativeModule('ExpoImage');

function withDeprecatedNativeEvent<NativeEvent>(
  event: NativeSyntheticEvent<NativeEvent>
): NativeEvent {
  Object.defineProperty(event.nativeEvent, 'nativeEvent', {
    get() {
      console.warn(
        '[expo-image]: Accessing event payload through "nativeEvent" is deprecated, it is now part of the event object itself'
      );
      return event;
    },
  });
  return event.nativeEvent;
}

class ExpoImage extends React.PureComponent<ImageProps> {
  onLoadStart = () => {
    this.props.onLoadStart?.();
  };

  onLoad = (event: NativeSyntheticEvent<ImageLoadEventData>) => {
    this.props.onLoad?.(withDeprecatedNativeEvent(event));
    this.onLoadEnd();
  };

  onProgress = (event: NativeSyntheticEvent<ImageProgressEventData>) => {
    this.props.onProgress?.(withDeprecatedNativeEvent(event));
  };

  onError = (event: NativeSyntheticEvent<ImageErrorEventData>) => {
    this.props.onError?.(withDeprecatedNativeEvent(event));
    this.onLoadEnd();
  };

  onLoadEnd = () => {
    this.props.onLoadEnd?.();
  };

  render() {
    const { source, style, defaultSource, loadingIndicatorSource, ...props } = this.props;
    const resolvedSource = Image.resolveAssetSource((source as ImageSource | number) ?? {});
    const resolvedStyle = StyleSheet.flatten([style]);
    const resolvedPlaceholder = Image.resolveAssetSource(
      defaultSource ?? loadingIndicatorSource ?? {}
    );
    const contentFit = resolveContentFit(props.contentFit, props.resizeMode);
    const contentPosition = resolveContentPosition(props.contentPosition);

    // If both are specified, we default to use default source
    if (defaultSource && loadingIndicatorSource) {
      console.warn(
        "<Image> component can't have both defaultSource and loadingIndicatorSource at the same time. Defaulting to defaultSource"
      );
    }

    // When possible, pass through the intrinsic size of the asset to the Yoga layout
    // system. While this is also possible in native code, doing it here is more efficient
    // as the yoga node gets initialized with the correct size from the start.
    // In native code, there is a separation between the layout (shadow) nodes and
    // actual views. Views that update the intrinsic content-size in Yoga trigger
    // additional layout passes, which we want to prevent.
    if (!Array.isArray(resolvedSource)) {
      const { width, height } = resolvedSource;
      resolvedStyle.width = resolvedStyle.width ?? width;
      resolvedStyle.height = resolvedStyle.height ?? height;
    }

    // Shadows behave different on iOS, Android & Web.
    // Android uses the `elevation` prop, whereas iOS
    // and web use the regular `shadow...` props.
    let hasShadows = false;
    if (Platform.OS === 'android') {
      delete resolvedStyle.shadowColor;
      delete resolvedStyle.shadowOffset;
      delete resolvedStyle.shadowOpacity;
      delete resolvedStyle.shadowRadius;
      hasShadows = !!resolvedStyle.elevation;
    } else {
      delete resolvedStyle.elevation;
      hasShadows = !!resolvedStyle.shadowColor;
    }

    // @ts-ignore
    const backgroundColor = processColor(resolvedStyle.backgroundColor);
    // On Android, we have to set the `backgroundColor` directly on the correct component.
    // So we have to remove it from styles. Otherwise, the background color won't take into consideration the border-radius.
    if (Platform.OS === 'android') {
      delete resolvedStyle.backgroundColor;
    }

    // Shadows are rendered quite differently on iOS, Android and web.
    // - iOS renders the shadow along the transparent contours of the image.
    // - Android renders an underlay which extends to the inside of the bounds.
    // - Web renders the shadow only on the outside of the bounds.
    // To achieve a consistent appearance on all platforms, it is highly recommended
    // to set a background-color on the Image when using shadows. This will ensure
    // consistent rendering on all platforms and mitigate Androids drawing artefacts.
    if (hasShadows) {
      const bkColor: number = typeof backgroundColor === 'number' ? backgroundColor : 0;
      const alpha = bkColor >> 24;
      if (alpha !== -1 && alpha !== 255) {
        // To silence this warning, set background-color to a fully transparent color
        console.warn(
          `"expo-image" Shadows may not be rendered correctly for the transparent parts of images. Set "backgroundColor" to a non-transparent color when using a shadow.`
        );
      }
    }

    const tintColor = processColor(resolvedStyle.tintColor);

    const borderColor = processColor(resolvedStyle.borderColor);
    // @ts-ignore
    const borderStartColor = processColor(resolvedStyle.borderStartColor);
    // @ts-ignore
    const borderEndColor = processColor(resolvedStyle.borderEndColor);
    // @ts-ignore
    const borderLeftColor = processColor(resolvedStyle.borderLeftColor);
    // @ts-ignore
    const borderRightColor = processColor(resolvedStyle.borderRightColor);
    // @ts-ignore
    const borderTopColor = processColor(resolvedStyle.borderTopColor);
    // @ts-ignore
    const borderBottomColor = processColor(resolvedStyle.borderBottomColor);

    return (
      <NativeExpoImage
        {...props}
        {...resolvedStyle}
        source={resolvedSource}
        style={resolvedStyle}
        defaultSource={resolvedPlaceholder}
        contentFit={contentFit}
        contentPosition={contentPosition}
        onLoadStart={this.onLoadStart}
        onLoad={this.onLoad}
        onProgress={this.onProgress}
        onError={this.onError}
        // @ts-ignore
        tintColor={tintColor}
        borderColor={borderColor}
        borderLeftColor={borderLeftColor}
        borderRightColor={borderRightColor}
        borderTopColor={borderTopColor}
        borderBottomColor={borderBottomColor}
        borderStartColor={borderStartColor}
        borderEndColor={borderEndColor}
        backgroundColor={backgroundColor}
      />
    );
  }
}

export { ExpoImageModule };
export default ExpoImage;
