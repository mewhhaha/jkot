export const invertTime = (time: number) => {
  const max = Number(time.toString().replace(/[0-9]/g, "9"));
  return max - time;
};
