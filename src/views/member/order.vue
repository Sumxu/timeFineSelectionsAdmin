<script setup lang="ts">
import { reactive, ref, onMounted, h } from "vue";
import FormSearch from "@/components/opts/form-search.vue";
import TableButtons from "@/components/opts/btns2.vue";
import { PureTable } from "@pureadmin/table";
import * as $userApi from "@/api/member/order";
import message from "@/utils/message";
import { formatAddress, formatDate, fromWei } from "@/utils/wallet";
import { levelOptions, userLevelOptions, userTypeMap } from "@/constants/constants";
import { orderConvert, payTypeConvert, classifyConvert } from "@/constants/convert";
import { ElMessageBox, ElSelect, ElOption, ElInput, ElMessage } from "element-plus";
const pageData: any = reactive({
  preserveExpanded: true,
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
        label: "订单编号",
        prop: "orderSn",
        minWidth: "220px"
      },
      { label: "图片", prop: "pic", slot: "imgScope", minWidth: "120px" },
      { label: "商品名称", prop: "name", minWidth: "320px" },
      {
        label: "价格",
        prop: "price"
      },
      {
        label: "状态",
        prop: "status",
        minWidth: "120px",
        slot: "statusScope"
      },
      { label: "规格名称", prop: "itemName", minWidth: "120px" },
      { label: "获得积分", prop: "integral", minWidth: "120px" },
      { label: "商户名称", prop: "merchantName", minWidth: "120px" },
      { label: "支付方式", prop: "payType", slot: "payTypeScope", minWidth: "120px" },
      { label: "商户地址", prop: "merchantAddress", minWidth: "370px" },
      { label: "手机号", prop: "receiverPhone", minWidth: "170px" },
      { label: "联系人", prop: "receiverName", minWidth: "120px" },
      { label: "详细地址", prop: "detailAddress", minWidth: "120px" },
      { label: "物流公司", prop: "logisticsCompany", minWidth: "120px" },
      { label: "物流单号", prop: "trackingNumber", minWidth: "120px" },
      { label: "购买数量", prop: "price", minWidth: "120px" },
      { label: "分类", prop: "classify", slot: "classifyScope", minWidth: "120px" },
      { label: "创建时间", prop: "createTime", width: "180px"  },
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
//编辑规格
const handleEditItem=(data:any)=>{

}
//添加规格
const handleAddItem=(data:any)=>{

}
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
  const expressCompany = ref("");
  const expressNumber = ref("");

  ElMessageBox({
    title: "填写物流信息",
    message: () =>
      h(
        "div",
        {
          style: "width: 300px; display: flex; flex-direction: column; gap: 16px;"
        },
        [
          // 物流公司
          h("div", { style: "display: flex; flex-direction: column; gap: 6px;" }, [
            h("span", { style: "font-weight: 500;" }, "物流公司"),
            h(ElInput, {
              placeholder: "请输入物流公司",
              modelValue: expressCompany.value,
              "onUpdate:modelValue": (val: string) => (expressCompany.value = val)
            })
          ]),
          // 物流单号
          h("div", { style: "display: flex; flex-direction: column; gap: 6px;" }, [
            h("span", { style: "font-weight: 500;" }, "物流单号"),
            h(ElInput, {
              placeholder: "请输入物流单号",
              modelValue: expressNumber.value,
              "onUpdate:modelValue": (val: string) => (expressNumber.value = val)
            })
          ])
        ]
      ),
    showCancelButton: true,
    confirmButtonText: "提交",
    cancelButtonText: "取消",

    beforeClose: async (action, instance, done) => {
      if (action === "confirm") {
        // 校验不能为空
        if (!expressCompany.value.trim() || !expressNumber.value.trim()) {
          ElMessage.warning("物流公司和物流单号不能为空！");
          return; // 阻止关闭
        }

        instance.confirmButtonLoading = true;

        try {
          // 发送请求（你这里换成你的接口）
          const res = await $userApi.send({
            id: row.id,
            logisticsCompany: expressCompany.value,
            trackingNumber: expressNumber.value
          });
          if (res.success) {
            ElMessage.success("提交成功");
            done();
          } else {
            ElMessage.error(res.msg || "提交失败");
          }
          _loadData()
        } catch (err: any) {
          console.error("updateExpress error:", err);
          ElMessage.error(err?.message || "请求出错");
        } finally {
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
      <template #statusScope="scope">
        <span>{{ orderConvert(scope.row[scope.column.property]) }}</span>
      </template>
      <template #imgScope="scope">
        <el-image style="width: 100px; height: 100px" :src="scope.row['pic']" :zoom-rate="1.2" :max-scale="7"
          :min-scale="0.2" fit="cover" />
      </template>
      <template #payTypeScope="scope">
        <span>{{ payTypeConvert(scope.row[scope.column.property]) }}</span>
      </template>
      <template #classifyScope="scope">
        <span>{{ classifyConvert(scope.row[scope.column.property]) }}</span>
      </template>

      <template #createTimeScope="scope">
        <span>{{ formatDate(scope.row[scope.column.property]).dateTime }}</span>
      </template>

      <template #operation="{ row }">
        <el-link type="primary" @click="handleUpdateLevel(row)">{{ row.status == 2 ? '已发货' : '去发货' }}</el-link>
      </template>
    </pure-table>
  </el-card>
</template>
