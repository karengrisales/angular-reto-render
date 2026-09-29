import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Thin wrapper for inline SVG icons via <use href="#icon-id">.
 * Keeps markup semantics (role="img" + aria-label) consistent across the app.
 * Add icon sprites to src/assets/icons/sprite.svg.
 */
@Component({
  selector: 'app-icon',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg
      [attr.width]="size()"
      [attr.height]="size()"
      [attr.aria-label]="label() || null"
      [attr.role]="label() ? 'img' : 'presentation'"
      [attr.aria-hidden]="label() ? null : 'true'"
      fill="currentColor"
      focusable="false"
    >
      <use [attr.href]="'assets/icons/sprite.svg#' + name()" />
    </svg>
  `,
  styleUrl: 'icon.component.scss',
})
export class IconComponent {
  name  = input.required<string>();
  size  = input<number>(24);
  label = input<string>('');
}
