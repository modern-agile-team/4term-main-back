import { InternalServerErrorException } from '@nestjs/common';
import { Transform } from 'class-transformer';

const ValidateAnnouncement = () => {
  const toPlain = Transform(
    ({ value }) => {
      return value;
    },
    {
      toPlainOnly: true,
    },
  );
  const toClass = (target: any, key: string) => {
    return Transform(
      ({ obj }) => {
        return valueToGender(obj[key]);
      },
      {
        toClassOnly: true,
      },
    )(target, key);
  };
  return function (target: any, key: string) {
    toPlain(target, key);
    toClass(target, key);
  };
};

const valueToGender = (value: any) => {
  if (value === null || value === undefined) {
    return undefined;
  }
  if (typeof value === 'boolean') {
    return value;
  }
  if (value === 'E') {
    return 1;
  }
  if (value === 'A') {
    return 2;
  }
  throw new InternalServerErrorException(
    `잘못된 공지사항 TYPE을 입력하셨습니다.`,
  );
};

export { ValidateAnnouncement };
