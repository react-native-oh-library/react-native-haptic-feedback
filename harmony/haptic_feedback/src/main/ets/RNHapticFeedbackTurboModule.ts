/*
 * Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved
 * Use of this source code is governed by a MIT license that can be
 * found in the LICENSE file.
 */
import { TurboModule, TurboModuleContext } from '@rnoh/react-native-openharmony/ts';
import { TM } from '@rnoh/react-native-openharmony/generated/ts';
import Logger from './Logger';
import vibrator from '@ohos.vibrator';
import audio from '@ohos.multimedia.audio';
import { BusinessError } from '@ohos.base';
import common from '@ohos.app.ability.common';
export class RNHapticFeedbackTurboModule extends TurboModule implements TM.HapticFeedbackNativeModule.Spec {
  private context: common.UIAbilityContext
  constructor(ctx: TurboModuleContext) {
    super(ctx);
    this.context = ctx.uiAbilityContext
  }
  public trigger(type: string, options?: { enableVibrateFallback: boolean,ignoreAndroidSystemSettings:boolean }): void {
    let ignoreHOSSystemSettingsVal = options?.ignoreAndroidSystemSettings || false
    let singleObj = {
      impactLight: { type: 'preset', effectId: 'haptic.effect.hard', intensity: 30 },
      impactMedium: { type: 'preset', effectId: 'haptic.effect.hard', intensity: 60 },
      impactHeavy: { type: 'preset', effectId: 'haptic.effect.hard' },
      rigid: { type: 'preset', effectId: 'haptic.effect.sharp' },
      soft: { type: 'preset', effectId: 'haptic.effect.soft' },
      selection: { type: 'preset', effectId: 'haptic.effect.sharp', intensity: 50 },
      effectClick: { type: 'preset', effectId: 'haptic.effect.soft', intensity: 60 },
      effectHeavyClick: { type: 'preset', effectId: 'haptic.effect.soft', intensity: 80 },
      effectTick: { type: 'preset', effectId: 'haptic.effect.soft', intensity: 70 },
    }

    let constantObj={
      clockTick:{type: 'time',duration:4},
      contextClick:{type: 'time',duration:6},
      keyboardPress:{type: 'time',duration:3},
      keyboardRelease:{type: 'time',duration:7},
      keyboardTap:{type: 'time',duration:3},
      longPress:{type: 'time',duration:0},
      textHandleMove:{type: 'time',duration:9},
      virtualKey:{type: 'time',duration:1},
      virtualKeyRelease:{type: 'time',duration:8},
    }

    let multipleObj = {
      notificationSuccess: { type: 'file' },
      notificationWarning: { type: 'file' },
      notificationError: { type: 'file' },
      effectDoubleClick: { type: 'file' },
    }
    let audioManager = audio.getAudioManager();
    let audioVolumeManager: audio.AudioVolumeManager = audioManager.getVolumeManager();
    try {
      let audioVolumeGroupManager: audio.AudioVolumeGroupManager =
        audioVolumeManager.getVolumeGroupManagerSync(audio.DEFAULT_VOLUME_GROUP_ID);
      Logger.info(`Get audioVolumeGroupManager success.`);
      let value: audio.AudioRingMode = audioVolumeGroupManager.getRingerModeSync()
      let isVolumeOn = value != 0
      let isVibrateMode = value == 1
      Logger.info(`Indicate that the ringer mode is obtained ${value}. finalBollen:${ignoreHOSSystemSettingsVal ==
        false && !(isVolumeOn || isVibrateMode)}  isVolumeOn:${isVolumeOn} isVibrateMode:${isVibrateMode}`);
      if (ignoreHOSSystemSettingsVal == false && !(isVolumeOn || isVibrateMode)) {
        return
      }
      if (singleObj[type]) {
        try {
          vibrator.startVibration({
            type: singleObj[type].type,
            effectId: singleObj[type].effectId,
            count: 1,
            intensity: singleObj[type].intensity || 100
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
      } else if (multipleObj[type]) {
        let rawFd = this.context.resourceManager.getRawFdSync(`${type}.json`);
        try {
          vibrator.startVibration({
            type: multipleObj[type].type,
            hapticFd: { fd: rawFd.fd, offset: rawFd.offset, length: rawFd.length }
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
      }else if(constantObj[type]){
        try {
          vibrator.startVibration({
            type: constantObj[type].type,
            duration: constantObj[type].duration
          }, {
            id: 0,
            usage: 'unknown'
          }).then(() => {
            Logger.info('Succeed in starting vibration');
          }, (error: BusinessError) => {
            Logger.error(`Failed to start vibration. Code: ${error.code}, message: ${error.message}`);
          });
        } catch (err) {
          let e: BusinessError = err as BusinessError;
          Logger.error(`An unexpected error occurred. Code: ${e.code}, message: ${e.message}`);
        }
      }else{
        try {
          vibrator.startVibration({
            type: 'preset',
            effectId: 'haptic.effect.sharp',
            count: 1,
            intensity: 50
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
      }
    } catch (err) {
      let error = err as BusinessError;
      Logger.error(`Failed to get audioVolumeGroupManager, error: ${error}`);
    }
  }
}