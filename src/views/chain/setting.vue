<script setup lang="ts">
import message from "@/utils/message";
import { onMounted, reactive, ref, h } from "vue";

import AddressList from "./modules/address-list.vue";
import PoolInfo from "./modules//pool-info.vue";

import factoryAbi from "@/abi/factory-abi";
import { contractAddress } from "@/config/contract";
import { fromWei, callContractMethod } from "@/utils/wallet";
import { ElMessageBox, ElInputNumber } from "element-plus";

const addressListRef = ref();
const poolInfoRef = ref();

onMounted(async () => {
  await _loadFee();
  await _loadData();
});

const pageData: any = reactive({
  buyFee: 0,
  sellFee: 0,
  dataSource: {
    statusOptions: [
      { label: "关闭", value: 0 },
      { label: "开启", value: 1 },
      { label: "暂停", value: 2 }
    ]
  },
  tableParams: {
    columns: [
      {
        label: "价值",
        prop: "value",
        minWidth: "100px",
        slot: "amountScope"
      },
      {
        label: "铸造次数",
        prop: "number",
        minWidth: "100px"
      },
      {
        label: "每次铸造UT",
        prop: "numberPer",
        minWidth: "100px",
        slot: "amountScope"
      },
      {
        label: "每次铸造利润",
        prop: "numberProfit",
        minWidth: "100px",
        slot: "amountScope"
      },
      {
        label: "每次铸造额度",
        prop: "numberQuota",
        minWidth: "100px",
        slot: "amountScope"
      },
      {
        label: "状态",
        prop: "status",
        minWidth: "100px",
        slot: "statusScope"
      },
      {
        label: "操作",
        fixed: "right",
        slot: "operation",
        width: "100px"
      }
    ],
    list: [],
    /*加载 */
    loading: false
  }
});

const _loadFee = async () => {
  const buyFee = await callContractMethod(
    contractAddress.FactoryContract,
    factoryAbi.abi,
    "buyFee",
    [],
    false
  );

  pageData.buyFee = buyFee / 100n;

  const sellFee = await callContractMethod(
    contractAddress.FactoryContract,
    factoryAbi.abi,
    "sellFee",
    [],
    false
  );

  pageData.sellFee = sellFee / 100n;
};

const setFee = () => {
  const buyFee = ref<number | null>(null);
  const sellFee = ref<number | null>(null);

  ElMessageBox({
    title: "设置费率",
    message: () =>
      h("div", [
        h(ElInputNumber, {
          modelValue: buyFee.value,
          placeholder: "买税率",
          style: "width: 100%; margin-bottom: 10px;",
          min: 0,
          "onUpdate:modelValue": value => {
            buyFee.value = value;
          }
        }),

        h(ElInputNumber, {
          modelValue: sellFee.value,
          placeholder: "卖税率",
          style: "width: 100%; margin-bottom: 10px;",
          min: 0,
          "onUpdate:modelValue": value => {
            sellFee.value = value;
          }
        })
      ]),
    showCancelButton: true,
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    beforeClose: async (action, instance, done) => {
      if (action === "confirm") {
        if (buyFee.value == null || sellFee.value == null) {
          message.error("请填写完整信息！");
          return;
        }

        instance.confirmButtonLoading = true;
        instance.confirmButtonText = "上链中...";

        try {
          const rewardTx = await callContractMethod(
            contractAddress.FactoryContract,
            factoryAbi.abi,
            "setFee",
            [buyFee.value * 100, sellFee.value * 100],
            true
          );

          await _loadFee();
          message.success("上链成功");
        } catch (error) {
          message.error("上链失败");
        } finally {
          instance.confirmButtonLoading = false;
          instance.confirmButtonText = "确定";
        }
      } else {
        done();
      }
    }
  });
};

const addWhite = () => {
  addressListRef.value.open(pageData.web3);
};

const _loadData = async () => {
  pageData.tableParams.loading = true;

  // 生成 0 ~ 2
  const poolIds = Array.from({ length: 3 }, (_, i) => i);

  // 并发查询，并等待所有结果
  const list = await Promise.all(
    poolIds.map(async id => {
      const pool = await callContractMethod(
        contractAddress.FactoryContract,
        factoryAbi.abi,
        "poolList",
        [id],
        false
      );
      return {
        poolId: id,
        value: Number(fromWei(pool[0])),
        number: Number(pool[1]),
        numberPer: Number(fromWei(pool[2])),
        numberProfit: Number(fromWei(pool[3])),
        numberQuota: Number(fromWei(pool[4])),
        status: Number(pool[5])
      };
    })
  );

  pageData.tableParams.list = list;
  pageData.tableParams.loading = false;
};

const handleUpdate = row => {
  poolInfoRef.value.open(row, pageData.dataSource);
};
</script>

<template>
  <el-card :shadow="'never'">
    
  </el-card>
</template>
