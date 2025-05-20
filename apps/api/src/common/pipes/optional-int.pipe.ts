import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common'

@Injectable()
export class OptionalParseIntPipe implements PipeTransform {
  transform(value: string | undefined): number | undefined {
    if (value === undefined || value === null || value === '') {
      return undefined
    }
    const parsed = parseInt(value, 10)
    if (isNaN(parsed)) {
      throw new BadRequestException('Validation failed (numeric string expected)')
    }
    return parsed
  }
}
