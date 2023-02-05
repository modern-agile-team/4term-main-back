import { CreateReplyDto } from '../dto/create-reply.dto';

export interface Enquiry<T> {
  no: number;
  userNo: number;
  title: string;
  description: string;
  createdDate: Date;
  imageUrls: T;
  isDone?: boolean;
}

export interface EnquiryImage<T> {
  imageUrl: T;
  enquiryNo: number;
}

export interface ReplyImage<T> {
  imageUrl: T;
  replyNo: number;
}

export class Reply extends CreateReplyDto {
  imageUrl?: string;
  no?: number;
  createdDate?: Date;
  enquiryNo?: number;
}
