import React, { useState, useEffect } from 'react';
import { BackHandler, Platform, FlatList } from 'react-native';
import { useIsFocused } from '@react-navigation/native';

import styled from 'styled-components/native';
import map from 'lodash/map';
import includes from 'lodash/includes';
import without from 'lodash/without';
import union from 'lodash/union';
import {
    Appbar,
    Searchbar,
    Divider,
    Checkbox,
    RadioButton,
    List
} from 'react-native-paper';
import { usePicker } from './store';

const Root = styled.View`
    display: flex;
    flex-direction: column;
    flex: 1;
    background-color: ${({ theme: { colors: { background } } }) => background};
`;

const SafeArea = styled.SafeAreaView`
    flex: 1;
`;

const KeyboardAvoiding = styled.KeyboardAvoidingView`
    flex: 1;
`;

const optionsKeyExtractor = ({ key }) => `${key}`;

const renderOptionItem = ({
    item,
    selectedValue,
    onValueChange,
    isMultiSelect,
    selectedValues,
    onValuesChange
}) => {
    const onSelect = () => {
        if (isMultiSelect) {
            const isSelected = includes(selectedValues, item);
            onValuesChange(
                isSelected ?
                    without(selectedValues, item) :
                    union(selectedValues, [item])
            );
            return;
        }

        onValueChange(item);
    };

    const renderSelector = () => {
        if (isMultiSelect) {
            return (
                <Checkbox
                    status={includes(selectedValues, item) ? 'checked' : 'unchecked'}
                    onPress={onSelect}
                />
            );
        }

        return (
            <RadioButton
                status={item === selectedValue ? 'checked' : 'unchecked'}
                onPress={onSelect}
            />
        );
    };

    return (
        <List.Item
            title={item}
            left={renderSelector}
            onPress={onSelect}
        />
    );
};

export const PickerScreen = () => {
    const isFocused = useIsFocused();
    const [
        { pickerConfig },
        { closePicker }
    ] = usePicker();

    const {
        items,
        selectedValue,
        onValueChange,
        isMultiSelect,
        selectedValues,
        onValuesChange,
        canFilter
    } = pickerConfig;

    const [
        internalSelectedValue,
        setInternalSelectedValue
    ] = useState(selectedValue);
    const [
        internalSelectedValues,
        setInternalSelectedValues
    ] = useState(selectedValues);
    const [searchText, setSearchText] = useState('');

    const onConfirm = () => {
        isMultiSelect ?
            onValuesChange(internalSelectedValues) :
            onValueChange(internalSelectedValue);
        closePicker();
    };

    const onCancel = () => {
        closePicker();
    };

    const onSearchChange = text => {
        setSearchText(text);
    };

    const renderItem = ({ item }) => renderOptionItem({
        item: item.data,
        selectedValue: internalSelectedValue,
        onValueChange: setInternalSelectedValue,
        isMultiSelect,
        selectedValues: internalSelectedValues,
        onValuesChange: setInternalSelectedValues
    });

    const data = map(items, (item, index) => ({
        data: item,
        key: index
    }));

    useEffect(() => {
        const handler = isFocused && BackHandler.addEventListener(
            'hardwareBackPress',
            () => {
                onCancel();
                return true;
            }
        );

        return () => handler && handler.remove();
    }, [
        onCancel,
        isFocused
    ]);

    return (
        <Root>
            <Appbar.Header>
                <Appbar.Action
                    icon='close'
                    onPress={onCancel}
                />
                <Appbar.Content
                    title={pickerConfig.title || ''}
                    titleStyle={{ textAlign: 'center', width: '100%' }}
                />
                <Appbar.Action
                    icon='check'
                    onPress={onConfirm}
                />
            </Appbar.Header>
            <KeyboardAvoiding
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <SafeArea>
                    {!!canFilter && (
                        <Searchbar
                            placeholder='Type to search'
                            onChangeText={onSearchChange}
                            value={searchText}
                        />
                    )}
                    <FlatList
                        ItemSeparatorComponent={Divider}
                        renderItem={renderItem}
                        keyExtractor={optionsKeyExtractor}
                        data={data}
                    />
                </SafeArea>
            </KeyboardAvoiding>
        </Root>
    );
};
