<script setup lang="ts">
import message from "@/utils/message";
import { onMounted, reactive, ref, h } from "vue";
import { contractAddress } from "@/config/contract";
import factoryAbi from "@/abi/factory-abi";
import erc20Abi from "@/abi/erc20-abi";
import { fromWei, callContractMethod } from "@/utils/wallet";

const addressListRef = ref();
const poolInfoRef = ref();

onMounted(async () => {
  await _getBalance();
});

const pageData: any = reactive({
  usdtBalance: 0,
  utBalance: 0
});

const _getBalance = async () => {
  const usdtBalance = await callContractMethod(
    contractAddress.Usdt_Address,
    erc20Abi.abi,
    "balanceOf",
    [contractAddress.FactoryContract],
    false
  );
  pageData.usdtBalance = fromWei(usdtBalance);

  const utBalance = await callContractMethod(
    contractAddress.Ut_Address,
    erc20Abi.abi,
    "balanceOf",
    [contractAddress.FactoryContract],
    false
  );
  pageData.utBalance = fromWei(utBalance);
  console.log("usdtBalance", usdtBalance);
  console.log("utBalance", utBalance);
};

</script>

<template>
  <el-space wrap>
    <el-card class="box-card" style="width: 320px">
      <template #header>
        <div class="card-header">
          <span>代理合约USDT余额</span>
        </div>
      </template>
      <div class="text item">
        <span>{{ pageData.usdtBalance }} U</span>
      </div>
    </el-card>
    <el-card class="box-card" style="width: 320px">
      <template #header>
        <div class="card-header">
          <span>代理合约UT余额</span>
        </div>
      </template>
      <div class="text item">
        <span>{{ pageData.utBalance }} U</span>
      </div>
    </el-card>
  </el-space>
</template>

<style lang="scss" scoped></style>
