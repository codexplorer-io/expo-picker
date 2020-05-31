import { Platform } from 'react-native';
import get from 'lodash/get';
import QuickPicker from 'quick-picker';
import pickerStore, { ANIMATION_DURATION } from 'quick-picker/dist/PickerStore';

const mapPickerConfig = ({
    items,
    selectedValue,
    onValueChange,
    pickerType = 'normal',
    ...rest
}) => {
    const options = pickerType !== 'time' ? items.map(value => ({
        label: `${value}`,
        value
    })) : undefined;

    return {
        items: options,
        item: pickerType !== 'time' ?
            options.find(({ value }) => value === selectedValue) :
            selectedValue,
        onChange: selectedOption => {
            onValueChange(
                pickerType !== 'time' ? selectedOption.value : selectedOption
            );

            if (Platform.OS !== 'ios' || pickerType !== 'normal') {
                return;
            }

            const iosPicker = get(pickerStore, 'pickerComponent._iosPicker');
            iosPicker && iosPicker.setState({
                value: selectedOption.value
            });
        },
        ...(pickerType === 'time' ? {
            date: selectedValue
        } : {}),
        pickerType,
        ...rest
    };
};

const openPickerIOS = ({ pickerConfig }) => {
    QuickPicker.open(
        mapPickerConfig(pickerConfig)
    );
    return true;
};

const closePickerIOS = () => {
    QuickPicker.close();
    return true;
};

const openDateTimePickerAndroid = ({ pickerConfig }) => {
    QuickPicker.open({
        ...mapPickerConfig({
            ...pickerConfig,
            mode: 'date',
            display: 'calendar'
        }),
        onChange: date => {
            setTimeout(
                () => {
                    QuickPicker.open({
                        ...mapPickerConfig({
                            ...pickerConfig,
                            selectedValue: date,
                            mode: 'time',
                            display: 'clock'
                        }),
                        onChange: time => pickerConfig.onValueChange(
                            new Date(
                                date.getFullYear(),
                                date.getMonth(),
                                date.getDate(),
                                time.getHours(),
                                time.getMinutes(),
                                0,
                                0
                            )
                        )
                    });
                    pickerStore.pickerComponent._open();
                },
                ANIMATION_DURATION + 100
            );
        }
    });
    return true;
};

const openPickerAndroid = ({ pickerConfig }) => {
    if (pickerConfig.pickerType === 'time') {
        return (pickerConfig.mode === 'datetime' ?
            openDateTimePickerAndroid :
            openPickerIOS
        )({ pickerConfig });
    }

    return false;
};

const closePickerAndroid = ({ pickerConfig }) => {
    if (pickerConfig.pickerType === 'time') {
        return closePickerIOS();
    }

    return false;
};

export const pickerInterface = Platform.select({
    ios: () => ({
        openPicker: openPickerIOS,
        closePicker: closePickerIOS
    }),
    android: () => ({
        openPicker: openPickerAndroid,
        closePicker: closePickerAndroid
    })
})();
