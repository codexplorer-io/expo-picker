---
name: expo-picker
description: Instructions and guidelines for using @codexporer.io/expo-picker (Expo Picker) in React Native and Expo applications.
---

# `@codexporer.io/expo-picker` Skill

## Overview
`@codexporer.io/expo-picker` provides a comprehensive full-screen and dialog selection system supporting list picking (single/multi-select), native date/time selection, and HSV color picking. It integrates search filtering via `@codexporer.io/expo-searchbar`, high-performance virtualization via `@shopify/flash-list`, and navigation bridging via `@codexporer.io/expo-navigation-bridge`.

---

## When to Use
- Picking single or multiple options from small or large lists (e.g. typography, categories, tags, aspect ratios).
- Selecting dates, times, or timestamps with native modals.
- Picking custom hex/HSV colors via an interactive color picker dialog.

---

## Peer Dependencies
Requires the following peer dependencies:
- Core: `react`, `react-native`, `react-sweet-state`, `color`, `lodash`, `react-native-safe-area-context`
- List virtualization: `@shopify/flash-list`
- Date/Time picker: `react-native-modal-datetime-picker`, `@react-native-community/datetimepicker`
- Device info: `@codexporer.io/expo-device`
- Codex UI components: `@codexporer.io/expo-app-theme`, `@codexporer.io/expo-appbar`, `@codexporer.io/expo-button`, `@codexporer.io/expo-checkbox`, `@codexporer.io/expo-dialog`, `@codexporer.io/expo-keyboard-avoiding-view`, `@codexporer.io/expo-navigation-bridge`, `@codexporer.io/expo-radio-button`, `@codexporer.io/expo-searchbar`, `@codexporer.io/react-hooks`, `@codexporer.io/react-native-hsv-color-picker`

---

## Required Setup

1. Register `...getRouteConfig()` routes in the React Navigation Stack:
```tsx
import { getRouteConfig as getPickerRoutes } from '@codexporer.io/expo-picker';

// In Navigation Stack:
{getPickerRoutes().map(route => (
  <Stack.Screen
    key={route.name}
    name={route.name}
    component={route.screen}
    options={route.screenOptions}
  />
))}
```

2. Mount `<Picker />` coordinator near root inside `ThemeProvider` and `SafeAreaProvider`:
```tsx
import { Picker } from '@codexporer.io/expo-picker';

export function RootApp() {
  return (
    <SafeAreaProvider>
      <AppThemeProvider>
        <AppNavigator />
        <Picker />
      </AppThemeProvider>
    </SafeAreaProvider>
  );
}
```

---

## Usage Examples

### 1. List Single Selection with Search Filtering

```tsx
import React, { useState } from 'react';
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

### 2. Multi-Select Options with Select All

```tsx
import React, { useState } from 'react';
import { Button } from '@codexporer.io/expo-button';
import { usePicker } from '@codexporer.io/expo-picker';

const TAGS = ['Travel', 'Nature', 'Portraits', 'Architecture', 'Street', 'Macro'];

export function TagSelector() {
  const [selectedTags, setSelectedTags] = useState<string[]>(['Travel']);
  const [, { openPicker }] = usePicker();

  const handleOpen = () => {
    openPicker({
      title: 'Select Tags',
      items: TAGS,
      isMultiSelect: true,
      selectedValues: selectedTags,
      canFilter: true,
      onValuesChange: (tags) => {
        setSelectedTags(tags);
      }
    });
  };

  return <Button title={`Selected: ${selectedTags.length}`} onPress={handleOpen} />;
}
```

### 3. Date / Time Picker

```tsx
openPicker({
  pickerType: 'date',
  mode: 'date',
  selectedValue: new Date(),
  onValueChange: (date) => {
    console.log('Selected date:', date);
  }
});
```

### 4. Color Picker Mode

```tsx
openPicker({
  pickerType: 'color',
  selectedValue: '#01579B',
  onValueChange: (hexColor) => {
    setAccentColor(hexColor);
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
  - `closePicker(): Promise<void>` — Closes the picker dialog/screen (awaits `onBeforeClose?.()`).

### `PickerConfig<T>` Options

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `title` | `string` | `''` | Header title displayed in appbar |
| `items` | `T[]` | `[]` | Array of candidate options to pick from |
| `pickerType` | `'list' \| 'date' \| 'time' \| 'datetime' \| 'color'` | `'list'` | Visual picker modality |
| `mode` | `'date' \| 'time' \| 'datetime'` | `'date'` | Date/time picker display mode |
| `selectedValue` | `T` | — | Current value (for single selection) |
| `selectedValues` | `T[]` | `[]` | Array of current values (for multi selection) |
| `onValueChange` | `(value: T) => void` | — | Single item selection callback |
| `onValuesChange` | `(values: T[]) => void` | — | Multi item selection callback |
| `isMultiSelect` | `boolean` | `false` | Enables multi-select checkbox mode |
| `hasSelector` | `boolean` | `true` | Renders checkboxes/radio for selection |
| `canFilter` | `boolean` | `false` | Enables live search filter bar in header |
| `filterOption` | `(item: T, text: string) => boolean` | — | Custom search filter predicate |
| `shouldHideSelectAll` | `boolean` | `false` | Hides the select all toggle button in multi-select |
| `shouldHideConfirmScreenButton` | `boolean` | `false` | Hides the header check confirmation button |
| `renderOptionContent` | `(props: { option: T; renderLabel }) => ReactNode` | — | Custom item content renderer |
| `renderOption` | `(props: { option: T }) => ReactNode` | — | Custom full item renderer |
| `renderTopView` | `() => ReactNode` | — | Header element above list |
| `renderBottomView` | `() => ReactNode` | — | Footer element below list |
| `renderEmptyView` | `() => ReactNode` | — | Custom view rendered when no filter match |
| `estimatedItemSize` | `number` | `200` | FlashList item height estimate |
| `startYear` | `number` | `1950` | Minimum year limit for date picker |
| `endYear` | `number` | `2050` | Maximum year limit for date picker |
| `isEqual` | `(item1: T, item2: T) => boolean` | `item1 === item2` | Custom equality comparator for list items |
| `onBeforeClose` | `() => Promise<boolean> \| boolean` | — | Interceptor callback to guard closing; return `false` to abort close |
| `onConfirm` | `() => Promise<void> \| void` | — | Custom confirmation handler on header check press |

---

## Critical Rules & Guidelines
1. **Always Mount `<Picker />`**: Without this coordinator component, calling `openPicker()` will not display dialogs or push navigation routes.
2. **FlashList Virtualization**: `estimatedItemSize` defaults to `200`; tune this when rendering items with significantly different dimensions.
3. **Theming**: Option rows, dividers, headers, buttons, and searchbars derive styling from `useAppTheme()`. Never hardcode raw colors in custom render callbacks.
4. **Hardware Back Press**: `PickerScreen` automatically handles hardware back press when focused, triggering `closePicker()`.

