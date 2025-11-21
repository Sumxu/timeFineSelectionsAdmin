import { ref } from "vue";

interface WeightItem {
  address: string;
  weight: number;
}

export function useColumns() {
  const dataList = ref<WeightItem[]>([]);

  const columns: TableColumnList = [
    {
      label: "钱包地址",
      prop: "address",
      cellRenderer: ({ row }) => <el-input v-model={row.address} />
    },
    {
      label: "操作",
      fixed: "right",
      width: 90,
      slot: "operation"
    }
  ];

  function onAdd() {
    dataList.value.push({
      address: ""
    });
  }

  function onDel(row) {
    const index = dataList.value.indexOf(row);
    if (index !== -1) dataList.value.splice(index, 1);
  }

  return {
    columns,
    dataList,
    onAdd,
    onDel
  };
}
