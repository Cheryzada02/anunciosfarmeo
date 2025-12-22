import { FastAverageColor } from 'fast-average-color-node';

const fac = new FastAverageColor();

/**
 * Obtiene un color (hex) basado en el icono del servidor.
 * Si no se puede calcular, devuelve un color fallback.
 */
export async function getGuildBrandColor(guild) {
  try {
    const iconUrl = guild.iconURL({ extension: 'png', size: 128 });
    if (!iconUrl) return '#5865F2'; // fallback estilo Discord

    const res = await fetch(iconUrl);
    if (!res.ok) return '#5865F2';

    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const color = await fac.getColorAsync(buffer);
    // color.hex viene tipo "#AABBCC"
    return color?.hex || '#5865F2';
  } catch {
    return '#5865F2';
  }
}
