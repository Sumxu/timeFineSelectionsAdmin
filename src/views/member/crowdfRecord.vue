<script setup lang="ts">
import { reactive, onMounted } from "vue";
import FormSearch from "@/components/opts/form-search.vue";
import TableButtons from "@/components/opts/btns2.vue";
import StatusTabs from "@/components/opts/status-tabs.vue";
import { PureTable } from "@pureadmin/table";
import * as $crowdfRecordApi from "@/api/member/crowdfRecord";
import message from "@/utils/message";
import { formatAddress, formatDate, fromWei } from "@/utils/wallet";

const pageData: any = reactive({
  searchState: true,
  searchForm: {},
  searchStatus: "null",
  searchField: [
    {
      type: "input",
      label: "钱包地址",
      prop: "address",
      placeholder: "请输入钱包地址"
    }
  ],
  dataSource: {},
  permission: {
    query: ["member:exchange:page"]
  },
  btnOpts: {
    size: "small",
    leftBtns: [],
    rightBtns: [
      { key: "search", label: "查询", icon: "ep:search", state: true },
      { key: "refresh", label: "刷新", icon: "ep:refresh", state: true }
    ]
  },
  tabsOpts: [
    { label: "全部", name: "null" },
    { label: "GenToUsdt", name: 0 },
    { label: "UsdtToGen ", name: 1 },
    { label: "UtToUsdt", name: 2 }
  ],
  tableParams: {
    columns: [
      { label: "钱包地址", prop: "address", width: "370px" },
      { label: "期数", prop: "crowdfNo" },
      { label: "状态", prop: "status", slot: "statusScope" },
      { label: "总预约额", prop: "crowdfAmount", width: "180px", slot: "crowdfAmountScope" },
      { label: "总参与额", prop: "applyAmount", width: "180px", slot: "applyAmountScope" },
      { label: "参与额", prop: "partakeAmount", width: "180px", slot: "partakeAmountScope" },
      { label: "赎回本金", prop: "backAmount", width: "180px", slot: "backAmountScope" },
      { label: "收益总额", prop: "profitAmount", width: "180px", slot: "profitAmountScope" },
      { label: "本金总补偿", prop: "compensateAmount", width: "180px", slot: "compensateAmountScope" },
      { label: "赠送矿机总价值", prop: "compensateMiner", width: "180px", slot: "compensateMinerScope" },
      { label: "参与时间", prop: "blockTime", width: "180px", slot: "blockTimeScope" }
    ],
    list: [],
    loading: false,
    pagination: {
      pageSize: 10,
      defaultPageSize: 10,
      currentPage: 1,
      total: 0,
      background: true
    }
  }
});

// 搜索表单变化
const _updateSearchFormData = (data: any) => (pageData.searchForm = data);

// 查询
const _searchForm = (data: any) => {
  pageData.searchForm = data;
  _loadData();
};

// 重置
const _resetSearchForm = (data?) => (pageData.searchForm = data);

// 获取分页参数
const getQueryParams = () => ({
  ...pageData.searchForm,
  current: pageData.tableParams.pagination.currentPage,
  size: pageData.tableParams.pagination.pageSize,
});

// 获取表格数据
const _loadData = (page?: number) => {
  pageData.tableParams.loading = true;
  const query = getQueryParams();
  if (page) query.current = page;

  $crowdfRecordApi
    .queryPage(query)
    .then((res: any) => {
      if (res.code === 200) {
        pageData.tableParams.list = res.data.records;
        pageData.tableParams.pagination.total = Number(res.data.total);
      } else {
        message.warning(res.msg);
        pageData.tableParams.list = [];
        pageData.tableParams.pagination.total = 0;
      }
    })
    .finally(() => (pageData.tableParams.loading = false));
};

// 分页切换
const handleChangePageSize = (val: any) => {
  pageData.tableParams.pagination.pageSize = val;
  _loadData();
};

const handleChangeCurrentPage = (val: any) => {
  pageData.tableParams.pagination.currentPage = val;
  _loadData();
};

// 按钮操作
const btnClickHandle = (key: string) => {
  switch (key) {
    case "search":
      pageData.searchState = !pageData.searchState;
      break;
    case "refresh":
      _loadData();
      break;
  }
};

const handleClick = (tabName: any) => {
  pageData.searchStatus = tabName;
  _loadData();
};

onMounted(() => _loadData());
</script>

<template>
  <el-card :shadow="'never'">
    <form-search :show="pageData.searchState" :form-field="pageData.searchField" :data-source="pageData.dataSource"
      @search-form="_updateSearchFormData" @search="_searchForm" @reset="_resetSearchForm" />
    <table-buttons :size="pageData.btnOpts.size" :left-btns="pageData.btnOpts.leftBtns"
      :right-btns="pageData.btnOpts.rightBtns" @click="btnClickHandle" />

    <pure-table :data="pageData.tableParams.list" :columns="pageData.tableParams.columns" row-key="id" border stripe
      :loading="pageData.tableParams.loading" :pagination="pageData.tableParams.pagination"
      @page-current-change="handleChangeCurrentPage" @page-size-change="handleChangePageSize">


      <template #crowdfAmountScope="scope">
        <span>{{ fromWei(scope.row[scope.column.property]) }}</span>
      </template>
      <template #partakeAmountScope="scope">
        <span>{{ fromWei(scope.row[scope.column.property]) }}</span>
      </template>

      <template #backAmountScope="scope">
        <span>{{ fromWei(scope.row[scope.column.property]) }}</span>
      </template>
      <template #profitAmountScope="scope">
        <span>{{ fromWei(scope.row[scope.column.property]) }}</span>
      </template>
      <template #compensateAmountScope="scope">
        <span>{{ fromWei(scope.row[scope.column.property]) }}</span>
      </template>
      <template #applyAmountScope="scope">
        <span>{{ fromWei(scope.row[scope.column.property]) }}</span>
      </template>
      <template #compensateMinerScope="scope">
        <span>{{ fromWei(scope.row[scope.column.property]) }}</span>
      </template>
      <template #blockTimeScope="scope">
        <span>{{ formatDate(scope.row[scope.column.property]).dateTime }}</span>
      </template>
      <template #statusScope="scope">
        <span v-if="scope.row.status == 1">众筹成功</span>
        <span v-if="scope.row.status == 2">众筹失败</span>
        <span v-if="scope.row.status == 3">预约中</span>
      </template>
    </pure-table>
  </el-card>
</template>
