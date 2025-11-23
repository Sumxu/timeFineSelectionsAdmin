<script setup lang="ts">
import "@wangeditor/editor/dist/css/style.css";
import { Editor, Toolbar } from "@wangeditor/editor-for-vue";
import { shallowRef, ref, onBeforeUnmount, watch } from "vue";

defineOptions({ name: "BaseEditor" });

// props 支持 v-model
const props = defineProps<{ modelValue: string }>();
const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
}>();

const mode = "default";
// 编辑器实例
const editorRef = shallowRef();
const toolbarConfig: any = { excludeKeys: "fullScreen" };
const editorConfig = { placeholder: "请输入内容..." };

// 内部绑定值
const valueHtml = ref(props.modelValue || "");

// 监听内部变化，发事件给父组件
watch(valueHtml, (val) => {
  emit("update:modelValue", val);
});

// 监听父组件传入值变化，更新编辑器内容
watch(
  () => props.modelValue,
  (val) => {
    if (val !== valueHtml.value) valueHtml.value = val || "";
  }
);

const handleCreated = (editor: any) => {
  editorRef.value = editor;
};

// 组件销毁时销毁编辑器实例
onBeforeUnmount(() => {
  if (editorRef.value) editorRef.value.destroy();
});
</script>

<template>
  <div class="wangeditor">
    <Toolbar
      :editor="editorRef"
      :defaultConfig="toolbarConfig"
      :mode="mode"
      style="border-bottom: 1px solid #ccc"
    />
    <Editor
      v-model="valueHtml"
      :defaultConfig="editorConfig"
      :mode="mode"
      style="height: 500px; overflow-y: hidden"
      @onCreated="handleCreated"
    />
  </div>
</template>
