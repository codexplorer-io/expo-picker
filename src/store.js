import { createStore, createHook } from 'react-sweet-state';

const Store = createStore({
    initialState: {
        shouldOpen: false,
        shouldClose: false,
        isPickerScreenOpened: false,
        pickerConfig: null,
        navigation: null
    },
    actions: {
        initNavigation: navigation => ({ setState }) => {
            setState({ navigation });
        },
        openPicker: pickerConfig => ({ setState, getState }) => {
            const { shouldOpen } = getState();
            !shouldOpen && setState({
                shouldOpen: true,
                shouldClose: false,
                pickerConfig
            });
        },
        pickerOpened: () => ({ setState }) => {
            setState({
                shouldOpen: false,
                shouldClose: false
            });
        },
        closePicker: () => ({ setState, getState }) => {
            const { shouldClose } = getState();
            !shouldClose && setState({
                shouldOpen: false,
                shouldClose: true
            });
        },
        pickerClosed: () => ({ setState }) => {
            setState({
                shouldOpen: false,
                shouldClose: false
            });
        }
    },
    name: 'picker'
});

export const usePicker = createHook(Store);
