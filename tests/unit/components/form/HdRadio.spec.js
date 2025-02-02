import { wrapperFactoryBuilder, getLastEventPayload } from 'tests/unit/helpers';
import HdRadio from '@/components/form/HdRadio.vue';
// reusing items from the stories
import ITEMS from '@/stories/mocks/FORM_ITEMS';

// list of selectors we depend on
const ITEM_SELECTOR = '.radio';
const SELECTED_ITEM_SELECTOR = '.radio--selected';
const VERTICAL_ITEM_SELECTOR = '.radio-wrapper--vertical';

const wrapperBuilder = wrapperFactoryBuilder(HdRadio, {
  props: {
    name: 'testRadio',
    label: 'test radio label',
    items: ITEMS,
  },
});

describe('HdRadio', () => {
  it('is rendered as expected', () => {
    const wrapper = wrapperBuilder();

    expect(wrapper.html()).toMatchSnapshot();
  });

  it('renders with preselected item', () => {
    const wrapper = wrapperBuilder({
      props: {
        value: ITEMS[2].value,
      },
    });

    expect(wrapper.findAll(SELECTED_ITEM_SELECTOR).length).toBe(1);
  });

  it('emits `input` event with the right payload on click', () => {
    const wrapper = wrapperBuilder();
    const ITEM_INDEX = 1;

    wrapper.findAll(ITEM_SELECTOR).at(ITEM_INDEX).trigger('click');

    expect(wrapper.emitted('input')[0][0]).toEqual(ITEMS[ITEM_INDEX].value);
  });

  it('emits `input` event with the right payload on arrows keydown', async () => {
    const INITIAL_ITEM_INDEX = 2;
    const wrapper = wrapperBuilder({
      props: {
        value: ITEMS[INITIAL_ITEM_INDEX].value,
      },
    });
    const getLastInputEventPayload = () => getLastEventPayload({ wrapper, eventName: 'input' });
    // The keydown event handler is the same for all the items
    // so it doesn't matter which items fires it. We pick the first one in this test
    const itemWrapper = wrapper.find(ITEM_SELECTOR);

    // We test the "next" keys
    ['Down', 'Right'].forEach((key) => {
      itemWrapper.trigger('keydown', {
        key,
      });
      const payload = getLastInputEventPayload();
      expect(payload).toEqual(ITEMS[INITIAL_ITEM_INDEX + 1].value);
    });

    // We test the "previous" keys
    ['Up', 'Left'].forEach((key) => {
      itemWrapper.trigger('keydown', {
        key,
      });
      const payload = getLastInputEventPayload();
      expect(payload).toEqual(ITEMS[INITIAL_ITEM_INDEX - 1].value);
    });

    // We test the handling of the items' array bounds
    await wrapper.setProps({ value: ITEMS[ITEMS.length - 1].value });
    ['Down', 'Right'].forEach((key) => {
      itemWrapper.trigger('keydown', {
        key,
      });
      const payload = getLastInputEventPayload();
      expect(payload).toEqual(ITEMS[0].value);
    });

    await wrapper.vm.$nextTick();

    await wrapper.setProps({ value: ITEMS[0].value });
    ['Up', 'Left'].forEach((key) => {
      itemWrapper.trigger('keydown', {
        key,
      });
      const payload = getLastInputEventPayload();
      expect(payload).toEqual(ITEMS[ITEMS.length - 1].value);
    });
  });

  it('can show items vertically', () => {
    const wrapper = wrapperBuilder({
      props: {
        vertical: true,
      },
    });

    expect(wrapper.find(VERTICAL_ITEM_SELECTOR).exists()).toBe(true);
  });

  it('validates requiredness', async () => {
    const wrapper = wrapperBuilder({
      props: {
        value: undefined,
      },
    });
    // We make sure nothing is selected so we can properly test the validation
    expect(wrapper.findAll(SELECTED_ITEM_SELECTOR).length).toBe(0);
    expect(wrapper.vm.validate()).toBe(true);

    await wrapper.setProps({
      required: true,
    });

    expect(wrapper.vm.validate()).toBe(false);
  });

  it('Supports disabling', () => {
    const wrapper = wrapperBuilder({
      props: {
        disabled: true,
      },
    });

    expect(wrapper.find('input').attributes().disabled).toBe('disabled');
  });
});
