import React, { useEffect, useState } from 'react';
import QuickPicker from 'quick-picker';
import { usePrevious } from '@marko/react-hooks';
import { pickerInterface } from './picker-interface';
import { usePicker } from './store';

export const PICKER_SCREEN_ROUTE_NAME = 'PickerScreen';

export const Picker = () => {
    const [
        {
            shouldOpen,
            shouldClose,
            pickerConfig,
            navigation
        },
        {
            pickerOpened,
            pickerClosed
        }
    ] = usePicker();

    const [
        shouldOpenPickerScreen,
        setShouldOpenPickerScreen
    ] = useState(false);

    const previousShouldOpen = usePrevious(shouldOpen);
    const previousShouldClose = usePrevious(shouldClose);

    useEffect(() => {
        if (!previousShouldOpen && shouldOpen) {
            const isOpened = pickerInterface.openPicker({ pickerConfig });
            isOpened && pickerOpened();
            setShouldOpenPickerScreen(!isOpened);
        }

        if (shouldClose && !previousShouldClose) {
            const isClosed = pickerInterface.closePicker({ pickerConfig });

            if (!isClosed) {
                navigation.goBack();
                setShouldOpenPickerScreen(false);
            }

            pickerClosed();
        }
    }, [
        previousShouldOpen,
        previousShouldClose,
        shouldOpen,
        shouldClose,
        shouldOpenPickerScreen
    ]);

    const isVisible = !shouldClose && shouldOpenPickerScreen;
    useEffect(() => {
        if (!isVisible) {
            return;
        }

        navigation.navigate(PICKER_SCREEN_ROUTE_NAME);
    }, [
        isVisible,
        navigation
    ]);

    return <QuickPicker />;
};
