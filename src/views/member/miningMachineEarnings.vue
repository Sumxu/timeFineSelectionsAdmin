<script setup lang="ts">
import { reactive, ref, onMounted, h } from "vue";
import FormSearch from "@/components/opts/form-search.vue";
import TableButtons from "@/components/opts/btns2.vue";
import { PureTable } from "@pureadmin/table";
import * as $claimMinerRecord from "@/api/member/claimMinerRecord";
import message from "@/utils/message";
import { formatAddress, fromWei, formatDate } from "@/utils/wallet";
import { miningMachineEarningsConvert } from "@/constants/convert";
import { ElMessageBox, ElSelect, ElOption } from "element-plus";
const pageData: any = reactive({
  searchState: true,
  searchForm: {},
  searchField: [
    {
      type: "input",
      label: "钱包地址",
      prop: "address",
      placeholder: "请输入钱包地址"
    }
  ],

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
           { label: "钱包地址", prop: "address",width: "370px"},

      { label: "领取数量", prop: "claimAmount", slot: "claimAmountScope" },
      { label: "费率", prop: "fee",   slot: "feeScope" },
      { label: "类型", prop: "type",  slot: "typeScope" },
      {
        label: "领取时间",
        prop: "blockTime",
        slot: "blockTimeScope",
        width: "120px"
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
  size: pageData.tableParams.pagination.pageSize
});

// 获取表格数据
const _loadData = (page?: number) => {
  pageData.tableParams.loading = true;
  const query = getQueryParams();
  if (page) query.current = page;

  $claimMinerRecord
    .queryPage(query)
    .then((res: any) => {
      if (res.code === 200) {
        console.log("claimMinerRecord", res)
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
    <pure-table :data="pageData.tableParams.list" :columns="pageData.tableParams.columns" row-key="address" border
      stripe :loading="pageData.tableParams.loading" :pagination="pageData.tableParams.pagination"
      @page-current-change="handleChangeCurrentPage" @page-size-change="handleChangePageSize">
      <template #blockTimeScope="scope">
        <span>{{ formatDate(scope.row[scope.column.property]).dateTime }}</span>
      </template>
    <template #claimAmountScope="scope">
        <span>{{fromWei(scope.row[scope.column.property]) }}</span>
      </template>
      <template #typeScope="scope">
        <span>{{miningMachineEarningsConvert(scope.row[scope.column.property]) }}</span>
      </template>

      <template #claimAmount="scope">
        <span>{{ fromWei(scope.row[scope.column.property]).dateTime }}</span>
      </template>
      <template #feeScope="scope">
        <span>{{ fromWei(scope.row[scope.column.property]) }}</span>
      </template>
      <template #addressScope="scope">
        <el-popover placement="top-start" width="370" trigger="hover" :content="scope.row[scope.column.property]">
          <template #reference>
            <span>
              {{ formatAddress(scope.row[scope.column.property]) }}
            </span>
          </template>
        </el-popover>
      </template>
      <template #operation="{ row }">
        <el-link type="primary" @click="handleUpdateLevel(row)">修改等级</el-link>
      </template></pure-table>
  </el-card>
</template>
