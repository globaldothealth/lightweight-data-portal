export const formatBytes = (bytes: number, decimals: number): string => {
    if (bytes == 0) return '0 Bytes';
    const k = 1000,
          dm: number = decimals || 2,
          sizes: string[] = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
          i: number = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}