<script setup lang="ts">
import { reactive, onMounted, ref } from "vue";
import FormSearch from "@/components/opts/form-search.vue";
import TableButtons from "@/components/opts/btns2.vue";
import StatusTabs from "@/components/opts/status-tabs.vue";
import { PureTable } from "@pureadmin/table";
import * as $crowdfApi from "@/api/member/crowdf";
import message from "@/utils/message";
import { formatAddress, formatDate, fromWei } from "@/utils/wallet";
const editRef = ref();
import editDialog from './component/editDialog/index.vue'
const pageData: any = reactive({
  searchState: true,
  searchForm: {},
  searchStatus: "null",
  dataSource: {},
  permission: {
    query: ["member:crowdfDetailsRecord:page"]
  },
  btnOpts: {
    size: "small",
    leftBtns: [
      {
        key: "updateIncreaseRate",
        label: "设置增长比例",
        type: "primary",
        icon: "ep:edit",
        state: true,
        permission: ["org:save"]
      },
      {
        key: "updateInitRate",
        label: "设置首期比例",
        type: "success",
        icon: "ep:edit",
        state: true,
        permission: ["org:update"]
      }
    ],
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
      { label: "编号", prop: "crowdfNo" },
      { label: "类型", prop: "type", slot: "typeScope", width: "320px" },
      { label: "总参与额", prop: "applyAmount", slot: "applyAmountScope", width: "320px" },
      { label: "赎回数量", prop: "backAmount", width: "180px", slot: "backAmountScope" },
      { label: "补偿数量", prop: "compensateAmount", width: "180px", slot: "compensateAmountScope" },
      { label: "补偿矿机价值", prop: "compensateMiner", width: "180px", slot: "compensateMinerScope" },
      { label: "众筹数量", prop: "crowdfAmount", width: "180px", slot: "crowdfAmountScope" },
      { label: "参与数量", prop: "partakeAmount", width: "180px", slot: "partakeAmountScope" },
      { label: "参与人数", prop: "partakeNumber", width: "180px" },
      { label: "收益数量", prop: "profitAmount", width: "180px", slot: "profitAmountScope" },
      { label: " 开始时间", prop: "startTime", width: "180px", slot: "startTimeScope" },
      { label: "结束时间", prop: "endTime", width: "180px", slot: "endTimeScope" }
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
  size: pageData.tableParams.pagination.pageSize
});

// 获取表格数据
const _loadData = (page?: number) => {
  pageData.tableParams.loading = true;
  const query = getQueryParams();
  if (page) query.current = page;
  $crowdfApi
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
    case "updateIncreaseRate":
      getConfigType('CROWDF_INCREASE_RATE', 1,'设置增长比例')
      break;
    case "updateInitRate":
      getConfigType('CROWDF_INIT_PARTAKE_RATE', 2,'设置首期比例')
      break;
  }
};
const getConfigType = (code, val,title) => {
  $crowdfApi.getConfig({
    code
  }).then(res => {
    if(res.success){
     editRef.value!.open(res.data, val,title);
    }
  })
   

}
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

      <template #backAmountScope="scope">
        <span>{{ fromWei(scope.row[scope.column.property]) }}</span>
      </template>
      <template #applyAmountScope="scope">
        <span>{{ fromWei(scope.row[scope.column.property]) }}</span>
      </template>
      <template #startTimeScope="scope">
        <span>{{ formatDate(scope.row[scope.column.property]).dateTime }}</span>
      </template>
      <template #endTimeScope="scope">
        <span>{{ formatDate(scope.row[scope.column.property]).dateTime }}</span>
      </template>
      <template #compensateMinerScope="scope">
        <span>{{ fromWei(scope.row[scope.column.property]) }}</span>
      </template>
      <template #crowdfAmountScope="scope">
        <span>{{ fromWei(scope.row[scope.column.property]) }}</span>
      </template>
      <template #partakeAmountScope="scope">
        <span>{{ fromWei(scope.row[scope.column.property]) }}</span>
      </template>
      <template #profitAmountScope="scope">
        <span>{{ fromWei(scope.row[scope.column.property]) }}</span>
      </template>
      <template #typeScope="scope">
        <span v-if="scope.row.status == 1">
          进行中
        </span>
        <span v-if="scope.row.status == 2">
          已完成
        </span>
        <span v-if="scope.row.status == 3">
          已失败
        </span>
      </template>
    </pure-table>
    <editDialog ref="editRef"></editDialog>
  </el-card>
</template>
