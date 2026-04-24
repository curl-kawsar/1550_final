const TIMEZONE_LABEL_TO_IANA = {
  'Eastern': 'America/New_York',
  'ET': 'America/New_York',
  'EST': 'America/New_York',
  'EDT': 'America/New_York',
  'Central': 'America/Chicago',
  'CT': 'America/Chicago',
  'CST': 'America/Chicago',
  'CDT': 'America/Chicago',
  'Mountain': 'America/Denver',
  'MT': 'America/Denver',
  'MST': 'America/Denver',
  'MDT': 'America/Denver',
  'Pacific': 'America/Los_Angeles',
  'PT': 'America/Los_Angeles',
  'PST': 'America/Los_Angeles',
  'PDT': 'America/Los_Angeles',
  'Alaska': 'America/Anchorage',
  'AKT': 'America/Anchorage',
  'Hawaii': 'Pacific/Honolulu',
  'HST': 'Pacific/Honolulu',
};

export function resolveIANATimezone(label) {
  if (!label) return null;
  const trimmed = label.trim();
  if (TIMEZONE_LABEL_TO_IANA[trimmed]) return TIMEZONE_LABEL_TO_IANA[trimmed];
  // Accept raw IANA identifiers (e.g. "America/New_York") stored by admin
  try {
    Intl.DateTimeFormat(undefined, { timeZone: trimmed });
    return trimmed;
  } catch {
    return null;
  }
}

export function getStudentTimezone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return null;
  }
}

export function getTimezoneAbbreviation(ianaZone, date = new Date()) {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: ianaZone,
      timeZoneName: 'short'
    });
    const parts = formatter.formatToParts(date);
    const tzPart = parts.find(p => p.type === 'timeZoneName');
    return tzPart ? tzPart.value : '';
  } catch {
    return '';
  }
}

const DAY_TO_INDEX = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6
};

function getZonedParts(date, timeZone) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    weekday: 'long',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23'
  }).formatToParts(date);

  const value = (type) => parts.find(p => p.type === type)?.value;
  return {
    weekday: value('weekday'),
    year: Number(value('year')),
    month: Number(value('month')),
    day: Number(value('day')),
    hour: Number(value('hour')),
    minute: Number(value('minute'))
  };
}

function resolveSourceDateParts(sourceIANA, dateContext) {
  if (dateContext instanceof Date || (typeof dateContext === 'string' && /\d{4}-\d{2}-\d{2}/.test(dateContext))) {
    const d = dateContext instanceof Date ? dateContext : new Date(dateContext);
    if (!Number.isNaN(d.getTime())) {
      return {
        year: d.getUTCFullYear(),
        month: d.getUTCMonth() + 1,
        day: d.getUTCDate()
      };
    }
  }

  const requestedDay = Array.isArray(dateContext) ? dateContext[0] : dateContext;
  const nowParts = getZonedParts(new Date(), sourceIANA);
  const baseNoonUTC = new Date(Date.UTC(nowParts.year, nowParts.month - 1, nowParts.day, 12));

  if (typeof requestedDay === 'string' && DAY_TO_INDEX[requestedDay] !== undefined) {
    const currentIndex = DAY_TO_INDEX[nowParts.weekday] ?? 0;
    const requestedIndex = DAY_TO_INDEX[requestedDay];
    const daysUntil = (requestedIndex - currentIndex + 7) % 7;
    baseNoonUTC.setUTCDate(baseNoonUTC.getUTCDate() + daysUntil);
  }

  return {
    year: baseNoonUTC.getUTCFullYear(),
    month: baseNoonUTC.getUTCMonth() + 1,
    day: baseNoonUTC.getUTCDate()
  };
}

function sourceLocalTimeToUTC({ year, month, day, hours, minutes, sourceIANA }) {
  const utcEstimate = new Date(Date.UTC(year, month - 1, day, hours, minutes, 0));
  const zoned = getZonedParts(utcEstimate, sourceIANA);
  const zonedAsUTC = Date.UTC(zoned.year, zoned.month - 1, zoned.day, zoned.hour, zoned.minute, 0);
  const wantedAsUTC = Date.UTC(year, month - 1, day, hours, minutes, 0);
  return new Date(utcEstimate.getTime() - (zonedAsUTC - wantedAsUTC));
}

/**
 * Converts a class time (HH:MM 24h string) from a source timezone to a target timezone.
 * Uses the next upcoming occurrence of the specified day to handle DST correctly.
 *
 * Returns { time: "H:MM AM/PM", abbreviation: "BST", nextDay: boolean, date: "Mon, Apr 23" }
 */
export function convertClassTime(timeString, sourceTimezoneLabel, targetIANA, dateContext) {
  if (!timeString || !sourceTimezoneLabel || !targetIANA) return null;

  const sourceIANA = resolveIANATimezone(sourceTimezoneLabel);
  if (!sourceIANA) return null;

  try {
    const [hours, minutes] = timeString.split(':').map(Number);
    const sourceDate = resolveSourceDateParts(sourceIANA, dateContext);
    const correctedUTC = sourceLocalTimeToUTC({
      ...sourceDate,
      hours,
      minutes,
      sourceIANA
    });

    const targetFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: targetIANA,
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    const convertedTime = targetFormatter.format(correctedUTC);

    const targetDateFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: targetIANA,
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
    const sourceDateKey = `${sourceDate.year}-${sourceDate.month}-${sourceDate.day}`;
    const targetKeyParts = new Intl.DateTimeFormat('en-US', {
      timeZone: targetIANA,
      year: 'numeric',
      month: 'numeric',
      day: 'numeric'
    }).formatToParts(correctedUTC);
    const targetDateKey = `${targetKeyParts.find(p => p.type === 'year').value}-${targetKeyParts.find(p => p.type === 'month').value}-${targetKeyParts.find(p => p.type === 'day').value}`;

    const nextDay = targetDateKey !== sourceDateKey;
    const abbreviation = getTimezoneAbbreviation(targetIANA, correctedUTC);

    return {
      time: convertedTime,
      abbreviation,
      nextDay,
      date: targetDateFormatter.format(correctedUTC),
      timezone: targetIANA
    };
  } catch (e) {
    console.error('Timezone conversion error:', e);
    return null;
  }
}

/**
 * Formats a class time with optional timezone conversion.
 * Returns a display-ready object with original and converted times.
 */
export function formatClassTimeWithConversion(startTime, endTime, sourceTimezoneLabel, dateContext) {
  const studentTZ = getStudentTimezone();
  if (!studentTZ) {
    return { converted: false };
  }

  const sourceIANA = resolveIANATimezone(sourceTimezoneLabel);
  if (!sourceIANA) {
    return { converted: false };
  }

  const startConverted = convertClassTime(startTime, sourceTimezoneLabel, studentTZ, dateContext);
  const endConverted = convertClassTime(endTime, sourceTimezoneLabel, studentTZ, dateContext);

  if (!startConverted || !endConverted) {
    return { converted: false };
  }

  return {
    converted: true,
    localStart: startConverted.time,
    localEnd: endConverted.time,
    localDate: startConverted.date,
    localAbbreviation: startConverted.abbreviation,
    nextDay: startConverted.nextDay,
    studentTimezone: studentTZ
  };
}
