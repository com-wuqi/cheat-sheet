---
title: FFmpeg 常用命令
description: 转码、提取音频、裁剪、缩放、字幕和 GIF 处理的常用参数。
sidebarSort: 42
---

# FFmpeg 常用命令

整理自 [skywind3000/awesome-cheatsheets](https://github.com/skywind3000/awesome-cheatsheets) 的中文速查表。

## 基础参数

```bash
-codecs                                                     # 列出可用编码
-formats                                                    # 列出支持的格式
-protocols                                                  # 列出支持的协议
-i input.mp4                                                # 指定输入文件
-c:v libx264                                                # 指定视频编码
-c:a aac                                                    # 指定音频编码
-vcodec libx264                                             # 旧写法
-acodec aac                                                 # 旧写法
-fs SIZE                                                    # 指定文件大小
```

## 音频参数

```bash
-aq QUALITY                                                 # 音频质量，编码器相关
-ar 44100                                                   # 音频采样率
-ac 1                                                       # 音频声道数量
-an                                                         # 禁止音频
-filter:a "volume=2.0"                                      # 改变音量（-vol 已过时）
```

## 视频参数

```bash
-aspect RATIO                                               # 长宽比 4:3, 16:9
-r RATE                                                     # 每秒帧率
-s WIDTHxHEIGHT                                             # 视频尺寸：640x480
-vn                                                         # 禁用视频
```

## 码率设置

```bash
-b:v 1M                                                     # 设置视频码率 1mbps/s
-b:a 1M                                                     # 设置音频码率 1mbps/s
```

## 视频转码

```bash
ffmpeg -i input.mov output.mp4                              # 转码为 MP4
ffmpeg -i input.mp4 -vn -c:a copy output.aac                # 提取音频
ffmpeg -i input.mp4 -vn -c:a mp3 output.mp3                 # 提取音频并转码
ffmpeg -i input.mov -c:v libx264 -c:a aac out.mp4        # 指定编码参数
ffmpeg -i input.mov -c:v libvpx -c:a libvorbis out.webm     # 转换 webm
ffmpeg -i input.mp4 -ab 56 -ar 44100 -b 200 -f flv out.flv  # 转换 flv
ffmpeg -i input.mp4 -an output.gif                        # 转换 GIF
```

## 切分视频

```bash
ffmpeg -i input.mp4 -ss 0 -t 60 first-1-min.mp4             # 切割开头一分钟
ffmpeg -i input.mp4 -ss 60 -t 60 second-1-min.mp4           # 一分钟到两分钟
ffmpeg -i input.mp4 -ss 00:01:23.000 -t 60 first-1-min.mp4  # 另一种时间格式
```

## 视频尺寸

```bash
ffmpeg -i input.mp4 -vf "scale=640:320" output.mp4          # 视频尺寸缩放
ffmpeg -i input.mp4 -vf "crop=400:300:10:10" output.mp4     # 视频尺寸裁剪
```

## 其他用法

```bash
ffmpeg -i sub.srt sub.ass                                   # 字幕格式转换
ffmpeg -i input.mp4 -vf ass=sub.ass out.mp4                 # 烧录字幕进视频
ffmpeg -i "<url>" out.mp4                                   # 下载视频
```

## 组合用法

```bash
# 给 gif 加上静音音轨并转换成 mp4
ffmpeg -f lavfi -i anullsrc -i in.gif -c:v libx264 -c:a aac -shortest out.mp4

# 给 gif 加上静音音轨并转换成 mp4，兼容手机播放
ffmpeg -f lavfi -i anullsrc -i in.gif -c:v libx264 -c:a aac -shortest \
       -pix_fmt yuv420p -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" out.mp4
```

## 相关资源

- https://cheatography.com/thetartankilt/cheat-sheets/ffmpeg/
- http://qwinff.github.io/

## 来源

- [skywind3000/awesome-cheatsheets](https://github.com/skywind3000/awesome-cheatsheets)（MIT License，Copyright (c) 2018 Linwei）
- 原作者：skywind
