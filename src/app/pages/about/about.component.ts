import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MainLayoutComponent } from '../../shared/templates/main-layout/main-layout.component';
import { ButtonComponent } from '../../shared/atoms/button/button.component';
import { SeoService } from '../../core/services/seo.service';
import { BRAND } from '../../core/config/brand.config';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [MainLayoutComponent, ButtonComponent, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'about.component.html',
  styleUrl: 'about.component.scss',
})
export class AboutComponent implements OnInit {
  private readonly seo = inject(SeoService);

  protected readonly brand = BRAND;

  // TODO: reemplazar con los textos reales de la marca
  protected readonly values = [
    { title: 'Hecho a mano', text: 'Cada pieza se elabora de forma artesanal, una por una.' },
    { title: 'Piezas únicas', text: 'Diseños en pocas unidades para que tu estilo sea solo tuyo.' },
    { title: 'Materiales cuidados', text: 'Seleccionamos materiales de calidad pensados para durar.' },
  ];

  ngOnInit(): void {
    this.setSeo();
  }

  private setSeo(): void {
    const meta = this.seo
      .createBuilder()
      .title('Quiénes somos')
      .description(`Conoce la historia, misión y visión de ${BRAND.name}, bisutería artesanal hecha con amor.`)
      .jsonLd({
        '@context': 'https://schema.org',
        '@type': 'AboutPage',
        name: `Quiénes somos — ${BRAND.name}`,
        url: `${BRAND.url}/quienes-somos`,
      })
      .build();
    this.seo.apply(meta);
  }
}
