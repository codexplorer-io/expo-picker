import React, { useEffect, useState } from 'react';
import { di } from 'react-magnetic-di';
import Color from 'color';
import { usePrevious } from '@codexporer.io/react-hooks';
import HsvColorPicker from 'react-native-hsv-color-picker';
import { Button, Portal, Dialog } from 'react-native-paper';
import { DateTimePickerModal } from './date-time-picker-modal';
import { usePicker } from './store';

export const PICKER_SCREEN_ROUTE_NAME = 'PickerScreen';

const DialogContent = Dialog.Content;
const DialogActions = Dialog.Actions;

export const Picker = () => {
    di(
        Button,
        DateTimePickerModal,
        Dialog,
        DialogActions,
        DialogContent,
        HsvColorPicker,
        Portal,
        usePicker,
        usePrevious,
        useState
    );

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
    const isColorPicker = pickerConfig?.pickerType === 'color';
    const selectedValue = pickerConfig?.selectedValue;
    const [color, setColor] = useState();

    const previousShouldClose = usePrevious(shouldClose);
    const shouldClosePickerScreen = shouldClose &&
        !previousShouldClose &&
        !isDatePicker &&
        !isColorPicker;
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
        !isDatePicker &&
        !isColorPicker;

    useEffect(() => {
        shouldOpenPickerScreen && navigation.navigate(PICKER_SCREEN_ROUTE_NAME);
    }, [
        shouldOpenPickerScreen,
        navigation
    ]);

    useEffect(() => {
        if (!isColorPicker || !selectedValue) {
            return;
        }

        setColor(Color(selectedValue).hsv().object());
    }, [
        selectedValue,
        isColorPicker
    ]);

    const renderDatePicker = () => {
        const {
            onValueChange,
            mode
        } = pickerConfig;

        const isDatePickerVisible = !shouldClose && shouldOpen;
        const handleConfirm = selectedValue => {
            closePicker();
            selectedValue && onValueChange(selectedValue);
        };

        return (
            <DateTimePickerModal
                isVisible={isDatePickerVisible}
                mode={mode}
                date={selectedValue}
                onConfirm={handleConfirm}
                onCancel={closePicker}
            />
        );
    };

    const renderColorPicker = () => {
        const {
            onValueChange
        } = pickerConfig;

        const handleConfirm = () => {
            closePicker();
            color && onValueChange(Color(color).hex());
        };

        const handleSatValPickerChange = ({ saturation, value }) => {
            setColor({
                ...color,
                s: saturation * 100,
                v: value * 100
            });
        };

        const handleHuePickerChange = ({ hue }) => {
            setColor({
                ...color,
                h: hue
            });
        };

        const isColorPickerVisible = !shouldClose && shouldOpen;

        return (
            <Portal>
                <Dialog
                    visible={isColorPickerVisible}
                    onDismiss={closePicker}
                >
                    <DialogContent>
                        <HsvColorPicker
                            huePickerHue={color.h}
                            onHuePickerDragMove={handleHuePickerChange}
                            onHuePickerPress={handleHuePickerChange}
                            satValPickerHue={color.h}
                            satValPickerSaturation={color.s / 100}
                            satValPickerValue={color.v / 100}
                            onSatValPickerDragMove={handleSatValPickerChange}
                            onSatValPickerPress={handleSatValPickerChange}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onPress={closePicker}>
                            Cancel
                        </Button>
                        <Button
                            onPress={handleConfirm}
                        >
                            Select
                        </Button>
                    </DialogActions>
                </Dialog>
            </Portal>
        );
    };

    if (isDatePicker) {
        return renderDatePicker();
    }

    if (isColorPicker && !!color) {
        return renderColorPicker();
    }

    return null;
};
