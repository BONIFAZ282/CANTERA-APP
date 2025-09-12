// sidebar.component.ts
import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  
  @Output() closeSidenav = new EventEmitter<void>();

  constructor(private router: Router) {}

  ngOnInit(): void {}

  onItemClick(): void {
    this.closeSidenav.emit();
  }
}