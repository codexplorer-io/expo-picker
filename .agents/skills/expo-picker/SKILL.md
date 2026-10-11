---
name: expo-picker
description: Instructions and guidelines for using @codexporer.io/expo-picker (Expo Picker) in React Native and Expo applications.
---

# `@codexporer.io/expo-picker` Skill

## Overview
`@codexporer.io/expo-picker` provides a comprehensive full-screen selection system supporting list picking (single/multi-select), date/time selection, and HSV color picking. It integrates search filtering via `@codexporer.io/expo-searchbar` and high-performance scrolling via `@shopify/flash-list`.

---

## When to Use
- Picking single or multiple options from large lists (e.g., photo albums, aspect ratio presets).
- Selecting dates, times, or timestamps.
- Picking custom hex/HSV colors.

---

## Required Setup

1. Register `getRouteConfig()` routes in the Stack navigator.
2. Mount `<Picker />` in the root app component tree:

```tsx
import {
  Picker,
  getRouteConfig as getPickerRoutes
} from '@codexporer.io/expo-picker';

// In Navigation Stack:
{getPickerRoutes().map(route => (
  <Stack.Screen
    key={route.name}
    name={route.name}
    component={route.screen}
    options={route.screenOptions}
  />
))}

// Near root layout:
<Picker />
```

---

## Usage Examples

### List Single Selection with Search

```tsx
import React, { useState } from 'react';
import { View } from 'react-native';
import { Button } from '@codexporer.io/expo-button';
import { usePicker } from '@codexporer.io/expo-picker';

const FONTS = ['Roboto', 'Inter', 'Montserrat', 'Playfair', 'Open Sans'];

export function FontSelector() {
  const [font, setFont] = useState('Roboto');
  const [, { openPicker }] = usePicker();

  const handleOpen = () => {
    openPicker({
      title: 'Select Typography',
      items: FONTS,
      selectedValue: font,
      canFilter: true,
      onValueChange: (selected) => {
        setFont(selected);
      }
    });
  };

  return <Button title={`Font: ${font}`} onPress={handleOpen} />;
}
```

### Color Picker Mode

```tsx
openPicker({
  pickerType: 'color',
  title: 'Choose Accent Color',
  selectedValue: '#01579B',
  onValueChange: (color) => {
    setAccentColor(color);
  }
});
```

---

## API Reference

### `usePicker()` Hook
Returns `[state, actions]`:
- **`state`**:
  - `shouldOpen: boolean` — Modal/screen open trigger.
  - `shouldClose: boolean` — Modal/screen close trigger.
  - `pickerConfig: PickerConfig | null` — Active picker configuration.
- **`actions`**:
  - `openPicker(config: PickerConfig): void` — Opens the picker with options.
  - `changeConfig(config: Partial<PickerConfig>): void` — Mutates active config (e.g. updating selection).
  - `closePicker(): Promise<void>` — Closes the picker dialog/screen.

### `PickerConfig<T>` Options

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `title` | `string` | — | Header title displayed in appbar |
| `items` | `T[]` | — | Array of candidate options to pick from |
| `pickerType` | `'list' \| 'date' \| 'time' \| 'datetime' \| 'color'` | `'list'` | Visual picker modality |
| `selectedValue` | `T` | — | Current value (for single selection) |
| `selectedValues` | `T[]` | — | Array of current values (for multi selection) |
| `onValueChange` | `(value: T) => void` | — | Single item selection callback |
| `onValuesChange` | `(values: T[]) => void` | — | Multi item selection callback |
| `canFilter` | `boolean` | `false` | Enables live search filter bar in header |
| `hasSelector` | `boolean` | `true` | Renders checkboxes/radio for selection |
| `shouldHideSelectAll` | `boolean` | `false` | Hides the select all toggle button in multi-select |
| `shouldHideConfirmScreenButton` | `boolean` | `false` | Hides the footer confirm button |
| `renderOptionContent` | `(props: { option: T; renderLabel }) => ReactNode` | — | Custom item content renderer |
| `renderOption` | `(props: { option: T }) => ReactNode` | — | Custom full item renderer |
| `renderEmptyView` | `() => ReactNode` | — | Custom view rendered when no filter match |
| `estimatedItemSize` | `number` | `50` | FlashList item height estimate |
| `onBeforeClose` | `() => Promise<boolean> \| boolean` | — | Interceptor callback to guard closing |
| `onConfirm` | `() => Promise<void> \| void` | — | Callback on selection confirmation |

---

## Critical Rules & Guidelines
1. **Always Mount `<Picker />`**: Without this headless coordinator component, calling `openPicker()` will not navigate to the picker screen.
2. **FlashList Performance**: Pass `estimatedItemSize` when rendering thousands of list items to ensure smooth 60fps scrolling.
3. **Partial Updates with `changeConfig`**: Use `changeConfig({ selectedValue })` to dynamically update options without re-opening the screen.
