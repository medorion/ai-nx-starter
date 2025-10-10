import { Module } from '@nestjs/common';
import { ExampleController } from './example.controller';
import { ExampleService } from './example.service';

@Module({
  controllers: [ExampleController],
  providers: [ExampleService],
  exports: [ExampleService], // Export service in case other modules need it
})
export class ExampleModule {}
