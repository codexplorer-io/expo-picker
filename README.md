# expo-picker
Customizable picker components for react-native & expo. Includes color, date time, single option and multi options pickers.

## Platform Compatibility
iOS|Android|Web|
-|-|-|
✅|✅|❌|

## Samples

### Date time

<img title="Date picker iOS" src="https://github.com/codexplorer-io/expo-picker/blob/master/samples/date-ios.png?raw=true" width="40%"> <img title="Date & time picker iOS" src="https://github.com/codexplorer-io/expo-picker/blob/master/samples/datetime-ios.png?raw=true" width="40%">

<img title="Date picker Android" src="https://github.com/codexplorer-io/expo-picker/blob/master/samples/date-android.jpg?raw=true" width="40%"> <img title="Time picker Android" src="https://github.com/codexplorer-io/expo-picker/blob/master/samples/time-android.jpg?raw=true" width="40%">

### Single & multi options with customizations

<img title="Single select 1" src="https://github.com/codexplorer-io/expo-picker/blob/master/samples/single-select-title.jpg?raw=true" width="40%"> <img title="Single select 2" src="https://github.com/codexplorer-io/expo-picker/blob/master/samples/single-select.jpg?raw=true" width="40%">

<img title="Custom multi 1" src="https://github.com/codexplorer-io/expo-picker/blob/master/samples/custom-multiselect.jpg?raw=true" width="30%"> <img title="Custom multi 2" src="https://github.com/codexplorer-io/expo-picker/blob/master/samples/custom-multiselect2.jpg?raw=true" width="30%"> <img title="Custom multi 3" src="https://github.com/codexplorer-io/expo-picker/blob/master/samples/custom-multiselect3.jpg?raw=true" width="30%">

### Color

<img title="Color picker" src="https://github.com/codexplorer-io/expo-picker/blob/master/samples/color.jpg?raw=true">

## Prerequisites
Module requires a few module dependencies (look at `peerDependencies` within `package.json`) and some theme variable initalizations before it can be used and components redered properly.

Required theme variables:

- **colors.background** - Background color for the picker screen used to display select options
- **colors.backgroundHighlight** - Background highlight color used to highlight select options

```javascript
import { ThemeProvider } from 'styled-components';
import { Provider as PaperProvider } from 'react-native-paper';
import { App } from './app';

const theme = {
    colors: {
        background: backgroundColor,
        backgroundHighlight: backgroundHighlightColor,
        ...
    },
    ...
};

export const AppThemeWrapper = () => (
    <ThemeProvider theme={theme}>
        <PaperProvider theme={theme}>
            <App />
        </PaperProvider>
    </ThemeProvider>
);
```

Before picker can be displayed, it needs to be rendered within `App` as a descendant of theme providers:
```javascript
import { Picker } from '@codexporer.io/expo-picker';
...

export const App = () => (
    <>
        ...other components
        <Picker />
    </>
);
```

As a requirement to display picker screen, it needs to be integrated with react native navigation:
```javascript
import { getRouteConfig } from '@codexporer.io/expo-picker';
import { NavigationContainer } from '@react-navigation/native';
...

const Stack = createSharedElementStackNavigator();
const { Navigator, Screen } = Stack;
const routeConfig = getRouteConfig();
...

const navigationRef = useRef();
const [{ navigation }, { initNavigation }] = usePicker();
const currentNavigationRef = navigationRef.current;

useEffect(() => {
    if (!navigation && currentNavigationRef) {
        initNavigation(currentNavigationRef);
    }
}, [
    navigation,
    initNavigation,
    currentNavigationRef
]);

<NavigationContainer ref={navigationRef}>
    <Navigator>
        <Screen
            name={routeConfig.name}
            component={routeConfig.screen}
            options={routeConfig.screenOptions}
            ...rest props
        />
        ...other screens
    </Navigator>
</NavigationContainer>
```

## Usage

Picker is simple for use component. Everything needed is provided through `usePicker` hook:
```javascript
import { usePicker } from '@codexporer.io/expo-picker';
...

export const MyComponent = () => {
    const [, { openPicker, closePicker, changeConfig }] = usePicker();

    const onShowPicker = () => {
        openPicker(...pickerConfig);
    };
    
    const onRerenderPicker = () => {
        changeConfig(...pickerConfig);
    };
    
    const onClosePicker = () => {
        closePicker();
    };

    return ...;
};
```

## Exports
symbol|description|
-|-|
Picker|picker component|
usePicker|hook used to control the picker|

## usePicker
Returns an array with `openPicker`, `closePicker` and `changeConfig` actions on the second index:
```javascript
const [, { openPicker, closePicker, changeConfig }] = usePicker();

...
openPicker(...pickerConfig);
...
changeConfig(...pickerConfig);
...
closePicker();
```

### Open picker / change config action parameters
parameter|description|
-|-|
pickerType|Type of the picker to be displayed: "time" - date & time picker, "color" - color picker, otherwise select options picker will be used (by default select options picker will be used)|
mode|Type of the date & time picker to be displayed: "date" - for date picker only, "time" - for time picker only, "datetime" - for date & time picker (default: "date")|
title|Title displayed in picker screen for select options picker (default: empty string)|
items|Array of strings to be displayed as options for select options picker|
selectedValue|Selected value within the picker. Format depends of the picker type. For color picker it should be string in format `rgb(r, g, b)` or hash `#123456`; for date & time picker it should be `Date` object; for select options it should be string value from `items` parameter|
onValueChange|Callback invoked when value is changed. Format depends of the picker type. For color picker it will be called with hash `#123456` string; for date & time picker it will be called with `Date` object; for select options it will be called with string value from `items` parameter|
isMultiSelect|Defines if select options picker is multi select (default: false)|
selectedValues|Array of strings, selected values. Used only in multi select options picker, where `selectedValue` will be ignorred. Array should contain string values from `items` parameter|
onValuesChange|Callback invoked with array of string selected `items` when values are changed. Used only in multi select options picker, where `onValueChange` will be ignorred|
renderOptionContent|Used to render select option item content. If not passed, `item` will be displayed as a content|
renderTopView|Used to render view on the top of the picker screen with select options|
renderBottomView|Used to render view on the bottom of the picker screen with select options|
renderEmptyView|Used to render render empty view, when there are no select options|
hasSelector|If `false` select "radio", nor "checkbox" will be rendered. By default selector is rendered|
shouldHideSelectAll|If `true`, "select all options" option for multi select options will be hidden|
shouldHideConfirmScreenButton|If `true`, header confirm action for multi select options will be hidden|
canFilter|NOT IMPLEMENTED|
