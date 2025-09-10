<template>
    <el-dialog title="选择模板" :visible.sync="visible" width="60%">
        <el-row>
            <el-col :span="24">
                <el-form :inline="true" :model="searchForm" style="margin-bottom: 10px;">
                    <el-form-item label="模板类别">
                        <el-select v-model="searchForm.category" placeholder="请选择">
                            <el-option label="全部" value=""></el-option>
                            <el-option label="销售合同" value="销售合同"></el-option>
                            <el-option label="服务合同" value="服务合同"></el-option>
                            <el-option label="租赁合同" value="租赁合同"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item>
                        <el-input v-model="searchForm.keyword" placeholder="请输入关键词"></el-input>
                    </el-form-item>
                </el-form>
            </el-col>
        </el-row>

        <el-row>
            <el-col :span="24">
                <el-table :data="filteredTemplates" style="width: 100%;" @row-click="selectTemplate">
                    <el-table-column prop="name" label="模板名称"></el-table-column>
                    <el-table-column prop="category" label="类别"></el-table-column>
                    <el-table-column prop="lastModified" label="最后修改日期"></el-table-column>
                </el-table>
            </el-col>
        </el-row>

        <div slot="footer" class="dialog-footer">
            <el-button @click="closeDialog">取消</el-button>
            <el-button type="primary" @click="confirmSelection">确定</el-button>
        </div>
    </el-dialog>
</template>

<script>
export default {
    name: "TemplateManager",
    props: {
        visible: {
            type: Boolean,
            required: true,
        },
        templates: {
            type: Array,
            required: true,
        },
    },
    data() {
        return {
            searchForm: {
                category: '',
                keyword: '',
            },
            selectedTemplate: null,
        };
    },
    computed: {
        filteredTemplates() {
            return this.templates.filter(template => {
                return (!this.searchForm.category || template.category === this.searchForm.category) &&
                    (!this.searchForm.keyword || template.name.includes(this.searchForm.keyword));
            });
        },
    },
    methods: {
        selectTemplate(template) {
            this.selectedTemplate = template;
        },
        closeDialog() {
            this.$emit('update:visible', false);
        },
        confirmSelection() {
            if (this.selectedTemplate) {
                this.$emit('templateSelected', this.selectedTemplate);
                this.closeDialog();
            } else {
                this.$message.warning('请先选择一个模板！');
            }
        }
    },
};
</script>

<style scoped>
.dialog-footer {
    text-align: right;
}
</style>
