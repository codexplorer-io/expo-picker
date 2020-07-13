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
    useTheme,
    Subheading
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

const Item = styled.TouchableHighlight`
    display: flex;
    flex-direction: row;
    padding: 10px;
    background-color: ${({ theme: { colors: { background } } }) => background};
`;

const ItemContent = styled.View`
    display: flex;
    flex-direction: row;
    margin-left: 10px;
    align-items: center;
`;

const optionsKeyExtractor = ({ key }) => `${key}`;

const renderOptionItem = ({
    item,
    selectedValue,
    onValueChange,
    isMultiSelect,
    selectedValues,
    onValuesChange,
    renderOptionContent,
    theme
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

    const renderLabel = () => (
        <Subheading>
            {item}
        </Subheading>
    );

    return (
        <Item
            underlayColor={theme.colors.backgroundHighlight}
            onPress={onSelect}
        >
            <>
                {renderSelector()}
                <ItemContent>
                    {
                        renderOptionContent ?
                            renderOptionContent({
                                option: item,
                                renderLabel
                            }) :
                            renderLabel()
                    }
                </ItemContent>
            </>
        </Item>
    );
};

export const PickerScreen = () => {
    const isFocused = useIsFocused();
    const theme = useTheme();
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
        canFilter,
        renderOptionContent,
        renderBottomView
    } = pickerConfig;
    const [
        internalSelectedValues,
        setInternalSelectedValues
    ] = useState(selectedValues);
    const [searchText, setSearchText] = useState('');

    const onConfirm = () => {
        onValuesChange(internalSelectedValues);
        closePicker();
    };

    const onSingleSelect = value => {
        onValueChange(value);
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
        selectedValue,
        onValueChange: onSingleSelect,
        isMultiSelect,
        selectedValues: internalSelectedValues,
        onValuesChange: setInternalSelectedValues,
        renderOptionContent,
        theme
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
                {!!isMultiSelect && (
                    <Appbar.Action
                        icon='check'
                        onPress={onConfirm}
                    />
                )}
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
                    {renderBottomView && renderBottomView()}
                </SafeArea>
            </KeyboardAvoiding>
        </Root>
    );
};
