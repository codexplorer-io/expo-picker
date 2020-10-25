import React, { useEffect } from 'react';
import { usePrevious } from '@codexporer.io/react-hooks';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
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
        { closePicker }
    ] = usePicker();

    const isDatePicker = pickerConfig?.pickerType === 'time';

    const previousShouldClose = usePrevious(shouldClose);
    const shouldClosePickerScreen = shouldClose &&
        !previousShouldClose &&
        !isDatePicker;
    useEffect(() => {
        shouldClosePickerScreen && navigation.goBack();
    }, [
        shouldClosePickerScreen,
        navigation
    ]);

    const previousShouldOpen = usePrevious(shouldOpen);
    const shouldOpenPickerScreen = !shouldClose &&
        shouldOpen &&
        !previousShouldOpen &&
        !isDatePicker;
    useEffect(() => {
        shouldOpenPickerScreen && navigation.navigate(PICKER_SCREEN_ROUTE_NAME);
    }, [
        shouldOpenPickerScreen,
        navigation
    ]);

    if (!isDatePicker) {
        return null;
    }

    const {
        selectedValue,
        onValueChange,
        mode
    } = pickerConfig;

    const isDatePickerVisible = !shouldClose && shouldOpen;
    return (
        <DateTimePickerModal
            isVisible={isDatePickerVisible}
            mode={mode}
            date={selectedValue}
            onConfirm={selectedValue => {
                closePicker();
                selectedValue && onValueChange(selectedValue);
            }}
            onCancel={() => {
                closePicker();
            }}
        />
    );
};
