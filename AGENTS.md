# AGENTS.md — `@codexporer.io/expo-picker`

## Package Overview
Versatile multi-modal picker suite supporting list selections, multi-select checkboxes, date/time pickers, and color pickers with search filtering and FlashList virtualization.

## Key Exports
- `Picker`: Headless coordinator mounted in root app tree.
- `usePicker()`: Hook returning `[state, { openPicker, changeConfig, closePicker }]`.
- `getRouteConfig()`: Stack route registration array for `PickerScreen`.

## Critical Guidelines for AI Agents
- **Mount Coordinator**: Ensure `<Picker />` is mounted once in the app hierarchy, and `getRouteConfig()` is registered in the Stack navigator.
- **Select Modes**:
  - Single item: pass `selectedValue` and `onValueChange: (val) => void`.
  - Multiple items: pass `selectedValues: T[]`, `hasSelector: true`, and `onValuesChange: (vals) => void`.
- **Searchable Lists**: Pass `canFilter: true` to display an integrated searchbar in the header.
- **Color & Date Modes**: Pass `pickerType: 'color'` or `pickerType: 'date' | 'time' | 'datetime'`.
- **Theming**: Option rows, checks, headers, and searchbars derive styling from `useAppTheme()`. Never hardcode raw hex values in custom render callbacks.
