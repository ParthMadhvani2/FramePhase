export function clearTranscriptionItems(items) {
  if (!items || !Array.isArray(items)) return [];

  items.forEach((item, key) => {
    if (!item.start_time) {
      // Skip if this is the first item (no previous to merge into)
      if (key === 0) return;
      const prev = items[key - 1];
      if (prev && prev.alternatives?.[0]) {
        prev.alternatives[0].content += item.alternatives[0]?.content || '';
      }
      delete items[key];
    }
  });

  return items
    .filter(Boolean)
    .filter(item => item.alternatives?.[0])
    .map(item => {
      const { start_time, end_time } = item;
      const content = item.alternatives[0].content;
      return { start_time, end_time, content };
    });
}

function secondsToHHMMSSMS(timeString) {
  const totalSeconds = parseFloat(timeString) || 0;
  const d = new Date(totalSeconds * 1000);
  return d.toISOString().slice(11, 23).replace('.', ',');
}

function secondsToVTTTime(timeString) {
  const totalSeconds = parseFloat(timeString) || 0;
  const d = new Date(totalSeconds * 1000);
  return d.toISOString().slice(11, 23);
}

export function transcriptionItemsToSrt(items) {
  let srt = '';
  let i = 1;
  items.filter(Boolean).forEach(item => {
    srt += i + "\n";
    const { start_time, end_time } = item;
    srt += secondsToHHMMSSMS(start_time)
      + ' --> '
      + secondsToHHMMSSMS(end_time)
      + "\n";
    srt += item.content + "\n";
    srt += "\n";
    i++;
  });
  return srt;
}

export function transcriptionItemsToVtt(items) {
  let vtt = 'WEBVTT\n\n';
  let i = 1;
  items.filter(Boolean).forEach(item => {
    vtt += i + "\n";
    const { start_time, end_time } = item;
    vtt += secondsToVTTTime(start_time)
      + ' --> '
      + secondsToVTTTime(end_time)
      + "\n";
    vtt += item.content + "\n";
    vtt += "\n";
    i++;
  });
  return vtt;
}
