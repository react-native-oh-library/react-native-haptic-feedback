<!-- {% raw %} -->

模板版本：v0.2.2

<p align="center">
  <h1 align="center"> <code>react-native-haptic-feedback</code> </h1>
</p>

<p align="center">
    <a href="https://github.com/mkuczera/react-native-haptic-feedback">
        <img src="https://img.shields.io/badge/platforms-android%20|%20ios%2|%20harmony%20-lightgrey.svg" alt="Supported platforms" />
    </a>
    <a href="https://github.com/mkuczera/react-native-haptic-feedback?tab=MIT-1-ov-file#readme">
        <img src="https://img.shields.io/badge/license-MIT-green.svg" alt="License" />
    </a>
</p>

> [!TIP] [Github 地址](https://github.com/react-native-oh-library/react-native-haptic-feedback)

## 安装与使用

请到三方库的 Releases 发布地址查看配套的版本信息：[@react-native-oh-tpl/react-native-haptic-feedback Releases](https://github.com/react-native-oh-library/react-native-haptic-feedback/releases)，并下载适用版本的 tgz 包。

进入到工程目录并输入以下命令：

> [!TIP] # 处替换为 tgz 包的路径

#### **npm**

```bash
npm install @react-native-oh-tpl/react-native-haptic-feedback@file:#
```

#### **yarn**

```bash
yarn add @react-native-oh-tpl/react-native-haptic-feedback@file:#
```

下面的代码展示了这个库的基本使用场景：

> [!WARNING] 使用时 import 的库名不变。

```js
import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  Button
} from 'react-native';
import { TestSuite, Tester, TestCase } from '@rnoh/testerino'
import ReactNativeHapticFeedback from 'react-native-haptic-feedback'
const options = {
  enableVibrateFallback: false,
  ignoreAndroidSystemSettings: false,
};


const methods = ['impactLight', 'impactMedium', 'impactHeavy', 'notificationSuccess', 'notificationWarning', 'notificationError', 'rigid', 'soft',
  'selection','clockTick','contextClick','keyboardPress','keyboardRelease','keyboardTap','longPress','textHandleMove','virtualKey','virtualKeyRelease',
  'effectClick', 'effectDoubleClick', 'effectHeavyClick', 'effectTick'
]

export const HapticFeedbackExample = () => {
  return (
    <SafeAreaView>
    <ScrollView>
    <Tester>
      <TestSuite name='HapticFeedbackDemo'>
        
          {
            methods.map(item => {
              return <TestCase itShould={`Trigger ${item} haptic feedback`} tags={['C_API']} key={item}>
                <Button title={item} onPress={()=>ReactNativeHapticFeedback?.trigger(item,options)}></Button>
              </TestCase>
            })
          }
          
      </TestSuite>
    </Tester>
    </ScrollView>
    </SafeAreaView>
  );
}
```

## 使用 Codegen

本库已经适配了 `Codegen` ，在使用前需要主动执行生成三方库桥接代码，详细请参考[ Codegen 使用文档](/zh-cn/codegen.md)。

## Link

目前鸿蒙暂不支持 AutoLink，所以 Link 步骤需要手动配置。

首先需要使用 DevEco Studio 打开项目里的鸿蒙工程 `harmony`

### 在工程根目录的 `oh-package.json` 添加 overrides 字段

```json
{
  ...
  "overrides": {
    "@rnoh/react-native-openharmony" : "file:./react_native_openharmony"
  }
}
```

### 引入原生端代码

目前有两种方法：

1. 通过 har 包引入（在 IDE 完善相关功能后该方法会被遗弃，目前首选此方法）；
2. 直接链接源码。

方法一：通过 har 包引入（推荐）

> [!TIP] har 包位于三方库安装路径的 `harmony` 文件夹下。

打开 `entry/oh-package.json5`，添加以下依赖

```json
"dependencies": {
    "@rnoh/react-native-openharmony": "file:../react_native_openharmony",
    "@react-native-oh-tpl/react-native-haptic-feedback": "file:../../node_modules/@react-native-oh-tpl/react-native-haptic-feedback/harmony/haptic_feedback.har"

  }
```

点击右上角的 `sync` 按钮

或者在终端执行：

```bash
cd entry
ohpm install
```

方法二：直接链接源码

> [!TIP] 如需使用直接链接源码，请参考[直接链接源码说明](/zh-cn/link-source-code.md)

### 配置 CMakeLists 和引入 RNHapticFeedbackPackage

打开 `entry/src/main/cpp/CMakeLists.txt`，添加：

```diff
project(rnapp)
cmake_minimum_required(VERSION 3.4.1)
set(CMAKE_SKIP_BUILD_RPATH TRUE)
set(RNOH_APP_DIR "${CMAKE_CURRENT_SOURCE_DIR}")
set(NODE_MODULES "${CMAKE_CURRENT_SOURCE_DIR}/../../../../../node_modules")
+ set(OH_MODULE_DIR "${CMAKE_CURRENT_SOURCE_DIR}/../../../oh_modules")
set(RNOH_CPP_DIR "${CMAKE_CURRENT_SOURCE_DIR}/../../../../../../react-native-harmony/harmony/cpp")
set(LOG_VERBOSITY_LEVEL 1)
set(CMAKE_ASM_FLAGS "-Wno-error=unused-command-line-argument -Qunused-arguments")
set(CMAKE_CXX_FLAGS "-fstack-protector-strong -Wl,-z,relro,-z,now,-z,noexecstack -s -fPIE -pie")
set(WITH_HITRACE_SYSTRACE 1) # for other CMakeLists.txt files to use
add_compile_definitions(WITH_HITRACE_SYSTRACE)

add_subdirectory("${RNOH_CPP_DIR}" ./rn)

# RNOH_BEGIN: manual_package_linking_1
add_subdirectory("../../../../sample_package/src/main/cpp" ./sample-package)
# RNOH_END: manual_package_linking_1

file(GLOB GENERATED_CPP_FILES "./generated/*.cpp")

add_library(rnoh_app SHARED
    ${GENERATED_CPP_FILES}
    "./PackageProvider.cpp"
    "${RNOH_CPP_DIR}/RNOHAppNapiBridge.cpp"
)
target_link_libraries(rnoh_app PUBLIC rnoh)

# RNOH_BEGIN: manual_package_linking_2
target_link_libraries(rnoh_app PUBLIC rnoh_sample_package)
# RNOH_END: manual_package_linking_2


```

### 在 ArkTs 侧引入 RNHapticFeedbackPackage

打开 `entry/src/main/ets/RNPackagesFactory.ts`，添加：

```diff
...
+ import { RNHapticFeedbackPackage } from '@react-native-oh-tpl/react-native-haptic-feedback/ts';

export function createRNPackages(ctx: RNPackageContext): RNPackage[] {
  return [
    new SamplePackage(ctx),
+   new RNHapticFeedbackPackage(ctx)
  ];
}
```

### 运行

点击右上角的 `sync` 按钮

或者在终端执行：

```bash
cd entry
ohpm install
```

然后编译、运行即可。

### 兼容性

要使用此库，需要使用正确的 React-Native 和 RNOH 版本。另外，还需要使用配套的 DevEco Studio 和 手机 ROM。

请到三方库相应的 Releases 发布地址查看 Release 配套的版本信息：[@react-native-oh-tpl/react-native-haptic-feedback Releases](https://github.com/react-native-oh-library/react-native-haptic-feedback/releases)

## 静态方法

> [!tip] "Platform"列表示该属性在原三方库上支持的平台。

> [!tip] "HarmonyOS Support"列为 yes 表示 HarmonyOS 平台支持该方法；no 则表示不支持；partially 表示部分支持。使用方法跨平台一致，效果对标 iOS 或 Android 的效果。

### `trigger(method, options)`

使用此方法触发触觉反馈。

| Argument                              | Description                                                                                                                                                      | Type    | Required | Platform  | HarmonyOS Support |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | -------- | --------- | ----------------- |
| `method`                              | Specifies the type of haptic feedback. See the list of available methods below.                                                                                  | string  | yes      | all       | yes               |
| `options.enableVibrateFallback`       | iOS only. If haptic feedback is unavailable (iOS < 10 OR Device < iPhone6s), vibrate with default method (heavy 1s) (default: false).                            | boolean | no       | ios       | no                |
| `options.ignoreAndroidSystemSettings` | :android: Android only. If haptic is disabled in the Android system settings, this allows ignoring the setting and triggering haptic feedback. (default: false). | boolean | no       | android   | yes                |

> [!tip] 鸿蒙系统下也使用options.ignoreAndroidSystemSettings属性名
<br>

| method                | Platform | HarmonyOS Support |
| --------------------- | :--------: | :-----------------: |
| `impactLight`         | all      | ✅               |
| `impactMedium`        | all      | ✅               |
| `impactHeavy`         | all      |✅              |
| `rigid`               | all      | ✅             |
| `soft`                | all      | ✅              |
| `notificationSuccess` | all      | ✅             |
| `notificationWarning` | all      | ✅              |
| `notificationError`   | all      | ✅             |
| `selection`           | ios      | ✅               |
|  `clockTick`      |   android   |   ✅   |
|  `contextClick`     |   android  |   ✅   |
|    `keyboardPress`    |   android   |  ✅   |
|   `keyboardRelease`   |   android   |   ✅  |
|     `keyboardTap`     |   android   |  ✅  |
|      `longPress`      |   android  |   ✅   |
|   `textHandleMove`    |   android   |   ✅  |
|     `virtualKey`      |   android  |  ✅   |
|  `virtualKeyRelease`  |   android   |  ✅   |
| `effectClick`         | android  | ✅             |
| `effectDoubleClick`   | android  |✅             |
| `effectHeavyClick`    | android  | ✅             |
| `effectTick`          | android  | ✅             |


## 遗留问题

1.目前 notificationSuccess，notificationWarning，notificationError，effectDoubleClick 多次振动方法，由于当前版本问题不支持，只能提供振动次数和振动间隔无法控制振感（默认强度 100）

## 其他

## 开源协议

本项目基于 [The MIT License (MIT)](https://github.com/mkuczera/react-native-haptic-feedback?tab=MIT-1-ov-file#readme) ，请自由地享受和参与开源。

<!-- {% endraw %} -->
