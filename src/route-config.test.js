import { routeConfig } from './route-config';

jest.mock('@react-navigation/stack', () => ({
    TransitionPresets: {
        ModalSlideFromBottomIOS: { transitionPreset: 'ModalSlideFromBottomIOS' }
    }
}));

jest.mock('./picker', () => ({
    PICKER_SCREEN_ROUTE_NAME: 'MockPickerScreenRouteName'
}));

jest.mock('./picker-screen', () => ({
    PickerScreen: 'MockPickerScreen'
}));

describe('routeConfig', () => {
    it('should be as expected', () => {
        expect(routeConfig).toMatchSnapshot();
    });
});
