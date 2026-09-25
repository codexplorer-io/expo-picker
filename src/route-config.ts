import { getScreenTransitions } from '@codexporer.io/expo-navigation-bridge';
import { PICKER_SCREEN_ROUTE_NAME } from './picker';
import { PickerScreen } from './picker-screen';

export interface PickerRouteConfig {
    name: string;
    screen: React.ComponentType<any>;
    screenOptions: Record<string, any>;
}

export const getRouteConfig = (): PickerRouteConfig[] => [{
    name: PICKER_SCREEN_ROUTE_NAME,
    screen: PickerScreen,
    screenOptions: {
        ...(getScreenTransitions()?.slideFromBottom ?? {})
    }
}];
