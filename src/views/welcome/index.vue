<script setup lang="ts">
import message from "@/utils/message";
import { onMounted, reactive, ref, h } from "vue";
import { contractAddress } from "@/config/contract";
import factoryAbi from "@/abi/factory-abi";
import erc20Abi from "@/abi/erc20-abi";
import * as $homeApi from "@/api/home/home";
import { fromWei, callContractMethod, getBalance } from "@/utils/wallet";
import { ethers } from "ethers";
const addressListRef = ref();
const poolInfoRef = ref();

onMounted(() => {
    _getBalance();
    _getHomeStatistics();
});

const pageData: any = reactive({
  usdtBalance: 0,
  caBalance: 0,
  bnbWithdrawBalance: 0,
  bnbBalance: 0,
  CrowdFundingBalance: 0,
  dayNodeAmount: 0,
  dayTicketAmount: 0,
  todayNodeAmount: 0,
  todayTicketAmount: 0
})

const _getBalance = async () => {
  const usdtBalance = await callContractMethod(
    contractAddress.Usdt_Address,
    erc20Abi.abi,
    "balanceOf",
    [contractAddress.FactoryContract],
    false
  );
  pageData.usdtBalance = fromWei(usdtBalance);
  const caBalance = await callContractMethod(
    contractAddress.Ca_Address,
    erc20Abi.abi,
    "balanceOf",
    [contractAddress.FactoryContract],
    false
  );

  pageData.caBalance = fromWei(caBalance);

  const bnbWithdrawBalance = await getBalance(contractAddress.BnB_Withdraw_Address);
  console.log("bnbWithdrawBalance",bnbWithdrawBalance)
  pageData.bnbWithdrawBalance = fromWei(bnbWithdrawBalance);

  const bnbBalance = await getBalance(contractAddress.BnB_Address);

  pageData.bnbBalance = fromWei(bnbBalance);

  const CrowdFundingBalance = await getBalance(contractAddress.Crowd_Funding_Address);

  pageData.CrowdFundingBalance = fromWei(CrowdFundingBalance);
}
const _getHomeStatistics = () => {
  $homeApi.queryHome().then(res => {
    if(res.success){
      pageData.dayNodeAmount=res.data.dayNodeAmount
      pageData.dayTicketAmount=res.data.dayTicketAmount
      pageData.todayNodeAmount=res.data.todayNodeAmount
      pageData.todayTicketAmount=res.data.todayTicketAmount
    }
  })
}
</script>

<template>
  <div>
    <el-space wrap>
    <el-card class="box-card" style="width: 320px">
      <template #header>
        <div class="card-header">
          <span>代理合约USDT余额</span>
        </div>
      </template>
      <div class="text item">
        <span>{{ pageData.usdtBalance }} USDT</span>
      </div>
    </el-card>
    <el-card class="box-card" style="width: 320px">
      <template #header>
        <div class="card-header">
          <span>代理合约CA余额</span>
        </div>
      </template>
      <div class="text item">
        <span>{{ pageData.caBalance }} CA</span>
      </div>
    </el-card>

    <el-card class="box-card" style="width: 320px">
      <template #header>
        <div class="card-header">
          <span>自动提现账户BNB余额</span>
        </div>
      </template>
      <div class="text item">
        <span>{{ pageData.bnbWithdrawBalance }} BNB</span>
      </div>
    </el-card>


    <el-card class="box-card" style="width: 320px">
      <template #header>
        <div class="card-header">
          <span>上链账户BNB余额</span>
        </div>
      </template>
      <div class="text item">
        <span>{{ pageData.bnbBalance }} BNB</span>
      </div>
    </el-card>

    <el-card class="box-card" style="width: 320px">
      <template #header>
        <div class="card-header">
          <span>众筹上链 BNB余额</span>
        </div>
      </template>
      <div class="text item">
        <span>{{ pageData.CrowdFundingBalance }} BNB</span>
      </div>
    </el-card>
  </el-space>


  <el-space wrap style="margin-top: 24px;">
    <el-card class="box-card" style="width: 320px">
      <template #header>
        <div class="card-header">
          <span>昨日节点业绩</span>
        </div>
      </template>
      <div class="text item">
        <span>{{ fromWei(pageData.todayNodeAmount) }}</span>
      </div>
    </el-card>
    <el-card class="box-card" style="width: 320px">
      <template #header>
        <div class="card-header">
          <span>今日节点业绩</span>
        </div>
      </template>
      <div class="text item">
        <span>{{ fromWei(pageData.dayNodeAmount)  }}</span>
      </div>
    </el-card>

    <el-card class="box-card" style="width: 320px">
      <template #header>
        <div class="card-header">
          <span>昨日门票业绩</span>
        </div>
      </template>
      <div class="text item">
        <span>{{ fromWei(pageData.todayTicketAmount)  }}</span>
      </div>
    </el-card>


    <el-card class="box-card" style="width: 320px">
      <template #header>
        <div class="card-header">
          <span>今日门票业绩</span>
        </div>
      </template>
      <div class="text item">
        <span>{{ fromWei(pageData.dayTicketAmount) }}</span>
      </div>
    </el-card>
  </el-space>
  </div>
</template>

<style lang="scss" scoped></style>
