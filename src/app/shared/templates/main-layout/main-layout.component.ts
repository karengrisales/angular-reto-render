import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HeaderComponent } from '../../organisms/header/header.component';
import { FooterComponent } from '../../organisms/footer/footer.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [HeaderComponent, FooterComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-header />
    <main id="main-content" class="layout-main" tabindex="-1">
      <ng-content />
    </main>
    <app-footer />
  `,
  styleUrl: 'main-layout.component.scss',
})
export class MainLayoutComponent {}
