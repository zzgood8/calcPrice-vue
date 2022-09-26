<template>
  <!-- 上传按钮 -->
  <el-upload
    :show-file-list="false"
    :on-success="uploadSuccess"
    :on-error="uploadFailed"
    accept=".xlsx"
    class="upload-main"
    drag
    :action="uploadUrl()"
    multiple
  >
    <el-icon class="el-icon--upload"><upload-filled /></el-icon>
    <div class="el-upload__text">拖拽文件到这里或者 <em>点击上传</em></div>
    <template #tip>
      <div class="el-upload__tip">只能上传xlsx文件</div>
    </template>
  </el-upload>

  <price-rues />

  <!-- 表格对话框 -->
  <el-dialog :close-on-click-modal="false" v-model="state.dialogVisible" title="单价计算结果" width="800px">
    <el-table highlight-current-row @row-dblclick="editUnitPrice" border height="400" :data="excelData" stripe style="width: 100%">
      <el-table-column prop="name" label="名称" sortable />
      <el-table-column prop="length" label="长" sortable />
      <el-table-column prop="width" label="宽" sortable />
      <el-table-column prop="height" label="厚" sortable />
      <el-table-column prop="unitPrice" label="单价" sortable>
        <template #default="scope">
          <el-input
            v-if="scope.row.edit"
            @input="
              (v: any) =>
                (scope.row.unitPrice = v
                  .replace(/[^\d.]/g, '')
                  .replace(/\.{2,}/g, '.')
                  .replace(/^(\d+)\.(\d\d).*$/, '$1.$2'))
            "
            v-model="scope.row.unitPrice"
            @keyup.enter.native="EnterKey(scope.row)"
          />
          <span v-else>{{ scope.row.unitPrice }}</span>
        </template>
      </el-table-column>
    </el-table>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="exportExcel">下载Excel</el-button>
        <el-button @click="state.dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="state.dialogVisible = false">确认</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { UploadFilled } from '@element-plus/icons-vue'
import { reactive, ref } from 'vue'
import { ElNotification } from 'element-plus'
import XLSX from 'xlsx'
import PriceRues from './components/priceRues.vue'
import { uploadUrl } from '@/api/PriceRules'

// 页面状态
const state = reactive({
  dialogVisible: false
})
// 表格数据
const excelData = ref<any>()

// 上传失败回调
const uploadFailed = (error: Error) => {
  ElNotification({
    title: '上传失败!',
    message: '服务器响应失败!请联系管理员!',
    type: 'error'
  })
  console.log(error)
}

// 上传成功回调
const uploadSuccess = (res: any) => {
  if (res.code == 200) {
    excelData.value = fortmatPrice(res.data)
    state.dialogVisible = true
  } else {
    ElNotification({
      title: '上传失败!',
      message: res.msg,
      type: 'error'
    })
  }
}

// 格式化单价
function fortmatPrice(data: Array<any>) {
  for (let i = 0; i < data.length; i++) {
    if (data[i].unitPrice) {
      data[i].unitPrice = data[i].unitPrice.toFixed(2)
    }
  }
  return data
}

// 触发修改单价
const editUnitPrice = (row: any) => {
  row.edit = true
}

// 回车保存单价
const EnterKey = (row: any) => {
  row.edit = false
}

// 导出Excel
function exportExcel() {
  if (excelData.value.length > 0) {
    const worksheet = XLSX.utils.json_to_sheet(excelData.value as any)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'sheet1')
    XLSX.writeFile(workbook, 'test.xlsx')
  } else {
    ElNotification({
      title: '下载Excel失败!',
      message: '无法获取表格数据',
      type: 'error'
    })
  }
}
</script>

<style>
html,
body {
  margin: 0;
  padding: 0;
}

.upload-main {
  width: 50%;
}

.el-upload {
  --el-upload-dragger-padding-horizontal: 120px !important;
}

#app {
  height: 100vh;
  background-color: rgb(180, 180, 241, 0.1);
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
