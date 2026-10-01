function formatUtcLabel(minutes: number): string {
  const sign = minutes < 0 ? '-' : '+';
  const absolute = Math.abs(minutes);
  const hours = Math.floor(absolute / 60);
  const rest = absolute % 60;

  return rest === 0
    ? `UTC ${sign}${hours}`
    : `UTC ${sign}${hours}:${String(rest).padStart(2, '0')}`;
}

function formatHourGap(minutes: number): string {
  const absolute = Math.abs(minutes);
  const hours = Math.floor(absolute / 60);
  const rest = absolute % 60;
  const parts: string[] = [];

  if (hours > 0) {
    parts.push(`${hours} ${hours === 1 ? 'hour' : 'hours'}`);
  }

  if (rest > 0) {
    parts.push(`${rest} ${rest === 1 ? 'minute' : 'minutes'}`);
  }

  return parts.join(' ');
}

export function formatUtcOffset(
  minutes: number | null,
  localOffsetMinutes = -new Date().getTimezoneOffset(),
): string {
  if (minutes === null) {
    return '';
  }

  const label = formatUtcLabel(minutes);
  const delta = minutes - localOffsetMinutes;

  if (delta === 0) {
    return `Same time zone (${label})`;
  }

  const direction = delta > 0 ? 'ahead' : 'behind';
  return `${formatHourGap(delta)} ${direction} (${label})`;
}
