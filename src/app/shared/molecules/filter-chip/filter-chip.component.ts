import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-filter-chip',
  standalone: true,
  imports: [NgClass],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      type="button"
      class="chip"
      [class.chip--active]="active()"
      [attr.aria-pressed]="active()"
      (click)="selected.emit(value())"
    >
      @if (icon()) {
        <span class="chip__icon" aria-hidden="true">{{ icon() }}</span>
      }
      <span class="chip__label">{{ label() }}</span>
    </button>
  `,
  styleUrl: 'filter-chip.component.scss',
})
export class FilterChipComponent {
  label    = input.required<string>();
  value    = input.required<string>();
  icon     = input<string>('');
  active   = input(false);

  selected = output<string>();
}
