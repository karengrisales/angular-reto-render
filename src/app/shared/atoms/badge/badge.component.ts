import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NgClass } from '@angular/common';

export type BadgeVariant = 'primary' | 'accent' | 'neutral' | 'surface';

@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [NgClass],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span [ngClass]="['badge', 'badge--' + variant()]">
      <ng-content />
    </span>
  `,
  styleUrl: 'badge.component.scss',
})
export class BadgeComponent {
  variant = input<BadgeVariant>('surface');
}
