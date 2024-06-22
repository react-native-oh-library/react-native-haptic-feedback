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
    let singleObj={
      impactLight:{type:'preset',effectId:'haptic.effect.hard',intensity:30},
      impactMedium:{type:'preset',effectId:'haptic.effect.hard',intensity:60},
      impactHeavy:{type:'preset',effectId:'haptic.effect.hard'},
      rigid:{type:'preset',effectId:'haptic.effect.sharp'},
      soft:{type:'preset',effectId:'haptic.effect.soft'},
      selection:{type:'preset',effectId:'haptic.effect.sharp',intensity:50},
      effectClick:{type:'preset',effectId:'haptic.effect.soft',intensity:60},
      effectHeavyClick:{type:'preset',effectId:'haptic.effect.soft',intensity:80},
      effectTick:{type:'preset',effectId:'haptic.effect.soft',intensity:70},
    }

    let multipleObj={
      notificationSuccess:{type:'file'},
      notificationWarning:{type:'file'},
      notificationError:{type:'file'},
      effectDoubleClick:{type:'file'},
    }


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


      if(singleObj[type]){
        try {
          vibrator.startVibration({
            type: singleObj[type].type,
            effectId: singleObj[type].effectId,
            count: 1,
            intensity:singleObj[type].intensity||100
          }, {
            id: 0,
            usage: 'unknown'
          }, (error: BusinessError) => {
            if (error) {
              Logger.error(`Failed to start vibration. Code: ${error.code}, message: ${error.message}`);
              return;
            }
            Logger.info('Succeed in starting vibration');
          });
        } catch (err) {
          let e: BusinessError = err as BusinessError;
          Logger.error(`An unexpected error occurred. Code: ${e.code}, message: ${e.message}`);
        }
      }else if(multipleObj[type]){
        let rawFd=this.context.resourceManager.getRawFdSync(`${type}.json`);
        try {
          vibrator.startVibration({
            type: multipleObj[type].type,
            hapticFd: { fd: rawFd.fd,offset: rawFd.offset, length: rawFd.length }
          }, {
            id: 0,
            usage: 'unknown'
          }).then(() => {
            Logger.info(`Succeed in starting vibration!!!!!!   type:${type}.json    fd:${rawFd.fd}  offset: ${rawFd.offset}  length: ${rawFd.length}`);

          }, (error: BusinessError) => {
            Logger.error(`Failed to start vibration. Code: ${error.code}, message: ${error.message}`);
          });
        } catch (err) {
          let e: BusinessError = err as BusinessError;
          Logger.error(`An unexpected error occurred. Code: ${e.code}, message: ${e.message}`);
        }
        this.context.resourceManager.closeRawFdSync(`${type}.json`)
      }


} catch (err) {
  let error = err as BusinessError;
      Logger.error(`Failed to get audioVolumeGroupManager, error: ${error}`);

}



  }

}