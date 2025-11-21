<script setup lang="ts">
import { reactive, onMounted } from "vue";
import FormSearch from "@/components/opts/form-search.vue";
import TableButtons from "@/components/opts/btns2.vue";
import StatusTabs from "@/components/opts/status-tabs.vue";
import { PureTable } from "@pureadmin/table";
import * as $crowdfDetailsRecordApi from "@/api/member/crowdfDetailsRecord";
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
    query: ["member:crowdfDetailsRecord:page"]
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
           { label: "钱包地址", prop: "address",width: "370px"},

      { label: "期数", prop: "crowdfNo" },
      { label: "状态", prop: "type", slot: "typeScope" },
      { label: "金额", prop: "partakeAmount", slot: "partakeAmountScope" },
      { label: "时间", prop: "createTime", width: "180px", slot: "createTimeScope" }
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

  $crowdfDetailsRecordApi
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


      <template #partakeAmountScope="scope">
        <!-- 通过类型判断展示对应的内容 -->
         <span v-if="scope.row.type==2">
            补偿金额(CA) {{ fromWei(scope.row.partakeAmount) }}
         </span>  
          <span v-if="scope.row.type==1">
            赎回金额(CA) {{ fromWei(scope.row.partakeAmount) }}
            赠送价值 {{ fromWei(scope.row.minerAmount) }}CA矿机*1台
         </span>  
          <span v-if="scope.row.type==3">
            收益金额(CA) {{ fromWei(scope.row.partakeAmount) }}
         </span>  
      </template>
      <template #createTimeScope="scope">
        <span>{{ formatDate(scope.row[scope.column.property]).dateTime }}</span>
      </template>

      <template #typeScope="scope">
        <span v-if="scope.row.allocateStatus == 1">预约中</span>
        <span v-if="scope.row.allocateStatus == 2">参与成功</span>
        <span v-if="scope.row.allocateStatus == 3">参与失败</span>
      </template>
    </pure-table>
  </el-card>
</template>
