import { TransitionPresets } from '@react-navigation/stack';
import { PICKER_SCREEN_ROUTE_NAME } from './picker';
import { PickerScreen } from './picker-screen';

export const routeConfig = [{
    name: PICKER_SCREEN_ROUTE_NAME,
    screen: PickerScreen,
    screenOptions: {
        ...TransitionPresets.ModalSlideFromBottomIOS
    }
}];
