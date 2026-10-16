# AGENTS.md — `@codexporer.io/expo-picker`

## Package Overview
Versatile multi-modal picker suite supporting list selections (single and multi-select), date/time pickers, and HSV color pickers with real-time search filtering, FlashList virtualization, and navigation bridge integration.

## Peer Dependencies
```json
{
  "react": "*",
  "react-native": "*",
  "react-sweet-state": "*",
  "color": "*",
  "lodash": "*",
  "@shopify/flash-list": "*",
  "react-native-modal-datetime-picker": "*",
  "@react-native-community/datetimepicker": "*",
  "react-native-safe-area-context": "*",
  "@codexporer.io/expo-app-theme": "*",
  "@codexporer.io/expo-appbar": "*",
  "@codexporer.io/expo-button": "*",
  "@codexporer.io/expo-checkbox": "*",
  "@codexporer.io/expo-device": "*",
  "@codexporer.io/expo-dialog": "*",
  "@codexporer.io/expo-keyboard-avoiding-view": "*",
  "@codexporer.io/expo-navigation-bridge": "*",
  "@codexporer.io/expo-radio-button": "*",
  "@codexporer.io/expo-searchbar": "*",
  "@codexporer.io/react-hooks": "*",
  "@codexporer.io/react-native-hsv-color-picker": "*"
}
```

## Key Exports (`src/index.ts`)
- `Picker`: Headless coordinator component mounted once in root application tree. Manages dialog pickers (color, date/time) directly and coordinates navigation to `PickerScreen` via `getNavigation()?.push('PickerScreen')` and `getNavigation()?.goBack()`.
- `getRouteConfig()`: Returns route array `[{ name: 'PickerScreen', screen: PickerScreen, screenOptions: { ...(getScreenTransitions()?.slideFromBottom ?? {}) } }]` for React Navigation stack registration.
- `usePicker()`: React Sweet State hook returning `[state, actions]`:
  - `state`: `{ shouldOpen: boolean, shouldClose: boolean, pickerConfig: PickerConfig | null }`
  - `actions`:
    - `openPicker(config: PickerConfig): void`
    - `changeConfig(config: Partial<PickerConfig>): void`
    - `closePicker(): Promise<void>` (evaluates `onBeforeClose?.()`; cancels close if returns `false`)

## Picker Modalities & Configuration (`PickerConfig<T>`)
- **`list` (default)**:
  - Rendered in `PickerScreen` with `@shopify/flash-list` (`estimatedItemSize` defaults to `200`).
  - Search filtering: enabled via `canFilter: true` using `@codexporer.io/expo-searchbar`. Custom matching logic via `filterOption(item, searchText)`; fallback matches case-insensitively against `item.label ?? item.title ?? item.name ?? String(item)`.
  - Single select: provide `selectedValue` and `onValueChange: (val) => void`. Displays `RadioButton`. Selection immediately triggers `onValueChange(item)` and closes picker.
  - Multi select: provide `isMultiSelect: true`, `selectedValues: T[]`, and `onValuesChange: (vals) => void`. Displays `Checkbox`, header check confirmation button, and optional "Select All" toggle (shown when `!shouldHideSelectAll && items.length > 1`).
  - Equality comparator: `isEqual(item1, item2)` (defaults to `item1 === item2`).
- **`date` / `time` / `datetime`**:
  - Rendered via `react-native-modal-datetime-picker`.
  - On iOS, checks `OS.isIOS()` from `@codexporer.io/expo-device` and sets `display: 'inline'`.
  - Configurable `startYear` (default `1950`) and `endYear` (default `2050`).
- **`color`**:
  - Renders `@codexporer.io/expo-dialog` containing `HsvColorPicker` from `@codexporer.io/react-native-hsv-color-picker`.
  - Parses string/hex colors with `color` library into HSV and returns `.hex()` on confirmation.

## Critical Guidelines for AI Agents
- **Dual Setup Required**:
  1. Register `...getRouteConfig()` in your root stack navigator.
  2. Mount `<Picker />` in your root component hierarchy inside `SafeAreaProvider` and `AppThemeProvider`.
- **Navigation Bridge**: Relies on `@codexporer.io/expo-navigation-bridge` (`setNavigation`, `getNavigation`, `useIsFocused`, `getScreenTransitions`). Hardware back press is automatically handled when the picker screen is focused.
- **Theming**: All UI elements (backgrounds, rows, borders, text, appbar, searchbar) derive styling strictly from `useAppTheme()`. Never hardcode raw hex values in custom render callbacks (`renderOption`, `renderOptionContent`, `renderTopView`, `renderBottomView`, `renderEmptyView`).

