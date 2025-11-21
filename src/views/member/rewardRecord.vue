<script setup lang="ts">
import { reactive, onMounted } from "vue";
import FormSearch from "@/components/opts/form-search.vue";
import TableButtons from "@/components/opts/btns2.vue";
import { PureTable } from "@pureadmin/table";
import * as $rewardRecord from "@/api/member/rewardRecord";
import message from "@/utils/message";
import { BigNumberAdd, formatAddress, formatDate, fromWei } from "@/utils/wallet";
const typeMap = {
  0: "无",
  1: "USDT节点奖励",
  2: "USDT等级奖励",
  3: "USDT超级节点分红",
  4: "USDT节点提现分红",
  5: "CA直推奖励",
  6: "CA等级奖励",
  7: "CA节点奖励",
  8: "CA节点提现分红"
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
      type: "select",
      label: "类型",
      prop: "type",
      placeholder: "请选择类型",
      dataSourceKey: "typeOptions",
      options: {
        clearable: true,
        filterable: true,
        keys: {
          prop: "value",
          value: "value",
          label: "label"
        }
      }
    },
  ],
  dataSource: {
    typeOptions: [
      {
        label: "USDT节点奖励",
        value: 1
      },
      {
        label: "USDT等级奖励",
        value: 2
      },
      {
        label: "USDT超级节点分红",
        value: 3
      },
      {
        label: "USDT节点提现分红",
        value: 4
      },
      {
        label: "CA直推奖励",
        value: 5
      },
      {
        label: "CA等级奖励",
        value: 6
      },
      {
        label: "CA节点奖励",
        value: 7
      },
      {
        label: "CA节点提现分红",
        value: 8
      }
    ],
  },
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
  tableParams: {
    columns: [
      { label: "钱包地址", prop: "address" },
      { label: "类型", prop: "type", slot: "typeScope", width: "320px", },
      { label: "状态", prop: "status", width: "180px", slot: "statusScope" },
      { label: "收益", prop: "fees", width: "180px", slot: "feesScope" },
      { label: "领取时间", prop: "createTime", width: "180px", slot: "createTimeScope" }
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

const _resetSearchForm = (data?: any) => {
  pageData.searchForm = data;
};

// 获取分页参数
const getQueryParams = () => {
  const sqp = {};
  const param = Object.assign(sqp, pageData.searchForm);
  param.current = pageData.tableParams.pagination.currentPage;
  param.size = pageData.tableParams.pagination.pageSize;
  return param;
};
// 获取表格数据
const _loadData = (page?: number) => {
  pageData.tableParams.list = []
  pageData.tableParams.loading = true;
  const query = getQueryParams();
  if (page) query.current = page;

  $rewardRecord
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

      <template #statusScope="scope">
        <span v-if="scope.row.status == 1">待领取</span>
        <span v-if="scope.row.status == 2">已领取</span>
      </template>
      <template #feesScope="scope">
        <span>{{ fromWei(BigNumberAdd(scope.row.usdtAmount, scope.row.fees)) }}</span>
      </template>
      <template #createTimeScope="scope">
        <span>{{ formatDate(scope.row[scope.column.property]).dateTime }}</span>
      </template>

      <template #typeScope="scope">
        <span>
          {{ typeMap[scope.row.type] }}
        </span>
      </template>
    </pure-table>
  </el-card>
</template>
