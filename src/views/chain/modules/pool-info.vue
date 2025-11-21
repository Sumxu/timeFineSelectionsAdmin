<script setup lang="ts">
import { reactive, ref, computed } from "vue";
import message from "@/utils/message";
const formRef = ref();

import factoryAbi from "@/abi/factory-abi";
import { toWei, callContractMethod } from "@/utils/wallet";
import { contractAddress } from "@/config/contract";

const pageData: any = reactive({
  mode: "add",
  modalParam: {
    visible: false,
    title: ""
  },
  formParam: {
    infoForm: {},
    loading: false
  },
  dataSource: {}
});

const formFields = computed(() => {
  const fields: any[] = [
    {
      type: "number",
      label: "价值",
      prop: "value",
      placeholder: "请输入价值",
      precision: 0,
      step: 1
    },
    {
      type: "number",
      label: "铸造次数",
      prop: "number",
      placeholder: "请输入铸造次数",
      precision: 0,
      step: 1
    },
    {
      type: "number",
      label: "每次铸造UT",
      prop: "numberPer",
      precision: 2,
      step: 1
    },
    {
      type: "number",
      label: "每次铸造额度",
      prop: "numberQuota",
      precision: 2,
      step: 1
    },
    {
      type: "select",
      label: "状态",
      prop: "status",
      placeholder: "请选择状态",
      dataSourceKey: "statusOptions",
      options: {
        clearable: true,
        filterable: true,
        keys: {
          prop: "value",
          value: "value",
          label: "label"
        }
      }
    }
  ];

  return fields;
});

const formRules = computed(() => {
  const rule: any = {
    value: [{ required: true, message: "请填写价值", trigger: "blur" }],
    number: [{ required: true, message: "请填写铸造次数", trigger: "blur" }],
    numberPer: [
      { required: true, message: "请填写每次铸造UT", trigger: "blur" }
    ],
    numberQuota: [
      { required: true, message: "请填写每次铸造额度", trigger: "blur" }
    ],
    status: [{ required: true, message: "请选择状态", trigger: "blur" }]
  };
  return rule;
});

const disabledFields = computed(() => (item: any) => {
  if (pageData.mode === "add") {
    return false;
  }
  if (pageData.mode === "detail") {
    return true;
  }
  return false;
});

const open = (row: any, dataSource: any) => {
  pageData.dataSource = dataSource;
  if (row == null) {
    pageData.mode = "add";
    pageData.modalParam.title = "新增";
    initData();
    //初始化
  } else {
    pageData.mode = "update";
    pageData.modalParam.title = "修改";
    //请求数据
    getInfo(row);
  }
  pageData.modalParam.visible = true;
};

const initData = () => {};

const getInfo = (row: any) => {
  const fixed = {
    ...row
  };
  Object.assign(pageData.formParam.infoForm, fixed);
};

const _handleClose = () => {
  pageData.formParam.loading = false;
  pageData.modalParam.visible = false;
  emits("confirm");
};

const handleCancel = () => {
  pageData.formParam.loading = false;
  pageData.modalParam.visible = false;
};

const handleConfirm = () => {
  formRef.value!.validate((isValid: boolean) => {
    if (isValid) {
      if (pageData.mode === "add") {
        save();
      } else {
        update();
      }
    }
  });
};

const save = () => {};
const update = async () => {
  pageData.formParam.loading = true;
  const params = pageData.formParam.infoForm;

  try {
    const rewardTx = await callContractMethod(
      contractAddress.FactoryContract,
      factoryAbi.abi,
      "updatePool",
      [
        params.poolId,
        toWei(params.value),
        params.number,
        toWei(params.numberPer),
        toWei(params.numberQuota),
        params.status
      ],
      true
    );

    message.success("修改成功");
    _handleClose();
  } catch (error) {
    message.error("修改失败:" + error.message);
  } finally {
    pageData.formParam.loading = false;
  }
};

const emits = defineEmits(["close", "confirm"]);
defineExpose({ open });
</script>

<template>
  <div>
    <el-dialog
      v-model="pageData.modalParam.visible"
      :title="pageData.modalParam.title"
      destroy-on-close
      :width="500"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      class="el-dialog-header"
      :before-close="_handleClose"
    >
      <el-form
        ref="formRef"
        :model="pageData.formParam.infoForm"
        :rules="formRules"
        :inline="true"
      >
        <el-form-item
          v-for="(item, index) in formFields"
          :key="index"
          :label="item.label"
          :prop="item.prop"
          class="form-row"
        >
          <template v-if="item.type === 'input'">
            <el-input
              v-model="pageData.formParam.infoForm[item.prop]"
              clearable
              :type="item.options?.type ?? 'text'"
              :disabled="disabledFields(item)"
            />
          </template>

          <template v-if="item.type === 'number'">
            <el-input-number
              v-model="pageData.formParam.infoForm[item.prop]"
              :precision="item.precision"
              :step="item.precision"
              :disabled="disabledFields(item)"
            />
          </template>

          <template v-if="item.type === 'switch'">
            <el-switch
              v-model="pageData.formParam.infoForm[item.prop]"
              class="ml-2"
              style="
                --el-switch-on-color: #13ce66;
                --el-switch-off-color: #ff4949;
              "
              :active-value="1"
              :inactive-value="2"
              :disabled="disabledFields(item)"
            />
          </template>
          <template v-else-if="item.type === 'select'">
            <el-select
              v-model="pageData.formParam.infoForm[item.prop]"
              :filterable="item.options?.filterable ?? true"
              :clearable="item.options?.clearable ?? true"
              :placeholder="item.placeholder"
              style="width: 100%"
              :disabled="disabledFields(item)"
            >
              <el-option
                v-for="su in pageData.dataSource[item.dataSourceKey]"
                :key="su[item.options?.keys?.prop ?? 'value']"
                :label="su[item.options?.keys?.label ?? 'label']"
                :value="su[item.options?.keys?.value ?? 'value']"
              />
            </el-select>
          </template>
          <template v-if="item.type === 'time'">
            <el-date-picker
              v-model="pageData.formParam.infoForm[item.prop]"
              type="datetime"
              placeholder="选择时间"
            />
          </template>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button
          v-loading="pageData.formParam.loading"
          type="primary"
          plain
          @click="handleConfirm"
          >提 交</el-button
        >
        <el-button style="margin-left: 10px" @click="handleCancel"
          >关闭</el-button
        >
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped></style>
