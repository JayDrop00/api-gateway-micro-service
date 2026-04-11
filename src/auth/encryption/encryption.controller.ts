import { Controller, Post, Body } from '@nestjs/common';
import { EncryptionService } from './encryption.service';
import { EncryptedRequestBodyDto } from './dto/encryptedRequestBody.dto';

@Controller('encryption')
export class EncryptionController {
  constructor(private readonly encryptionService: EncryptionService) {}

  @Post('raw-data')
  async echo(@Body() body: EncryptedRequestBodyDto) {
    console.log(body)

    const decrypted = await this.encryptionService.RawData(body.data, body.iv);

    const responsePayload = {
    message: "Hello from server",
    original: decrypted,
  };

    return this.encryptionService.encryptResponse(responsePayload);
  }
}