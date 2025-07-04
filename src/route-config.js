import { TransitionPresets } from '@react-navigation/stack';
import { Platform } from 'react-native';
import { PICKER_SCREEN_ROUTE_NAME } from './picker';
import { PickerScreen } from './picker-screen';

export const getRouteConfig = () => [{
    name: PICKER_SCREEN_ROUTE_NAME,
    screen: PickerScreen,
    screenOptions: {
        ...Platform.select({
            ios: TransitionPresets.BottomSheetAndroid,
            default: TransitionPresets.ModalSlideFromBottomIOS
        })
    }
}];
