<template>
  <el-row class="tac" style="height: 100%;">
    <el-col :span="24" style="height: 100%; overflow: hidden;">
      <el-menu class="el-menu-vertical-demo" background-color="#2c3e50" text-color="#ecf0f1" active-text-color="#1abc9c"
        style="height: 100%;" @select="handleSelect" default-active="1-1" :default-openeds="['1', '3']">
        <el-submenu index="1">
          <template slot="title">
            <i class="el-icon-document" style="font-size: 20px;"></i>
            <span>合同管理</span>
          </template>
          <el-menu-item index="1-1" @mouseenter="animateMenuItem">合同列表</el-menu-item>
          <el-menu-item index="1-2" @mouseenter="animateMenuItem">创建合同</el-menu-item>
          <el-menu-item index="1-3" @mouseenter="animateMenuItem">模板管理</el-menu-item>
        </el-submenu>
        <el-submenu index="3">
          <template slot="title">
            <i class="el-icon-chat-dot-square" style="font-size: 20px;"></i>
            <span>法律咨询</span>
          </template>
          <el-menu-item index="3-1" @mouseenter="animateMenuItem">AI咨询</el-menu-item>
        </el-submenu>
      </el-menu>
    </el-col>
  </el-row>
</template>

<script>
import { gsap } from "gsap";

export default {
  name: "Navigator",
  methods: {
    handleSelect(key) {
      switch (key) {
        case '1-1':
          this.$router.push('/contractlist');
          break;
        case '1-2':
          this.$router.push('/createcontract');
          break;
        case '1-3':
          this.$router.push('/templatemanagement');
          break;
        case '3-1':
          this.$router.push('/aiconsultingt');
          break;
        default:
          console.log('Unknown menu item selected:', key);
      }
    },
    animateMenuItem(event) {
      gsap.to(event.target, { duration: 0.5, x: 10, ease: "bounce" });
    }
  }
}
</script>

<style scoped>
.el-menu-vertical-demo {
  background-color: #2c3e50;
  color: #ecf0f1;
  width: 100%;
}

.el-menu-item {
  display: flex;
  align-items: center;
  font-size: 16px;
}

.el-menu-vertical-demo .el-submenu__title {
  color: #ecf0f1;
  font-size: 16px;
}

.el-menu-vertical-demo .el-menu-item:hover,
.el-menu-vertical-demo .el-submenu__title:hover {
  background-color: #34495e;
}

.el-menu-vertical-demo .el-submenu__title .el-icon,
.el-menu-vertical-demo .el-menu-item .el-icon {
  margin-right: 10px;
  color: #ecf0f1;
}

.el-menu-vertical-demo .el-menu-item.is-active {
  background-color: #1abc9c;
}
</style>
