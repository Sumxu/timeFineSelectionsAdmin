<script setup lang="ts">
import { reactive, ref, onMounted, h } from "vue";
import FormSearch from "@/components/opts/form-search.vue";
import TableButtons from "@/components/opts/btns2.vue";
import { PureTable } from "@pureadmin/table";
import * as $withDrawApi from "@/api/member/withdraw";
import message from "@/utils/message";
import { formatAddress, fromWei, formatDate } from "@/utils/wallet";
import { levelOptions } from "@/constants/constants";

import { ElMessageBox, ElSelect, ElOption } from "element-plus";

const newLocal = "类型";
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
      label: "提现状态",
      prop: "status",
      placeholder: "请选择提现状态",
      dataSourceKey: "statusOptions",
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
    {
      type: "select",
      label: "提现类型",
      prop: "type",
      placeholder: "请选择提现类型",
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
    }
  ],
  dataSource: {
    levelOptions: levelOptions,
    statusOptions: [
      {
        label: "待确认",
        value: 1
      },
      {
        label: "已完成",
        value: 2
      }
    ],
    typeOptions: [
      {
        label: "USDT",
        value: 1
      },
      {
        label: "CA",
        value: 2
      }
    ]
  },
  permission: {
    query: ["defi:user:page"]
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
      { label: "钱包地址", prop: "address", width: "370px" },
      { label: "提现时间", prop: "applyTime", slot: "applyTimeScope" },
      { label: "提现状态", prop: "status", slot: "statusScope" },
      { label: "提现金额", prop: "applyAmount", slot: "applyAmountScope" },
      {
        label: "确认时间",
        prop: "confirmTime",
        slot: "confirmTimeScope",
        width: "120px"
      },
      {
        label: "操作",
        fixed: "right",
        slot: "operation"
      }
    ],
    list: [],
    loading: false,
    pagination: {
      pageSize: 50,
      defaultPageSize: 50,
      currentPage: 1,
      total: 0,
      background: true,
      pageSizes: [50, 100, 200, 300, 500]
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
  pageData.tableParams.list = []
  pageData.tableParams.loading = true;
  const query = getQueryParams();
  if (page) query.current = page;
  $withDrawApi
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
//同意提现
const handleWithdraw = (row: any) => {
  ElMessageBox.confirm(
    `是否同意提现${fromWei(row.applyAmount)}通过?`,
    '提示',
    {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(async () => {
    const res = await $withDrawApi.withdraw({
      id: row.id
    });
    if (res.success) {
      message.success("操作成功");
      await _loadData();
    } else {
      message.warning(res.msg || "操作失败");
    }
  })
};
onMounted(() => _loadData());
</script>
<template>
  <el-card :shadow="'never'">
    <form-search :show="pageData.searchState" :form-field="pageData.searchField" :data-source="pageData.dataSource"
      @search-form="_updateSearchFormData" @search="_searchForm" @reset="_resetSearchForm" />
    <table-buttons :size="pageData.btnOpts.size" :left-btns="pageData.btnOpts.leftBtns"
      :right-btns="pageData.btnOpts.rightBtns" @click="btnClickHandle" />
    <pure-table :data="pageData.tableParams.list" :columns="pageData.tableParams.columns" row-key="address" border
      stripe :loading="pageData.tableParams.loading" :pagination="pageData.tableParams.pagination"
      @page-current-change="handleChangeCurrentPage" @page-size-change="handleChangePageSize">
      <template #applyTimeScope="scope">
        <span>{{ formatDate(scope.row[scope.column.property]).dateTime }}</span>
      </template>

      <template #statusScope="scope">
        <span>{{ (scope.row[scope.column.property]) == 1 ? '待确认' : '已完成' }}</span>
      </template>

      <template #confirmTimeScope="scope">
        <span v-if="scope.row[scope.column.property]">{{ formatDate(scope.row[scope.column.property]).dateTime }}</span>
        <span v-else>{{ }}</span>
      </template>
      <template #applyAmountScope="scope">
        <span>{{ fromWei(scope.row[scope.column.property]) }}</span>
        <span>{{ scope.row['applyType'] == 1 ? '(USDT) ' : '(CA)' }}</span>
      </template>
      <template #operation="{ row }">
        <el-link type="primary" @click="handleWithdraw(row)" v-if="row.status == 1">确认提现</el-link>
      </template></pure-table>
  </el-card>
</template>
