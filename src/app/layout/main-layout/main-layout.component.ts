// main-layout.component.ts
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatSidenav } from '@angular/material/sidenav';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss']
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  
  @ViewChild('sidenav') sidenav!: MatSidenav;
  
  private destroy$ = new Subject<void>();
  
  // Propiedades para controlar el sidenav
  sidenavMode: 'side' | 'over' = 'side';
  sidenavOpened = true;
  showMenuButton = false;
  
  // Breakpoints personalizados
  private readonly MOBILE_BREAKPOINT = '(max-width: 768px)';
  private readonly TABLET_BREAKPOINT = '(max-width: 1024px)';

  constructor(private breakpointObserver: BreakpointObserver) {}

  ngOnInit(): void {
    this.observeBreakpoints();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private observeBreakpoints(): void {
    // Observar cambios en el tamaño de pantalla
    this.breakpointObserver
      .observe([this.MOBILE_BREAKPOINT, this.TABLET_BREAKPOINT])
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        const isMobile = this.breakpointObserver.isMatched(this.MOBILE_BREAKPOINT);
        const isTablet = this.breakpointObserver.isMatched(this.TABLET_BREAKPOINT);
        
        if (isMobile) {
          // Móvil: sidenav como overlay cerrado por defecto
          this.sidenavMode = 'over';
          this.sidenavOpened = false;
          this.showMenuButton = true;
        } else if (isTablet) {
          // Tablet: sidenav como overlay pero se puede mantener abierto
          this.sidenavMode = 'over';
          this.sidenavOpened = false;
          this.showMenuButton = true;
        } else {
          // Desktop: sidenav fijo abierto
          this.sidenavMode = 'side';
          this.sidenavOpened = true;
          this.showMenuButton = false;
        }
      });
  }

  toggleSidenav(): void {
    if (this.sidenav) {
      this.sidenav.toggle();
    }
  }

  closeSidenav(): void {
    if (this.sidenavMode === 'over' && this.sidenav) {
      this.sidenav.close();
    }
  }

  // Método para cerrar sidenav al hacer clic en un enlace (móvil)
  onSidenavItemClick(): void {
    if (this.sidenavMode === 'over') {
      this.closeSidenav();
    }
  }
}