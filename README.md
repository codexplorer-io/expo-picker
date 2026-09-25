# `@codexporer.io/expo-picker`

Customizable picker suite for React Native and Expo applications. Includes color picker, date/time pickers, single-select options, and multi-select options with search filtering and custom content rendering.

## Platform Compatibility

| iOS | Android | Web |
| :---: | :---: | :---: |
| ✅ | ✅ | ❌ |

## Samples

### Date & Time
<img title="Date picker" src="https://github.com/codexplorer-io/expo-picker/blob/master/samples/date.png?raw=true" width="40%"> <img title="Time picker" src="https://github.com/codexplorer-io/expo-picker/blob/master/samples/time.png?raw=true" width="40%">

### Single & Multi-Options with Search
<img title="Single select 1" src="https://github.com/codexplorer-io/expo-picker/blob/master/samples/single-select-title.jpg?raw=true" width="40%"> <img title="Single select 2" src="https://github.com/codexplorer-io/expo-picker/blob/master/samples/single-select.jpg?raw=true" width="40%">

<img title="Custom multi 1" src="https://github.com/codexplorer-io/expo-picker/blob/master/samples/custom-multiselect.jpg?raw=true" width="30%"> <img title="Custom multi 2" src="https://github.com/codexplorer-io/expo-picker/blob/master/samples/custom-multiselect2.jpg?raw=true" width="30%"> <img title="Custom multi 3" src="https://github.com/codexplorer-io/expo-picker/blob/master/samples/custom-multiselect3.jpg?raw=true" width="30%">

### Color Picker
<img title="Color picker" src="https://github.com/codexplorer-io/expo-picker/blob/master/samples/color.jpg?raw=true" width="60%">

## Installation & Peer Dependencies

```bash
yarn add @codexporer.io/expo-picker
```

Ensure peer dependencies are installed:
```bash
yarn add react-sweet-state color react-native-modal-datetime-picker \
  @codexporer.io/react-native-hsv-color-picker @codexporer.io/react-hooks \
  @codexporer.io/expo-device @codexporer.io/expo-keyboard-avoiding-view \
  @codexporer.io/expo-appbar @codexporer.io/expo-button @codexporer.io/expo-checkbox \
  @codexporer.io/expo-dialog @codexporer.io/expo-radio-button @codexporer.io/expo-searchbar \
  @codexporer.io/expo-navigation-bridge @codexporer.io/expo-app-theme
```

## Setup

### 1. Mount `<Picker />` in Application Root

`<Picker />` renders dialog-based pickers (such as the HSV color picker and date/time modal) and must be placed inside your `ThemeProvider`:

```tsx
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, defaultThemeConfig } from '@codexporer.io/expo-app-theme';
import { Picker } from '@codexporer.io/expo-picker';

export const App = ({ children }) => (
  <SafeAreaProvider>
    <ThemeProvider themeConfig={defaultThemeConfig}>
      {children}
      <Picker />
    </ThemeProvider>
  </SafeAreaProvider>
);
```

### 2. Register Navigation Route for Select Screens

For single-select and multi-select screens, register the picker screen in your React Navigation stack using `getRouteConfig()`:

```tsx
import React, { useRef, useEffect } from 'react';
import { NavigationContainer, useIsFocused } from '@react-navigation/native';
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import { setNavigation, setScreenTransitions, setUseIsFocused } from '@codexporer.io/expo-navigation-bridge';
import { getRouteConfig } from '@codexporer.io/expo-picker';

// Configure screen transitions and hooks for the picker
setScreenTransitions({
  slideFromBottom: TransitionPresets.ModalSlideFromBottomIOS,
});
setUseIsFocused(useIsFocused);

const Stack = createStackNavigator();
const [pickerRoute] = getRouteConfig();

export function RootNavigator() {
  const navigationRef = useRef(null);

  useEffect(() => {
    if (navigationRef.current) {
      setNavigation(navigationRef.current);
    }
  }, []);

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator>
        {/* Your application screens */}
        <Stack.Screen
          name={pickerRoute.name}
          component={pickerRoute.screen}
          options={pickerRoute.screenOptions}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

## Usage

Use `usePicker()` to open and control pickers anywhere in your application:

```tsx
import React, { useState } from 'react';
import { Button, View, Text } from 'react-native';
import { usePicker } from '@codexporer.io/expo-picker';

export const ExampleScreen = () => {
  const [, { openPicker }] = usePicker();
  const [selectedColor, setSelectedColor] = useState('#01579B');
  const [selectedItem, setSelectedItem] = useState('Option 1');

  // Open Color Picker
  const handleOpenColor = () => {
    openPicker({
      pickerType: 'color',
      selectedValue: selectedColor,
      onValueChange: (newColor) => setSelectedColor(newColor)
    });
  };

  // Open Single-Select Options Picker
  const handleOpenSelect = () => {
    openPicker({
      title: 'Select Track Type',
      items: ['Electronic', 'Ambient', 'Rock', 'Classical'],
      selectedValue: selectedItem,
      canFilter: true,
      onValueChange: (val) => setSelectedItem(val)
    });
  };

  return (
    <View style={{ padding: 16, gap: 12 }}>
      <Text>Selected Color: {selectedColor}</Text>
      <Button title="Pick Color" onPress={handleOpenColor} />

      <Text>Selected Genre: {selectedItem}</Text>
      <Button title="Select Genre" onPress={handleOpenSelect} />
    </View>
  );
};
```

## Exports

| Symbol | Description |
| :--- | :--- |
| `Picker` | Dialog-based picker component (color, date/time) |
| `getRouteConfig` | Returns route configuration array for React Navigation stack registration |
| `usePicker` | React hook to trigger, configure, and close pickers |

## Picker Options Reference

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `pickerType` | `'color' \| 'date' \| 'time' \| 'datetime' \| 'select'` | `'select'` | Type of picker to display |
| `mode` | `'date' \| 'time' \| 'datetime'` | `'date'` | Date picker mode |
| `title` | `string` | `''` | Header title in select option screen |
| `items` | `string[]` | `[]` | Available choices for select picker |
| `selectedValue` | `any` | — | Current selected value |
| `onValueChange` | `(val: any) => void` | — | Callback invoked on single selection change |
| `isMultiSelect` | `boolean` | `false` | Enables multi-selection mode with checkboxes |
| `selectedValues` | `string[]` | `[]` | Selected items array for multi-select |
| `onValuesChange` | `(vals: string[]) => void` | — | Callback invoked on multi-selection change |
| `canFilter` | `boolean` | `false` | Enables real-time search filtering in options screen |
| `renderOptionContent` | `(item: string) => ReactNode`| — | Custom item renderer |
| `renderTopView` | `() => ReactNode` | — | Custom header element above option list |
| `renderBottomView` | `() => ReactNode` | — | Custom footer element below option list |
| `hasSelector` | `boolean` | `true` | Shows radio or checkbox selector icon |

## License

MIT
