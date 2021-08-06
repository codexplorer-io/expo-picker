import React, { useState, useEffect } from 'react';
import { shallow } from 'enzyme';
import { BackHandler, View, FlatList } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import {
    Appbar,
    Searchbar,
    Divider,
    RadioButton,
    Checkbox,
    Text
} from 'react-native-paper';
import noop from 'lodash/noop';
import { usePicker } from './store';
import { PickerScreen } from './picker-screen';

jest.mock('react', () => ({
    ...jest.requireActual('react'),
    useState: jest.fn(),
    useEffect: jest.fn()
}));

jest.mock('react-native/Libraries/Utilities/BackHandler', () => ({
    addEventListener: jest.fn()
}));

jest.mock('react-native-paper', () => {
    const { createMockComponent } = jest.requireActual('@codexporer.io/react-test-utils');
    return {
        Appbar: {
            Header: createMockComponent('Appbar.Header'),
            Action: createMockComponent('Appbar.Action'),
            Content: createMockComponent('Appbar.Content')
        },
        Searchbar: createMockComponent('Searchbar'),
        Divider: createMockComponent('Divider'),
        Checkbox: createMockComponent('Checkbox'),
        RadioButton: createMockComponent('RadioButton'),
        useTheme: () => ({ colors: { backgroundHighlight: 'mockBackgroundHighlight' } }),
        Subheading: createMockComponent('Subheading'),
        Text: createMockComponent('Text')
    };
});

jest.mock('@react-navigation/native', () => ({
    useIsFocused: jest.fn()
}));

jest.mock('./store', () => ({
    usePicker: jest.fn()
}));

const defaultPickerConfig = {
    title: undefined,
    items: ['item 1', 'item 2'],
    selectedValue: null,
    onValueChange: jest.fn(),
    isMultiSelect: false,
    selectedValues: null,
    onValuesChange: jest.fn(),
    canFilter: false,
    renderOptionContent: null,
    renderTopView: null,
    renderBottomView: null,
    renderEmptyView: null
};

describe('PickerScreen', () => {
    const removeBackHandler = jest.fn();
    const mockUseState = ({
        internalSelectedValues = null,
        setInternalSelectedValues = noop,
        searchText = '',
        setSearchText = noop
    }) => {
        let call = 0;
        useState.mockImplementation(() => {
            call += 1;

            if (call === 1) {
                return [
                    internalSelectedValues,
                    setInternalSelectedValues
                ];
            }

            if (call === 2) {
                return [
                    searchText,
                    setSearchText
                ];
            }

            return null;
        });
    };
    const mockUsePicker = ({
        pickerConfig = defaultPickerConfig,
        closePicker = jest.fn()
    }) => {
        usePicker.mockReturnValue([{ pickerConfig }, { closePicker }]);
    };

    beforeEach(() => {
        mockUseState({});
        useEffect.mockImplementation(fn => fn());
        useIsFocused.mockReturnValue(true);
        mockUsePicker({});
        BackHandler.addEventListener.mockReturnValue({ remove: removeBackHandler });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('Appbar.Header', () => {
        it('should render single select as expected', () => {
            // eslint-disable-next-line lodash/prefer-lodash-method
            const wrapper = shallow(<PickerScreen />)
                .dive()
                .find(Appbar.Header);

            expect(wrapper).toMatchSnapshot();
        });

        it('should render multi select as expected', () => {
            mockUsePicker({
                pickerConfig: {
                    ...defaultPickerConfig,
                    isMultiSelect: true
                }
            });

            // eslint-disable-next-line lodash/prefer-lodash-method
            const wrapper = shallow(<PickerScreen />)
                .dive()
                .find(Appbar.Header);

            expect(wrapper).toMatchSnapshot();
        });

        it('should close the selector when back action is pressed', () => {
            const closePicker = jest.fn();
            mockUsePicker({ closePicker });

            // eslint-disable-next-line lodash/prefer-lodash-method
            const wrapper = shallow(<PickerScreen />)
                .dive()
                .find(Appbar.Action);

            wrapper.first().prop('onPress')();

            expect(closePicker).toHaveBeenCalledTimes(1);
            expect(wrapper).toHaveLength(1);
        });

        it('should confirm when mutiselect confirm action is pressed', () => {
            const closePicker = jest.fn();
            const selectedValues = ['value1', 'value2'];
            mockUsePicker({
                closePicker,
                pickerConfig: {
                    ...defaultPickerConfig,
                    isMultiSelect: true,
                    selectedValues
                }
            });
            mockUseState({ internalSelectedValues: selectedValues });

            // eslint-disable-next-line lodash/prefer-lodash-method
            const wrapper = shallow(<PickerScreen />)
                .dive()
                .find(Appbar.Action);

            wrapper.at(1).prop('onPress')();

            expect(useState).toHaveBeenNthCalledWith(1, selectedValues);
            expect(defaultPickerConfig.onValuesChange).toHaveBeenCalledTimes(1);
            expect(defaultPickerConfig.onValuesChange).toHaveBeenCalledWith(selectedValues);
            expect(closePicker).toHaveBeenCalledTimes(1);
            expect(wrapper).toHaveLength(2);
        });
    });

    describe('Top View', () => {
        it('should render top view', () => {
            const TopView = () => <View />;
            const renderTopView = jest.fn(() => <TopView />);
            mockUsePicker({
                pickerConfig: {
                    ...defaultPickerConfig,
                    renderTopView
                }
            });

            const wrapper = shallow(<PickerScreen />).dive();

            // eslint-disable-next-line lodash/prefer-lodash-method
            expect(wrapper.find(TopView)).toHaveLength(1);
            expect(renderTopView).toHaveBeenCalledTimes(1);
        });
    });

    describe('Searchbar', () => {
        it('should render search bar', () => {
            mockUseState({ searchText: 'Mock Search' });
            mockUsePicker({
                pickerConfig: {
                    ...defaultPickerConfig,
                    canFilter: true,
                    items: ['1', '2']
                }
            });

            const wrapper = shallow(<PickerScreen />).dive();

            // eslint-disable-next-line lodash/prefer-lodash-method
            const searchbar = wrapper.find(Searchbar);
            expect(searchbar).toHaveLength(1);
            expect(searchbar.props()).toStrictEqual({
                onChangeText: expect.any(Function),
                placeholder: 'Type to search',
                value: 'Mock Search'
            });
        });

        it('should not render search bar when no items', () => {
            mockUsePicker({
                pickerConfig: {
                    ...defaultPickerConfig,
                    canFilter: true,
                    items: []
                }
            });

            const wrapper = shallow(<PickerScreen />).dive();

            // eslint-disable-next-line lodash/prefer-lodash-method
            expect(wrapper.find(Searchbar)).toHaveLength(0);
        });

        it('should not render search bar when filtering is disabled', () => {
            mockUsePicker({
                pickerConfig: {
                    ...defaultPickerConfig,
                    canFilter: false,
                    items: ['1', '2']
                }
            });

            const wrapper = shallow(<PickerScreen />).dive();

            // eslint-disable-next-line lodash/prefer-lodash-method
            expect(wrapper.find(Searchbar)).toHaveLength(0);
        });

        it('should set search text on text change', () => {
            const setSearchText = jest.fn();
            mockUseState({ setSearchText });
            mockUsePicker({
                pickerConfig: {
                    ...defaultPickerConfig,
                    canFilter: true,
                    items: ['1', '2']
                }
            });
            // eslint-disable-next-line lodash/prefer-lodash-method
            const onChangeText = shallow(<PickerScreen />)
                .dive()
                .find(Searchbar)
                .prop('onChangeText');

            onChangeText('Mock Text');

            expect(setSearchText).toHaveBeenCalledTimes(1);
            expect(setSearchText).toHaveBeenCalledWith('Mock Text');
        });
    });

    describe('Empty View', () => {
        it('should render empty view', () => {
            const EmptyView = () => <View />;
            const renderEmptyView = jest.fn(() => <EmptyView />);
            mockUsePicker({
                pickerConfig: {
                    ...defaultPickerConfig,
                    items: [],
                    renderEmptyView
                }
            });

            const wrapper = shallow(<PickerScreen />).dive();

            // eslint-disable-next-line lodash/prefer-lodash-method
            expect(wrapper.find(EmptyView)).toHaveLength(1);
            expect(renderEmptyView).toHaveBeenCalledTimes(1);
        });

        it('should not render empty view when have items', () => {
            const EmptyView = () => <View />;
            const renderEmptyView = jest.fn(() => <EmptyView />);
            mockUsePicker({
                pickerConfig: {
                    ...defaultPickerConfig,
                    items: ['1', '2'],
                    renderEmptyView
                }
            });

            const wrapper = shallow(<PickerScreen />).dive();

            // eslint-disable-next-line lodash/prefer-lodash-method
            expect(wrapper.find(EmptyView)).toHaveLength(0);
            expect(renderEmptyView).not.toHaveBeenCalled();
        });
    });

    describe('Select All', () => {
        it('should render select all', () => {
            mockUseState({ internalSelectedValues: ['3', '4'] });
            mockUsePicker({
                pickerConfig: {
                    ...defaultPickerConfig,
                    items: ['1', '2'],
                    isMultiSelect: true
                }
            });

            const wrapper = shallow(<PickerScreen />).dive();

            // eslint-disable-next-line lodash/prefer-lodash-method
            const selectAll = wrapper.find('SelectAll');
            expect(selectAll).toHaveLength(1);
            expect(selectAll.props()).toStrictEqual({
                items: ['1', '2'],
                onValuesChange: expect.any(Function),
                values: ['3', '4']
            });
        });

        it('should not render select all when 1 item', () => {
            mockUseState({ internalSelectedValues: ['3', '4'] });
            mockUsePicker({
                pickerConfig: {
                    ...defaultPickerConfig,
                    items: ['1'],
                    isMultiSelect: true
                }
            });

            const wrapper = shallow(<PickerScreen />).dive();

            // eslint-disable-next-line lodash/prefer-lodash-method
            const selectAll = wrapper.find('SelectAll');
            expect(selectAll).toHaveLength(0);
        });

        it('should not render select all when no items', () => {
            mockUseState({ internalSelectedValues: ['3', '4'] });
            mockUsePicker({
                pickerConfig: {
                    ...defaultPickerConfig,
                    items: [],
                    isMultiSelect: true
                }
            });

            const wrapper = shallow(<PickerScreen />).dive();

            // eslint-disable-next-line lodash/prefer-lodash-method
            const selectAll = wrapper.find('SelectAll');
            expect(selectAll).toHaveLength(0);
        });

        it('should not render select all when not multiselect', () => {
            mockUseState({ internalSelectedValues: ['3', '4'] });
            mockUsePicker({
                pickerConfig: {
                    ...defaultPickerConfig,
                    items: ['1', '2'],
                    isMultiSelect: false
                }
            });

            const wrapper = shallow(<PickerScreen />).dive();

            // eslint-disable-next-line lodash/prefer-lodash-method
            const selectAll = wrapper.find('SelectAll');
            expect(selectAll).toHaveLength(0);
        });

        it('should call set values when value changes', () => {
            const setInternalSelectedValues = jest.fn();
            mockUseState({ setInternalSelectedValues });
            mockUsePicker({
                pickerConfig: {
                    ...defaultPickerConfig,
                    items: ['1', '2'],
                    isMultiSelect: true
                }
            });
            // eslint-disable-next-line lodash/prefer-lodash-method
            const onValuesChange = shallow(<PickerScreen />)
                .dive()
                .find('SelectAll')
                .prop('onValuesChange');

            onValuesChange('Mock Items');

            expect(setInternalSelectedValues).toHaveBeenCalledTimes(1);
            expect(setInternalSelectedValues).toHaveBeenCalledWith('Mock Items');
        });
    });

    describe('List', () => {
        it('should render list', () => {
            mockUsePicker({
                pickerConfig: {
                    ...defaultPickerConfig,
                    items: ['1', '2']
                }
            });

            const wrapper = shallow(<PickerScreen />).dive();

            // eslint-disable-next-line lodash/prefer-lodash-method
            const list = wrapper.find(FlatList);
            expect(list).toHaveLength(1);
            expect(list.props()).toStrictEqual(
                expect.objectContaining({
                    ItemSeparatorComponent: Divider,
                    renderItem: expect.any(Function),
                    keyExtractor: expect.any(Function),
                    data: [
                        {
                            data: '1',
                            key: 0
                        },
                        {
                            data: '2',
                            key: 1
                        }
                    ]
                })
            );
        });

        it('should extract item key', () => {
            mockUsePicker({
                pickerConfig: {
                    ...defaultPickerConfig,
                    items: ['1', '2']
                }
            });
            // eslint-disable-next-line lodash/prefer-lodash-method
            const extractKey = shallow(<PickerScreen />)
                .dive()
                .find(FlatList)
                .prop('keyExtractor');

            const key = extractKey({ key: 10 });

            expect(key).toBe('10');
        });

        describe('list item', () => {
            // eslint-disable-next-line lodash/prefer-lodash-method
            const getRenderItem = () => shallow(<PickerScreen />)
                .dive()
                .find(FlatList)
                .prop('renderItem');

            describe('single select', () => {
                it('should render item root', () => {
                    mockUsePicker({
                        pickerConfig: {
                            ...defaultPickerConfig,
                            items: ['1', '2']
                        }
                    });
                    const renderItem = getRenderItem();

                    const item = shallow(renderItem({ item: { data: 'mock data', key: 'mock key' } }));

                    expect(item.props()).toStrictEqual(
                        expect.objectContaining({
                            underlayColor: 'mockBackgroundHighlight',
                            onPress: expect.any(Function)
                        })
                    );
                });

                it('should call on select when root onPress is called', () => {
                    const onValueChange = jest.fn();
                    mockUsePicker({
                        pickerConfig: {
                            ...defaultPickerConfig,
                            items: ['1', '2'],
                            onValueChange
                        }
                    });
                    const renderItem = getRenderItem();
                    const onPress = shallow(renderItem({ item: { data: 'mock data', key: 'mock key' } })).prop('onPress');

                    onPress();

                    expect(onValueChange).toHaveBeenCalledTimes(1);
                    expect(onValueChange).toHaveBeenCalledWith('mock data');
                });

                it('should render radio button unchecked', () => {
                    mockUsePicker({
                        pickerConfig: {
                            ...defaultPickerConfig,
                            items: ['1', '2']
                        }
                    });
                    const renderItem = getRenderItem();

                    const wrapper = shallow(
                        renderItem({ item: { data: 'mock data', key: 'mock key' } })
                    );

                    // eslint-disable-next-line lodash/prefer-lodash-method
                    const radioButton = wrapper.find(RadioButton);
                    expect(radioButton).toEqual(wrapper.childAt(0));
                    expect(radioButton).toHaveLength(1);
                    expect(radioButton.props()).toStrictEqual(
                        expect.objectContaining({
                            status: 'unchecked',
                            onPress: expect.any(Function)
                        })
                    );
                });

                it('should render radio button checked', () => {
                    mockUsePicker({
                        pickerConfig: {
                            ...defaultPickerConfig,
                            items: ['1', '2'],
                            selectedValue: 'mock data'
                        }
                    });
                    const renderItem = getRenderItem();

                    // eslint-disable-next-line lodash/prefer-lodash-method
                    const radioButton = shallow(
                        renderItem({ item: { data: 'mock data', key: 'mock key' } })
                    ).find(RadioButton);

                    expect(radioButton).toHaveLength(1);
                    expect(radioButton.props()).toStrictEqual(
                        expect.objectContaining({
                            status: 'checked',
                            onPress: expect.any(Function)
                        })
                    );
                });

                it('should call on select when radio button onPress is called', () => {
                    const onValueChange = jest.fn();
                    mockUsePicker({
                        pickerConfig: {
                            ...defaultPickerConfig,
                            items: ['1', '2'],
                            onValueChange
                        }
                    });
                    const renderItem = getRenderItem();
                    // eslint-disable-next-line lodash/prefer-lodash-method
                    const onPress = shallow(
                        renderItem({ item: { data: 'mock data', key: 'mock key' } })
                    ).find(RadioButton).prop('onPress');

                    onPress();

                    expect(onValueChange).toHaveBeenCalledTimes(1);
                    expect(onValueChange).toHaveBeenCalledWith('mock data');
                });

                it('should not render radio button', () => {
                    mockUsePicker({
                        pickerConfig: {
                            ...defaultPickerConfig,
                            items: ['1', '2'],
                            hasSelector: false
                        }
                    });
                    const renderItem = getRenderItem();

                    const wrapper = shallow(
                        renderItem({ item: { data: 'mock data', key: 'mock key' } })
                    );

                    // eslint-disable-next-line lodash/prefer-lodash-method
                    expect(wrapper.find(RadioButton)).toHaveLength(0);
                });

                it('should properly render default item content', () => {
                    mockUsePicker({
                        pickerConfig: {
                            ...defaultPickerConfig,
                            items: ['1', '2']
                        }
                    });
                    const renderItem = getRenderItem();

                    // eslint-disable-next-line lodash/prefer-lodash-method
                    const content = shallow(
                        renderItem({ item: { data: 'mock data', key: 'mock key' } })
                    ).childAt(1);

                    expect(content).toMatchSnapshot();
                });

                it('should properly render custom item content', () => {
                    const renderOptionContent = jest.fn(({
                        option,
                        renderLabel
                    }) => (
                        <View>
                            <Text>
                                {option}
                            </Text>
                            {renderLabel()}
                        </View>
                    ));
                    mockUsePicker({
                        pickerConfig: {
                            ...defaultPickerConfig,
                            items: ['1', '2'],
                            renderOptionContent
                        }
                    });
                    const renderItem = getRenderItem();

                    // eslint-disable-next-line lodash/prefer-lodash-method
                    const content = shallow(
                        renderItem({ item: { data: 'mock data', key: 'mock key' } })
                    ).childAt(1);

                    expect(renderOptionContent).toHaveBeenCalledTimes(1);
                    expect(renderOptionContent).toHaveBeenCalledWith({
                        option: 'mock data',
                        renderLabel: expect.any(Function)
                    });
                    expect(content).toMatchSnapshot();
                });
            });

            describe('multi select', () => {
                it('should render item root', () => {
                    mockUsePicker({
                        pickerConfig: {
                            ...defaultPickerConfig,
                            items: ['1', '2'],
                            isMultiSelect: true
                        }
                    });
                    const renderItem = getRenderItem();

                    const item = shallow(renderItem({ item: { data: 'mock data', key: 'mock key' } }));

                    expect(item.props()).toStrictEqual(
                        expect.objectContaining({
                            underlayColor: 'mockBackgroundHighlight',
                            onPress: expect.any(Function)
                        })
                    );
                });

                it('should select item when root onPress is called and item is not selected', () => {
                    const setInternalSelectedValues = jest.fn();
                    mockUseState({
                        internalSelectedValues: ['1', '2'],
                        setInternalSelectedValues
                    });
                    mockUsePicker({
                        pickerConfig: {
                            ...defaultPickerConfig,
                            items: ['1', '2'],
                            isMultiSelect: true
                        }
                    });
                    const renderItem = getRenderItem();
                    const onPress = shallow(renderItem({ item: { data: 'mock data', key: 'mock key' } })).prop('onPress');

                    onPress();

                    expect(setInternalSelectedValues).toHaveBeenCalledTimes(1);
                    expect(setInternalSelectedValues).toHaveBeenCalledWith(['1', '2', 'mock data']);
                });

                it('should unselect item when root onPress is called and item is selected', () => {
                    const setInternalSelectedValues = jest.fn();
                    mockUseState({
                        internalSelectedValues: ['1', 'mock data', '2'],
                        setInternalSelectedValues
                    });
                    mockUsePicker({
                        pickerConfig: {
                            ...defaultPickerConfig,
                            items: ['1', '2'],
                            isMultiSelect: true
                        }
                    });
                    const renderItem = getRenderItem();
                    const onPress = shallow(renderItem({ item: { data: 'mock data', key: 'mock key' } })).prop('onPress');

                    onPress();

                    expect(setInternalSelectedValues).toHaveBeenCalledTimes(1);
                    expect(setInternalSelectedValues).toHaveBeenCalledWith(['1', '2']);
                });

                it('should render checkbox unchecked', () => {
                    mockUseState({
                        internalSelectedValues: ['1', '2']
                    });
                    mockUsePicker({
                        pickerConfig: {
                            ...defaultPickerConfig,
                            items: ['1', '2'],
                            isMultiSelect: true
                        }
                    });
                    const renderItem = getRenderItem();

                    const wrapper = shallow(
                        renderItem({ item: { data: 'mock data', key: 'mock key' } })
                    );

                    // eslint-disable-next-line lodash/prefer-lodash-method
                    const checkbox = wrapper.find(Checkbox);
                    expect(checkbox).toEqual(wrapper.childAt(0));
                    expect(checkbox).toHaveLength(1);
                    expect(checkbox.props()).toStrictEqual(
                        expect.objectContaining({
                            status: 'unchecked',
                            onPress: expect.any(Function)
                        })
                    );
                });

                it('should render checkbox checked', () => {
                    mockUseState({
                        internalSelectedValues: ['1', 'mock data', '2']
                    });
                    mockUsePicker({
                        pickerConfig: {
                            ...defaultPickerConfig,
                            items: ['1', '2'],
                            isMultiSelect: true,
                            selectedValue: 'mock data'
                        }
                    });
                    const renderItem = getRenderItem();

                    // eslint-disable-next-line lodash/prefer-lodash-method
                    const checkbox = shallow(
                        renderItem({ item: { data: 'mock data', key: 'mock key' } })
                    ).find(Checkbox);

                    expect(checkbox).toHaveLength(1);
                    expect(checkbox.props()).toStrictEqual(
                        expect.objectContaining({
                            status: 'checked',
                            onPress: expect.any(Function)
                        })
                    );
                });

                it('should select item when checkbox onPress is called and item is not selected', () => {
                    const setInternalSelectedValues = jest.fn();
                    mockUseState({
                        internalSelectedValues: ['1', '2'],
                        setInternalSelectedValues
                    });
                    mockUsePicker({
                        pickerConfig: {
                            ...defaultPickerConfig,
                            items: ['1', '2'],
                            isMultiSelect: true
                        }
                    });
                    const renderItem = getRenderItem();
                    // eslint-disable-next-line lodash/prefer-lodash-method
                    const onPress = shallow(
                        renderItem({ item: { data: 'mock data', key: 'mock key' } })
                    ).find(Checkbox).prop('onPress');

                    onPress();

                    expect(setInternalSelectedValues).toHaveBeenCalledTimes(1);
                    expect(setInternalSelectedValues).toHaveBeenCalledWith(['1', '2', 'mock data']);
                });

                it('should unselect item when checkbox onPress is called and item is selected', () => {
                    const setInternalSelectedValues = jest.fn();
                    mockUseState({
                        internalSelectedValues: ['1', 'mock data', '2'],
                        setInternalSelectedValues
                    });
                    mockUsePicker({
                        pickerConfig: {
                            ...defaultPickerConfig,
                            items: ['1', '2'],
                            isMultiSelect: true
                        }
                    });
                    const renderItem = getRenderItem();
                    // eslint-disable-next-line lodash/prefer-lodash-method
                    const onPress = shallow(
                        renderItem({ item: { data: 'mock data', key: 'mock key' } })
                    ).find(Checkbox).prop('onPress');

                    onPress();

                    expect(setInternalSelectedValues).toHaveBeenCalledTimes(1);
                    expect(setInternalSelectedValues).toHaveBeenCalledWith(['1', '2']);
                });

                it('should properly render default item content', () => {
                    mockUsePicker({
                        pickerConfig: {
                            ...defaultPickerConfig,
                            items: ['1', '2'],
                            isMultiSelect: true
                        }
                    });
                    const renderItem = getRenderItem();

                    // eslint-disable-next-line lodash/prefer-lodash-method
                    const content = shallow(
                        renderItem({ item: { data: 'mock data', key: 'mock key' } })
                    ).childAt(1);

                    expect(content).toMatchSnapshot();
                });

                it('should properly render custom item content', () => {
                    const renderOptionContent = jest.fn(({
                        option,
                        renderLabel
                    }) => (
                        <View>
                            <Text>
                                {option}
                            </Text>
                            {renderLabel()}
                        </View>
                    ));
                    mockUsePicker({
                        pickerConfig: {
                            ...defaultPickerConfig,
                            items: ['1', '2'],
                            isMultiSelect: true,
                            renderOptionContent
                        }
                    });
                    const renderItem = getRenderItem();

                    // eslint-disable-next-line lodash/prefer-lodash-method
                    const content = shallow(
                        renderItem({ item: { data: 'mock data', key: 'mock key' } })
                    ).childAt(1);

                    expect(renderOptionContent).toHaveBeenCalledTimes(1);
                    expect(renderOptionContent).toHaveBeenCalledWith({
                        option: 'mock data',
                        renderLabel: expect.any(Function)
                    });
                    expect(content).toMatchSnapshot();
                });
            });
        });
    });

    describe('Bottom View', () => {
        it('should render bottom view', () => {
            const BottomView = () => <View />;
            const renderBottomView = jest.fn(() => <BottomView />);
            mockUsePicker({
                pickerConfig: {
                    ...defaultPickerConfig,
                    renderBottomView
                }
            });

            const wrapper = shallow(<PickerScreen />).dive();

            // eslint-disable-next-line lodash/prefer-lodash-method
            expect(wrapper.find(BottomView)).toHaveLength(1);
            expect(renderBottomView).toHaveBeenCalledTimes(1);
        });
    });

    describe('Back Handler', () => {
        it('should call closePicker on back handler', () => {
            let backHandler;
            BackHandler.addEventListener.mockImplementation((eventName, handler) => {
                expect(eventName).toEqual('hardwareBackPress');
                backHandler = handler;
            });
            const closePicker = jest.fn();
            mockUsePicker({
                closePicker,
                pickerConfig: {
                    ...defaultPickerConfig
                }
            });
            shallow(<PickerScreen />).dive();
            expect(BackHandler.addEventListener).toHaveBeenCalledTimes(1);
            expect(closePicker).not.toHaveBeenCalled();

            backHandler();

            expect(closePicker).toHaveBeenCalledTimes(1);
        });

        it('should not call back handler addEventListener when not focused', () => {
            useIsFocused.mockReturnValue(false);
            mockUsePicker({
                pickerConfig: {
                    ...defaultPickerConfig
                }
            });
            shallow(<PickerScreen />).dive();

            expect(BackHandler.addEventListener).not.toHaveBeenCalled();
        });

        it('should remove back handler on change', () => {
            let removeHandler;
            useEffect.mockImplementation(fn => {
                removeHandler = fn();
            });
            mockUsePicker({
                pickerConfig: {
                    ...defaultPickerConfig
                }
            });
            shallow(<PickerScreen />).dive();
            expect(removeBackHandler).not.toHaveBeenCalled();

            removeHandler();

            expect(removeBackHandler).toHaveBeenCalledTimes(1);
        });
    });
});
