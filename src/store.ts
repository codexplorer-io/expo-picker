import React from 'react';
import { createStore, createHook } from 'react-sweet-state';

export interface PickerOptionItem<T = any> {
    option: T;
    renderLabel?: (label?: React.ReactNode) => React.ReactNode;
}

export interface PickerConfig<T = any> {
    pickerType?: 'time' | 'date' | 'datetime' | 'color' | 'list' | string;
    selectedValue?: T;
    selectedValues?: T[];
    onValueChange?: (value: T) => void;
    onValuesChange?: (values: T[]) => void;
    title?: string;
    items?: T[];
    mode?: 'date' | 'time' | 'datetime';
    startYear?: number;
    endYear?: number;
    canFilter?: boolean;
    renderOptionContent?: (props: { option: T; renderLabel: (label?: React.ReactNode) => React.ReactNode }) => React.ReactNode;
    renderOption?: (props: { option: T }) => React.ReactNode;
    renderTopView?: () => React.ReactNode;
    renderBottomView?: () => React.ReactNode;
    renderEmptyView?: () => React.ReactNode;
    hasSelector?: boolean;
    shouldHideSelectAll?: boolean;
    shouldHideConfirmScreenButton?: boolean;
    estimatedItemSize?: number;
    isEqual?: (item1: T, item2: T) => boolean;
    onBeforeClose?: () => Promise<boolean> | boolean;
    onConfirm?: () => Promise<void> | void;
    [key: string]: any;
}

export interface PickerState {
    shouldOpen: boolean;
    shouldClose: boolean;
    pickerConfig: PickerConfig | null;
    navigation: any;
}

const initialState: PickerState = {
    shouldOpen: false,
    shouldClose: false,
    pickerConfig: null,
    navigation: null
};

export const Store = createStore({
    initialState,
    actions: {
        initNavigation: (navigation: any) => ({ setState }: { setState: (state: Partial<PickerState>) => void }) => {
            setState({ navigation });
        },
        openPicker: (pickerConfig: PickerConfig) => ({ setState, getState }: { setState: (state: Partial<PickerState>) => void; getState: () => PickerState }) => {
            const { shouldOpen } = getState();
            if (!shouldOpen) {
                setState({
                    shouldOpen: true,
                    shouldClose: false,
                    pickerConfig
                });
            }
        },
        changeConfig: (pickerConfig: Partial<PickerConfig>) => ({ setState, getState }: { setState: (state: Partial<PickerState>) => void; getState: () => PickerState }) => {
            const { pickerConfig: currentConfig } = getState();
            setState({
                pickerConfig: {
                    ...(currentConfig ?? {}),
                    ...pickerConfig
                }
            });
        },
        closePicker: () => async ({ setState, getState }: { setState: (state: Partial<PickerState>) => void; getState: () => PickerState }) => {
            const { shouldClose, pickerConfig } = getState();
            const { onBeforeClose } = pickerConfig ?? {};
            if (!shouldClose) {
                const canClose = (await onBeforeClose?.()) ?? true;
                if (canClose) {
                    setState({
                        shouldOpen: false,
                        shouldClose: true
                    });
                }
            }
        }
    },
    name: 'picker'
});

export const usePicker = createHook(Store);
