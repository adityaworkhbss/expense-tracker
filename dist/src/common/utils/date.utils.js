"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSalaryCycleDates = getSalaryCycleDates;
exports.getSalaryCycleForMonth = getSalaryCycleForMonth;
exports.getTodayRange = getTodayRange;
exports.getThisWeekRange = getThisWeekRange;
exports.getLastNDaysRange = getLastNDaysRange;
exports.getThisMonthRange = getThisMonthRange;
exports.getDateRange = getDateRange;
exports.toISTDateString = toISTDateString;
exports.toISTMonthKey = toISTMonthKey;
exports.getSalaryCycleHistory = getSalaryCycleHistory;
const dayjs_1 = __importDefault(require("dayjs"));
const utc = __importStar(require("dayjs/plugin/utc"));
const timezone = __importStar(require("dayjs/plugin/timezone"));
const isoWeek = __importStar(require("dayjs/plugin/isoWeek"));
const weekOfYear = __importStar(require("dayjs/plugin/weekOfYear"));
dayjs_1.default.extend(utc.default || utc);
dayjs_1.default.extend(timezone.default || timezone);
dayjs_1.default.extend(isoWeek.default || isoWeek);
dayjs_1.default.extend(weekOfYear.default || weekOfYear);
const IST = 'Asia/Kolkata';
function getSalaryCycleDates(referenceDate, cycleDay = 10) {
    const ref = (0, dayjs_1.default)(referenceDate).tz(IST);
    const dayOfMonth = ref.date();
    let cycleStart;
    let cycleEnd;
    if (dayOfMonth >= cycleDay) {
        cycleStart = ref.date(cycleDay).startOf('day');
        cycleEnd = ref.add(1, 'month').date(cycleDay - 1).endOf('day');
    }
    else {
        cycleStart = ref.subtract(1, 'month').date(cycleDay).startOf('day');
        cycleEnd = ref.date(cycleDay - 1).endOf('day');
    }
    return {
        start: cycleStart.utc().toDate(),
        end: cycleEnd.utc().toDate(),
    };
}
function getSalaryCycleForMonth(year, month, cycleDay = 10) {
    const cycleStart = dayjs_1.default.tz(`${year}-${String(month).padStart(2, '0')}-${String(cycleDay).padStart(2, '0')}`, IST).startOf('day');
    const cycleEnd = cycleStart.add(1, 'month').subtract(1, 'day').endOf('day');
    return {
        start: cycleStart.utc().toDate(),
        end: cycleEnd.utc().toDate(),
    };
}
function getTodayRange(tz = IST) {
    const now = (0, dayjs_1.default)().tz(tz);
    return {
        start: now.startOf('day').utc().toDate(),
        end: now.endOf('day').utc().toDate(),
    };
}
function getThisWeekRange(tz = IST) {
    const now = (0, dayjs_1.default)().tz(tz);
    return {
        start: now.startOf('isoWeek').utc().toDate(),
        end: now.endOf('isoWeek').utc().toDate(),
    };
}
function getLastNDaysRange(n, tz = IST) {
    const now = (0, dayjs_1.default)().tz(tz);
    return {
        start: now.subtract(n - 1, 'day').startOf('day').utc().toDate(),
        end: now.endOf('day').utc().toDate(),
    };
}
function getThisMonthRange(tz = IST) {
    const now = (0, dayjs_1.default)().tz(tz);
    return {
        start: now.startOf('month').utc().toDate(),
        end: now.endOf('month').utc().toDate(),
    };
}
function getDateRange(from, to, tz = IST) {
    return {
        start: dayjs_1.default.tz(from, tz).startOf('day').utc().toDate(),
        end: dayjs_1.default.tz(to, tz).endOf('day').utc().toDate(),
    };
}
function toISTDateString(date) {
    return (0, dayjs_1.default)(date).tz(IST).format('YYYY-MM-DD');
}
function toISTMonthKey(date) {
    return (0, dayjs_1.default)(date).tz(IST).format('YYYY-MM');
}
function getSalaryCycleHistory(months, cycleDay = 10) {
    const cycles = [];
    const now = (0, dayjs_1.default)().tz(IST);
    for (let i = 0; i < months; i++) {
        const refDate = now.subtract(i, 'month');
        const cycle = getSalaryCycleDates(refDate.toDate(), cycleDay);
        const label = (0, dayjs_1.default)(cycle.start).tz(IST).format('MMM YYYY');
        cycles.push({ ...cycle, label });
    }
    return cycles;
}
//# sourceMappingURL=date.utils.js.map