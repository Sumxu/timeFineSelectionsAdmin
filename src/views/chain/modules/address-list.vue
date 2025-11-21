  <script setup lang="ts">
import { reactive, ref } from "vue";

import message from "@/utils/message";
import { PureTable } from "@pureadmin/table";

import { Delete } from "@element-plus/icons-vue";
import { useColumns } from "./columns";
const { columns, dataList, onAdd, onDel } = useColumns();

import factoryAbi from "@/abi/factory-abi";
import { contractAddress } from "@/config/contract";
import { isValidAddress, callContractMethod } from "@/utils/wallet";

const pageData: any = reactive({
  modalParam: {
    visible: false,
    title: "批量设置白名单"
  },
  web3: null,
  status: true,
  submitLoading: false,
  // 搜索Data
  searchForm: {}
});

const open = web3 => {
  pageData.web3 = web3;
  pageData.modalParam.visible = true;
};

const initData = () => {
  pageData.modalParam.visible = false;
  dataList.value = [];
};

const _handleClose = () => {
  initData();
  emits("close");
};

const _handleSubmit = async () => {
  const list = dataList.value;

  if (list.length < 1) {
    message.error("请填写一条以上的修改记录");
    return;
  }

  const addressList = [];

  list.forEach(item => {
    if (!isValidAddress(item.address)) {
      message.error(item.address + "地址格式不正确，请确认");
      return;
    }

    addressList.push(item.address);
  });

  pageData.submitLoading = true;

  try {
    const rewardTx = await callContractMethod(
      contractAddress.FactoryContract,
      factoryAbi.abi,
      "setExcludeAddress",
      [addressList, pageData.status],
      true
    );
    _handleClose();
    message.success("修改成功");
  } catch (error) {
    message.error("上链失败");
  } finally {
    pageData.submitLoading = false;
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
      :width="800"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      class="el-dialog-header"
    >
      <el-row style="margin-bottom: 10px">
        <el-button type="primary" @click="onAdd">添加地址</el-button>
        <el-radio-group v-model="pageData.status" style="margin-left: 20px">
          <el-radio :value="true" size="large">设置白名单</el-radio>
          <el-radio :value="false" size="large">取消白名单</el-radio>
        </el-radio-group>
      </el-row>
      <!--table-->
      <pure-table
        :data="dataList"
        :columns="columns"
        align-whole="center"
        row-key="id"
        border
        stripe
        :header-row-class-name="'table-header'"
      >
        <template #operation="{ row }">
          <el-button type="danger" :icon="Delete" circle @click="onDel(row)" />
        </template>
      </pure-table>

      <template #footer>
        <el-button plain @click="_handleClose">关闭</el-button>

        <el-button
          type="primary"
          :loading="pageData.submitLoading"
          @click="_handleSubmit"
        >
          提交
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped></style>
