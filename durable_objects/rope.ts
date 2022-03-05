// https://github.com/component/rope

const SPLIT_LENGTH = 1000;
const JOIN_LENGTH = 500;
const REBALANCE_RATIO = 1.2;

export type Rope = {
  length: number;
} & (
  | { value: string; left?: undefined; right?: undefined }
  | { value?: undefined; left: Rope; right: Rope }
);

const adjust = (rope: Rope): Rope => {
  if (rope.value !== undefined) {
    if (rope.length > SPLIT_LENGTH) {
      const divide = Math.floor(rope.length / 2);
      return {
        length: rope.length,
        left: from(rope.value.substring(0, divide)),
        right: from(rope.value.substring(divide)),
      };
    }
  } else if (rope.length < JOIN_LENGTH) {
    return {
      length: rope.length,
      value: toString(rope.left) + toString(rope.right),
    };
  }

  return rope;
};

export const from = (str: string): Rope =>
  adjust({
    value: str,
    length: str.length,
  });

export const toString = (rope?: Rope): string => {
  if (rope === undefined) return "";
  if (rope.value !== undefined) return rope.value;

  return toString(rope.left) + toString(rope.right);
};

export const remove = (rope: Rope, start: number, end: number): Rope => {
  if (start < 0 || start > rope.length) {
    throw new RangeError("Start is not within rope bounds.");
  }
  if (end < 0 || end > rope.length) {
    throw new RangeError("End is not within rope bounds.");
  }
  if (start > end) {
    throw new RangeError("Start is greater than end.");
  }

  if (rope.value !== undefined) {
    return adjust({
      length: rope.length,
      value: rope.value.substring(0, start) + rope.value.substring(end),
    });
  } else {
    const leftLength = rope.left.length;
    const leftStart = Math.min(start, leftLength);
    const leftEnd = Math.min(end, leftLength);

    const rightLength = rope.right.length;
    const rightStart = Math.max(0, Math.min(start - leftLength, rightLength));
    const rightEnd = Math.max(0, Math.min(end - leftLength, rightLength));

    let left = rope.left;
    let right = rope.right;

    if (leftStart < leftLength) {
      left = remove(rope.left, leftStart, leftEnd);
    }
    if (rightEnd > 0) {
      right = remove(rope.right, rightStart, rightEnd);
    }

    return adjust({
      left,
      right,
      length: left.length + right.length,
    });
  }
};

export const insert = (rope: Rope, position: number, value: string): Rope => {
  if (position < 0 || position > rope.length)
    throw new RangeError("position is not within rope bounds.");
  if (rope.value !== undefined) {
    const next =
      rope.value.substring(0, position) +
      value +
      rope.value.substring(position);

    return adjust({
      length: next.length,
      value: next,
    });
  } else {
    const leftLength = rope.left.length;
    if (position < leftLength) {
      const left = insert(rope.left, position, value);
      return adjust({
        length: left.length + rope.right.length,
        left,
        right: rope.right,
      });
    } else {
      const right = insert(rope.right, position - leftLength, value);
      return adjust({
        length: rope.left.length + right.length,
        left: rope.left,
        right,
      });
    }
  }
};

export const rebuild = (rope: Rope): Rope => {
  if (rope.value === undefined) {
    const value = toString(rope.left) + toString(rope.right);
    return adjust({
      value,
      length: value.length,
    });
  }

  return rope;
};

export const rebalance = (rope: Rope): Rope => {
  if (rope.value === undefined) {
    if (
      rope.left.length / rope.right.length > REBALANCE_RATIO ||
      rope.right.length / rope.left.length > REBALANCE_RATIO
    ) {
      return rebuild(rope);
    } else {
      return {
        length: rope.length,
        left: rebalance(rope.left),
        right: rebalance(rope.right),
      };
    }
  }

  return rope;
};
