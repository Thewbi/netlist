//const TZ320 = require('TZ320').TZ320
//const DCULight = require('DCULight').DCULight

class DeviceCardService {

    constructor() {
      this.deviceCards = [];
      this.deviceCardMap = new Map();
      this.can = null;
    }

    addDeviceCard = function(deviceCard) {
      this.deviceCards.push(deviceCard);
    }

    setCan = function(can) {
      this.can = can;
    }

    selectDeviceCard = function(selectedDeviceCard) {

      // de-select all cards
      var i;
      for (i = 0; i < this.deviceCards.length; i++) {
        this.deviceCards[i].onfocuslost();
      }

      // select card
      selectedDeviceCard.onfocus();
    }

    onCanMessage = function(deviceType, deviceCanAddress, msg) {

        //console.log('devicecardservice - onCanMessage() deviceType=' + deviceType + ', deviceCanAddress=' + deviceCanAddress);

        let deviceCard = this.deviceCardMap.get(deviceCanAddress);
        if (deviceCard == null) {

            //console.log('devicecardservice - onCanMessage - new device - A');

            switch (deviceType) {

                case 3:
                    //console.log("[DEVICE TYPE   ] RWS/TZ320 (Control/Steuer Message)");
                    deviceCard = new TZ320(this.can, deviceCanAddress, 200, 300);
                    //deviceCard = new DeviceCard(deviceCanAddress, 200, 300);
                    //console.log('devicecardservice - onCanMessage - new device - B1');
                    break;

                case 7:
                    //console.log("[DEVICE TYPE   ] RWS/TZ320 (Lifetime Message)");
                    deviceCard = new TZ320(this.can, deviceCanAddress, 200, 300);
                    //deviceCard = new DeviceCard(deviceCanAddress, 200, 300);
                    //console.log('devicecardservice - onCanMessage - new device - B2');
                    break;

                case 19:
                    //console.log("[DEVICE TYPE   ] DCU Light (Control/Steuer Message)");
                    deviceCard = new DCULight(this.can, deviceCanAddress, 200, 300);
                    //deviceCard = new DeviceCard(deviceCanAddress, 200, 300);
                    //console.log('devicecardservice - onCanMessage - new device - B3');
                    break;

                case 23:
                    //console.log("[DEVICE TYPE   ] DCU Light (Lifetime Message)");
                    deviceCard = new DCULight(this.can, deviceCanAddress, 200, 300);
                    //deviceCard = new DeviceCard(deviceCanAddress, 200, 300);
                    //console.log('devicecardservice - onCanMessage - new device - B4');
                    break;

                default:
                    console.log("Unknown Device Type: " + deviceType);
                    deviceCard = new DeviceCard(this.can, deviceCanAddress, 200, 300);
                    //console.log('devicecardservice - onCanMessage - new device - B5');
                    break;
              }

              //console.log('devicecardservice - onCanMessage - new device - C');

              if (deviceCard != null) {

                deviceCard.useTemplate("main_div");

                //console.log('devicecardservice - onCanMessage - new device - D');

                this.deviceCardMap.set(deviceCanAddress, deviceCard);
              }

              //console.log('devicecardservice - onCanMessage - new device - E');
          }

          deviceCard.handleMessage(msg);
      }

  }