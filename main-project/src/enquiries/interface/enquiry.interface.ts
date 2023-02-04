import { CreateReplyDto } from '../dto/create-reply.dto';
import { Enquiries } from '../entity/enquiry.entity';

export interface Enquiry<T> {
  no: number;
  userNo: number;
  title: string;
  description: string;
  createdDate: Date;
  imageUrls: T;
  isDone?: boolean;
}

export interface Image {
  imageUrl: string;
  enquiryNo?: number;
  replyNo?: number;
}
export class Reply extends CreateReplyDto {
  imageUrl?: string;
  no?: number;
  createdDate?: Date;
  enquiryNo?: number;
}
