import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { NgClass } from '@angular/common';

export type ButtonVariant = 'primary' | 'secondary' | 'outline-light' | 'ghost' | 'icon';
export type ButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [NgClass],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      [type]="type()"
      [attr.aria-label]="ariaLabel()"
      [attr.aria-pressed]="ariaPressed()"
      [attr.aria-disabled]="disabled()"
      [disabled]="disabled() || null"
      [ngClass]="[
        'btn',
        'btn--' + variant(),
        'btn--' + size(),
        fullWidth() ? 'btn--full' : '',
        active() ? 'btn--active' : ''
      ]"
      (click)="clicked.emit($event)"
    >
      <ng-content />
    </button>
  `,
  styleUrl: 'button.component.scss',
})
export class ButtonComponent {
  variant  = input<ButtonVariant>('primary');
  size     = input<ButtonSize>('md');
  type     = input<'button' | 'submit' | 'reset'>('button');
  disabled = input(false);
  fullWidth = input(false);
  active   = input(false);
  ariaLabel = input<string | undefined>(undefined);
  ariaPressed = input<boolean | undefined>(undefined);

  clicked = output<MouseEvent>();
}
