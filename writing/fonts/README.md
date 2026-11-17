# Writing 字体

Noto Serif SC，SIL Open Font License 1.1（见 OFL.txt）。

来源：https://github.com/google/fonts/tree/main/ofl/notoserifsc

使用官方完整可变字体 NotoSerifSC[wght].ttf，通过 fontTools 固定为 400 与 700 两种字重并转换为 WOFF2，保留完整字符映射，不按当前文章裁剪。正文、标题的中文字均已检查覆盖。

[
  {
    "weight": 400,
    "file": "NotoSerifSC-Regular.b6137df8c0e8.woff2",
    "bytes": 5732792,
    "glyphs": 30928
  },
  {
    "weight": 700,
    "file": "NotoSerifSC-Bold.7a7d43371394.woff2",
    "bytes": 5925608,
    "glyphs": 30928
  }
]

writing-fonts.js 只在两个完整字体都加载成功后切换字体；失败或超过 8 秒则在本次页面访问中一直使用系统字体。字体随主站和 GitHub 静态备份一起发布，无运行时第三方字体请求。
