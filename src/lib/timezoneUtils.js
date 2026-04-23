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
  return TIMEZONE_LABEL_TO_IANA[label] || TIMEZONE_LABEL_TO_IANA[label.trim()] || null;
}

export function getStudentTimezone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return null;
  }
}

export function getTimezoneAbbreviation(ianaZone) {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: ianaZone,
      timeZoneName: 'short'
    });
    const parts = formatter.formatToParts(new Date());
    const tzPart = parts.find(p => p.type === 'timeZoneName');
    return tzPart ? tzPart.value : '';
  } catch {
    return '';
  }
}

/**
 * Converts a class time (HH:MM 24h string) from a source timezone to a target timezone.
 * Uses the next upcoming occurrence of the specified day to handle DST correctly.
 *
 * Returns { time: "H:MM AM/PM", abbreviation: "BST", nextDay: boolean, date: "Mon, Apr 23" }
 */
export function convertClassTime(timeString, sourceTimezoneLabel, targetIANA, dayOfWeek) {
  if (!timeString || !sourceTimezoneLabel || !targetIANA) return null;

  const sourceIANA = resolveIANATimezone(sourceTimezoneLabel);
  if (!sourceIANA) return null;
  if (sourceIANA === targetIANA) return null;

  try {
    const [hours, minutes] = timeString.split(':').map(Number);

    const now = new Date();
    const refDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0);

    const sourceFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: sourceIANA,
      year: 'numeric', month: '2-digit', day: '2-digit'
    });
    const sourceParts = sourceFormatter.formatToParts(refDate);
    const sYear = +sourceParts.find(p => p.type === 'year').value;
    const sMonth = +sourceParts.find(p => p.type === 'month').value - 1;
    const sDay = +sourceParts.find(p => p.type === 'day').value;

    const utcEstimate = new Date(Date.UTC(sYear, sMonth, sDay, hours, minutes, 0));

    const sourceOffsetFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: sourceIANA,
      hour: 'numeric', minute: 'numeric', hour12: false,
      year: 'numeric', month: 'numeric', day: 'numeric'
    });
    const soParts = sourceOffsetFormatter.formatToParts(utcEstimate);
    const soHour = +soParts.find(p => p.type === 'hour').value;
    const soMin = +soParts.find(p => p.type === 'minute').value;

    const diffMs = ((soHour * 60 + soMin) - (hours * 60 + minutes)) * 60 * 1000;
    const correctedUTC = new Date(utcEstimate.getTime() - diffMs);

    const targetFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: targetIANA,
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    const convertedTime = targetFormatter.format(correctedUTC);

    const targetDateFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: targetIANA,
      year: 'numeric', month: '2-digit', day: '2-digit'
    });
    const targetDateParts = targetDateFormatter.formatToParts(correctedUTC);
    const tDay = +targetDateParts.find(p => p.type === 'day').value;

    const nextDay = tDay !== sDay;
    const abbreviation = getTimezoneAbbreviation(targetIANA);

    return {
      time: convertedTime,
      abbreviation,
      nextDay,
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
export function formatClassTimeWithConversion(startTime, endTime, sourceTimezoneLabel) {
  const studentTZ = getStudentTimezone();
  if (!studentTZ) {
    return { converted: false };
  }

  const sourceIANA = resolveIANATimezone(sourceTimezoneLabel);
  if (!sourceIANA || sourceIANA === studentTZ) {
    return { converted: false };
  }

  const startConverted = convertClassTime(startTime, sourceTimezoneLabel, studentTZ);
  const endConverted = convertClassTime(endTime, sourceTimezoneLabel, studentTZ);

  if (!startConverted || !endConverted) {
    return { converted: false };
  }

  return {
    converted: true,
    localStart: startConverted.time,
    localEnd: endConverted.time,
    localAbbreviation: startConverted.abbreviation,
    nextDay: startConverted.nextDay,
    studentTimezone: studentTZ
  };
}
