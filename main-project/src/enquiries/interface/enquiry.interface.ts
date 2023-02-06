import { CreateEnquiryDto } from '../dto/create-enquiry.dto';
import { CreateReplyDto } from '../dto/create-reply.dto';

export interface Enquiry<T> extends CreateEnquiryDto {
  no: number;
  userNo: number;
  createdDate: Date;
  imageUrls: T;
  isDone?: boolean;
}

export interface EnquiryImage<T> {
  imageUrl: T;
  enquiryNo: number;
}

export interface ReplyImage<T> {
  imageUrl?: T;
  replyNo: number;
}

export class Reply<T> extends CreateReplyDto {
  no?: number;
  enquiryNo: number;
  createdDate?: Date;
  imageUrls?: T;
}
