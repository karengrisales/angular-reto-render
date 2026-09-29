import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgClass } from '@angular/common';
import { BRAND } from '../../../core/config/brand.config';
import { FavoritesService } from '../../../core/services/favorites.service';
import { ButtonComponent } from '../../atoms/button/button.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgClass, ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'header.component.html',
  styleUrl: 'header.component.scss',
})
export class HeaderComponent {
  protected readonly brand = BRAND;
  protected readonly menuOpen = signal(false);
  protected readonly favorites = inject(FavoritesService);

  protected readonly navLinks = [
    { label: 'Inicio',    path: '/' },
    { label: 'Catálogo',  path: '/catalogo' },
    { label: 'Quiénes somos', path: '/quienes-somos' },
    { label: 'Favoritos', path: '/favoritos' },
  ];

  toggleMenu(): void {
    this.menuOpen.update(v => !v);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }
}
