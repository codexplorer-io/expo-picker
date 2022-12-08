import React from 'react';
import { act } from 'react-dom/test-utils';
import { injectable } from 'react-magnetic-di';
import { usePrevious } from '@codexporer.io/react-hooks';
import { createMockComponent, mountWithDi } from '@codexporer.io/react-test-utils';
import HsvColorPicker from 'react-native-hsv-color-picker';
import { Button, Portal, Dialog } from 'react-native-paper';
import { DateTimePickerModal } from './date-time-picker-modal';
import { usePicker } from './store';
import { Picker } from './picker';

const DialogContent = Dialog.Content;
const DialogActions = Dialog.Actions;

describe('Picker', () => {
    const usePickerMock = jest.fn();
    const usePreviousMock = jest.fn();

    const navigation = {
        navigate: jest.fn(),
        goBack: jest.fn()
    };

    const mockUsePrevious = ({
        previousShouldClose = false,
        previousShouldOpen = false
    }) => {
        let call = 0;
        usePreviousMock.mockImplementation(() => {
            call += 1;

            if (call === 1) {
                return previousShouldClose;
            }

            if (call === 2) {
                return previousShouldOpen;
            }

            return null;
        });
    };

    const mockUsePicker = ({
        shouldOpen = false,
        shouldClose = false,
        pickerConfig = 'Mock Config',
        closePicker = jest.fn()
    }) => {
        usePickerMock.mockReturnValue([
            {
                shouldOpen,
                shouldClose,
                pickerConfig,
                navigation
            },
            { closePicker }
        ]);
    };

    const defaultDeps = [
        injectable(Button, createMockComponent('Button')),
        injectable(DateTimePickerModal, createMockComponent('DateTimePickerModal')),
        injectable(Dialog, createMockComponent('Dialog')),
        injectable(DialogContent, createMockComponent('DialogContent')),
        injectable(DialogActions, createMockComponent('DialogActions')),
        injectable(HsvColorPicker, createMockComponent('HsvColorPicker')),
        injectable(Portal, createMockComponent('Portal')),
        injectable(usePicker, usePickerMock),
        injectable(usePrevious, usePreviousMock)
    ];

    beforeEach(() => {
        jest.clearAllMocks();
        mockUsePrevious({});
        mockUsePicker({});
    });

    describe('Close Picker Screen', () => {
        it('should close picker screen', () => {
            mockUsePicker({ shouldClose: true, pickerConfig: {} });

            mountWithDi(
                <Picker />,
                { deps: defaultDeps }
            );

            expect(navigation.goBack).toHaveBeenCalledTimes(1);
        });

        it('should not close picker screen when shouldClose is false', () => {
            mockUsePicker({ shouldClose: false, pickerConfig: {} });

            mountWithDi(
                <Picker />,
                { deps: defaultDeps }
            );

            expect(navigation.goBack).not.toHaveBeenCalled();
        });

        it('should not close picker screen when shouldClose was previously true', () => {
            mockUsePicker({ shouldClose: true, pickerConfig: {} });
            mockUsePrevious({ previousShouldClose: true });

            mountWithDi(
                <Picker />,
                { deps: defaultDeps }
            );

            expect(navigation.goBack).not.toHaveBeenCalled();
        });

        it.each`
            pickerType
            ${'time'}
            ${'color'}
        `('should not close picker screen when pickerType is "$pickerType"', ({ pickerType }) => {
            mockUsePicker({ shouldClose: true, pickerConfig: { pickerType } });

            mountWithDi(
                <Picker />,
                { deps: defaultDeps }
            );

            expect(navigation.goBack).not.toHaveBeenCalled();
        });
    });

    describe('Open Picker Screen', () => {
        it('should open picker screen', () => {
            mockUsePicker({ shouldOpen: true, pickerConfig: {} });

            mountWithDi(
                <Picker />,
                { deps: defaultDeps }
            );

            expect(navigation.navigate).toHaveBeenCalledTimes(1);
            expect(navigation.navigate).toHaveBeenCalledWith('PickerScreen');
        });

        it('should not open picker screen when shouldClose is true', () => {
            mockUsePicker({ shouldOpen: true, shouldClose: true, pickerConfig: {} });

            mountWithDi(
                <Picker />,
                { deps: defaultDeps }
            );

            expect(navigation.navigate).not.toHaveBeenCalled();
        });

        it('should not open picker screen when previousShouldOpen is true', () => {
            mockUsePicker({ shouldOpen: true, pickerConfig: {} });
            mockUsePrevious({ previousShouldOpen: true });

            mountWithDi(
                <Picker />,
                { deps: defaultDeps }
            );

            expect(navigation.navigate).not.toHaveBeenCalled();
        });

        it.each`
            pickerType
            ${'time'}
            ${'color'}
        `('should not open picker screen when pickerType is "$pickerType"', ({ pickerType }) => {
            mockUsePicker({ shouldOpen: true, pickerConfig: { pickerType } });

            mountWithDi(
                <Picker />,
                { deps: defaultDeps }
            );

            expect(navigation.navigate).not.toHaveBeenCalled();
        });
    });

    describe('Date Time Picker', () => {
        it('should return DateTimePickerModal', () => {
            mockUsePicker({
                shouldOpen: true,
                pickerConfig: {
                    pickerType: 'time',
                    mode: 'mockMode',
                    selectedValue: 'mockSelectedValue'
                }
            });

            const wrapper = mountWithDi(
                <Picker />,
                { deps: defaultDeps }
            ).children();

            expect(wrapper).toHaveLength(1);
            expect(wrapper.name()).toBe('DateTimePickerModal');
            expect(wrapper.props()).toEqual({
                isVisible: true,
                mode: 'mockMode',
                date: 'mockSelectedValue',
                onCancel: expect.any(Function),
                onConfirm: expect.any(Function)
            });
        });

        it('should not return DateTimePickerModal when pickerType is not "time"', () => {
            mockUsePicker({
                shouldOpen: true,
                pickerConfig: {
                    mode: 'mockMode',
                    selectedValue: 'mockSelectedValue'
                }
            });

            const wrapper = mountWithDi(
                <Picker />,
                { deps: defaultDeps }
            ).children();

            expect(wrapper).toHaveLength(0);
        });

        it.each`
            shouldOpen | shouldClose | result    | description
            ${true}    | ${true}     | ${false}  | ${'not render'}
            ${true}    | ${false}    | ${true}   | ${'render'}
            ${false}   | ${true}     | ${false}  | ${'not render'}
            ${false}   | ${false}    | ${false}  | ${'not render'}
        `('should $description picker visible when shouldOpen=$shouldOpen and shouldClose=$shouldClose',
            ({ shouldOpen, shouldClose, result }) => {
                mockUsePicker({
                    shouldOpen,
                    shouldClose,
                    pickerConfig: {
                        pickerType: 'time',
                        mode: 'mockMode',
                        selectedValue: 'mockSelectedValue'
                    }
                });

                const wrapper = mountWithDi(
                    <Picker />,
                    { deps: defaultDeps }
                ).children();

                expect(wrapper.prop('isVisible')).toBe(result);
            });

        it('should close picker and call onValueChange when date time is confirmed', () => {
            const onValueChange = jest.fn();
            const closePicker = jest.fn();
            mockUsePicker({
                shouldOpen: true,
                closePicker,
                pickerConfig: {
                    pickerType: 'time',
                    mode: 'mockMode',
                    selectedValue: 'mockSelectedValue',
                    onValueChange
                }
            });
            const onConfirm = mountWithDi(
                <Picker />,
                { deps: defaultDeps }
            ).children().prop('onConfirm');

            onConfirm('mockValue');

            expect(closePicker).toHaveBeenCalledTimes(1);
            expect(onValueChange).toHaveBeenCalledTimes(1);
            expect(onValueChange).toHaveBeenCalledWith('mockValue');
        });

        it('should not call onValueChange when no selected value', () => {
            const onValueChange = jest.fn();
            const closePicker = jest.fn();
            mockUsePicker({
                shouldOpen: true,
                closePicker,
                pickerConfig: {
                    pickerType: 'time',
                    mode: 'mockMode',
                    selectedValue: 'mockSelectedValue',
                    onValueChange
                }
            });
            const onConfirm = mountWithDi(
                <Picker />,
                { deps: defaultDeps }
            ).children().prop('onConfirm');

            onConfirm(null);

            expect(closePicker).toHaveBeenCalledTimes(1);
            expect(onValueChange).not.toHaveBeenCalledTimes(1);
        });

        it('should close picker when selection is canceled', () => {
            const onValueChange = jest.fn();
            const closePicker = jest.fn();
            mockUsePicker({
                shouldOpen: true,
                closePicker,
                pickerConfig: {
                    pickerType: 'time',
                    mode: 'mockMode',
                    selectedValue: 'mockSelectedValue',
                    onValueChange
                }
            });
            const onCancel = mountWithDi(
                <Picker />,
                { deps: defaultDeps }
            ).children().prop('onCancel');

            onCancel();

            expect(closePicker).toHaveBeenCalledTimes(1);
        });
    });

    describe('Color Picker', () => {
        it('should return dialog with color picker and actions', () => {
            mockUsePicker({
                shouldOpen: true,
                pickerConfig: {
                    pickerType: 'color',
                    selectedValue: 'white'
                }
            });

            const wrapper = mountWithDi(
                <Picker />,
                { deps: defaultDeps }
            ).children();

            expect(wrapper).toHaveLength(1);
            expect(wrapper.name()).toBe('Portal');
            // eslint-disable-next-line lodash/prefer-lodash-method
            expect(wrapper.find('Dialog').find('DialogContent').find('HsvColorPicker').props()).toEqual({
                huePickerHue: 0,
                onHuePickerDragMove: expect.any(Function),
                onHuePickerPress: expect.any(Function),
                satValPickerHue: 0,
                satValPickerSaturation: 0,
                satValPickerValue: 1,
                onSatValPickerDragMove: expect.any(Function),
                onSatValPickerPress: expect.any(Function)
            });
            // eslint-disable-next-line lodash/prefer-lodash-method
            expect(wrapper.find('Dialog').find('DialogActions').find('Button')).toHaveLength(2);
        });

        it('should not return dialog with color picker when pickerType is not "color"', () => {
            mockUsePicker({
                shouldOpen: true,
                pickerConfig: {
                    selectedValue: 'mockSelectedValue'
                }
            });

            const wrapper = mountWithDi(
                <Picker />,
                { deps: defaultDeps }
            ).children();

            expect(wrapper).toHaveLength(0);
        });

        it.each`
            shouldOpen | shouldClose | result    | description
            ${true}    | ${true}     | ${false}  | ${'not render'}
            ${true}    | ${false}    | ${true}   | ${'render'}
            ${false}   | ${true}     | ${false}  | ${'not render'}
            ${false}   | ${false}    | ${false}  | ${'not render'}
        `('should $description picker visible when shouldOpen=$shouldOpen and shouldClose=$shouldClose',
            ({ shouldOpen, shouldClose, result }) => {
                mockUsePicker({
                    shouldOpen,
                    shouldClose,
                    pickerConfig: {
                        pickerType: 'color',
                        selectedValue: 'white'
                    }
                });

                const wrapper = mountWithDi(
                    <Picker />,
                    { deps: defaultDeps }
                ).children();

                // eslint-disable-next-line lodash/prefer-lodash-method
                expect(wrapper.find('Dialog').prop('visible')).toBe(result);
            });

        it('should change hue when hue picker is dragged', () => {
            mockUsePicker({
                shouldOpen: true,
                pickerConfig: {
                    pickerType: 'color',
                    selectedValue: 'white'
                }
            });
            const wrapper = mountWithDi(
                <Picker />,
                { deps: defaultDeps }
            );
            // eslint-disable-next-line lodash/prefer-lodash-method
            const onHuePickerDragMove = wrapper.find('HsvColorPicker').prop('onHuePickerDragMove');

            act(() => {
                onHuePickerDragMove({ hue: 0.5 });
                wrapper.setProps({});
            });

            // eslint-disable-next-line lodash/prefer-lodash-method
            expect(wrapper.find('HsvColorPicker').props()).toEqual(
                expect.objectContaining({
                    huePickerHue: 0.5,
                    satValPickerHue: 0.5,
                    satValPickerSaturation: 0,
                    satValPickerValue: 1
                })
            );
        });

        it('should change hue when hue picker is pressed', () => {
            mockUsePicker({
                shouldOpen: true,
                pickerConfig: {
                    pickerType: 'color',
                    selectedValue: 'white'
                }
            });
            const wrapper = mountWithDi(
                <Picker />,
                { deps: defaultDeps }
            );
            // eslint-disable-next-line lodash/prefer-lodash-method
            const onHuePickerPress = wrapper.find('HsvColorPicker').prop('onHuePickerPress');

            act(() => {
                onHuePickerPress({ hue: 1.5 });
                wrapper.setProps({});
            });

            // eslint-disable-next-line lodash/prefer-lodash-method
            expect(wrapper.find('HsvColorPicker').props()).toEqual(
                expect.objectContaining({
                    huePickerHue: 1.5,
                    satValPickerHue: 1.5,
                    satValPickerSaturation: 0,
                    satValPickerValue: 1
                })
            );
        });

        it('should change saturation & value when saturation & value picker is dragged', () => {
            mockUsePicker({
                shouldOpen: true,
                pickerConfig: {
                    pickerType: 'color',
                    selectedValue: 'white'
                }
            });
            const wrapper = mountWithDi(
                <Picker />,
                { deps: defaultDeps }
            );
            // eslint-disable-next-line lodash/prefer-lodash-method
            const onSatValPickerDragMove = wrapper.find('HsvColorPicker').prop('onSatValPickerDragMove');

            act(() => {
                onSatValPickerDragMove({ saturation: 0.5, value: 0.6 });
                wrapper.setProps({});
            });

            // eslint-disable-next-line lodash/prefer-lodash-method
            expect(wrapper.find('HsvColorPicker').props()).toEqual(
                expect.objectContaining({
                    huePickerHue: 0,
                    satValPickerHue: 0,
                    satValPickerSaturation: 0.5,
                    satValPickerValue: 0.6
                })
            );
        });

        it('should change saturation & value when saturation & value picker is pressed', () => {
            mockUsePicker({
                shouldOpen: true,
                pickerConfig: {
                    pickerType: 'color',
                    selectedValue: 'white'
                }
            });
            const wrapper = mountWithDi(
                <Picker />,
                { deps: defaultDeps }
            );
            // eslint-disable-next-line lodash/prefer-lodash-method
            const onSatValPickerPress = wrapper.find('HsvColorPicker').prop('onSatValPickerPress');

            act(() => {
                onSatValPickerPress({ saturation: 1.2, value: 0.3 });
                wrapper.setProps({});
            });

            // eslint-disable-next-line lodash/prefer-lodash-method
            expect(wrapper.find('HsvColorPicker').props()).toEqual(
                expect.objectContaining({
                    huePickerHue: 0,
                    satValPickerHue: 0,
                    satValPickerSaturation: 1.2,
                    satValPickerValue: 0.3
                })
            );
        });

        it('should close picker and call onValueChange when date time is confirmed', () => {
            const onValueChange = jest.fn();
            const closePicker = jest.fn();
            mockUsePicker({
                shouldOpen: true,
                closePicker,
                pickerConfig: {
                    pickerType: 'color',
                    selectedValue: 'white',
                    onValueChange
                }
            });
            // eslint-disable-next-line lodash/prefer-lodash-method
            const onConfirm = mountWithDi(
                <Picker />,
                { deps: defaultDeps }
            ).find('Button').at(1).prop('onPress');

            onConfirm();

            expect(closePicker).toHaveBeenCalledTimes(1);
            expect(onValueChange).toHaveBeenCalledTimes(1);
            expect(onValueChange).toHaveBeenCalledWith('#FFFFFF');
        });

        it('should close picker and call onValueChange with changed value', () => {
            const onValueChange = jest.fn();
            const closePicker = jest.fn();
            mockUsePicker({
                shouldOpen: true,
                closePicker,
                pickerConfig: {
                    pickerType: 'color',
                    selectedValue: 'white',
                    onValueChange
                }
            });
            const wrapper = mountWithDi(
                <Picker />,
                { deps: defaultDeps }
            );
            // eslint-disable-next-line lodash/prefer-lodash-method
            const onSatValPickerPress = wrapper.find('HsvColorPicker').prop('onSatValPickerPress');
            act(() => {
                onSatValPickerPress({ saturation: 0, value: 0 });
                wrapper.setProps({});
            });
            // eslint-disable-next-line lodash/prefer-lodash-method
            const onConfirm = wrapper.find('Button').at(1).prop('onPress');

            onConfirm();

            expect(closePicker).toHaveBeenCalledTimes(1);
            expect(onValueChange).toHaveBeenCalledTimes(1);
            expect(onValueChange).toHaveBeenCalledWith('#000000');
        });

        it('should close picker when cancel button is pressed', () => {
            const onValueChange = jest.fn();
            const closePicker = jest.fn();
            mockUsePicker({
                shouldOpen: true,
                closePicker,
                pickerConfig: {
                    pickerType: 'color',
                    selectedValue: 'white',
                    onValueChange
                }
            });
            // eslint-disable-next-line lodash/prefer-lodash-method
            const onCancel = mountWithDi(
                <Picker />,
                { deps: defaultDeps }
            ).find('Button').at(0).prop('onPress');

            onCancel();

            expect(closePicker).toHaveBeenCalledTimes(1);
            expect(onValueChange).toHaveBeenCalledTimes(0);
        });

        it('should close picker when dialog is dismissed', () => {
            const onValueChange = jest.fn();
            const closePicker = jest.fn();
            mockUsePicker({
                shouldOpen: true,
                closePicker,
                pickerConfig: {
                    pickerType: 'color',
                    selectedValue: 'white',
                    onValueChange
                }
            });
            // eslint-disable-next-line lodash/prefer-lodash-method
            const onDismiss = mountWithDi(
                <Picker />,
                { deps: defaultDeps }
            ).find('Dialog').prop('onDismiss');

            onDismiss();

            expect(closePicker).toHaveBeenCalledTimes(1);
            expect(onValueChange).toHaveBeenCalledTimes(0);
        });
    });
});
