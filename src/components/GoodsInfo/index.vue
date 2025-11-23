<script setup lang="ts">
import { reactive, ref, watch } from "vue";
import { ElMessageBox } from "element-plus";
import Upload from "@/components/upload/index.vue";
import EditorBase from "@/components/EditorBase/index.vue";

// props 类型
interface GoodsInfoProps {
    visible: boolean;
    initialData?: {
        id?: number;
        name?: string;
        pic?: string[];
        merchantAddress?: string;
        merchantName?: string;
        isHome?: boolean;
        classify?: string | number;
    };
    classifyOptions?: Record<string, string>;
}

// props
const props = defineProps<GoodsInfoProps>();

// emit
const emit = defineEmits<{
    (e: "update:visible", value: boolean): void;
    (e: "submit", data: any): void;
}>();

// 弹窗内部可控的显示状态
const innerVisible = ref(props.visible);

// 同步父组件 visible
watch(
    () => props.visible,
    (val) => {
        innerVisible.value = val;
    }
);

// 当内部状态变化时通知父组件
watch(innerVisible, (val) => {
    emit("update:visible", val);
});

// 表单数据
const formData = reactive({
    id: undefined as number | undefined,
    name: "",
    pic: [] as string[],
    merchantAddress: "",
    merchantName: "",
    isHome: false,
    classify: "",
     content: ""  // 新增字段
});

// watch 初始数据变化（编辑或新增）
 watch(
  () => props.initialData,
  (newData) => {
    if (newData) Object.assign(formData, { ...newData, details: newData.details || "" });
    else {
      formData.id = undefined;
      formData.name = "";
      formData.pic = [];
      formData.merchantAddress = "";
      formData.merchantName = "";
      formData.isHome = false;
      formData.classify = "";
      formData.details = "";
    }
  },
  { immediate: true }
);

// 关闭弹窗前确认
const handleBeforeClose = (done: () => void) => {
    ElMessageBox.confirm("确定要关闭吗？未保存的数据将丢失")
        .then(() => done())
        .catch(() => { });
};

// 取消按钮
const handleCancel = () => {
    handleBeforeClose(() => {
        innerVisible.value = false;
    });
};

// 提交表单
const handleSubmit = () => {
    emit("submit", { ...formData });
    innerVisible.value = false;
};
</script>

<template>
    <el-dialog v-model="innerVisible" style="height: 700px;overflow-y: scroll;" title="商品信息" width="800px"
        :before-close="handleBeforeClose">
        <el-form label-width="100px">
            <el-form-item label="名称">
                <el-input v-model="formData.name" placeholder="请输入商品名称" />
            </el-form-item>

            <el-form-item label="商户地址">
                <el-input v-model="formData.merchantAddress" placeholder="请输入商户地址" />
            </el-form-item>

            <el-form-item label="商户名称">
                <el-input v-model="formData.merchantName" placeholder="请输入商户名称" />
            </el-form-item>

            <el-form-item label="是否首页">
                <el-select v-model="formData.isHome" placeholder="请选择">
                    <el-option label="是" :value="true" />
                    <el-option label="否" :value="false" />
                </el-select>
            </el-form-item>

            <el-form-item label="分类">
                <el-select v-model="formData.classify" placeholder="请选择分类">
                    <el-option v-for="(label, key) in props.classifyOptions" :key="key" :label="label" :value="key" />
                </el-select>
            </el-form-item>

            <el-form-item label="封面图片">
                <Upload v-model="formData.pic" :limit="5" accept="image" type="image" label="上传封面" :show-list="true" />
            </el-form-item>
            <el-form-item label="富文本">
                <EditorBase v-model="formData.details" />
            </el-form-item>
            <template #footer>
                <div class="dialog-footer">
                    <el-button @click="handleCancel">取消</el-button>
                    <el-button type="primary" @click="handleSubmit">提交</el-button>
                </div>
            </template>
        </el-form>
    </el-dialog>
</template>
