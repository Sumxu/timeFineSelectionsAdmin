<script setup lang="ts">
import { reactive, onMounted } from "vue";
import FormSearch from "@/components/opts/form-search.vue";
import TableButtons from "@/components/opts/btns2.vue";
import StatusTabs from "@/components/opts/status-tabs.vue";
import { PureTable } from "@pureadmin/table";
import * as $claimApi from "@/api/member/claim";
import message from "@/utils/message";
import { formatAddress, fromWei } from "@/utils/wallet";

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
    },
    {
      type: "date",
      label: "时间筛选",
      prop: "dates",
      dateType: "daterange"
    }
  ],
  dataSource: {},
  permission: {
    query: ["member:claim:page"]
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
    { label: "铸造", name: 1 },
    { label: "直推", name: 2 },
    { label: "团队", name: 3 }
  ],
  tableParams: {
    columns: [
      { label: "钱包地址", prop: "address" },
      { label: "类型", prop: "type", slot: "typeScope" },
      { label: "ut数量", prop: "ut", slot: "amountScope" },
      { label: "gas数量", prop: "gas", slot: "amountScope" },
      { label: "区块号", prop: "blockNum" },
      { label: "领取时间", prop: "blockTime", width: "180px" }
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
  type: pageData.searchStatus
});

// 获取表格数据
const _loadData = (page?: number) => {
  pageData.tableParams.loading = true;
  const query = getQueryParams();
  if (page) query.current = page;

  $claimApi
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
    <form-search
      :show="pageData.searchState"
      :form-field="pageData.searchField"
      :data-source="pageData.dataSource"
      @search-form="_updateSearchFormData"
      @search="_searchForm"
      @reset="_resetSearchForm"
    />
    <table-buttons
      :size="pageData.btnOpts.size"
      :left-btns="pageData.btnOpts.leftBtns"
      :right-btns="pageData.btnOpts.rightBtns"
      @click="btnClickHandle"
    />

    <!-- tags -->
    <status-tabs
      v-model="pageData.searchStatus"
      :tabs="pageData.tabsOpts"
      @change="handleClick"
    />

    <pure-table
      :data="pageData.tableParams.list"
      :columns="pageData.tableParams.columns"
      row-key="id"
      border
      stripe
      :loading="pageData.tableParams.loading"
      :pagination="pageData.tableParams.pagination"
      @page-current-change="handleChangeCurrentPage"
      @page-size-change="handleChangePageSize"
    >
      <template #addressScope="scope">
        <el-popover
          placement="top-start"
          width="370"
          trigger="hover"
          :content="scope.row[scope.column.property]"
        >
          <template #reference>
            <span>
              {{ formatAddress(scope.row[scope.column.property]) }}
            </span>
          </template>
        </el-popover>
      </template>

      <template #amountScope="scope">
        <span>{{ fromWei(scope.row[scope.column.property]) }}</span>
      </template>

      <template #typeScope="scope">
        <span>
          {{
            {
              1: "铸造",
              2: "直推",
              3: "团队"
            }[scope.row[scope.column.property]] || "未知"
          }}
        </span>
      </template>
    </pure-table>
  </el-card>
</template>
