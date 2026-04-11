// raw-data.dto.ts
import { IsString } from 'class-validator';

export class EncryptedRequestBodyDto {
  @IsString()
  data: string;  // encrypted Base64
  @IsString()
  iv: string;   // IV Base64
}