---
cover: https://source.unsplash.com/random/?git
title: 前端工程化编程规范解决方案(Commitizen + Husky + Commitlint + lint-staged)
description: >-
  工作中，我们常常是以一个团队为单位去开发，每个人都有自己的代码风格，或者时常会有新的同学进入团队，不熟悉团队的代码要求，误提不合规的代码。人工review时常会有疏漏，因此需要一些工具来规范或者自动化review。
tags:
  - git
  - 代码规范
  - 前端工程
categories:
  - 技术分享
swiper_index: 4 #置顶轮播图顺序，非负整数，数字越大越靠前
abbrlink: 56c169c
date: 2023-01-16 21:12:23
---

工作中，我们常常是以一个团队为单位去开发，每个人都有自己的代码风格，或者时常会有新的同学进入团队，不熟悉团队的代码要求，误提不合规的代码。人工review时常会有疏漏，因此需要一些工具来规范或者自动化review。

# commit规范

## commitizen

`commitizen` 提供commit模版，用户一步步填写后生成最终的commit信息，可以帮助我们规范化git commit的提交, 安装`commitizen`后，我们可以使用`git cz`来代替`git commit`。

[Commitizen github](https://github.com/commitizen/cz-cli 'commitizen github').

1. 全局安装`Commitizen`
```bash
npm install -g commitizen@4.2.4
```

2. 项目内安装并配置 cz-customizable 插件
    a. 使用 npm 下载 cz-customizable
    ```bash
    npm i cz-customizable@6.3.0 --save-dev
    ```
    b. 添加以下配置到 `package.json` 中
    ```bash
      "config": {
        "commitizen": {
          "path": "node_modules/cz-customizable"
        }
      }
    ```
    c. 项目根目录下创建 `.cz-config.js` 自定义提示文件
    ```js
    module.exports = {
        // 可选类型
        types: [
            { value: ':sparkles: feat', name: '✨ feat:     新功能' },
            { value: ':bug: fix', name: '🐛 fix:      修复' },
            { value: ':zap: perf', name: '⚡ perf:     性能优化' },
            {
                value: ':rocket: chore',
                name: '🚀 chore:    构建过程或辅助工具的变动',
            },
            { value: ':tada: init', name: '🎉 init:     初始化' },
            { value: ':memo: docs', name: '📝 docs:     文档变更' },
            {
                value: ':lipstick: style',
                name: '💄 style:    代码格式(不影响代码运行的变动)',
            },
            {
                value: ':recycle: refactor',
                name: '♻️ refactor: 重构(既不是增加feature，也不是修复bug)',
            },
            { value: ':white_check_mark: test', name: '✅ test:     增加测试' },
            { value: ':rewind: revert', name: '⏪️ revert:   回退' },
            { value: ':package: build', name: '📦️ build:    打包' },
        ],
        messages: {
            type: '请选择提交类型:',
            customScope: '请输入修改范围(可选):',
            subject: '请简要描述提交(必填):',
            body: '请输入详细描述(可选):',
            footer: '请输入要关闭的issue(可选):',
            confirmCommit: '确认使用以上信息提交？(y/n/e/h)',
        },
        // 跳过问题
        skipQuestions: ['body', 'footer'],
        // subject文字长度默认是72
        subjectLimit: 100,
    };
    ```
    
    d. 使用 `git cz` 代替 `git commit`，即可看到提示内容 

那么到这里就已经可以使用`git cz` 来代替了 `git commit` 实现了规范化的提交诉求了，但是当前依然存在着一个问题，那就是我们必须要通过 `git cz` 指令才可以完成规范化提交！
那么如果有马虎的人，他们忘记了使用 `git cz` 指令，直接就提交了怎么办呢？
那么有没有方式来限制这种错误的出现呢？
答案是 **Git Hooks！**

# Git Hooks

而要实现这个目的，我们就需要先来了解一个概念，叫做 `Git hooks`（git 钩子 || git 回调方法）
也就是：git 在执行某个事件之前或之后进行一些其他额外的操作.
而我们所期望的 阻止不合规的提交消息，那么就需要使用到 hooks 的钩子函数。

整体的 hooks 非常多，当时我们其中用的比较多的其实只有两个：
|  Git Hook	   | 调用时机	  | 说明  |
|  ----  | ----  |  ----  |
| pre-commit	  | `git commit`执行前 它不接受任何参数，并且在获取提交日志消息并进行提交之前被调用。脚本`git commit`以非零状态退出会导致命令在创建提交之前中止。 | 可以用 `git commit --no-verify` 绕过 |
| commit-msg	  | `git commit`执行前 可用于将消息规范化为某种项目标准格式。还可用于在检查消息文件后拒绝提交。 | 可以用 `git commit --no-verify` 绕过 |

1. commit-msg：可以用来规范化标准格式，并且可以按需指定是否要拒绝本次提交
2. pre-commit：会在提交前被调用，并且可以按需指定是否要拒绝本次提交。

我们了解了 `git hooks` 的概念，那么接下来我们就使用 `git hooks` 来去校验我们的提交信息。

# commintlint & husky

要完成这么个目标，那么我们需要使用两个工具：

1. commitlint：用于检查提交信息

2. husky：是git hooks工具

## commitlint
  a. 使用 npm 下载 commitlint 
  ```bash
  npm i @commitlint/cli@17.4.0 --save-dev
  npm i @commitlint/config-conventional@12.1.4 --save-dev
  ```

  b. 使用 npm 下载 commitlint emoji 插件
  ```bash
  npm i commitlint-config-cz@0.13.3 --save-dev
  npm i commitlint-config-git-commit-emoji@1.0.0 --save-dev
  ```

  c. 项目根目录下创建 `commitlint.config.js` commitlint 配置文件
  ```js
    module.exports = {
      // 继承的规则
      extends: ['git-commit-emoji', 'cz']
      // 定义规则类型
      // 定义规则类型
      // rules: {
      //     // type 类型定义，表示 git 提交的 type 必须在以下类型范围内
      //     // 'type-enum': [
      //     //     // 当前验证的错误级别
      //     //     2,
      //     //     // 在什么情况下进行验证
      //     //     'always',
      //     //     // 泛型内容
      //     //     [
      //     //         ':sparkles: feat', // 新功能 feature
      //     //         ':bug: fix', // 修复 bug
      //     //         ':memo: docs', // 文档注释
      //     //         ':lipstick: style', // 代码格式(不影响代码运行的变动)
      //     //         ':recycle: refactor', // 重构(既不增加新功能，也不是修复bug)
      //     //         ':zap: perf', // 性能优化
      //     //         ':white_check_mark: test', // 增加测试
      //     //         ':rocket: chore', // 构建过程或辅助工具的变动
      //     //         ':rewind: revert', // 回退
      //     //         ':package: build', // 打包
      //     //         ':tada: init' // 打包
      //     //     ]
      //     // ],
      //     // subject 大小写不做校验
      //     // 'subject-case': [0]
      //     // 'subject-exclamation-mark': [0]
      // }
  };
  ```

## husky
  a. 使用 npm 下载 husky
  ```bash
  npm install husky@7.0.1 --save-dev
  ``` 
  b. 启动 `hooks` ， 生成 `.husky` 文件夹
  ```bash
  npx husky install
  ```
  c. 添加 `commitlint` 的 hook 到 `husky` 中，并指令在 `commit-msg` 的 hooks 下执行 `npx --no-install commitlint --edit "$1"` 指令
  ```bash
  npx husky add .husky/commit-msg 'npx --no-install commitlint --edit "$1"'
  ```
  

至此，就已经可以处理好了 **强制规范化的提交要求**，到现在 不符合规范的提交信息，将不可在被提交！
那么到这里我们的 规范化目标 就完成了吗？
当然没有！
现在我们还缺少一个 **规范化的处理** ，那就是 **代码格式提交规范处理！**

# lint-staged

`ESLint` 与 `Prettier` 配合可以解决代码格式问题，但是这样的一个格式处理问题，他只能够在本地进行处理，并且我们还需要 手动在 VSCode 中配置自动保存 才可以。那么这样就会存在一个问题，要是有人忘记配置这个东西了怎么办呢？他把代码写的乱七八糟的直接就提交了怎么办呢？

所以我们就需要有一种方式来规避这种风险。

那么想要完成这么一个操作就需要使用 `husky` 配合 `eslint` 才可以实现。

我们期望通过 `husky` 监测 `pre-commit` 钩子，在该钩子下执行类似 `npx eslint --ext .js,.vue src` 一些指令来去进行相关检测。

`lint-staged` 可以让你当前的代码检查 **只检查本次修改更新的代码，并在出现错误的时候，自动修复并且推送。**

  a. 使用 npm 下载 lint-staged，`lint-staged` 可以在commit前执行操作
  ```bash
  npm install lint-staged@13.1.0 --save-dev
  ```
  b. 在 `package.json` 中添加 `lint-staged` 钩子
  ```bash
  "lint-staged": {
    "src/**/*.{js,vue}": [
      "eslint --fix",
      "git add"
    ]
  }
  ```
  c. 添加 `commitlint` 的 hook 到 `husky` 中，并指令在 `pre-commit` 的 hooks 下执行 `npx lint-staged` 指令
  ```bash
  npx husky add .husky/pre-commit 'npx lint-staged'
  ```

如上配置，每次它只会在你本地 `commit` 之前，校验你提交的内容是否符合你本地配置的 `eslint`规则(这个见文档 ESLint )，校验会出现两种结果：
  a. 如果符合规则：则会提交成功。
  b. 如果不符合规则：它会自动执行 `eslint --fix` 尝试帮你自动修复，如果修复成功则会帮你把修复好的代码提交，如果失败，则会提示你错误，让你修好这个错误之后才能允许你提交代码。


# 总结

`commitizen` 已经是目前作为 git 提交规范中最优秀的工具之一了。在团队开发中，一般结合 `Eslint` 和 `Prettier` 工具一起使用，配合 `husky` 和 `commitlint` 钩子，做提交前的代码检测，做到自动化符合团队代码规范，养成良好的代码规范是每个程序员的必修课！


