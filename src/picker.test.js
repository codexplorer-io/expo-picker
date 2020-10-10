import React, { useEffect } from 'react';
import { shallow } from 'enzyme';
import { usePrevious } from '@marko/react-hooks';
import { usePicker } from './store';
import { Picker } from './picker';

jest.mock('react', () => ({
    ...jest.requireActual('react'),
    useEffect: jest.fn()
}));

jest.mock('react-native-modal-datetime-picker', () => {
    // eslint-disable-next-line lodash/prefer-constant
    const DateTimePickerModal = () => null;
    return DateTimePickerModal;
});

jest.mock('@marko/react-hooks', () => ({
    usePrevious: jest.fn()
}));

jest.mock('./store', () => ({
    usePicker: jest.fn()
}));

describe('Picker', () => {
    const navigation = {
        navigate: jest.fn(),
        goBack: jest.fn()
    };

    const mockUsePrevious = ({
        previousShouldClose = false,
        previousShouldOpen = false
    }) => {
        let call = 0;
        usePrevious.mockImplementation(() => {
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
        usePicker.mockReturnValue([
            {
                shouldOpen,
                shouldClose,
                pickerConfig,
                navigation
            },
            { closePicker }
        ]);
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockUsePrevious({});
        mockUsePicker({});
        useEffect.mockImplementation(fn => fn());
    });

    describe('Close Picker Screen', () => {
        it('should close picker screen', () => {
            mockUsePicker({ shouldClose: true, pickerConfig: {} });

            shallow(<Picker />);

            expect(navigation.goBack).toHaveBeenCalledTimes(1);
        });

        it('should not close picker screen when shouldClose is false', () => {
            mockUsePicker({ shouldClose: false, pickerConfig: {} });

            shallow(<Picker />);

            expect(navigation.goBack).not.toHaveBeenCalled();
        });

        it('should not close picker screen when shouldClose was previously true', () => {
            mockUsePicker({ shouldClose: true, pickerConfig: {} });
            mockUsePrevious({ previousShouldClose: true });

            shallow(<Picker />);

            expect(navigation.goBack).not.toHaveBeenCalled();
        });

        it('should not close picker screen when pickerType is "time"', () => {
            mockUsePicker({ shouldClose: true, pickerConfig: { pickerType: 'time' } });

            shallow(<Picker />);

            expect(navigation.goBack).not.toHaveBeenCalled();
        });
    });

    describe('Open Picker Screen', () => {
        /*
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
        */

        it('should open picker screen', () => {
            mockUsePicker({ shouldOpen: true, pickerConfig: {} });

            shallow(<Picker />);

            expect(navigation.navigate).toHaveBeenCalledTimes(1);
            expect(navigation.navigate).toHaveBeenCalledWith('PickerScreen');
        });

        it('should not open picker screen when shouldClose is true', () => {
            mockUsePicker({ shouldOpen: true, shouldClose: true, pickerConfig: {} });

            shallow(<Picker />);

            expect(navigation.navigate).not.toHaveBeenCalled();
        });

        it('should not open picker screen when previousShouldOpen is true', () => {
            mockUsePicker({ shouldOpen: true, pickerConfig: {} });
            mockUsePrevious({ previousShouldOpen: true });

            shallow(<Picker />);

            expect(navigation.navigate).not.toHaveBeenCalled();
        });

        it('should not open picker screen when pickerType is "time"', () => {
            mockUsePicker({ shouldOpen: true, pickerConfig: { pickerType: 'time' } });

            shallow(<Picker />);

            expect(navigation.navigate).not.toHaveBeenCalled();
        });
    });

    describe('Date Time Picker', () => {
        /*
            const isDatePicker = pickerConfig?.pickerType === 'time';

            if (!isDatePicker) {
                return null;
            }

            const {
                selectedValue,
                onValueChange,
                mode
            } = pickerConfig;

            const isDatePickerVisible = !shouldClose && shouldOpen && isDatePicker;
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
        */

        it('should return DateTimePickerModal', () => {
            mockUsePicker({
                shouldOpen: true,
                pickerConfig: {
                    pickerType: 'time',
                    mode: 'mockMode',
                    selectedValue: 'mockSelectedValue'
                }
            });

            const wrapper = shallow(<Picker />);

            expect(wrapper.getElement()).not.toBe(null);
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

            const wrapper = shallow(<Picker />);

            expect(wrapper.getElement()).toBe(null);
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
            const onConfirm = shallow(<Picker />).prop('onConfirm');

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
            const onConfirm = shallow(<Picker />).prop('onConfirm');

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
            const onCancel = shallow(<Picker />).prop('onCancel');

            onCancel();

            expect(closePicker).toHaveBeenCalledTimes(1);
        });
    });
});
