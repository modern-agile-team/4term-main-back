import { NumberType } from 'aws-sdk/clients/pinpointsmsvoicev2';

export interface Event<T> {
  no: number;
  title: string;
  description: string;
  createdDate: Date;
  imageUrls: T;
}
