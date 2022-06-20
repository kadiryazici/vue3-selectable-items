import { defineComponent, onBeforeUpdate, onMounted, onUnmounted, ref, watch, type PropType } from 'vue';
import { nanoid } from 'nanoid';
import { useKey } from '@/composables/useKey';

interface ItemData {
  id?: string;
  onSelect?: (data: ItemData) => void;
  wrapperElementTag?: string;
  wrapperElementAttributes?: Record<string, any>;
  expandMenuComponent?: any;
  expandMenuComponentProps?: Record<string, any>;
  expandMenuItemData?: ItemData[];
  [key: string | number]: any;
}

const allowedInputTypes = ['email', 'password', 'text', 'number', 'url', 'time', 'tel', 'search'];

export const isInputing = () =>
  document.activeElement instanceof HTMLTextAreaElement ||
  document.activeElement instanceof HTMLSelectElement ||
  (document.activeElement instanceof HTMLInputElement && allowedInputTypes.includes(document.activeElement.type));

// export const isFocusedOnBlackListedElement = () =>
//   document.activeElement?.getAttribute('role') === 'button' ||
//   document.activeElement instanceof HTMLButtonElement ||
//   document.activeElement instanceof HTMLAnchorElement ||
//   document.activeElement instanceof HTMLTextAreaElement ||
//   document.activeElement instanceof HTMLSelectElement ||
//   (document.activeElement instanceof HTMLInputElement && !allowedInputTypes.includes(document.activeElement.type));

const restoreFocus = (element: HTMLElement, cb?: () => void) => {
  // [element, x, y]
  const elements = [] as [HTMLElement, number, number][];
  const rootScrollingElement = document.scrollingElement || document.documentElement;
  let parent: HTMLElement = element.parentNode as HTMLElement;

  while (parent && parent !== rootScrollingElement) {
    if (parent.offsetHeight < parent.scrollHeight || parent.offsetWidth < parent.scrollWidth) {
      elements.push([parent, parent.scrollLeft, parent.scrollTop]);
    }
    parent = parent.parentNode as HTMLElement;
  }

  setTimeout(() => {
    for (const [element, scrollLeft, scrollTop] of elements) {
      element.scrollLeft = scrollLeft;
      element.scrollTop = scrollTop;
    }
    cb?.();
  }, 0);
};

const identifyItems = (data: ItemData[]) =>
  data.map((itemData) => {
    const cloneData = { ...itemData };
    cloneData.id ||= nanoid();
    cloneData.expandMenuItemData &&= identifyItems(cloneData.expandMenuItemData);
    return itemData;
  });

export const Items = defineComponent({
  name: 'Items',
  props: {
    data: {
      type: Array as PropType<ItemData[]>,
      default: () => [],
    },
  },
  emits: {
    'update:data': null as unknown as (newData: ItemData[]) => void,
    select: null as unknown as (data: ItemData) => void,
  },
  setup(props, { emit }) {
    const focusIndex = ref(-1);
    const dataWithId = ref<ItemData[]>(identifyItems(props.data));
    const elements = ref<HTMLElement[]>([]);

    onBeforeUpdate(() => {
      elements.value.length = 0;
    });

    const focusNext = (focusedByMouse = true) => {
      focusIndex.value = focusIndex.value >= dataWithId.value.length - 1 ? 0 : focusIndex.value + 1;
      handleAfterFocus(focusedByMouse);
    };

    const focusPrevious = (focusedByMouse = true) => {
      focusIndex.value = focusIndex.value <= 0 ? dataWithId.value.length - 1 : focusIndex.value - 1;
      handleAfterFocus(focusedByMouse);
    };

    const focusToIndex = (index: number, focusedByMouse = true) => {
      focusIndex.value = index;
      handleAfterFocus(focusedByMouse);
    };

    const handleAfterFocus = (focusedByMouse = true) => {
      restoreFocus(elements.value[focusIndex.value], () => {
        if (focusedByMouse) return;
        elements.value[focusIndex.value].scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'center',
        });
      });

      if (isInputing()) return;

      elements.value[focusIndex.value].focus();
    };

    const select = () => {
      const item = dataWithId.value[focusIndex.value];
      item.onSelect?.(item);
      emit('select', item);
    };

    const handleMouseEnter = (index: number) => {
      focusToIndex(index);
    };

    useKey('up', () => focusPrevious(false), { input: true, prevent: true, stop: true });
    useKey('down', () => focusNext(false), { input: true, prevent: true, stop: true });
    useKey('enter', select, { input: true, prevent: true, stop: true });
    useKey('space', select, { input: false, prevent: true, stop: true });

    const handleSelect = (index: number) => {
      dataWithId.value[index].onSelect?.(dataWithId.value[index]);
    };

    watch(
      () => props.data,
      () => {
        if (props.data !== dataWithId.value) {
          dataWithId.value = identifyItems(dataWithId.value);
          focusIndex.value = -1;
        }
      },
      {
        deep: true,
        immediate: true,
      },
    );

    const handleFocusIn = (event: FocusEvent) => {
      const { target } = event;
      if (!(target instanceof HTMLElement)) return;

      if (elements.value.includes(target)) {
        const index = elements.value.indexOf(target);
        focusIndex.value = index;
        return;
      }

      if (!target.hasAttribute('data-select---item')) {
        focusIndex.value = -1;
      }
    };

    onMounted(() => document.addEventListener('focusin', handleFocusIn));
    onUnmounted(() => document.removeEventListener('focusin', handleFocusIn));

    return {
      dataWithId,
      handleSelect,
      focusIndex,
      elements,
      focusToIndex,
      handleMouseEnter,
    };
  },
  render() {
    const items = this.dataWithId.map((data, index) => {
      const Tag = (data.wrapperElementTag || 'div') as 'div';

      return (
        <Tag
          class={[
            'select-item',
            {
              'select-item-focused': this.focusIndex === index,
            },
          ]}
          key={data.id}
          onClick={() => this.handleSelect(index)}
          onMouseenter={() => this.handleMouseEnter(index)}
          tabindex={0}
          data-select---item
          ref={(instance: any) => (this.elements[index] = instance)}
          {...(data.wrapperElementAttributes || {})}
        >
          {this.$slots.render?.(data)}
        </Tag>
      );
    });

    return items;
  },
});
