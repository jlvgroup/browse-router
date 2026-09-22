/**
 * Centralised typed wrappers around RN primitives that support `className`.
 *
 * NativeWind v4 attaches `className` at runtime via cssInterop. We re-export
 * the original RN component types so consumers get correct JSX type-checking,
 * and apply cssInterop as a side-effect at module load.
 */
import type { ComponentType } from 'react';
import type {
  ViewProps,
  TextProps,
  ScrollViewProps,
  PressableProps,
  TextInputProps,
  ImageProps,
  ImageBackgroundProps,
  FlatListProps,
  TouchableOpacityProps,
} from 'react-native';
import {
  View as RNView,
  Text as RNText,
  ScrollView as RNScrollView,
  Pressable as RNPressable,
  TextInput as RNTextInput,
  Image as RNImage,
  ImageBackground as RNImageBackground,
  FlatList as RNFlatList,
  TouchableOpacity as RNTouchableOpacity,
} from 'react-native';
import { cssInterop } from 'nativewind';

// cssInterop mutates the component in place; cast is safe because the runtime
// preserves props + only adds className handling.
const wrap = <P,>(Comp: ComponentType<P>): ComponentType<P> => {
  cssInterop(Comp as never, { className: 'style' });
  return Comp;
};

export const View: ComponentType<ViewProps> = wrap(RNView);
export const Text: ComponentType<TextProps> = wrap(RNText);
export const ScrollView: ComponentType<ScrollViewProps> = wrap(RNScrollView);
export const Pressable: ComponentType<PressableProps> = wrap(RNPressable);
export const TextInput: ComponentType<TextInputProps> = wrap(RNTextInput);
export const Image: ComponentType<ImageProps> = wrap(RNImage);
export const ImageBackground: ComponentType<ImageBackgroundProps> = wrap(RNImageBackground);
export const FlatList = wrap(RNFlatList) as typeof RNFlatList;
export const TouchableOpacity: ComponentType<TouchableOpacityProps> = wrap(RNTouchableOpacity);
