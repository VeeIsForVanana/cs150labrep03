"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllWithConflict = exports.getGEs = exports.parseInput = void 0;
const sampleInput = `CS 153 THU,TTh 10-11:30AM lec ERDT Room
CS 11 CLASS 1,W 10AM-12PM lab TBA; F 10AM-1PM lec TBA
CS 12 LAB 1,F 1-4PM lab TL3
CS 12 LEC 2,TTh 1-2PM lec P&G
CS 31 THY2,TTh 4-5:30PM lec CLR3`;
const cursedInput = `CS 153 EVD,MTWThF 10-11:30AM lec ERDT Room
Soc Sci 1 CLASS 1,W 10AM-12PM lab TBA; F 10AM-1PM lec TBA
Comm 3 Eng 1 FML,F 1-4PM lab TL3
CS 12 LEC 2,TTh 1-2PM lec P&G
CS 31 THY2,TTh 4-5:30PM lec CLR3
sts haha ill-formatted class name,M 10AM-9PM lec CS auditorium sir vallejo dabest
ROTC MS1 rip cadet officer moment,S 1:00AM-11:45PM corps work DMST
i have a life 101,S 11:00AM-6:00PM brx DMST
CS 150 lab,MTWThF 7:30AM-1:45PM 1cho is love; S 10AM-1PM 1cho is life`;
const gelist_1 = require("./gelist");
class Schedule {
    constructor(input) {
        this.daySchedule = new Set();
        this.timeStart = 0;
        this.timeEnd = 2359;
        // Sanitize input first because splitting by semicolon leaves leading spaces
        input = input.trim();
        const stringList = input.split(" ");
        const dateString = stringList[0];
        const timeString = stringList[1];
        // Loop for going through dateString one-by-one to identify the covered weekdays for the schedule
        for (let i = 0; i < dateString.length; i++) {
            switch (dateString.charAt(i)) {
                case "M":
                    this.daySchedule.add(0 /* Weekday.M */);
                    break;
                case "T":
                    // Special case for "T" since it can either be Tue or Thu, depending on the next letter
                    switch (dateString.charAt(i + 1)) {
                        case "h":
                            this.daySchedule.add(3 /* Weekday.Th */);
                            break;
                        default:
                            this.daySchedule.add(1 /* Weekday.T */);
                            break;
                    }
                    break;
                case "W":
                    this.daySchedule.add(2 /* Weekday.W */);
                    break;
                case "F":
                    this.daySchedule.add(4 /* Weekday.F */);
                    break;
                case "S":
                    this.daySchedule.add(5 /* Weekday.S */);
                    break;
                default:
                    break;
            }
        }
        // Break down the timeString into the start time and end time for the schedule
        const [startTimeString, endTimeString] = timeString.split('-').slice(0, 2);
        // Parse strings as numbers, then calculate for their 12-hour decimalized form (where hours are whole integers and minutes are expressed as decimal fractions of 60)
        // Note that this conversion does not yet account for the suffix
        function convertTo12Hours(input) {
            let output = 0;
            let pastColon = false; // Check if the parser is past the colon indicating that we're reading minutes now
            for (let i = 0; i < input.length; i++) {
                if (!isNaN(parseInt(input.charAt(i)))) {
                    if (!pastColon) {
                        output *= 10;
                        output += parseInt(input.charAt(i));
                    }
                    else {
                        // Parse the next two characters as minutes
                        output += parseInt(input.substring(i, i + 2)) / 60;
                    }
                }
                if (input.charAt(i) == ":") {
                    pastColon = true;
                }
            }
            return output;
        }
        let tempStartTime = convertTo12Hours(startTimeString);
        let tempEndTime = convertTo12Hours(endTimeString);
        // At this point, we go over the suffix
        // The order of the conditionals here is very important
        // IMPORTANTLY, regardless of the suffix (which will invariably be PM), 12:__ will always be 12.__
        if (endTimeString.includes("AM")) {
            // If end time is explicitly AM, it must end at AM; do nothing
        }
        else if (startTimeString.includes("AM")) {
            // If start time is expicitly AM, it must end at PM
            tempEndTime += Math.floor(tempEndTime) != 12 ? 12 : 0;
        }
        else {
            // If neither, then both start and end must be at PM
            tempStartTime += Math.floor(tempStartTime) != 12 ? 12 : 0;
            tempEndTime += Math.floor(tempEndTime) != 12 ? 12 : 0;
        }
        this.timeStart = tempStartTime;
        this.timeEnd = tempEndTime;
    }
    hasConflict(otherSchedule) {
        // If there exists a single common day between the schedules, return whether a time conflict exists
        for (let element of this.daySchedule) {
            if (otherSchedule.daySchedule.has(element)) {
                return (this.timeStart < otherSchedule.timeEnd && otherSchedule.timeStart < this.timeEnd);
            }
        }
        return false;
    }
}
class Section {
    constructor(input) {
        this.name = "";
        this.schedules = [];
        this.isGE = false;
        // Sanitizing the input *just in case*
        input = input.trim();
        // Splitting along comma will yield the string defining the section, and the string(s) defining the schedule (separated by semicolons)
        let [sectionString, scheduleStrings] = input.split(',');
        this.name = sectionString;
        this.schedules = scheduleStrings.split(';').map(elem => new Schedule(elem));
        // Use some to check if *any* GE name is a substring of the name, indicating that it is in fact a GE
        this.isGE = gelist_1.ge_list.some(elem => this.name.toLowerCase().includes(elem.toLowerCase()));
    }
    hasConflict(other) {
        // Check every possible pair of unique schedules of both sections
        for (let otherSchedule of other.schedules) {
            for (let mySchedule of this.schedules) {
                if (mySchedule.hasConflict(otherSchedule))
                    return true;
            }
        }
        return false;
    }
}
function parseInput(input) {
    return input.split('\n').map(elem => new Section(elem));
}
exports.parseInput = parseInput;
function getGEs(sections) {
    return sections.filter(elem => elem.isGE);
}
exports.getGEs = getGEs;
function getAllWithConflict(sections) {
    return sections.filter(section => sections.some(otherSection => (section.hasConflict(otherSection) && section != otherSection)));
}
exports.getAllWithConflict = getAllWithConflict;
const parsed = parseInput(cursedInput);
console.log(parsed);
console.log(getGEs(parsed));
console.log(getAllWithConflict(parsed));
