import { createStore, createHook } from 'react-sweet-state';

const Store = createStore({
    initialState: {
        shouldOpen: false,
        shouldClose: false,
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
        changeConfig: pickerConfig => ({ setState, getState }) => {
            const { pickerConfig: currentConfig } = getState();
            setState({
                pickerConfig: {
                    ...currentConfig,
                    ...pickerConfig
                }
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
