---
title: ADB 常用命令
description: 设备连接、应用安装、日志、截图录制、文件传输与系统调试。
sidebarSort: 43
---

# ADB 常用命令

Android Debug Bridge 常用命令。以下命令已补全 `adb` 前缀。

## 常用命令

```bash
adb devices                                   # 查看已连接的设备
adb start-server                              # 启动 adb server
adb kill-server                               # 停止 adb server
adb logcat                                    # 查看日志
adb install app.apk                           # 安装一个 APK
adb uninstall com.example.app                 # 卸载一个应用
adb shell                                     # 进入终端
```

## 其他命令

```bash
adb help                                      # 查看帮助信息
adb version                                   # 查看版本
adb forward tcp:8080 tcp:8080                 # 端口转发
adb reverse tcp:8080 tcp:8080                 # 反向端口转发
adb bugreport                                 # 生成adb出错报告
adb disconnect                                # 断开设备
adb tcpip 5555                                # 以 TCP 模式监听端口
adb connect 192.168.1.10:5555                 # 通过 TCP 连接设备
adb reboot                                    # 重启
adb push ./local /sdcard/                     # 上传文件
adb pull /sdcard/file ./                      # 下载文件
adb root                                      # 以root权限重启adbd
adb disable-verity                            # 禁用dm-verity以使/system分区可被修改
adb remount                                   # 以rw权限重新挂载/system分区
adb get-serialno                              # 获取序列号
adb shell screencap                           # 屏幕截图
adb shell screenrecord                        # 录制视频
adb shell pm list packages                    # 列出手机装的所有app的包名
adb shell pm list packages -s                 # 列出系统应用的所有包名
adb shell pm list packages -3                 # 列出第三方应用的所有包名
adb shell pm clear com.example.app            # 清除应用数据与缓存
adb shell am start -n com.example.app/.MainActivity # 启动应用
adb shell am force-stop com.example.app       # 停止应用
adb shell wm size                             # 查看屏幕分辨率
adb shell wm density                          # 查看屏幕密度
```

## 参考

- https://developer.android.google.cn/studio/command-line/adb.html

## 来源

- [skywind3000/awesome-cheatsheets](https://github.com/skywind3000/awesome-cheatsheets)（MIT License，Copyright (c) 2018 Linwei）
- 原作者：baiguangan
