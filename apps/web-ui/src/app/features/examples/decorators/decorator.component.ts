import { Component } from '@angular/core';
import { debounce } from '../../../core/decorators/debounce.decorator';
import { catchError } from '../../../core/decorators/catch-error.decorator';
import { log } from '../../../core/decorators/log.decorator';
import { LogLevel } from '../../../core/services/log-level.enum';
import { measureTime } from '../../../core/decorators/measure-time.decorator';
import { sleep } from '../../../shared/utils/sleep.function';

@Component({
  selector: 'app-decorator',
  standalone: false,
  templateUrl: './decorator.component.html',
  styleUrls: ['./decorator.component.less'],
})
export class DecoratorComponent {
  debounceValue = '';
  currentInputValue = ''; // Shows immediate input feedback

  onInputEvent(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.onInputChange(value);
  }

  onInputChange(value: string) {
    // Update immediately for UI feedback
    this.currentInputValue = value;
    // Call debounced method for processing
    this.onSearchChange(value);
  }

  @debounce(1000)
  onSearchChange(value: string) {
    // This will be called after debounce delay
    this.debounceValue = value;
    console.log('Debounced value:', value);
  }

  @catchError({ display: true, message: 'Something went wrong', rethrow: false })
  onSearch() {
    throw new Error('Sample Error');
  }

  @log(LogLevel.Info, 'Log something')
  onLog() {
    // Log should be visible in the console
  }

  @measureTime(LogLevel.Info, 'Measure something')
  async onMeasure() {
    await sleep(1000);
    // This will be logged with execution time
  }
}
