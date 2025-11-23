<script setup lang="ts">
import { reactive, ref, onMounted, h } from "vue";
import FormSearch from "@/components/opts/form-search.vue";
import TableButtons from "@/components/opts/btns2.vue";
import { PureTable } from "@pureadmin/table";
import * as $userApi from "@/api/goods/list";
import message from "@/utils/message";
import { formatAddress, formatDate, fromWei, callContractMethod, toWei } from "@/utils/wallet";
import { classifyMap, levelOptions, userLevelOptions, userTypeMap } from "@/constants/constants";
import { userlevelConvert, levelConvert, userTypeConvert, classifyConvert } from "@/constants/convert";
import { ElMessageBox, ElSelect, ElOption, ElMessage, makeList } from "element-plus";
import GoodsInfo from '@/components/GoodsInfo/index.vue'
import GoodsSpecsDialog from '@/components/GoodsSpecsDialog/index.vue'
import { contractAddress } from "@/config/contract";
import erc20Abi from "@/abi/erc20-abi";
import { parseEther  } from "ethers";
const classifyIdList = [
  { id: 1, name: "安品区", subsidy: 1 },
  { id: 2, name: "优品区", subsidy: 2 },
  { id: 3, name: "兑换区", subsidy: 0 },
  { id: 4, name: "臻品区", subsidy: 4 },
]
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
  switchLoading: false,
  classifyId: 0,
  specsDialogVisible: false,
  productId: "",//规格id
  merChatList: [],
  currentSpecs: {},
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
    leftBtns: [
      {
        key: "add",
        label: "新增",
        type: "primary",
        icon: "ep:plus",
        state: true,
        permission: ["org:save"]
      }
    ],
    rightBtns: [
      { key: "search", label: "查询", icon: "ep:search", state: true },
      { key: "refresh", label: "刷新", icon: "ep:refresh", state: true },
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
        label: "商品排序",
        prop: "sort",
        minWidth: "120px"
      },
      {
        label: "是否首页",
        prop: "isHome",
        minWidth: "120px",
        slot: "isHomeScope"
      },
      {
        label: "是否上架",
        prop: "status",
        minWidth: "120px",
        slot: "statusScope",
        fixed: "right"
      },
      { label: "分类", prop: "classify", minWidth: "120px", slot: "classifyScope" },
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
//商品是否上下架 切换开关时触发
const handleStatusChange = (row: any) => {
  $userApi.update(row).then(res => {
    if (res.code === 200) {
      _loadData()
    } else {
      message.warning(res.msg);
    }
  })
}

 // 计算积分（BigNumber × number）
const calcIntegral = (priceBn: BigNumber, subsidy: number) => {
  return priceBn.times(subsidy); // 返回 BigNumber
};

// 规格是否上链（ethers v6 完整写法）
 // 规格是否上链
const handleSpecsStatus = async (row: any, props: any) => {
  pageData.switchLoading = true;

  const status = !props.status;

  // 查 subsidy
  const match = classifyIdList.find((item) => item.id == row.classify);
  const subsidy = BigInt(match?.subsidy || 0);

  // 价格（单位：ether）转 bigint wei
  const priceWei = parseEther(String(props.price));

  // 积分 = 价格 × 补贴（bigint）
  const integralWei = priceWei * subsidy;

  console.log("priceWei =", priceWei.toString());
  console.log("subsidy =", subsidy.toString());
  console.log("integralWei =", integralWei.toString());

  try {
    const res = await callContractMethod(
      contractAddress.Store_Address,
      erc20Abi.abi,
      "updateProduct",
      [
        props.id,
        [
          priceWei,              // 价格（wei）
          row.classify,
          row.merchantAddress,
          integralWei,           // 积分（wei）
          status
        ]
      ],
      true
    );

    if (res) {
      message.success("操作成功");
      await _loadData();
    } else {
      message.warning(res?.msg || "操作失败");
    }
  } catch (err) {
    console.error(err);
    message.warning("操作失败");
  } finally {
    pageData.switchLoading = false;
  }
};
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
    $userApi.update(data).then(res => {
      if (res.code === 200) {
        _loadData()
      } else {
        message.warning(res.msg);
      }
    })
  } else {
    // 新增
    data.productId = pageData.productId
    $userApi.add(data).then(res => {
      if (res.code === 200) {
        _loadData()
      } else {
        message.warning(res.msg);
      }
    })
  }
  pageData.dialogVisible = false;
};
//规格编辑 添加
const handleSpecsSubmit = (data: any) => {
  if (data.id) {
    // 编辑
    $userApi.updateSpec(data).then(res => {
      if (res.code === 200) {
        _loadData()
      } else {
        message.warning(res.msg);
      }
    })
  } else {
    data.productId = pageData.productId
    // 新增
    $userApi.addSpec(data).then(res => {
      if (res.code === 200) {
        _loadData()
      } else {
        message.warning(res.msg);
      }
    })
  }
  pageData.dialogVisible = false;
}
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

const _merChatList = () => {
  $userApi.merChatList().then(res => {
    if (res.code == 200) {
      pageData.merChatList = res.data
    }
  })
}
const handleDialogSubmit = () => {
  pageData.dialogVisible = false;
}
const handleAddItem = (row: any, items: any) => {
  pageData.currentSpecs = items ? { ...items } : null;
  pageData.productId = row.id
  pageData.classifyId = row.classify
  pageData.specsDialogVisible = true;
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
    case "add":
      handleUpdateGood();
      break;
  }
};
const handleUpdateGood = (product?: Product) => {
  pageData.currentProduct = product ? { ...product } : null;
  pageData.dialogVisible = true;
};

onMounted(() => {
  _loadData()
  _merChatList()
});
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
          <el-button type="success" size="small" @click="handleAddItem(props.row)" style="margin-bottom: 12px;">
            添加
          </el-button>
          <el-table :data="props.row.items" border style="width: 800px; overflow-x: auto;">
            <el-table-column label="名称" prop="name" width="200" />
            <el-table-column label="图片" width="120">
              <template #default="scope">
                <el-image :src="scope.row.pic" style="width: 50px; height: 50px; border-radius: 4px" fit="cover" />
              </template>
            </el-table-column>
            <el-table-column label="价格" prop="price" width="120" />
            <el-table-column label="积分" prop="integral" width="120" />
            <el-table-column label="是否上链" prop="status" width="120" fixed="right">
              <template #default="scope">
                <el-switch v-model="scope.row.status" disabled />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="160" fixed="right">
              <template #default="scope">
                <el-button type="primary" size="small" @click="handleAddItem(props.row, scope.row)">
                  编辑
                </el-button>
                <el-button type="primary" size="small" :loading="pageData.switchLoading"
                  @click="handleSpecsStatus(props.row, scope.row)">
                  {{ props.row.status ? '下链' : "上链" }}
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
          <el-image style="width: 100px; height: 100px" :src="scope.row.pic ? scope.row.pic.split(',')[0] : ''"
            :zoom-rate="1.2" :max-scale="7" :min-scale="0.2" fit="cover" />
        </template>
        <template v-else-if="col.slot === 'statusScope'" #default="scope">
          <el-switch v-model="scope.row.status" @change="handleStatusChange(scope.row)" />
        </template>
        <template v-else-if="col.slot === 'operation'" #default="scope">
          <el-link type="primary" @click="handleUpdateGood(scope.row)">
            修改商品
          </el-link>
        </template>
      </el-table-column>
    </el-table>
    <!-- 商品弹窗组件 -->
    <GoodsInfo v-model:visible="pageData.dialogVisible" :initialData="pageData.currentProduct"
      :merChatList="pageData.merChatList" @submit="handleSubmit" />


    <GoodsSpecsDialog :visible="pageData.specsDialogVisible" :classifyId="pageData.classifyId"
      :initialData="pageData.currentSpecs" @submit="handleSpecsSubmit"
      @update:visible="val => pageData.specsDialogVisible = val" />
  </el-card>
</template>
