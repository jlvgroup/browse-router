/**
 * NativeWind v4 type augmentation.
 *
 * cssInterop attaches `className` to RN components at runtime, but the
 * built-in RN types don't know about it. We declare it here so TS lets
 * `className="..."` pass through.
 */
import 'react-native';

declare module 'react-native' {
  interface ViewProps {
    className?: string;
  }
  interface TextProps {
    className?: string;
  }
  interface ScrollViewProps {
    className?: string;
  }
  interface PressableProps {
    className?: string;
  }
  interface TextInputProps {
    className?: string;
  }
  interface ImageProps {
    className?: string;
  }
  interface ImageBackgroundProps {
    className?: string;
  }
  interface TouchableOpacityProps {
    className?: string;
  }
}
