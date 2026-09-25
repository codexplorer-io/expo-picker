import React, { useEffect, useState } from 'react';
import Color from 'color';
import { usePrevious } from '@codexporer.io/react-hooks';
import HsvColorPicker from '@codexporer.io/react-native-hsv-color-picker';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { OS } from '@codexporer.io/expo-device';
import { usePicker } from './store';
import { Dialog, DialogContent, DialogActions } from '@codexporer.io/expo-dialog';
import { Button, ButtonVariant, ButtonSize } from '@codexporer.io/expo-button';

export const PICKER_SCREEN_ROUTE_NAME = 'PickerScreen';

interface HsvColor {
    h: number;
    s: number;
    v: number;
}

export const Picker: React.FC = () => {
    const [
        {
            shouldOpen,
            shouldClose,
            pickerConfig,
            navigation
        },
        { closePicker }
    ] = usePicker();

    const isDatePicker =
        pickerConfig?.pickerType === 'time' ||
        pickerConfig?.pickerType === 'date' ||
        pickerConfig?.pickerType === 'datetime';
    const isColorPicker = pickerConfig?.pickerType === 'color';
    const selectedValue = pickerConfig?.selectedValue;
    const [color, setColor] = useState<HsvColor | undefined>();

    const previousShouldClose = usePrevious(shouldClose);
    const shouldClosePickerScreen = Boolean(
        shouldClose &&
        !previousShouldClose &&
        !isDatePicker &&
        !isColorPicker
    );

    useEffect(() => {
        if (shouldClosePickerScreen && navigation) {
            navigation.goBack?.();
        }
    }, [shouldClosePickerScreen, navigation]);

    const previousShouldOpen = usePrevious(shouldOpen);
    const shouldOpenPickerScreen = Boolean(
        !shouldClose &&
        shouldOpen &&
        !previousShouldOpen &&
        !isDatePicker &&
        !isColorPicker
    );

    useEffect(() => {
        if (shouldOpenPickerScreen && navigation) {
            navigation.push?.(PICKER_SCREEN_ROUTE_NAME);
        }
    }, [shouldOpenPickerScreen, navigation]);

    useEffect(() => {
        if (!isColorPicker || !selectedValue) {
            return;
        }

        try {
            const hsvObj = Color(selectedValue).hsv().object();
            setColor({
                h: hsvObj.h ?? 0,
                s: hsvObj.s ?? 0,
                v: hsvObj.v ?? 0
            });
        } catch {
            setColor({ h: 0, s: 0, v: 100 });
        }
    }, [selectedValue, isColorPicker]);

    const renderDatePicker = () => {
        if (!pickerConfig) {
            return null;
        }

        const {
            onValueChange,
            mode = 'date',
            startYear,
            endYear
        } = pickerConfig;

        const extraProps: Record<string, any> = {
            startYear: startYear ?? 1950,
            endYear: endYear ?? 2050
        };
        if (OS.isIOS()) {
            extraProps.display = 'inline';
        }

        const isDatePickerVisible = !shouldClose && shouldOpen;
        const handleConfirm = (date: Date) => {
            closePicker();
            if (date && onValueChange) {
                onValueChange(date);
            }
        };

        const DateTimePickerModalComponent = DateTimePickerModal as React.ComponentType<any>;

        return (
            <DateTimePickerModalComponent
                isVisible={isDatePickerVisible}
                mode={mode}
                date={selectedValue instanceof Date ? selectedValue : new Date()}
                onConfirm={handleConfirm}
                onCancel={closePicker}
                {...extraProps}
            />
        );
    };

    const renderColorPicker = () => {
        if (!pickerConfig || !color) {
            return null;
        }

        const { onValueChange } = pickerConfig;

        const handleConfirm = () => {
            closePicker();
            if (color && onValueChange) {
                onValueChange(Color(color).hex());
            }
        };

        const handleSatValPickerChange = ({ saturation, value }: { saturation: number; value: number }) => {
            setColor((prev) => ({
                h: prev?.h ?? 0,
                s: saturation * 100,
                v: value * 100
            }));
        };

        const handleHuePickerChange = ({ hue }: { hue: number }) => {
            setColor((prev) => ({
                h: hue,
                s: prev?.s ?? 0,
                v: prev?.v ?? 0
            }));
        };

        const isColorPickerVisible = !shouldClose && shouldOpen;

        return (
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
                    <Button
                        title="Cancel"
                        onPress={closePicker}
                        variant={ButtonVariant.Secondary}
                        size={ButtonSize.Small}
                    />
                    <Button
                        title="Select"
                        onPress={handleConfirm}
                        variant={ButtonVariant.Primary}
                        size={ButtonSize.Small}
                    />
                </DialogActions>
            </Dialog>
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

export default Picker;
