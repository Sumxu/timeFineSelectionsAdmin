<script setup lang="ts">
import { reactive, ref, onMounted, h } from "vue";
import FormSearch from "@/components/opts/form-search.vue";
import TableButtons from "@/components/opts/btns2.vue";
import { PureTable } from "@pureadmin/table";
import * as $userApi from "@/api/goods/list";
import message from "@/utils/message";
import { formatAddress, formatDate, fromWei } from "@/utils/wallet";
import { classifyMap, levelOptions, userLevelOptions, userTypeMap } from "@/constants/constants";
import { userlevelConvert, levelConvert, userTypeConvert, classifyConvert } from "@/constants/convert";
import { ElMessageBox, ElSelect, ElOption } from "element-plus";
import GoodsInfo from '@/components/GoodsInfo/index.vue'

interface Product {
  id?: number;
  name: string;
  pic: any[];
  merchantAddress: string;
  merchantName: string;
  isHome: boolean;
  classify: string | number;
}

const pageData: any = reactive({
  searchState: true,
  dialogVisible: false,
  currentProduct: null as Product | null,
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
      { label: "名称", prop: "name", minWidth: "220px" },
      { label: "图片", prop: "pic", minWidth: "120px", slot: "imgScope" },
      {
        label: "商户地址",
        prop: "merchantAddress",
        minWidth: "370px"
      },
      {
        label: "商户名称",
        prop: "merchantName",
        minWidth: "120px"
      },
      {
        label: "是否首页",
        prop: "isHome",
        minWidth: "120px",
        slot: "isHomeScope"
      },
      { label: "分类", prop: "classify", minWidth: "120px", solt: "classifyScope" },
      { label: "创建时间", prop: "createTime", width: "180px" },
      { label: "发布时间", prop: "publishTime", width: "180px" },
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
// 提交回调
const handleSubmit = (data: Product) => {
  if (data.id) {
    // 编辑

  } else {
    // 新增

  }

  pageData.dialogVisible = false;
};
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
const handleDialogSubmit = () => {
  pageData.dialogVisible = false;

}
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
const handleUpdateGood = (product?: Product) => {
  pageData.currentProduct = product ? { ...product } : null;
  pageData.dialogVisible = true;
  console.log("1==dialogVisible=", pageData.currentProduct)
};

onMounted(() => _loadData());
</script>

<template>
  <el-card :shadow="'never'">
    <form-search :show="pageData.searchState" :form-field="pageData.searchField" :data-source="pageData.dataSource"
      @search-form="_updateSearchFormData" @search="_searchForm" @reset="_resetSearchForm" />
    <table-buttons :size="pageData.btnOpts.size" :left-btns="pageData.btnOpts.leftBtns"
      :right-btns="pageData.btnOpts.rightBtns" @click="btnClickHandle" />
    <el-table :data="pageData.tableParams.list" stripe :loading="pageData.tableParams.loading">

      <!-- 展开行 -->
      <el-table-column type="expand">
        <template #default="props">
          <h3>规格信息</h3>
          <el-button type="success" size="small" @click="handleAddItem(props.row)">
            添加
          </el-button>
          <el-table :data="props.row.items" border style="margin-top: 10px">
            <el-table-column label="名称" prop="name" />

            <el-table-column label="图片">
              <template #default="scope">
                <el-image :src="scope.row.pic" style="width: 50px; height: 50px; border-radius: 4px" fit="cover" />
              </template>
            </el-table-column>

            <el-table-column label="价格" prop="price" />
            <el-table-column label="积分" prop="integral" />

            <el-table-column label="操作" width="160" :fixed="right">
              <template #default="scope">
                <el-button type="primary" size="small" @click="handleEditItem(props.row, scope.row)">
                  编辑
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </template>
      </el-table-column>
      <!-- 其他字段列：直接从 columns 迁移或手写 -->
      <el-table-column v-for="col in pageData.tableParams.columns" :key="col.prop" :label="col.label" :prop="col.prop"
        :width="col.width" :min-width="col.minWidth" :fixed="col.fixed" align="center">
        <template v-if="col.slot === 'isHomeScope'" #default="scope">
          <span>{{ scope.row[col.prop] == true ? '是' : '否' }}</span>
        </template>

        <template v-else-if="col.slot === 'classifyScope'" #default="scope">
          <span>{{ classifyConvert(scope.row[col.prop]) }}</span>
        </template>
        <template v-else-if="col.slot === 'imgScope'" #default="scope">
          <el-image style="width: 100px; height: 100px" :src="scope.row.pic" :zoom-rate="1.2" :max-scale="7"
            :min-scale="0.2" fit="cover" />
        </template>
        <template v-else-if="col.slot === 'operation'" #default="scope">
          <el-link type="primary" @click="handleUpdateGood(scope.row)">
            修改商品
          </el-link>
        </template>
      </el-table-column>
    </el-table>
    <!-- 弹窗组件 -->
     <GoodsInfo
      v-model:visible="pageData.dialogVisible"
      :initialData="pageData.currentProduct"
      :classifyOptions="classifyMap"
      @submit="handleSubmit"
    />
  </el-card>
</template>
