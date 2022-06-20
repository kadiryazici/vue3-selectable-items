<script setup lang="ts">
import { Items } from '@/components/Items';
import { ref } from 'vue';

const data = ref([
  {
    label: 'Bruh',
    onSelect: console.log,
  },
  {
    label: 'Hello',
    onSelect: console.log,
  },
  {
    label: 'Man',
    onSelect: console.log,
  },
  {
    label: 'Man',
    onSelect: console.log,
  },
  {
    label: 'Man',
    onSelect: console.log,
  },
  {
    label: 'Man',
    onSelect: console.log,
  },
  {
    label: 'Man',
    onSelect: console.log,
  },
]);
</script>

<template>
  <button>Yes</button>
  <input
    type="text"
    placeholder="test input"
  />
  <div class="items-wrapper">
    <Items v-model:data="data">
      <template #render="renderData">
        <b>{{ renderData.label }}</b>
      </template>
    </Items>
  </div>
</template>

<style lang="scss">
* {
  font-family: Arial, Helvetica, sans-serif;
  box-sizing: border-box;
  padding: 0;
  margin: 0;
}

.items-wrapper {
  width: 300px;
  border: 1px solid rgb(160, 160, 160);
  margin: 50px;
  border-radius: 5px;
  overflow: hidden;
  height: 100px;
  overflow: auto;
}

.select-item {
  width: 100%;
  display: flex;
  height: 30px;
  align-items: center;
  padding: 5px;

  &-focused {
    background-color: rgb(178, 178, 178);
  }
}
</style>
