<script setup lang="ts">
import { reactive } from "vue";
import * as $crowdfApi from "@/api/member/crowdf";
import { ref } from "vue";
import message from "@/utils/message";
defineOptions({
  name: "editDialog"
});
const formRef = ref();
const pageData: any = reactive({
  mode: "add",
  modalParam: {
    visible: false,
    title: "新增网点机构",
    closeOnclickModal: false
  },
  formParam: {
    fields: [
      {
        type: "input",
        label: "设置增长比例",
        prop: "value",
        placeholder: "请输入设置增长比例"
      }
    ],
    infoFrom: {},
    rules: {
      value: []
    },
    loading: false
  },
  dataSource: {}
});
const initModal = () => {
  pageData.modalParam.closeOnclickModal = false;
  pageData.formParam.infoFrom = {};
  pageData.mode = "add";
  pageData.formParam.loading = false;
};
const _handleClose = () => {
  initModal();
  emits("close");
  pageData.modalParam.visible = false;
};
const open = (form: any, val: any, title: string) => {
  pageData.mode = title;
  pageData.dataSource = val;
  pageData.formParam.infoFrom = form;
  if (val == 1) {
    //增长比例
    pageData.formParam.rules.value = [
      { required: true, message: "请设置增长比例", trigger: "blur" }
    ];
  } else {
    //设置首期比例
    pageData.formParam.rules.value = [
      { required: true, message: "请设置首期比例", trigger: "blur" },
      {
        validator: (rule, value, callback) => {
          if (value === undefined || value === null || value === '') {
            callback(new Error("请设置首期比例"));
          } else if (Number(value) < 1 || Number(value) > 1000) {
            callback(new Error("首期比例需在 1-1000 之间"));
          } else {
            callback();
          }
        },
        trigger: "blur"
      }
    ];
  }
  pageData.modalParam.visible = true;
};
const handleCancel = () => {
  initModal();
  emits("close");
  pageData.modalParam.visible = false;
};
const handleConfirm = () => {
  formRef.value!.validate((isValid: boolean) => {
    if (isValid) {
      if (pageData.dataSource == 1) {
        setIncreaseRateFn();
      } else {
        setInitRateFn()
      }
    }
  });
};
const setInitRateFn = () => {
  pageData.formParam.loading = true;
  const data = pageData.formParam.infoFrom;
  $crowdfApi
    .setInitRate({
      value:data.value
    })  
    .then(res => {
      if (res.code === 200) {
        message.success("修改成功");
        pageData.modalParam.visible = false;
        emits("confirm");
      } else {
        message.error(res.message);
      }
    })
    .finally(() => {
      pageData.formParam.loading = false;
    });
};

const setIncreaseRateFn = () => {
  pageData.formParam.loading = true;
  const data = pageData.formParam.infoFrom;
  console.log("data=", data);
  $crowdfApi
    .setIncreaseRate({
      value:data.value
    })
    .then(res => {
      if (res.code === 200) {
        message.success("修改成功");
        pageData.modalParam.visible = false;
        emits("confirm");
      } else {
        message.error(res.message);
      }
    })
    .finally(() => {
      pageData.formParam.loading = false;
    });
};
const emits = defineEmits(["close", "confirm"]);
defineExpose({
  open
});
</script>

<template>
  <div>
    <el-drawer v-model="pageData.modalParam.visible" :title="pageData.modalParam.title" destroy-on-close modal
      :close-on-click-modal="pageData.modalParam.closeOnclickModal" :before-close="_handleClose">
      <template #header>
        <span style="font-weight: 700">{{ pageData.mode }}</span>
      </template>
      <el-form :model="pageData.formParam.infoFrom" :rules="pageData.formParam.rules" label-position="right"
        ref="formRef" v-loading="pageData.formParam.loading">
        <el-row class="form-row">
          <el-col :span="24">
            <el-form-item label="设置增长比例" prop="value">
              <el-input v-model="pageData.formParam.infoFrom['value']" clearable />
            </el-form-item>
          </el-col>
          <el-alert title="100 =1%  1000=10%" type="success" :closable="false" effect="dark">
          </el-alert>
        </el-row>
      </el-form>
      <template #footer>
        <el-button plain @click="handleCancel">取 消</el-button>
        <el-button type="primary" @click="handleConfirm" plain v-loading="pageData.formParam.loading">确 定</el-button>
      </template>
    </el-drawer>
  </div>
</template>

<style scoped>
:deep(.el-drawer .el-drawer__body) {
  border-top: 1px solid #e8e8e8 !important;
}

:deep(.el-drawer .el-drawer__footer) {
  border-top: 1px solid #e8e8e8 !important;
}

.form-row {
  margin-bottom: 20px;
}
</style>
