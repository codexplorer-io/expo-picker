import React, { useState, useEffect, useCallback } from 'react';
import { BackHandler, Platform, FlatList } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import styled from 'styled-components/native';
import map from 'lodash/map';
import difference from 'lodash/difference';
import includes from 'lodash/includes';
import without from 'lodash/without';
import union from 'lodash/union';
import {
    Searchbar,
    Divider,
    Checkbox,
    RadioButton,
    useTheme,
    Subheading
} from 'react-native-paper';
import {
    Appbar,
    AppbarAction,
    AppbarContent
} from '@codexporer.io/expo-appbar';
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

const ItemRoot = styled.TouchableHighlight`
    display: flex;
    align-items: center;
    flex-direction: row;
    padding: 10px;
    background-color: ${({ theme: { colors: { background } } }) => background};
`;

const ItemContent = styled.View`
    flex: 1;
    display: flex;
    flex-direction: row;
    margin-left: 10px;
    align-items: center;
`;

const ItemLabel = styled(Subheading)``;

const SelectAllLabel = styled(ItemLabel)`
    font-weight: bold;
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
    theme,
    hasSelector
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

    const renderLabel = label => (
        <ItemLabel>
            {label ?? item}
        </ItemLabel>
    );

    return (
        <ItemRoot
            underlayColor={theme.colors.backgroundHighlight}
            onPress={onSelect}
        >
            <>
                {hasSelector && renderSelector()}
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
        </ItemRoot>
    );
};

const SelectAll = ({
    items,
    values,
    onValuesChange
}) => {
    const theme = useTheme();
    const shouldSelectAllItems = difference(items, values).length === 0;
    const onPress = () => {
        onValuesChange(shouldSelectAllItems ? [] : items);
    };

    return (
        <>
            <ItemRoot
                underlayColor={theme.colors.backgroundHighlight}
                onPress={onPress}
            >
                <>
                    <Checkbox
                        status={shouldSelectAllItems ? 'checked' : 'unchecked'}
                        onPress={onPress}
                    />
                    <ItemContent>
                        <SelectAllLabel>
                            Select All
                        </SelectAllLabel>
                    </ItemContent>
                </>
            </ItemRoot>
            <Divider />
        </>
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
        title,
        items,
        selectedValue,
        onValueChange,
        isMultiSelect,
        selectedValues,
        onValuesChange,
        canFilter,
        renderOptionContent,
        renderTopView,
        renderBottomView,
        renderEmptyView,
        hasSelector = true,
        shouldHideSelectAll,
        shouldHideConfirmScreenButton
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

    const onCancel = useCallback(() => {
        closePicker();
    }, [closePicker]);

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
        theme,
        hasSelector
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

    const shouldShowSearch = !!canFilter && data.length > 0;
    const shouldShowEmptyView = data.length === 0 && !!renderEmptyView;
    const shouldShowList = !shouldShowEmptyView;
    const shouldShowSelectAll = !shouldHideSelectAll &&
        shouldShowList &&
        isMultiSelect &&
        data.length > 1;
    const shouldShowTopView = !!renderTopView;
    const shouldShowBottomView = !!renderBottomView;

    return (
        <Root>
            <Appbar>
                <AppbarAction
                    icon='close'
                    onPress={onCancel}
                />
                <AppbarContent
                    title={title || ''}
                />
                {!!isMultiSelect && !shouldHideConfirmScreenButton && (
                    <AppbarAction
                        icon='check'
                        onPress={onConfirm}
                    />
                )}
            </Appbar>
            <KeyboardAvoiding
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <SafeArea>
                    {shouldShowTopView && renderTopView()}
                    {shouldShowSearch && (
                        <Searchbar
                            placeholder='Type to search'
                            onChangeText={onSearchChange}
                            value={searchText}
                        />
                    )}
                    {shouldShowEmptyView && renderEmptyView()}
                    {shouldShowSelectAll && (
                        <SelectAll
                            items={items}
                            values={internalSelectedValues}
                            onValuesChange={setInternalSelectedValues}
                        />
                    )}
                    {shouldShowList && (
                        <FlatList
                            ItemSeparatorComponent={Divider}
                            renderItem={renderItem}
                            keyExtractor={optionsKeyExtractor}
                            data={data}
                        />
                    )}
                    {shouldShowBottomView && renderBottomView()}
                </SafeArea>
            </KeyboardAvoiding>
        </Root>
    );
};
