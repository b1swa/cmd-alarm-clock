import * as readline from "node:readline";
import { DateTime, Info } from "luxon";
import EventEmitter from "node:events";
const eventEmitter = new EventEmitter();

class Alarm {
  constructor(alarmTime, dayOfWeek) {
    this.alarmTime = DateTime.fromISO(alarmTime);
    this.dayOfWeek = Info.weekdays("long")[dayOfWeek];
    this.snoozeCount = 0;
    this.snoozeLimit = 3;
    this.snoozeInterval = { minutes: 5 };
    this.active = true;
  }

  snooze() {
    if (this.snoozeCount < this.snoozeLimit) {
      this.alarmTime = this.alarmTime.plus(this.snoozeInterval);
      this.snoozeCount += 1;
      console.log(
        `Alarm snoozed to ${this.alarmTime.toFormat("HH:mm")} (Snooze count: ${this.snoozeCount})`,
      );
    } else {
      console.log("Maximum snooze limit reached!");
    }
  }

  deactivate() {
    this.active = false;
    console.log(`Alarm for ${this.alarmTime.toFormat("HH:mm")} deactivated`);
  }
}

class AlarmClock {
  constructor() {
    this.alarms = [];
  }

  addAlarm(alarmTime, dayOfWeek) {
    const alarm = new Alarm(alarmTime, dayOfWeek);
    this.alarms.push(alarm);
    console.log(
      `Alarm set for ${alarm.alarmTime.toFormat("HH:mm")} on ${Info.weekdays("long")[dayOfWeek]}`,
    );
  }

  deleteAlarm(alarmTime, dayOfWeek) {
    this.alarms = this.alarms.filter(
      (alarm) =>
        !(
          alarm.alarmTime.toFormat("HH:mm") === alarmTime &&
          alarm.dayOfWeek === Info.weekdays("long")[dayOfWeek]
        ),
    );
    console.log(
      `Alarm for ${alarmTime} on ${Info.weekdays("long")[dayOfWeek]} deleted`,
    );
  }

  displayTime() {
    const now = DateTime.now();
    console.log(`Current time: ${now.toFormat("yyyy-MM-dd HH:mm:ss")}`);
  }

  checkAlarms(rl) {
    let callbackfn = () => {
      const now = DateTime.now();
      const currentDay = now.toFormat("cccc");
      this.alarms.forEach((alarm) => {
        if (
          alarm.active &&
          alarm.dayOfWeek === currentDay &&
          now >= alarm.alarmTime
        ) {
          rl.pause();
          console.log(
            `Alarm ringing for ${alarm.alarmTime.toFormat("HH:mm")} on ${alarm.dayOfWeek}`,
          );
          const rl2 = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
          });
          rl2.question(
            "Enter 'snooze' to snooze the alarm, or 'off' to turn it off: ",
            (answer) => {
              if (answer.toLowerCase() === "snooze") {
                alarm.snooze();
              } else if (answer.toLowerCase() === "off") {
                alarm.deactivate();
              }
              rl2.close();
            },
          );
          clearInterval(intervalId);
          intervalId = false;
          rl.resume();
        }
      });
    };
    let intervalId = setInterval(callbackfn, 1000);
    if (!intervalId) intervalId = setInterval(callbackfn, 1000);
  }

  showAlarms() {
    let currentAlarmsString = this.alarms.reduce(
      (acc, alarm) =>
        acc +
        " " +
        `Alarm set for ${alarm.alarmTime.toFormat("HH:mm")} on ${alarm.dayOfWeek} \n`,
      "",
    );
    console.log(`Current Alarms \n${currentAlarmsString}`);
  }
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const clock = new AlarmClock();

function main() {
  rl.question(
    "\n1. Display current time\n2. Set an alarm\n3. Delete an alarm\n4. Exit\n5. Show Alarms\nEnter your choice: ",
    (choice) => {
      if (choice === "1") {
        clock.displayTime();
        main();
      } else if (choice === "2") {
        rl.question("Enter alarm time (HH:MM): ", (alarmTime) => {
          rl.question("Enter day of the week: ", (dayOfWeek) => {
            clock.addAlarm(alarmTime, dayOfWeek);
            main();
          });
        });
      } else if (choice === "3") {
        rl.question("Enter alarm time to delete (HH:MM): ", (alarmTime) => {
          rl.question("Enter day of the week: ", (dayOfWeek) => {
            clock.deleteAlarm(alarmTime, dayOfWeek);
            main();
          });
        });
      } else if (choice === "4") {
        rl.close();
      } else if (choice === "5") {
        clock.showAlarms();
        main();
      } else {
        console.log("Invalid choice. Please try again.");
        main();
      }
    },
  );
}

clock.checkAlarms(rl);
main();
