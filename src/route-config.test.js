import { getRouteConfig } from './route-config';

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

describe('getRouteConfig', () => {
    it('should return expected value', () => {
        expect(getRouteConfig()).toMatchSnapshot();
    });
});
