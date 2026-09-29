import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BRAND } from '../../../core/config/brand.config';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'footer.component.html',
  styleUrl: 'footer.component.scss',
})
export class FooterComponent {
  protected readonly brand = BRAND;
  protected readonly year = new Date().getFullYear();
}
