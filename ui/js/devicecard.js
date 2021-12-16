window.$ = window.jQuery = require('jquery');



class DeviceCard {

    constructor(can, id, width, height) {
      this.id = id;
      this.width = width;
      this.height = height;
      this.deviceType = -1;
      this.can = can;
    }

    selected() {
      console.log(' selected id=' + this.id);
    }

    onclicklock() {
      alert(this + ' onclicklock() ID=' + this.id + ', Type=' + this.deviceType);
    }

    onclickunlock() {
      alert(this + ' onclickunlock() ID=' + this.id + ', Type=' + this.deviceType);
    }

    onfocus() {
      this.container.style.border = 'thick solid #0000FF';

      //this.container.querySelector("#command_button_section").style.display = 'block';
      //this.container.querySelector("#offline_section").style.display = 'none';
    }

    onfocuslost() {
      this.container.style.border = 'thick solid #000000';

      //this.container.querySelector("#command_button_section").style.display = 'none';
      //this.container.querySelector("#offline_section").style.display = 'block';
    }

    messageReceived(msg) {
      goOnline();
    }

    goOnline() {
      this.container.querySelector("#command_button_section").style.display = 'block';
      this.container.querySelector("#offline_section").style.display = 'none';
    }

    goOffline() {
      this.container.querySelector("#command_button_section").style.display = 'none';
      this.container.querySelector("#offline_section").style.display = 'block';
    }

    useTemplate(targetContainerId) {

        let _this = this;

        // load the template
        let template = document.querySelector('#deviceCardTemplate');

        // create a copy of the template
        // use var instead of let because this value is returned and has to have wider scope
        var clonedTemplate = document.importNode(template.content, true);

        // store the div in a member variable
        this.container = clonedTemplate.getElementById('outer_div');

        // make it draggable
        $(this.container).draggable();

        // handle on click
        this.container.onclick = function() {
          deviceCardService.selectDeviceCard(_this);
        }

        // btn-lock
        //
        // set a id to the button
        let button = clonedTemplate.getElementById('btn-lock');
        button.id = button.id + '_' + this.id;

        // register a method on the class as onclick handler on the button
        button.onclick = function() {
          _this.onclicklock();
          _this.selected();
        }

        // btn-unlock
        //
        button = clonedTemplate.getElementById('btn-unlock');
        button.id = button.id + '_' + this.id;
        button.onclick = function() {
          _this.onclickunlock();
          _this.selected();
        }

        // container div
        let outer_container = document.getElementById(targetContainerId);
        outer_container.appendChild(clonedTemplate);

        // initially go offline
        //goOffline();

        return clonedTemplate;
    }

    handlMessage(msg) {

    }

    checkIdAndType(msg) {
      let id = msg.id;

      // parse device type
      let msgDeviceType = id & 0x7C0;
      msgDeviceType = msgDeviceType >>> 6;

      //console.log('msgDeviceType = ' + msgDeviceType);
      //console.log(this.deviceType);

      // check device type
      if (msgDeviceType != this.deviceType && msgDeviceType != this.deviceType) {
        return false;
      }

      // parse id
      let deviceCanAddress = id & 0x3F;

      // check id
      //console.log('deviceCanAddress = ' + deviceCanAddress + ' this.id = ' + this.id);
      if (deviceCanAddress != this.id) {
        return false;
      }

      return true;
    }

  }


class TZ320 extends DeviceCard {

    constructor(can, id, width, height) {
      super(can, id, width, height);
      this.deviceType = 7;
    }

    useTemplate(targetContainerId) {
      super.useTemplate(targetContainerId);
      let info = this.container.querySelector('#info');
      info.innerHTML = "TZ320";
    }

    onclicklock() {

      let rwsType = 0xC0;
      let rwsCanAddress = this.id;
      let idAndType = rwsType + rwsCanAddress;

      // byte 1 in buffer is the command 0x01 == lock
      this.can.write({
        id: idAndType,
        ext: false,
        buf: Buffer.from([0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00])
      });

    }

    onclickunlock() {

      let rwsType = 0xC0;
      let rwsCanAddress = this.id;
      let idAndType = rwsType + rwsCanAddress;

      // byte 1 in buffer is the command 0x02 == unlock
      this.can.write({
        id: idAndType,
        ext: false,
        buf: Buffer.from([0x02, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00])
      });

      // // byte 1 in buffer is the command 0x10 == short time release (Kurzzeitfreigabe)
      // this.can.write({
      //   id: idAndType,
      //   ext: false,
      //   buf: Buffer.from([0x10, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00])
      // });

    }

    handleMessage(msg) {
      //console.log('deviceCard - handleMessage()');

      //logMessage(0, msg);

      if (!super.checkIdAndType(msg)) {
        return;
      }

      //messageReceived(msg);
      this.container.querySelector("#command_button_section").style.display = 'block';
      this.container.querySelector("#offline_section").style.display = 'none';

      let buffer = msg.buf;
      let byte_0 = buffer[0];
      let rwsLockState = byte_0 & 0x0F;

      let btnLock;
      let btnUnlock;

      switch (rwsLockState) {

      case 0:
          //console.log(this.container);
          //console.log("[LOCK          ] UNLOCKED / [SCHLOSS] ENTRIEGELT");
          this.container.querySelector("#command_button_section").style.backgroundcolor = 'block';
          this.container.querySelector("#offline_section").style.display = 'none';

          btnLock = document.getElementById('btn-lock_' + this.id);
          //console.log('A btnLock = ' + btnLock);
          btnLock.style.background = 'blue';

          btnUnlock = document.getElementById('btn-unlock_' + this.id);
          //console.log('A btnUnlock = ' + btnUnlock);
          btnUnlock.style.background = 'white';
          break;

      case 1:
          //console.log("[LOCK          ] ZSU / [SCHLOSS] ZSU (Zeitschaltuhr)");
          break;

      case 2:
          //console.log("[LOCK          ] PRELOCKED / [SCHLOSS] VORVERRIEGELT");
          break;

      case 3:
          //console.log(this.container);
          //console.log("[LOCK          ] LOCKED / [SCHLOSS] VERRIEGELT");

          btnLock = document.getElementById('btn-lock_' + this.id);
          //console.log('B btnLock = ' + btnLock);
          btnLock.style.background = 'white';

          btnUnlock = document.getElementById('btn-unlock_' + this.id);
          //console.log('B btnUnlock = ' + btnUnlock);
          btnUnlock.style.background = 'blue';
          break;

      case 4:
          //console.log("[LOCK          ] EMA / [SCHLOSS] EMA (Einbruchmeldeanlage)");
          break;

      case 5:
          //console.log("[LOCK          ] KZF / [SCHLOSS] KZF (Kurzzeitfreigabe)");
          break;

      case 6:
          //console.log("[LOCK          ] Service / [SCHLOSS] Service");
          break;

      case 7:
          //console.log("[LOCK          ] RUN ALARM / [SCHLOSS] RUN ALARM");
          break;

      case 8:
          //console.log("[LOCK          ] RUN STOERUNG / [SCHLOSS] RUN STOERUNG");
          break;

      case 9:
          //console.log("[LOCK          ] AKTIV SCHLEUSE / [SCHLOSS] AKTIV SCHLEUSE");
          break;

      case 10:
          //console.log("[LOCK          ] PASSIV SCHLEUSE (passiv) / [SCHLOSS] PASSIV SCHLEUSE (passiv)");
          break;

      case 11:
          //console.log("[LOCK          ] PASSIV SCHLEUSE (belegt) / [SCHLOSS] PASSIV SCHLEUSE (belegt)");
          break;

      default:
          console.log("[LOCK          ] Unknown RWS Lock state!");
          break;

      }

      let rwsDoorState = byte_0 & 0x10;
      //console.log(rwsDoorState ? '[DOOR          ] CLOSED' : '[DOOR          ] OPEN');

      let rwsDoorPreAlarm = byte_0 & 0x20;
      //console.log(rwsDoorPreAlarm ? '[PREALARM      ] PREALARM' : '[PREALARM      ] NO PREALARM');

      let rwsMasterFunction = byte_0 & 0x40;
      //console.log(rwsMasterFunction ? '[MASTER-FUNC   ] ACTIVE' : '[MASTER-FUNC   ] NOT ACTIVE');

      // Rückmeldung verriegelung
      let rwsFeedbackLocking = byte_0 & 0x80;
      //console.log(rwsFeedbackLocking ? '[FEEDBACK LOCK ] ACTIVE' : '[FEEDBACK LOCK ] NOT ACTIVE');

    }

}

class DCULight extends DeviceCard {

  constructor(can, id, width, height) {
    super(can, id, width, height);
    this.deviceType = 23;
  }

  useTemplate(targetContainerId) {
    super.useTemplate(targetContainerId);
    let info = this.container.querySelector('#info');
    info.innerHTML = "DCU Light";
  }

  onclicklock() {
    //alert('[DCULight] ' + this + ' onclicklock() ID=' + this.id + ', Type=' + this.deviceType);

    // let deviceType = 0x4C0;
    // let canAddress = this.id;
    // let idAndType = deviceType + canAddress;

    let dcuLightType = 0x4C0;
    //let dcuLightType = 0x5C0;
    //let canAddress = this.id;
    let canAddress = 1;
    let idAndType = dcuLightType + canAddress;

    // byte 1 in buffer is the command 0x00 == BA-Nacht (= Betriebsart Nacht) (= Operating Mode Night)
    this.can.write({
      id: idAndType,
      ext: false,
      buf: Buffer.from([0x01, 0x02, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00])
    });

    // // byte 1 in buffer is the command 0x01 == BA-Automatik (= Betriebsart Automatik) (= Operating Mode Automatik)
    // this.can.write({
    //   id: idAndType,
    //   ext: false,
    //   buf: Buffer.from([0x02, 0x04, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00])
    // });
  }

  onclickunlock() {
    //alert('[DCULight] ' + this + ' onclickunlock() ID=' + this.id + ', Type=' + this.deviceType);

    // let deviceType = 0x4C0;
    // let canAddress = this.id;
    // let idAndType = deviceType + canAddress;

    let dcuLightType = 0x4C0;
    //let dcuLightType = 0x5C0;
    //let canAddress = this.id;
    let canAddress = 1;
    let idAndType = dcuLightType + canAddress;

    // byte 1 in buffer is the command 0x01 == BA-Nacht (= Betriebsart Nacht) (= Operating Mode Night)
    // this.can.write({
    //   id: idAndType,
    //   ext: false,
    //   buf: Buffer.from([0x01, 0x02, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00])
    // });

    // // byte 1 in buffer is the command 0x01 == BA-Automatik (= Betriebsart Automatik) (= Operating Mode Automatik)
    // this.can.write({
    //   id: idAndType,
    //   ext: false,
    //   buf: Buffer.from([0x02, 0x04, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00])
    // });

    // Kontakt Berechtigt (Ansteuerung KB) --> Kurzzeitfreigabe (Kurz auf und danach wieder zu)
    // BA-Nacht: wird ausgeführt
    // BA-Automatik: wird ausgeführt
    this.can.write({
      id: idAndType,
      ext: false,
      buf: Buffer.from([0x00, 0x01, 0x04, 0x00, 0x00, 0x00, 0x00, 0x00])
    });

    // // Kontakt Innen (Ansteuerung KI) --> Kurzzeitfreigabe (Kurz auf und danach wieder zu)
    // // BA-Nacht: wird ignoriert
    // // BA-Automatik: wird ausgeführt
    // this.can.write({
    //   id: idAndType,
    //   ext: false,
    //   buf: Buffer.from([0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00])
    // });

    // // Kontakt Außen (Ansteuerung KA) --> Kurzzeitfreigabe (Kurz auf und danach wieder zu)
    // // BA-Nacht: wird ignoriert
    // // BA-Automatik: wird ausgeführt
    // this.can.write({
    //   id: idAndType,
    //   ext: false,
    //   buf: Buffer.from([0x00, 0x00, 0x02, 0x00, 0x00, 0x00, 0x00, 0x00])
    // });

  }

  handleMessage(msg) {

    console.log(msg);

    if (!super.checkIdAndType(msg)) {
      return;
    }

    // // DEBUG output the message as json string
    // console.log(JSON.stringify(msg, (key, value) => {
    //     if ((typeof value === 'number') && (key == "id")) {
    //         return value.toString(16).toUpperCase().padStart(8, '0');
    //     } else if (typeof value === 'number') {
    //         return value.toString(16).toUpperCase().padStart(2, '0');
    //     } else {
    //         return value;
    //     }
    // }));

    // display the buttons
    this.container.querySelector("#command_button_section").style.display = 'block';
    this.container.querySelector("#offline_section").style.display = 'none';

    // "10","00","00","42","00","00","00","00"

    //
    // byte 0
    //

    let btnLock;
    let btnUnlock;

    let buffer = msg.buf;
    let byte_0 = buffer[0];
    let state = byte_0 & 0x0F;
    switch (state) {

      // Das DCU CAN Protocol zeigt Kurzzeitfreigabe nicht an!

      case 0:
          //console.log(this.container);
          console.log("[STATE          ] AUTOMATIK");

          // show/hide sections
          this.container.querySelector("#command_button_section").style.backgroundcolor = 'block';
          this.container.querySelector("#offline_section").style.display = 'none';

          // update buttons
          btnLock = document.getElementById('btn-lock_' + this.id);
          //console.log('A btnLock = ' + btnLock);
          btnLock.style.background = 'blue';

          btnUnlock = document.getElementById('btn-unlock_' + this.id);
          //console.log('A btnUnlock = ' + btnUnlock);
          btnUnlock.style.background = 'white';
          break;

      case 1:
          console.log("[STATE          ] NACHT");
          break;

      case 2:
          console.log("[STATE          ] LADENSCHLUSS");
          break;

      case 3:
          console.log("[STATE          ] DAUEROFFEN");
          break;

      case 4:
          console.log("[STATE          ] ZSU");
          break;

      case 5:
          console.log("[STATE          ] BMA");
          break;

      case 6:
          console.log("[STATE          ] Nicht initialisiert");
          break;

      case 7:
          console.log("[STATE          ] STOERUNG");
          break;

      case 8:
          console.log("[STATE          ] Alarm / RWA");
          break;

      case 9:
          console.log("[STATE          ] AKTIVE_SCHLEUSE");
          break;

      case 10:
          console.log("[STATE          ] PASSIVE_SCHLEUSE_PASSIV");
          break;

      case 11:
          console.log("[STATE          ] PASSIVE_SCHLEUSE_AKTIV");
          break;

      case 12:
          console.log("[STATE          ] OFF");
          break;

      case 13:
          console.log("[STATE          ] RWS");
          break;

      default:
          console.log("[LOCK          ] Unknown RWS Lock state!");
          break;
      }

      // bit 4 - door state (closed)
      let rwsDoorState = byte_0 & 0x10;
      console.log(rwsDoorState ?       '[DOOR CLOSED    ] CLOSED' : '[DOOR CLOSED    ] OPEN');

      // bit 5 - reduzierte Oeffnungsweite
      let rwsDoorPreAlarm = byte_0 & 0x20;
      console.log(rwsDoorPreAlarm ?    '[Red.Oeffnungsw.] 1'      : '[Red.Oeffnungsw.] 0');

      // bit 6 - door state (open)
      let rwsMasterFunction = byte_0 & 0x40;
      console.log(rwsMasterFunction ?  '[DOOR OPEN      ] OPEN'   : '[DOOR OPEN      ] CLOSED');

      // zustand verriegelung
      let locking = byte_0 & 0x80;
      console.log(locking ?            '[FEEDBACK LOCK  ] LOCKED' : '[FEEDBACK LOCK  ] UNLOCKED');

      //
      // byte 1
      //

      let byte_1 = buffer[1];
      // 0x7F = 0111 1111b = 127 = Aktuelle Öffnung in % der max. Öffnungsweite (Wertebereich 0% .. 100%)
      let percentageOpen = byte_1 & 0x7F;
      console.log('Opening %: ' + percentageOpen);

      // Masterfunktion für EMD - d.h. Bit ist gesetzt wenn der Antrieb durch Einfachprogrammschalter
      // oder MPS  einen Betriebsartenwechsel verhindert
      let masterfunctionEMD = byte_1 & 0x80;
      console.log('Masterfunction EMD: ' + masterfunctionEMD);

      //
      // byte 2
      //

      let byte_2 = buffer[2];
      // 0x7F = 0111 1111b = 127 = Aktuelle Öffnung in % der max. Öffnungsweite (Wertebereich 0% .. 100%)
      let faults = byte_2 & 0x7F;
      console.log('Faults: ' + faults);

      // Bit für sicherheitsrelevanten Fehler der weitergemeldet wird
      let securityRelevantFault = byte_2 & 0x80;
      console.log('securityRelevantFault: ' + securityRelevantFault);

      //
      // byte 3
      //

      let byte_3 = buffer[3];
      // 0x3F = 0011 1111b = 63 = ???
      let unknownInformation = byte_3 & 0x3F;
      switch (unknownInformation) {

        case 0:
            console.log("[???            ] Keine Tür");
            break;

        case 1:
            console.log("[???            ] EMD");
            break;

        case 2:
            console.log("[???            ] EMD-F");
            break;

        case 3:
            console.log("[???            ] EMD-F invers");
            break;

        case 4:
            console.log("[???            ] Karusselltür");
            break;

        case 5:
            console.log("[???            ] Karusselltür mit Fluchtfunktion (FR oder Breakout)");
            break;

        case 6:
            console.log("[???            ] n.b.");
            break;

        case 7:
            console.log("[???            ] n.b.");
            break;

        case 8:
            console.log("[???            ] Schiebetür");
            break;

        case 0x18:
            console.log("[???            ] FR-Schiebetür");
            break;

        case 0x39:
            console.log("[???            ] DCU8");
            break;

        case 0x3A:
            console.log("[???            ] DCU8-F");
            break;

        case 0x3B:
            console.log("[???            ] DCU8-Invers");
            break;

        default:
            console.log("[???            ] Unknown RWS Lock state!");
            break;

        }

      // 0x40 = 64
      // Wartungsmeldung (Die Funktion entspricht der Funktion des Punkt auf dem DPS).
      let wartungsmeldung = byte_3 & 0x40;
      console.log('Wartungsmeldung: ' + wartungsmeldung);

      // 0x80 = 128
      // frei
      let frei = byte_3 & 0x80;
      console.log('Frei: ' + frei);

  }

}


  let id = 0;
  function addDevice() {
    id++;
    let deviceCard = new DeviceCard(id, 200, 300);
    deviceCard.useTemplate("main_div");

    deviceCardService.addDeviceCard(deviceCard);
  }




//  module.exports = DeviceCard