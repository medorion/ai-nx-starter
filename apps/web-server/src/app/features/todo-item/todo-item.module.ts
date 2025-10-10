import { Module } from '@nestjs/common';
import { TodoItemController } from './todo-item.controller';
import { TodoItemService } from './todo-item.service';
import { TodoItemMapper } from './todo-item.mapper';
import { DataAccessModule } from '../../data-access.module';

@Module({
  imports: [DataAccessModule],
  controllers: [TodoItemController],
  providers: [TodoItemService, TodoItemMapper],
  exports: [TodoItemService, TodoItemMapper],
})
export class TodoItemModule {}
