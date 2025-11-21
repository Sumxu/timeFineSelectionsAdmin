<script setup lang="ts">
import { reactive, onMounted, ref } from "vue";

//组件相关
import FormSearch from "@/components/opts/form-search.vue";
import TableButtons from "@/components/opts/btns2.vue";
import { PureTable } from "@pureadmin/table";

//请求相关
import * as $nodeRecordApi from "@/api/member/nodeRecord";

//合约 工具相关
import message from "@/utils/message";
import { formatAddress, formatDate, fromWei } from "@/utils/wallet";
const pidMap = {
  0: "超级节点",
  1: "大节点",
  2: "小节点"
}
const pageData: any = reactive({
  searchState: true,
  searchForm: {},
  searchField: [
    {
      type: "input",
      label: "钱包地址",
      prop: "address",
      placeholder: "请输入钱包地址"
    },
    {
      type: "input",
      label: "查询团队",
      prop: "inviterAddress",
      placeholder: "请输入团队地址"
    },
  ],
  dataSource: {},
  permission: {
    query: ["member:node:page"]
  },
  btnOpts: {
    size: "small",
    leftBtns: [],
    rightBtns: [
      { key: "search", label: "查询", icon: "ep:search", state: true },
      { key: "refresh", label: "刷新", icon: "ep:refresh", state: true }
    ]
  },
  tableParams: {
    columns: [
      {
        label: "钱包地址",
        prop: "address",
      },
      { label: "节点名称", prop: "pid", slot: "pidScope" },
      {
        label: "金额",
        prop: "amount",
        slot: "amountScope"
      },
      { label: "购买时间", prop: "createTime", slot: "createTimeScope" }
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

  $nodeRecordApi
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
      <!-- 数量 -->
      <template #amountScope="scope">
        <span>{{ fromWei(scope.row[scope.column.property]) }}</span>
      </template>
       <template #pidScope="scope">
        <span> {{ pidMap[scope.row.pid] }}</span>
      </template>
      <!-- 数量 -->
      <template #createTimeScope="scope">
        <span>{{ formatDate(scope.row[scope.column.property]).dateTime }}</span>
      </template>
    </pure-table>
  </el-card>
</template>
