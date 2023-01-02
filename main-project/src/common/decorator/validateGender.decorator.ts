import { InternalServerErrorException } from '@nestjs/common';
import { Transform } from 'class-transformer';

const ValidateGender = () => {
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
  if (value === 'M') {
    return 'female';
  }
  if (value === 'F') {
    return 'male';
  }
  throw new InternalServerErrorException(`성별을 잘못 입력하셨습니다.`);
};

export { ValidateGender };
