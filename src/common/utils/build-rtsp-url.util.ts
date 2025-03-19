export const buildRtspUrl = (
  template: string,
  username: string,
  password: string,
  cameraIp: string,
): string => {
  return template
    .replace('${username}', username)
    .replace('${password}', password)
    .replace('${cameraIp}', cameraIp);
};
