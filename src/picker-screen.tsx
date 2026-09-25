import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    TouchableHighlight,
    BackHandler,
    StyleSheet,
    StyleProp,
    ViewStyle
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useIsFocused } from '@react-navigation/native';
import map from 'lodash/map';
import difference from 'lodash/difference';
import find from 'lodash/find';
import without from 'lodash/without';
import union from 'lodash/union';
import {
    Appbar,
    AppbarAction,
    AppbarContent
} from '@codexporer.io/expo-appbar';
import { KeyboardAvoidingView } from '@codexporer.io/expo-keyboard-avoiding-view';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppTheme, AppThemeColors } from '@codexporer.io/expo-app-theme';
import { usePicker } from './store';
import { Checkbox } from '@codexporer.io/expo-checkbox';
import { RadioButton } from '@codexporer.io/expo-radio-button';
import { Searchbar } from '@codexporer.io/expo-searchbar';

interface OptionItemProps<T = any> {
    item: T;
    selectedValue?: T;
    onValueChange: (value: T) => void;
    isMultiSelect?: boolean;
    selectedValues?: T[];
    onValuesChange: (values: T[]) => void;
    renderOptionContent?: (props: {
        option: T;
        renderLabel: (label?: React.ReactNode) => React.ReactNode;
    }) => React.ReactNode;
    theme: AppThemeColors;
    hasSelector?: boolean;
    renderOption?: (props: { option: T }) => React.ReactNode;
    isEqual: (a: T, b: T) => boolean;
}

const Divider: React.FC<{ style?: StyleProp<ViewStyle> }> = ({ style }) => {
    const theme = useAppTheme();
    return (
        <View
            style={[
                styles.divider,
                { backgroundColor: theme.border },
                style
            ]}
        />
    );
};

const optionsKeyExtractor = (_item: any, index: number): string => `${index}`;

const renderOptionItem = <T,>({
    item,
    selectedValue,
    onValueChange,
    isMultiSelect,
    selectedValues = [],
    onValuesChange,
    renderOptionContent,
    theme,
    hasSelector = true,
    renderOption,
    isEqual
}: OptionItemProps<T>): React.ReactElement | null => {
    if (renderOption) {
        return (renderOption({
            option: item
        }) as React.ReactElement | null) ?? null;
    }

    const onSelect = () => {
        if (isMultiSelect) {
            const isSelected = Boolean(find(selectedValues, (value: T) => isEqual(value, item)));
            onValuesChange(
                isSelected
                    ? without(selectedValues, item)
                    : union(selectedValues, [item])
            );
            return;
        }

        onValueChange(item);
    };

    const renderSelector = () => {
        if (isMultiSelect) {
            const isSelected = Boolean(find(selectedValues, (value: T) => isEqual(value, item)));
            return (
                <Checkbox
                    status={isSelected ? 'checked' : 'unchecked'}
                    onPress={onSelect}
                />
            );
        }

        const isSelected = isEqual(selectedValue as T, item);
        return (
            <RadioButton
                status={isSelected ? 'checked' : 'unchecked'}
                onPress={onSelect}
            />
        );
    };

    const renderLabel = (label?: React.ReactNode) => (
        <Text style={[styles.itemLabel, { color: theme.text }]}>
            {label ?? (typeof item === 'object' && item !== null ? (item as any).label ?? (item as any).title ?? String(item) : String(item ?? ''))}
        </Text>
    );

    return (
        <TouchableHighlight
            style={[styles.itemRoot, { backgroundColor: theme.background }]}
            underlayColor={theme.surfaceSecondary}
            onPress={onSelect}
        >
            <View style={styles.itemRow}>
                {hasSelector && renderSelector()}
                <View style={styles.itemContent}>
                    {renderOptionContent
                        ? (renderOptionContent({
                              option: item,
                              renderLabel
                          }) as React.ReactElement | null)
                        : renderLabel()}
                </View>
            </View>
        </TouchableHighlight>
    );
};

interface SelectAllProps<T = any> {
    items: T[];
    values: T[];
    onValuesChange: (values: T[]) => void;
}

const SelectAll = <T,>({
    items,
    values,
    onValuesChange
}: SelectAllProps<T>) => {
    const theme = useAppTheme();
    const shouldSelectAllItems = difference(items, values).length === 0;
    const onPress = () => {
        onValuesChange(shouldSelectAllItems ? [] : items);
    };

    return (
        <>
            <TouchableHighlight
                style={[styles.itemRoot, { backgroundColor: theme.background }]}
                underlayColor={theme.surfaceSecondary}
                onPress={onPress}
            >
                <View style={styles.itemRow}>
                    <Checkbox
                        status={shouldSelectAllItems ? 'checked' : 'unchecked'}
                        onPress={onPress}
                    />
                    <View style={styles.itemContent}>
                        <Text style={[styles.itemLabel, styles.selectAllLabel, { color: theme.text }]}>
                            Select All
                        </Text>
                    </View>
                </View>
            </TouchableHighlight>
            <Divider />
        </>
    );
};

export const PickerScreen: React.FC = () => {
    const isFocused = useIsFocused();
    const theme = useAppTheme();
    const [
        { pickerConfig },
        { closePicker }
    ] = usePicker();

    const {
        title = '',
        items = [],
        selectedValue,
        onValueChange = () => {},
        isMultiSelect = false,
        selectedValues = [],
        onValuesChange = () => {},
        canFilter = false,
        filterOption,
        renderOptionContent,
        renderOption,
        renderTopView,
        renderBottomView,
        renderEmptyView,
        hasSelector = true,
        shouldHideSelectAll = false,
        shouldHideConfirmScreenButton = false,
        estimatedItemSize = 200,
        isEqual = (item1: any, item2: any) => item1 === item2,
        onConfirm: onConfirmExternal
    } = pickerConfig ?? {};

    const [
        internalSelectedValues,
        setInternalSelectedValues
    ] = useState<any[]>(selectedValues);
    const [searchText, setSearchText] = useState('');

    useEffect(() => {
        setInternalSelectedValues(selectedValues);
    }, [selectedValues]);

    const onConfirm = async () => {
        if (onConfirmExternal) {
            try {
                await onConfirmExternal();
                closePicker();
            } catch {
                // Ignore error
            }
            return;
        }
        onValuesChange(internalSelectedValues);
        closePicker();
    };

    const onSingleSelect = (value: any) => {
        onValueChange(value);
        closePicker();
    };

    const onCancel = useCallback(() => {
        closePicker();
    }, [closePicker]);

    const onSearchChange = (text: string) => {
        setSearchText(text);
    };

    const filteredItems = (canFilter && searchText.trim().length > 0)
        ? items.filter((item: any) => {
              if (filterOption) {
                  return filterOption(item, searchText);
              }
              const strVal = typeof item === 'object' && item !== null
                  ? String(item.label ?? item.title ?? item.name ?? '')
                  : String(item ?? '');
              return strVal.toLowerCase().includes(searchText.toLowerCase());
          })
        : items;

    const data = map(filteredItems, (item: any, index: number) => ({
        data: item,
        key: index
    }));

    const renderItem = ({ item }: { item: { data: any; key: number } }): React.ReactElement | null =>
        renderOptionItem({
            item: item.data,
            selectedValue,
            onValueChange: onSingleSelect,
            isMultiSelect,
            selectedValues: internalSelectedValues,
            onValuesChange: setInternalSelectedValues,
            renderOptionContent,
            theme,
            hasSelector,
            renderOption,
            isEqual
        });

    useEffect(() => {
        const handler = isFocused && BackHandler.addEventListener(
            'hardwareBackPress',
            () => {
                onCancel();
                return true;
            }
        );

        return () => {
            handler && handler.remove();
        };
    }, [onCancel, isFocused]);

    const shouldShowSearch = Boolean(canFilter && items.length > 0);
    const shouldShowEmptyView = data.length === 0 && Boolean(renderEmptyView);
    const shouldShowList = !shouldShowEmptyView;
    const shouldShowSelectAll =
        !shouldHideSelectAll &&
        shouldShowList &&
        isMultiSelect &&
        data.length > 1;
    const shouldShowTopView = Boolean(renderTopView);
    const shouldShowBottomView = Boolean(renderBottomView);

    const extraListProps: Record<string, any> = {};
    if (estimatedItemSize) {
        extraListProps.estimatedItemSize = estimatedItemSize;
    }

    return (
        <View style={[styles.root, { backgroundColor: theme.background }]}>
            <Appbar>
                <AppbarAction
                    icon="close"
                    onPress={onCancel}
                />
                <AppbarContent
                    title={title || ''}
                />
                {((Boolean(isMultiSelect) && !shouldHideConfirmScreenButton) || Boolean(onConfirmExternal)) && (
                    <AppbarAction
                        icon="check"
                        onPress={onConfirm}
                    />
                )}
            </Appbar>
            <SafeAreaView style={styles.safeArea} edges={['right', 'bottom', 'left']}>
                <KeyboardAvoidingView
                    style={[styles.keyboardAvoiding, { backgroundColor: theme.background }]}
                    isSticky
                >
                    {shouldShowTopView && (renderTopView?.() as any)}
                    {shouldShowSearch && (
                        <Searchbar
                            placeholder="Type to search"
                            onChangeText={onSearchChange}
                            value={searchText}
                        />
                    )}
                    {shouldShowEmptyView && (renderEmptyView?.() as any)}
                    {shouldShowSelectAll && (
                        <SelectAll
                            items={items}
                            values={internalSelectedValues}
                            onValuesChange={setInternalSelectedValues}
                        />
                    )}
                    {shouldShowList && (
                        <FlashList
                            ItemSeparatorComponent={Divider}
                            renderItem={renderItem}
                            keyExtractor={optionsKeyExtractor}
                            data={data}
                            {...extraListProps}
                        />
                    )}
                    {shouldShowBottomView && (renderBottomView?.() as any)}
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    root: {
        flex: 1,
        flexDirection: 'column',
    },
    safeArea: {
        flex: 1,
    },
    keyboardAvoiding: {
        flex: 1,
    },
    itemRoot: {
        padding: 10,
    },
    itemRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    itemContent: {
        flex: 1,
        flexDirection: 'row',
        marginLeft: 10,
        alignItems: 'center',
    },
    itemLabel: {
        fontSize: 16,
        lineHeight: 22,
    },
    selectAllLabel: {
        fontWeight: 'bold',
    },
    divider: {
        height: StyleSheet.hairlineWidth,
        width: '100%',
    }
});

export default PickerScreen;
