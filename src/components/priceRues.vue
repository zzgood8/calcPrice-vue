<template>
  <el-button @click="state.dialogVisible = true" class="price-rule-button" type="primary">
    <el-icon><Edit /></el-icon>修改报价规则
  </el-button>

  <el-dialog :close-on-click-modal="false" v-model="state.dialogVisible" title="单价计算公式" width="800px">
    <el-container>
      <el-aside width="160px">
        <el-scrollbar height="400px">
          <el-menu :default-active="state.menuIndex" @select="selectCategory">
            <el-menu-item v-for="item in state.categorys" :key="item" :index="item">{{ item }}</el-menu-item>
          </el-menu>
        </el-scrollbar>
      </el-aside>
      <el-main>
        <el-scrollbar height="400px">
          <el-button type="primary" size="small" @click="addFormla">新增</el-button>
          <el-table @row-dblclick="editPriceRule" highlight-current-row border height="376" :data="categoryData" stripe style="width: 100%">
            <el-table-column prop="name" label="名称" />
            <el-table-column prop="formula" label="公式" />
            <el-table-column prop="formula" label="操作">
              <template #default="scope">
                <el-button size="small" @click="editPriceRule(scope.row)">修改</el-button>
                <el-button size="small" type="danger" @click="deletePriceRule(scope.row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-scrollbar>
      </el-main>
    </el-container>

    <el-dialog
      :close-on-click-modal="false"
      :destroy-on-close="true"
      draggable
      v-model="state.editDialogVisible"
      :title="editData.type === 'edit' ? '修改公式' : '新增公式'"
      width="400px"
    >
      <el-form ref="editForm" :rules="rules" label-suffix=": " :model="editData" label-width="60px">
        <el-form-item label="">
          <el-alert show-icon :closable="false" title="变量: W=长, D=宽, H=厚" type="warning" />
        </el-form-item>

        <el-form-item prop="category" label="分类">
          <el-input v-model="editData.category" />
        </el-form-item>

        <el-form-item prop="name" label="名称">
          <el-input v-model="editData.name" />
        </el-form-item>

        <el-form-item prop="formula" label="公式">
          <el-input autosize v-model="editData.formula" type="textarea" />
        </el-form-item>

        <el-form-item>
          <el-button @click="addOrEditSubmit" type="primary">保存</el-button>
          <el-button @click="state.editDialogVisible = false">取消</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="state.dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="state.dialogVisible = false">确认</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { Edit } from '@element-plus/icons-vue'
import { FormRules, ElForm } from 'element-plus'
import { onMounted, reactive, ref } from 'vue'
import * as api from '../api/PriceRules'
import _ from 'lodash'

const state = reactive({
  dialogVisible: false, // 公式表格开关
  editDialogVisible: false, // 公式表单编辑开关
  categorys: [] as any, // 分类数组
  menuIndex: '' // 当前激活的分组
})
const categoryData = ref<any>() // 当前分类下的数据
const editData = ref<any>({}) // 编辑的数据
const editForm = ref<InstanceType<typeof ElForm>>() // 表单对象

// 通过后台返回所有的分类
async function getCategory() {
  await api
    .getAllCategory()
    .then((res) => {
      state.categorys = res as any
      if (state.categorys.length > 0 && state.categorys.indexOf(state.menuIndex) === -1) {
        state.menuIndex = state.categorys[0]
      }
      if (state.menuIndex) {
        selectCategory(state.menuIndex)
      }
    })
    .catch((err) => {
      console.error(err)
    })
}

onMounted(() => {
  getCategory()
})

// 通过后台获取该分类下明细
const selectCategory = (index: any) => {
  state.menuIndex = index
  api
    .getPriceRulesByCategory(index)
    .then((res) => {
      categoryData.value = res
    })
    .catch((err) => {
      console.error(err)
    })
}

// 验证单价公式函数
function validFormula(rule: any, value: any, callback: any) {
  if (!value) {
    return callback(new Error('公式不能为空!'))
  }
  const W = 3
  const D = 2
  const H = 1
  try {
    eval(value)
    return callback()
  } catch (error: any) {
    return callback(error)
  }
}
// 表单验证规则
const rules = reactive<FormRules>({
  name: [
    {
      required: true,
      message: '名称不能为空',
      trigger: 'blur'
    }
  ],
  category: [
    {
      required: true,
      message: '分类不能为空',
      trigger: 'blur'
    }
  ],
  formula: [
    {
      required: true,
      message: '公式不能为空',
      trigger: 'blur'
    },
    {
      validator: validFormula,
      trigger: 'blur'
    }
  ]
})

// 双击编辑数据
const editPriceRule = (row: any) => {
  editData.value = _.cloneDeep(row)
  editData.value.type = 'edit'
  state.editDialogVisible = true
}

// 删除公式
const deletePriceRule = (row: any) => {
  api
    .deletePriceRules(row.id)
    .then(async (res) => {
      await getCategory()
    })
    .catch((err) => {
      console.error(err)
    })
}

// 新增公式弹窗
const addFormla = () => {
  editData.value = {
    category: '',
    formula: '',
    name: '',
    type: 'add'
  }
  state.editDialogVisible = true
}

// 保存修改或者新增的数据
const addOrEditSubmit = () => {
  if (!editForm) return
  editForm.value?.validate((valid) => {
    if (valid) {
      api
        .updateOrSave(editData.value)
        .then(async () => {
          await getCategory()
          state.editDialogVisible = false
        })
        .catch((err) => {
          console.error(err)
        })
    }
  })
}
</script>

<style>
.price-rule-button {
  position: absolute;
  top: 20px;
  right: 20px;
}

.el-menu {
  border-right: none !important;
}
</style>
