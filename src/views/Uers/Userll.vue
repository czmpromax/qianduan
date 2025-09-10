<template>
    <el-container>
        <el-header class="header">
            <Header />
        </el-header>
        <el-main class="main-container">
            <!-- 使用 el-row 和 el-col 来创建栅格布局 -->
            <el-row :gutter="20" justify="center">


                <el-card class="upload-card">
                    <h2 class="main-title">上传身份证</h2>
                    <div class="upload-container">
                        <!-- 上传身份证正面 -->
                        <div class="side-upload">
                            <el-upload class="upload-demo" drag action="https://jsonplaceholder.typicode.com/posts/"
                                multiple>
                                <i class="el-icon-upload"></i>
                                <div class="el-upload__text">请上传身份证正面</div>
                                <div class="el-upload__tip" slot="tip">只能上传jpg/png文件，且不超过500kb</div>
                            </el-upload>
                            <el-upload class="upload-demo" action="/api/upload/idcard/front" :limit="1"
                                :auto-upload="false" :file-list="frontFileList" :before-upload="beforeUpload"
                                :on-success="handleUploadSuccess('front')" :on-error="handleUploadError('front')"
                                ref="uploadFront" list-type="picture">
                                <el-button type="primary">
                                    <i class="el-icon-upload"></i> 选择文件
                                </el-button>
                            </el-upload>
                            <el-button type="success" @click="uploadFile('front')" :disabled="!frontFileList.length"
                                class="upload-button">
                                上传正面
                            </el-button>
                            <!-- 文件预览 -->
                            <div v-if="frontFileList.length" class="preview-container">
                                <h5>预览：</h5>
                                <div v-if="isImage(frontFileList[0].type)">
                                    <img :src="frontFileList[0].url || frontFileList[0].raw" alt="预览图片"
                                        class="preview-image" />
                                </div>
                                <div v-else-if="isPDF(frontFileList[0].type)">
                                    <a :href="frontFileList[0].url || frontFileList[0].raw" target="_blank">
                                        查看PDF文件
                                    </a>
                                </div>
                            </div>
                        </div>

                        <!-- 上传身份证反面 -->
                        <div class="side-upload">
                            <el-upload class="upload-demo" drag action="https://jsonplaceholder.typicode.com/posts/"
                                multiple>
                                <i class="el-icon-upload"></i>
                                <div class="el-upload__text">请上传身份证反面</div>
                            </el-upload>
                            <el-upload class="upload-demo" action="/api/upload/idcard/back" :limit="1"
                                :auto-upload="false" :file-list="backFileList" :before-upload="beforeUpload"
                                :on-success="handleUploadSuccess('back')" :on-error="handleUploadError('back')"
                                ref="uploadBack" list-type="picture">
                                <el-button type="primary">
                                    <i class="el-icon-upload"></i> 选择文件
                                </el-button>
                            </el-upload>
                            <el-button type="success" @click="uploadFile('back')" :disabled="!backFileList.length"
                                class="upload-button">
                                上传反面
                            </el-button>
                            <!-- 文件预览 -->
                            <div v-if="backFileList.length" class="preview-container">
                                <h5>预览：</h5>
                                <div v-if="isImage(backFileList[0].type)">
                                    <img :src="backFileList[0].url || backFileList[0].raw" alt="预览图片"
                                        class="preview-image" />
                                </div>
                                <div v-else-if="isPDF(backFileList[0].type)">
                                    <a :href="backFileList[0].url || backFileList[0].raw" target="_blank">
                                        查看PDF文件
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
                </el-card>

            </el-row>
        </el-main>
    </el-container>
</template>

<script>
import Header from '@/components/Header';
import axios from 'axios';

export default {
    name: "Dashboard",
    components: {
        Header,
    },
    data() {
        return {
            frontFileList: [], // 身份证正面文件列表
            backFileList: [], // 身份证反面文件列表
            userId: '',
        };
    },
    methods: {
        // 文件上传前校验
        beforeUpload(file) {
            const isJPGOrPNG =
                file.type === 'image/jpeg' ||
                file.type === 'image/png' ||
                file.type === 'application/pdf';
            const isLt2M = file.size / 1024 / 1024 < 2;

            if (!isJPGOrPNG) {
                this.$message.error('上传文件只能是 JPG/PNG 或 PDF 格式!');
                return false;
            }
            if (!isLt2M) {
                this.$message.error('上传文件大小不能超过 2MB!');
                return false;
            }
            return true;
        },

        // 处理文件上传成功
        handleUploadSuccess(side) {
            return (response, file, fileList) => {
                this.$message.success(`${side === 'front' ? '正面' : '反面'}文件上传成功！`);
                if (side === 'front') {
                    this.frontFileList = fileList;
                } else {
                    this.backFileList = fileList;
                }
            };
        },

        // 处理文件上传错误
        handleUploadError(side) {
            return (err, file, fileList) => {
                console.error(`${side === 'front' ? '正面' : '反面'}文件上传失败:`, err);
                this.$message.error(`${side === 'front' ? '正面' : '反面'}文件上传失败，请重试！`);
            };
        },

        // 手动触发文件上传
        uploadFile(side) {
            if (side === 'front') {
                this.$refs.uploadFront.submit(); // 调用正面上传的 submit 方法
            } else if (side === 'back') {
                this.$refs.uploadBack.submit(); // 调用反面上传的 submit 方法
            }
        },

        // 判断文件类型
        isImage(type) {
            return type === 'image/jpeg' || type === 'image/png';
        },
        isPDF(type) {
            return type === 'application/pdf';
        },
    },
};
</script>



<style scoped>
/* 整体背景样式 */
body,
html {
    margin: 0;
    padding: 0;
    background-color: #f5f7fa;
    /* 淡灰色背景 */
    font-family: 'Arial', sans-serif;
    color: #333;
    /* 默认字体颜色 */
}

.main-container {
    padding: 20px;
}

.main-title {
    text-align: center;
    margin-bottom: 20px;
    font-size: 24px;
    color: #333;
}

h3 {
    font-size: 18px;
    color: #555;
    margin-bottom: 15px;
}

.upload-card {
    padding: 20px;
    border: 1px solid #ebeef5;
    border-radius: 8px;
    background-color: #ffffff;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    width: 100%;
    /* 由 el-col 控制宽度 */
}

.upload-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
    margin-top: 10px;
}

.side-upload {
    width: 100%;
}

.upload-button {
    margin-top: 10px;
}

.el-upload__tip {
    color: #999;
    font-size: 12px;
    text-align: center;
    margin-top: 10px;
}

.preview-container {
    margin-top: 10px;
    text-align: center;
}

.preview-image {
    max-width: 100%;
    height: auto;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
}

/* 居中且宽度为70%的列 */
.centered-col {
    display: flex;
    justify-content: center;
    /* 使用栅格系统控制宽度，不需要自定义宽度 */
    max-width: 800px;
    /* 设置最大宽度，避免在超大屏幕上过宽 */
}

/* 响应式设计 */
@media (max-width: 768px) {
    .upload-container {
        flex-direction: column;
        align-items: stretch;
    }

    .upload-card {
        width: 100% !important;
        /* 在小屏幕上占满全宽 */
    }

    .centered-col {
        width: 100%;
        /* 在小屏幕上全宽 */
    }
}
</style>
