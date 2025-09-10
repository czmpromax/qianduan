<template>
    <!-- 区块详情页面 -->
    <div id="app">
        <el-container>
            <!-- 顶部标题栏 -->
            <el-header class="header">
                <Header />
            </el-header>

            <!-- 哈希搜索框 -->
            <div class="search-container">
                <div class="search-box">
                    <el-input v-model="searchHash" placeholder="输入备案号" clearable class="search-input">
                    </el-input>
                    <el-button class="search-icon search-button" @click="onSearch">
                        <i class="el-icon-search"></i>
                    </el-button>
                </div>
            </div>

            <div class="web-font" style="width:100%">
                <div style="height: 100%; padding-top: 20px;">
                    <div class="home main">
                        <div>
                            <!-- 顶部数据展示 -->
                            <div class="home-head">
                                <div class="home-head-data grid-container">
                                    <ul>
                                        <li class="grid-item bg-8693f3">
                                            <span class="home-head-data-label">当前块高</span>
                                            <span class="home-head-data-content">{{ this.blockNumber }}</span>
                                        </li>
                                        <li class="grid-item bg-bc8dee">
                                            <span class="home-head-data-label">交易总量</span>
                                            <span class="home-head-data-content">{{ this.transactionCount }}</span>
                                        </li>
                                        <li class="grid-item bg-ffa897">
                                            <span class="home-head-data-label">失败的交易量</span>
                                            <span class="home-head-data-content">{{ this.failedTransactionCount
                                                }}</span>
                                        </li>
                                        <li class="grid-item bg-89c3f8">
                                            <span class="home-head-data-label">节点ID</span>
                                            <span class="home-head-data-content">{{ this.NodeId }}</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                            <!-- 节点表格 -->
                            <div class="table-container">
                                <h3>节点信息</h3>
                                <el-table :data="paginatedNodeList" style="width: 800%;"
                                    :cell-style="{ textAlign: 'center' }">
                                    <el-table-column prop="nodeId" label="节点ID" width="510"
                                        align="center"></el-table-column>
                                    <el-table-column prop="blockNumber" label="当前块高" align="center"></el-table-column>
                                    <el-table-column prop="pbftView" label="pbftView" align="center"></el-table-column>
                                    <el-table-column prop="status" label="节点状态" align="center">
                                        <template #default="{ row }">
                                            <span :style="{
                                                color: row.status === '正常' ? 'green' : 'red',
                                                fontWeight: row.status === '异常' ? 'bold' : 'normal'
                                            }">
                                                {{ row.status }}
                                            </span>
                                        </template>
                                    </el-table-column>
                                </el-table>
                                <el-pagination layout="prev, pager, next" :page-size="pageSize"
                                    :current-page.sync="currentPageNode" :total="nodeList.length" align="center">
                                </el-pagination>
                            </div>

                            <!-- 区块与交易信息 -->
                            <div class=" dual-table">
                                <!-- 区块信息 -->
                                <div class="table-section block-table">
                                    <h3>区块</h3>
                                    <el-table :data="paginatedBlockList" style="width: 100%;">
                                        <el-table-column prop="blockNum" label="区块编号" width="150"
                                            align="center"></el-table-column>
                                        <el-table-column prop="time" label="时间" :formatter="formatTime"
                                            align="center"></el-table-column>
                                        <el-table-column prop="blockHash" label="区块哈希" align="center"></el-table-column>
                                    </el-table>
                                    <el-pagination layout="prev, pager, next" :page-size="pageSize"
                                        :current-page.sync="currentPageBlock" :total="blockList.length" align="center">
                                    </el-pagination>
                                </div>

                                <!-- 交易信息 -->
                                <div class="table-section transaction-table">
                                    <h3>交易</h3>
                                    <el-table :data="paginatedTransactionList" style="width: 100%;">
                                        <el-table-column prop="transactionHash" label="交易哈希" width="300">
                                            <!-- 每一行交易哈希点击触发查询 -->
                                            <template #default="{ row }">
                                                <el-link type="primary" @click="searchByHash(row.transactionHash)">
                                                    {{ row.transactionHash }}
                                                </el-link>
                                            </template>
                                        </el-table-column>
                                        <el-table-column prop="from" label="发送方"></el-table-column>
                                        <el-table-column prop="to" label="接收方"></el-table-column>
                                        <el-table-column prop="time" label="时间"
                                            :formatter="formatTime"></el-table-column>
                                    </el-table>
                                    <el-pagination layout="prev, pager, next" :page-size="pageSize"
                                        :current-page.sync="currentPageTransaction" :total="transactionList.length"
                                        align="center">
                                    </el-pagination>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </el-container>
    </div>
</template>
<script>
import Header from '@/components/Header';
import * as echarts from 'echarts';
import Navigator from '../../components/Navigator.vue';

export default {
    data() {
        return {
            blockNumber: 0,
            transactionCount: 0,
            failedTransactionCount: 0,
            NodeId: '',
            nodeList: [],
            blockList: [],
            transactionList: [],
            currentPageNode: 1,
            currentPageBlock: 1,
            currentPageTransaction: 1,
            pageSize: 5,
            data_list: [],
            count_list: [],
            searchHash: '',
            callback: []
        };
    },
    components: {
        Header,
        Navigator
    },
    created() {
        this.getData();
    },
    computed: {
        // 节点信息分页数据
        paginatedNodeList() {
            return this.nodeList.slice((this.currentPageNode - 1) * this.pageSize, this.currentPageNode * this.pageSize);
        },
        // 区块信息分页数据
        paginatedBlockList() {
            return this.blockList.slice((this.currentPageBlock - 1) * this.pageSize, this.currentPageBlock * this.pageSize);
        },
        // 交易信息分页数据
        paginatedTransactionList() {
            return this.transactionList.slice((this.currentPageTransaction - 1) * this.pageSize, this.currentPageTransaction * this.pageSize);
        }
    },
    methods: {
        formatTime(row, column, cellValue, index) {
            // cellValue为原始时间字符串，如 "56928-12-15 11:13:00"
            if (!cellValue) return '';

            // 假设你的原始格式类似 "YYYY-MM-DD HH:MM:SS"，
            // 这里的年份是个不正常的值 "56928" 示例，所以需要替换为2024。
            // 如果实际数据是正常的日期字符串，请根据实际情况解析。

            // 将日期和时间部分拆开
            let [dateStr, timeStr] = cellValue.split(' ');
            let [year, month, day] = dateStr.split('-');


            // 将空格替换为'-'使格式变成 "2024-12-15-11:13:00"
            // 或者如果你只是想在日期和时间之间用'-'连接，也可直接:
            const formatted = `${year}-${month}-${day}-${timeStr}`;

            return formatted;
        },
        getData() {
            this.axios.get("contract/getList").then(response => {
                const data = response.data;

                this.blockNumber = data.blockHeight;
                this.transactionCount = data.totalTransactionCount;
                this.failedTransactionCount = data.failedTransactionCount;
                this.NodeId = data.NodeId;

                this.nodeList = data.nodeList || [];
                this.blockList = data.blockList || [];
                this.transactionList = data.transactionList || [];
            }).catch(error => {
                console.error("数据获取失败", error);
            });
            this.axios.get("contract/getblock").then(response => {
                const data = response.data;
                this.blockNumber = data.blockHeight;
                this.transactionCount = data.totalTransactionCount;
                this.failedTransactionCount = data.failedTransactionCount;
                this.NodeId = data.NodeId;
                this.data_list = data.dateList || [];
                this.count_list = data.transactionList || [];

                this.initChart();
            }).catch(error => {
                console.error("数据获取失败", error);
            });
        },
        onSearch() {
            const input = this.searchHash ? this.searchHash.trim() : '';

            if (!input || !/^\d+$/.test(input)) {
                // 判断输入是否为空或是否为纯数字
                this.$message.error('请输入有效的备案号');
                return;
            }

            // 输入的是合同 ID（数字），调用合同接口并显示结果
            this.axios
                .get('/contract/getcrontractxx', { params: { crontractId: input } })
                .then((response) => {
                    const contractData = response.data;

                    if (!contractData || contractData.error) {
                        this.$message.error(contractData.error || '获取合同信息失败');
                        return;
                    }

                    // 弹出提示框显示合同信息
                    this.$alert(
                        `<div class="custom-dialog-content">
                        <style>
                            .custom-dialog{
                             width: 1000px;
                            }
                            .custom-dialog-content {
                                max-width: 800px; /* 弹窗宽度 */
                                margin: 0 auto; /* 居中 */
                            }
                            .custom-dialog-table {
                                width: 100%;
                                border-collapse: collapse;
                                font-size: 14px;
                                line-height: 1.8;
                            }
                            .custom-dialog-table td {
                                padding: 10px 8px;
                                vertical-align: top;
                                word-break: break-all;
                            }
                            .custom-dialog-table td:first-child {
                                font-weight: bold;
                                color: #333;
                                width: 30%; /* 左侧标题固定宽度 */
                            }
                            .custom-dialog-table td:last-child {
                                word-break: break-all;
                                color: #666;
                            }
                            /* 区块分隔样式 */
                            .custom-section {
                                padding: 10px;
                                background-color: #f9f9f9; /* 浅灰背景 */
                                margin: 10px 0; /* 分隔块的上下间距 */
                                border-radius: 4px; /* 圆角 */
                                border: 1px solid #ddd; /* 边框颜色 */
                            }
                        </style>
                        <table class="custom-dialog-table">
                            <tr>
                                <td>合同备案号</td>
                                <td>${contractData.id}</td>
                            </tr>
                            <tr>
                                <td>合同名称</td>
                                <td>${contractData.name}</td>
                            </tr>
                            <tr>
                                <td>合同哈希</td>
                                <td>${contractData.hash}</td>
                            </tr>
                            <tr>
                                <td>区块哈希</td>
                                <td>${contractData.blockHash}</td>
                            </tr>
                            <tr>
                                <td>交易哈希</td>
                                <td>${contractData.transactionHash}</td>
                            </tr>
                            <tr>
                                <td>签署人</td>
                                <td>${contractData.signers.join(', ')}</td>
                            </tr>
                        </table>
                    </div>`,
                        '合同信息',
                        {
                            dangerouslyUseHTMLString: true, // 允许 HTML 格式
                            confirmButtonText: '关闭',
                            customClass: 'custom-dialog', // 自定义弹窗样式类名
                        }
                    );

                })
                .catch((error) => {
                    console.error('获取合同信息失败:', error);
                    this.$message.error(error.response?.data?.message || '获取合同信息失败');
                });
        },
        // 根据列表中的交易哈希查询
        searchByHash(transactionHash) {
            if (!transactionHash) {
                this.$message.error('无效的交易哈希');
                return;
            }

            // 调用接口查询交易哈希
            this.axios.get('/contract/getTransactionHash', { params: { transactionHash } })
                .then((response) => {
                    const transactionData = response.data;

                    console.log('交易详情响应:', transactionData);

                    if (!transactionData || transactionData.error) {
                        this.$message.error(transactionData.error || '获取交易详情失败');
                        return;
                    }

                    // 跳转到交易详情页面，传递哈希作为参数
                    this.$router.push({
                        path: '/transactionhash',
                        query: { transactionHash }
                    });
                })
                .catch((error) => {
                    console.error('获取交易详情失败:', error);
                    this.$message.error(error.response?.data?.message || '获取交易详情失败');
                });
        },
        querySearch(queryString, callback) {
            if (!queryString) {
                callback([]); // 如果没有输入，返回空数组
                return;
            }
            const suggestions = this.transactionList
                .filter(item => item.transactionHash.includes(queryString)) // 根据输入过滤
                .map(item => ({ value: item.transactionHash })); // 提取交易哈希并格式化
            callback(suggestions);
        },
    }
};
</script>

<style scoped>
@import url("../../assets/css/BlockMessage.css");
</style>