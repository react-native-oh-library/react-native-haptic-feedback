/**
 * MIT License
 *
 * Copyright (C) 2024 Huawei Device Co., Ltd.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import { TurboModule, TurboModuleContext } from '@rnoh/react-native-openharmony/ts';
import { TM } from '@rnoh/react-native-openharmony/generated/ts';
import Logger from './Logger';
import vibrator from '@ohos.vibrator';
import audio from '@ohos.multimedia.audio';
import { BusinessError } from '@ohos.base';
import common from '@ohos.app.ability.common';


export class RNHapticFeedbackTurboModule extends TurboModule implements TM.HapticFeedbackNativeModule.Spec {

  private context:common.UIAbilityContext

  constructor(ctx:TurboModuleContext) {
    super(ctx);
   this.context=ctx.uiAbilityContext

  }

  public trigger(type:string,options?:{ignoreHOSSystemSettings: boolean}): void {

    let ignoreHOSSystemSettingsVal=options?.ignoreHOSSystemSettings||false

    let rawFd=this.context.resourceManager.getRawFdSync(`${type}.json`);

    let audioManager = audio.getAudioManager();
    let audioVolumeManager: audio.AudioVolumeManager = audioManager.getVolumeManager();
    try {
      let audioVolumeGroupManager: audio.AudioVolumeGroupManager = audioVolumeManager.getVolumeGroupManagerSync(audio.DEFAULT_VOLUME_GROUP_ID);
      Logger.info(`Get audioVolumeGroupManager success.`);
      let value: audio.AudioRingMode = audioVolumeGroupManager.getRingerModeSync()
      let isVolumeOn=value!=0
      let isVibrateMode=value==1
      Logger.info(`Indicate that the ringer mode is obtained ${value}. finalBollen:${ignoreHOSSystemSettingsVal == false && !(isVolumeOn || isVibrateMode)}  isVolumeOn:${isVolumeOn} isVibrateMode:${isVibrateMode}`);

      if(ignoreHOSSystemSettingsVal == false && !(isVolumeOn || isVibrateMode)) return

      try {
        vibrator.startVibration({
          type: "file",
          hapticFd: { fd: rawFd.fd,offset: rawFd.offset, length: rawFd.length }
        }, {
          id: 0,
          usage: 'unknown'
        }).then(() => {
          Logger.info(`Succeed in starting vibration!!!!!!    type:${type}.json    fd:${rawFd.fd}  offset: ${rawFd.offset}  length: ${rawFd.length}`);

        }, (error: BusinessError) => {
          Logger.error(`Failed to start vibration. Code: ${error.code}, message: ${error.message} 请检测是否打开手机系统触感反馈`);
        });
      } catch (err) {
        let e: BusinessError = err as BusinessError;
        Logger.error(`An unexpected error occurred. Code: ${e.code}, message: ${e.message}`);
      }

} catch (err) {
  let error = err as BusinessError;
      Logger.error(`Failed to get audioVolumeGroupManager, error: ${error}`);

}

      this.context.resourceManager.closeRawFdSync(`${type}.json`)

  }

}