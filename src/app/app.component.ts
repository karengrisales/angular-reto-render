import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [CommonModule],
  template: `
    <main class="main-container">
      <h1>{{ title }}</h1>
      <p>¡Reto de técnicas de renderizado en Angular en marcha!</p>
    </main>
  `,
  styles: [
    `
      .main-container {
        font-family: Arial, sans-serif;
        text-align: center;
        margin-top: 50px;
      }
      h1 {
        color: #007acc;
      }
    `,
  ],
})
export class AppComponent {
  title = "Técnicas de renderizado web en Angular";
}
