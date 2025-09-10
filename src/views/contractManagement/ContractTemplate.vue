<template>
  <div id="app">
    <el-container>
      <el-header class="header">
        <Header />
      </el-header>
      <el-container>
        <el-main style="text-align: center;">
          <el-row :gutter="20">
            <el-col :span="24">
              <el-card class="card">
                <h3 class="card-title">模板搜索和过滤</h3>
                <el-form :inline="true" :model="searchForm" class="demo-form-inline">
                  <el-form-item label="模板类别">
                    <el-select v-model="searchForm.category" placeholder="请选择">
                      <el-option label="全部" value=""></el-option>
                      <el-option label="销售合同" value="销售合同"></el-option>
                      <el-option label="服务合同" value="服务服务合同"></el-option>
                      <el-option label="租赁合同" value="租赁合同"></el-option>
                    </el-select>
                  </el-form-item>
                  <el-form-item>
                    <el-input v-model="searchForm.keyword" placeholder="输入关键词"></el-input>
                  </el-form-item>
                </el-form>
              </el-card>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="24">
              <el-card class="card">
                <h3 class="card-title">模板列表</h3>
                <el-table :data="filteredTemplates" style="width: 100%">
                  <el-table-column prop="name" label="模板名称" class="template-item"></el-table-column>
                  <el-table-column prop="category" label="类别" class="template-item"></el-table-column>
                  <el-table-column prop="lastModified" label="最后修改日期" class="template-item"></el-table-column>
                  <el-table-column label="操作" class="template-item">
                    <template slot-scope="scope">
                      <el-button type="primary" @click="editTemplate(scope.row)">编辑</el-button>
                      <el-button type="danger" @click="deleteTemplate(scope.row)">删除</el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </el-card>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="24">
              <el-card class="card">
                <h3 class="card-title">模板编辑器</h3>
                <el-form :model="selectedTemplate" label-width="120px" class="editor">
                  <el-form-item label="模板名称">
                    <el-input v-model="selectedTemplate.name" placeholder="请输入模板名称"></el-input>
                  </el-form-item>
                  <el-form-item label="模板类别">
                    <el-input v-model="selectedTemplate.category" placeholder="请输入模板类别"></el-input>
                  </el-form-item>
                  <el-form-item label="模板内容">
                    <div ref="quillEditor" class="quill-editor"></div>
                  </el-form-item>
                  <el-form-item>
                    <el-button type="primary" @click="saveTemplate">保存模板</el-button>
                  </el-form-item>
                </el-form>
              </el-card>
            </el-col>
          </el-row>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script>
import Navigator from "@/components/Navigator";
import Header from '@/components/Header';
import axios from 'axios';
import Quill from 'quill';

export default {
  name: "TemplateManagement",
  components: {
    Navigator,
    Header
  },
  data() {
    return {
      searchForm: {
        category: '',
        keyword: ''
      },
      templates: [],
      selectedTemplate: {
        id: null,
        name: '',
        category: '',
        content: '',
        lastModified: ''
      },
      quill: null, // 用于存储 Quill 实例
      editorOptions: {
        theme: 'snow',
        placeholder: '请输入模板内容',
        modules: {
          toolbar: [
            [{ header: [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ list: 'ordered' }, { list: 'bullet' }],
            ['link', 'image', 'code-block'],
            ['clean']
          ]
        }
      }
    };
  },
  computed: {
    filteredTemplates() {
      return this.templates.filter(template => {
        return (
          (!this.searchForm.category || template.category === this.searchForm.category) &&
          (!this.searchForm.keyword || template.name.includes(this.searchForm.keyword))
        );
      });
    }
  },
  methods: {
    fetchTemplates() {
      axios.get("contract/allTemplate").then(response => {
        if (response.data.code === 200) {
          this.templates = response.data.data;
        } else {
          this.$message.error("获取模板失败");
        }
      }).catch(() => {
        this.$message.error("网络错误，请稍后重试");
      });
    },
    editTemplate(template) {
      this.selectedTemplate = { ...template }; // 复制数据用于编辑
      // 在编辑时设置编辑器内容
      if (this.quill) {
        this.quill.setContents(this.quill.clipboard.convert(this.selectedTemplate.content || ''));
      }
    },
    saveTemplate() {
      // 在保存前，从编辑器中获取最新的内容
      if (this.quill) {
        this.selectedTemplate.content = this.quill.root.innerHTML;
      }

      const url = "contract/addTemplay";

      // 自动生成最后修改时间
      this.selectedTemplate.lastModified = new Date().toISOString();

      axios.post(url, this.selectedTemplate).then(response => {
        if (response.data.code === 200) {
          const updatedTemplate = response.data.data;
          const index = this.templates.findIndex(t => t.id === updatedTemplate.id);
          if (index >= 0) {
            this.templates.splice(index, 1, updatedTemplate); // 更新模板
          } else {
            this.templates.push(updatedTemplate); // 添加新模板
          }
          this.$message.success("模板保存成功");
        } else {
          this.$message.error("保存失败");
        }
      }).catch(() => {
        this.$message.error("网络错误，请稍后重试");
      });
    },
    deleteTemplate(template) {
      this.$confirm(`确定删除模板: ${template.name} 吗？`, "提示", {
        confirmButtonText: "是",
        cancelButtonText: "否",
        type: "warning",
      })
        .then(() => {
          // 调用后端删除接口
          const url = `contract/delTemplate/${template.id}`;
          axios
            .delete(url)
            .then((response) => {
              if (response.data.code === 200) {
                // 从本地列表中移除
                this.templates = this.templates.filter((t) => t.id !== template.id);
                this.$message.success("模板删除成功");
              } else {
                this.$message.error("删除失败：" + response.data.message);
              }
            })
            .catch(() => {
              this.$message.error("网络错误，请稍后重试");
            });
        })
        .catch(() => {
          this.$message.info("已取消删除");
        });
    },
    initializeQuill() {
      if (this.$refs.quillEditor) {
        this.quill = new Quill(this.$refs.quillEditor, this.editorOptions);

        // 设置初始内容
        this.quill.root.innerHTML = this.selectedTemplate.content || '';

        // 监听内容变化
        this.quill.on('text-change', () => {
          this.selectedTemplate.content = this.quill.root.innerHTML;
        });
      }
    }
  },
  mounted() {
    this.fetchTemplates(); // 初始加载模板数据
    this.initializeQuill(); // 初始化 Quill 编辑器
  },
  beforeDestroy() {
    // 清理 Quill 实例
    if (this.quill) {
      this.quill.off('text-change');
      this.quill = null;
    }
  }
};
</script>

<style scoped>
@import "~quill/dist/quill.snow.css";
/* 引入 Quill 的样式 */

body,
html,
#app {
  margin: 0;
  padding: 0;
  background-color: rgba(234, 246, 255, 0.9);
  /* 淡蓝色背景 */
  color: #333;
  /* 默认文字颜色 */
  background-image: url("../img/2.png");
  background-size: cover;
  /* 背景图片铺满整个容器 */
  background-repeat: no-repeat;
  /* 防止背景图片重复 */
  background-position: center center;
  /* 背景图片居中显示 */
}

.header {
  color: #fff;
  line-height: 20px;
}

el-header {
  display: block;
  position: relative;
}

.el-card {
  box-sizing: border-box;
}

.el-button {
  margin-right: 10px;
  margin-top: 10px;
}

.card-title {
  font-size: 24px;
  color: #333;
}

/* 调整富文本编辑器的高度 */
.ql-container {
  height: 300px;
}
</style>
