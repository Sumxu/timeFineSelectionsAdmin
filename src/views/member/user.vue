<script setup lang="ts">
import { reactive, ref, onMounted, h } from "vue";
import FormSearch from "@/components/opts/form-search.vue";
import TableButtons from "@/components/opts/btns2.vue";
import { PureTable } from "@pureadmin/table";
import * as $userApi from "@/api/member/user";
import message from "@/utils/message";
import { formatAddress, formatDate, fromWei, callContractMethod } from "@/utils/wallet";
import { levelOptions, userLevelOptions, userTypeMap } from "@/constants/constants";
import { userlevelConvert, levelConvert, userTypeConvert } from "@/constants/convert";
import { ElMessageBox, ElSelect, ElOption } from "element-plus";
import erc20Abi from "@/abi/erc20-abi";
import { contractAddress } from "@/config/contract";

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
      label: "上级地址",
      prop: "parentAddress",
      placeholder: "请输入上级地址"
    }
  ],
  dataSource: {
    levelOptions: levelOptions
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
      {
        label: "钱包地址",
        prop: "address",
        width: "370px"
      },
      {
        label: "上级地址",
        prop: "parentAddress",
        width: "370px"
      },
      { label: "当前等级", prop: "level", minWidth: "120px" },
      { label: "用户类型", prop: "userType", minWidth: "120px", slot: "userTypeScope" },
      {
        label: "商家名称",
        prop: "merchantName",
        minWidth: "120px"
      },
      {
        label: "用户投入",
        prop: "myPerf",
        minWidth: "120px"
      },

      { label: "直推人数", prop: "directCount", minWidth: "120px" },
      { label: "团队人数", prop: "teamCount", minWidth: "120px" },
      { label: "小区业绩", prop: "communityPerf", minWidth: "120px" },
      {
        label: "团队业绩",
        prop: "teamPerf",
        minWidth: "120px"
      },
      { label: "注册时间", prop: "createTime", width: "180px", slot: "createTimeScope" },
      { label: "操作", fixed: "right", slot: "operation", width: "120px" }
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
  pageData.tableParams.list = []
  pageData.tableParams.loading = true;
  const query = getQueryParams();
  if (page) query.current = page;
  $userApi
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
const handleUpdateLevel = (row: any) => {
  const status = ref<string | number>(row.level);
  const userStatus = ref<string | number>(row.level);
  const address=row.address
  ElMessageBox({
    title: "修改等级",
    message: () =>
      h(
        "div",
        {
          style:
            "width: 300px; display: flex; flex-direction: column; gap: 16px;" // 增加了垂直方向的间距
        },
        [
          // 用户等级选择框
          h(
            "div",
            { style: "display: flex; align-items: center; gap: 8px;" },
            [
              // 左侧标题
              h(
                "span",
                { style: "white-space: nowrap; font-weight: 500;" },
                "用户等级"
              ),
              // 下拉选择框
              h(
                ElSelect,
                {
                  modelValue: userStatus.value,
                  placeholder: "请选择用户等级",
                  "onUpdate:modelValue": (val: any) => {
                    userStatus.value = val;
                  },
                  style: "flex: 1;",
                  clearable: true
                },
                () =>
                  userLevelOptions.map(item =>
                    h(ElOption, {
                      key: item.value,
                      label: item.label,
                      value: item.value
                    })
                  )
              )
            ]
          )
        ]
      ),
    showCancelButton: true,
    beforeClose: async (action, instance, done) => {
      if (action === "confirm") {
        try {
          instance.confirmButtonLoading = true;
          const res = await callContractMethod(
            contractAddress.Store_Address,
            erc20Abi.abi,
            "setLevel",
            [address,Number(userStatus.value)],
            true
          )
          if (res) {
            message.success("操作成功");
            await _loadData();
            done();
          } else {
            message.warning(res.msg || "操作失败");
          }
        } catch (err: any) {
          console.error("updateLevel error:", err);
          message.error(err?.message || "请求出错");
        } finally {
          // 确保 loading 状态被关闭
          instance.confirmButtonLoading = false;
        }
      } else {
        done();
      }
    }
  });
};
const handleUpdateActivateClick = (row: any) => {
  ElMessageBox.confirm(
    `是否${row.activate ? '取消激活' : '激活'}收益?`,
    '提示',
    {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(async () => {
    const res = await $userApi.updateUserActivate({
      activate: !row.activate,
      address: row.address
    });
    if (res.success) {
      message.success("操作成功");
      await _loadData();
    } else {
      message.warning(res.msg || "操作失败");
    }
  });
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
      <template #levelScope="scope">
        <span>{{ levelConvert(scope.row[scope.column.property]) }}</span>
      </template>
      <template #userTypeScope="scope">
        <span>{{ userTypeConvert(scope.row[scope.column.property]) }}</span>
      </template>

      <template #createTimeScope="scope">
        <span>{{ formatDate(scope.row[scope.column.property]).dateTime }}</span>
      </template>

      
      <template #operation="{ row }">
        <el-link type="primary" @click="handleUpdateLevel(row)">修改等级</el-link>
      </template>
    </pure-table>
  </el-card>
</template>
