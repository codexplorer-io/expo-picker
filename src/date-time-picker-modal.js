import React, {
    useEffect,
    useRef,
    useState
} from 'react';
import {
    DatePickerModal,
    TimePickerModal
} from 'react-native-paper-dates';

export const DateTimePickerModal = ({
    isVisible,
    mode,
    date,
    onConfirm,
    onCancel
}) => {
    const dateRef = useRef(new Date(date));
    const [currentMode, setCurrentMode] = useState(null);

    useEffect(() => {
        dateRef.current = new Date(date);
    }, [date]);

    useEffect(() => {
        if (!isVisible) {
            setCurrentMode(null);
            return;
        }

        if (currentMode === null) {
            setCurrentMode(
                mode === 'time' ?
                    'time' :
                    'date'
            );
        }

        if (currentMode === 'time-transition') {
            setCurrentMode('waiting-for-transition');
            setTimeout(() => {
                setCurrentMode('time');
            }, 100);
        }

        !isVisible && setCurrentMode(null);
    }, [isVisible, currentMode, mode]);

    const handleConfirm = ({ date, hours, minutes }) => {
        if (currentMode === 'date') {
            const currentHours = dateRef.current.getHours();
            const currentMinutes = dateRef.current.getMinutes();
            dateRef.current = date;
            dateRef.current.setHours(currentHours);
            dateRef.current.setMinutes(currentMinutes);

            if (mode === 'datetime') {
                setCurrentMode('time-transition');
                return;
            }

            onConfirm(dateRef.current);
        }

        if (currentMode === 'time') {
            dateRef.current.setHours(hours);
            dateRef.current.setMinutes(minutes);
        }

        onConfirm(dateRef.current);
    };

    return currentMode === 'date' || currentMode === 'time-transition' ? (
        <DatePickerModal
            visible={currentMode === 'date'}
            locale='en'
            mode='single'
            date={dateRef.current}
            onDismiss={onCancel}
            onConfirm={handleConfirm}
            animationType='slide'
        />
    ) : currentMode === 'time' ? (
        <TimePickerModal
            visible
            locale='en'
            onDismiss={onCancel}
            onConfirm={handleConfirm}
            hours={dateRef.current.getHours()}
            minutes={dateRef.current.getMinutes()}
            animationType='fade'
        />
    ) : null;
};
