// sidebar.component.ts
import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/AuthService';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {

  @Output() closeSidenav = new EventEmitter<void>();

  constructor(
    private router: Router,
    private authService: AuthService
  ) { }


cargoCod: string = '';

  ngOnInit(): void {
    this.cargoCod = this.authService.getCargoCod();
      console.log('Cargo actual:', this.cargoCod);

  }

  get esAdmin(): boolean {
    return this.cargoCod === '00001';
  }

  get esMozo(): boolean {
    return this.cargoCod === '00003';
  }

  get esCocinero(): boolean {
    return this.cargoCod === '00002';
  }


  onItemClick(): void {
    this.closeSidenav.emit();
  }

  

}