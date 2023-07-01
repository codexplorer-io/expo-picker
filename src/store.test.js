import { Store } from './store';

describe('store', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should have actions and initial state', () => {
        const { initialState, actions } = Store;
        expect(initialState).toStrictEqual({
            shouldOpen: false,
            shouldClose: false,
            pickerConfig: null,
            navigation: null
        });
        expect(actions).toStrictEqual({
            initNavigation: expect.any(Function),
            openPicker: expect.any(Function),
            changeConfig: expect.any(Function),
            closePicker: expect.any(Function)
        });
    });

    describe('initNavigation', () => {
        it('should set navigation', () => {
            const { actions: { initNavigation } } = Store;
            const setState = jest.fn();
            const thunk = initNavigation('MOCK_NAVIGATION');

            thunk({ setState });

            expect(setState).toHaveBeenCalledTimes(1);
            expect(setState).toHaveBeenCalledWith({
                navigation: 'MOCK_NAVIGATION'
            });
        });
    });

    describe('openPicker', () => {
        it('should open picker when shouldOpen is false', () => {
            const { actions: { openPicker } } = Store;
            const getState = jest.fn(() => ({ shouldOpen: false }));
            const setState = jest.fn();
            const thunk = openPicker('MOCK_CONFIG');

            thunk({ getState, setState });

            expect(getState).toHaveBeenCalledTimes(1);
            expect(setState).toHaveBeenCalledTimes(1);
            expect(setState).toHaveBeenCalledWith({
                shouldOpen: true,
                shouldClose: false,
                pickerConfig: 'MOCK_CONFIG'
            });
        });

        it('should not open picker when shouldOpen is true', () => {
            const { actions: { openPicker } } = Store;
            const getState = jest.fn(() => ({ shouldOpen: true }));
            const setState = jest.fn();
            const thunk = openPicker('MOCK_CONFIG');

            thunk({ getState, setState });

            expect(getState).toHaveBeenCalledTimes(1);
            expect(setState).not.toHaveBeenCalled();
        });
    });

    describe('changeConfig', () => {
        it('should extend current config', () => {
            const { actions: { changeConfig } } = Store;
            const getState = jest.fn(() => ({
                pickerConfig: {
                    oldConfigProp: 'MOCK_OLD_1',
                    newConfigProp: 'MOCK_OLD_2'
                }
            }));
            const setState = jest.fn();
            const thunk = changeConfig({ newConfigProp: 'MOCK_NEW' });

            thunk({ getState, setState });

            expect(getState).toHaveBeenCalledTimes(1);
            expect(setState).toHaveBeenCalledTimes(1);
            expect(setState).toHaveBeenCalledWith({
                pickerConfig: {
                    oldConfigProp: 'MOCK_OLD_1',
                    newConfigProp: 'MOCK_NEW'
                }
            });
        });
    });

    describe('closePicker', () => {
        it('should close picker when shouldClose is false', async () => {
            const { actions: { closePicker } } = Store;
            const getState = jest.fn(() => ({ shouldClose: false }));
            const setState = jest.fn();
            const thunk = closePicker();

            await thunk({ getState, setState });

            expect(getState).toHaveBeenCalledTimes(1);
            expect(setState).toHaveBeenCalledTimes(1);
            expect(setState).toHaveBeenCalledWith({
                shouldOpen: false,
                shouldClose: true
            });
        });

        it('should not close picker when shouldClose is true', () => {
            const { actions: { closePicker } } = Store;
            const getState = jest.fn(() => ({ shouldClose: true }));
            const setState = jest.fn();
            const thunk = closePicker();

            thunk({ getState, setState });

            expect(getState).toHaveBeenCalledTimes(1);
            expect(setState).not.toHaveBeenCalled();
        });
    });
});
