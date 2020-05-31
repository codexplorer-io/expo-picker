import React, { useEffect, useState } from 'react';
import styled from 'styled-components/native';
import QuickPicker from 'quick-picker';
import map from 'lodash/map';
import {
    Dialog,
    Portal,
    List,
    RadioButton,
    Divider
} from 'react-native-paper';
import { FlatList } from 'react-native';
import { usePrevious } from '@marko/react-hooks';
import { pickerInterface } from './picker-interface';
import { usePicker } from './store';

const renderPickerDialogOptionItem = ({
    item,
    selectedValue,
    onValueChange,
    hideDialog
}) => {
    const onSelect = () => {
        onValueChange(item);
        hideDialog();
    };

    return (
        <List.Item
            title={item}
            left={() => (
                <RadioButton
                    status={item === selectedValue ? 'checked' : 'unchecked'}
                    onPress={onSelect}
                />
            )}
            onPress={onSelect}
        />
    );
};

const pickerDialogOptionsKeyExtractor = ({ key }) => `${key}`;

const renderPickerDialog = ({
    pickerConfig,
    isVisible,
    hideDialog
}) => {
    if (!isVisible || !pickerConfig) {
        return null;
    }

    const {
        items,
        selectedValue,
        onValueChange
    } = pickerConfig;

    return (
        <>
            <DialogContent>
                {items && (
                    <FlatList
                        ItemSeparatorComponent={Divider}
                        renderItem={({ item }) => renderPickerDialogOptionItem({
                            item: item.data,
                            selectedValue,
                            onValueChange,
                            hideDialog
                        })}
                        keyExtractor={pickerDialogOptionsKeyExtractor}
                        data={map(items, (item, index) => ({
                            data: item,
                            key: index
                        }))}
                    />
                )}
            </DialogContent>
        </>
    );
};

const DialogContent = styled(Dialog.Content)`
    padding-top: 24px;
`;

export const Picker = ({
    theme
}) => {
    const [
        {
            shouldOpen,
            shouldClose,
            pickerConfig
        },
        {
            pickerOpened,
            closePicker,
            pickerClosed
        }
    ] = usePicker();

    const [shouldDisplayDialog, setShouldDisplayDialog] = useState(false);

    const previousShouldOpen = usePrevious(shouldOpen);
    const previousShouldClose = usePrevious(shouldClose);

    useEffect(() => {
        if (!previousShouldOpen && shouldOpen) {
            const isOpened = pickerInterface.openPicker({ pickerConfig });
            isOpened && pickerOpened();
            setShouldDisplayDialog(!isOpened);
        }

        if (shouldClose) {
            !previousShouldClose && pickerInterface.closePicker({ pickerConfig });
            pickerClosed();
            setShouldDisplayDialog(false);
        }
    }, [
        previousShouldOpen,
        previousShouldClose,
        shouldOpen,
        shouldClose,
        shouldDisplayDialog
    ]);

    const hideDialog = () => closePicker();

    const isVisible = !shouldClose && shouldDisplayDialog;

    return (
        <>
            <QuickPicker />
            <Portal>
                <Dialog
                    visible={isVisible}
                    onDismiss={hideDialog}
                >
                    {renderPickerDialog({
                        pickerConfig,
                        isVisible,
                        theme,
                        hideDialog
                    })}
                </Dialog>
            </Portal>
        </>
    );
};
