import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { RouterOutlet } from '@angular/router';
import { JsonPipe, NgStyle } from '@angular/common';

export interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
  symbol: string;
}

const ELEMENT_DATA: PeriodicElement[] = [
  { position: 1, name: 'Hydrogen', weight: 1.0079, symbol: 'H' },
  { position: 2, name: 'Helium', weight: 4.0026, symbol: 'He' },
  { position: 3, name: 'Lithium', weight: 6.941, symbol: 'Li' },
  { position: 4, name: 'Beryllium', weight: 9.0122, symbol: 'Be' },
  { position: 5, name: 'Boron', weight: 10.811, symbol: 'B' },
  { position: 6, name: 'Carbon', weight: 12.0107, symbol: 'C' },
  { position: 7, name: 'Nitrogen', weight: 14.0067, symbol: 'N' },
  { position: 8, name: 'Oxygen', weight: 15.9994, symbol: 'O' },
  { position: 9, name: 'Fluorine', weight: 18.9984, symbol: 'F' },
  { position: 10, name: 'Neon', weight: 20.1797, symbol: 'Ne' },
];

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MatTableModule, NgStyle, JsonPipe],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, AfterViewInit {
  @ViewChild('table', {static: true}) tableElementRef!: ElementRef;
  displayedColumns: string[] = ['position', 'name', 'weight', 'symbol'];
  dataSource = ELEMENT_DATA;

  private startX: number = 0;
  private startWidth: number = 0;
  private headerElement!: HTMLElement | null;
  public  columnWidths: { [key:string]: number | 'auto' } = {};
  private resizing: boolean = false;
  private currentColumn!: {label: string, index: number};
  private table!: HTMLTableElement;
  private sizes:number[] = [];
  private th!:  HTMLTableCellElement[];


  ngOnInit() {
    const savedWidths = localStorage.getItem('tableColumnWidths');
    if (savedWidths) {
      this.columnWidths = JSON.parse(savedWidths);
    }
  }

  ngAfterViewInit() {
    this.table = this.tableElementRef.nativeElement.querySelector('table');
    this.th = Array.from(this.table.querySelectorAll('th'));
    this.applySavedWidths();
  }

  startResize(event: MouseEvent, header: HTMLTableCellElement, index: number) {
    event.preventDefault();

    this.headerElement = header;
    this.startX = event.pageX;
    this.startWidth = this.headerElement.offsetWidth;
    this.resizing = true;
    this.currentColumn = { label: this.displayedColumns[index], index };

    this.sizes = this.th.map(el => Math.ceil(el.getBoundingClientRect().width));

    this.sizes.forEach((width, i) => {
      const th = this.th[i];
      if (th) {
        th.style.width = `${width}px`;
      }
    });

    document.addEventListener('mousemove', this.onResize);
    document.addEventListener('mouseup', this.stopResize);
  }

  onResize = (event: MouseEvent) => {
    if (!this.resizing) return;

    const newWidth = Math.max(50, this.startWidth + (event.pageX - this.startX)); // Minimum width: 50px

    const thElements = this.table.querySelectorAll('th');
    thElements[this.currentColumn.index].style.width = `${newWidth}px`;

    const totalWidth = this.sizes
      .reduce((sum, width, i) => i === this.currentColumn.index ? sum + newWidth : sum + width, 0);
    this.table.style.width = `${totalWidth}px`;
  };

  stopResize = () => {
    this.headerElement = null;

    if (this.resizing) {
      this.resizing = false;
      document.removeEventListener('mousemove', this.onResize);
      document.removeEventListener('mouseup', this.stopResize);

      const th = this.th;

      const data = this.displayedColumns.map((el, i) => {
        return {[el]: Math.ceil(th[i].getBoundingClientRect().width)};
      })

      localStorage.setItem('tableColumnWidths', JSON.stringify(data));
    }
  };

  applySavedWidths() {
    this.displayedColumns.forEach((column, i) => {
      const th = this.table.querySelectorAll('th')[i];
      if (th) {
        th.style.width = this.columnWidths[column]
          ? `${this.columnWidths[column]}px`
          : `${Math.floor(th.getBoundingClientRect().width)}px`;
      }
    });

    // Fix the table width based on saved column widths
    const totalWidth = this.displayedColumns.reduce((sum, column) => {
      return sum + (+this.columnWidths[column] || 0);
    }, 0);
    this.table.style.width = `${totalWidth}px`;
  }
}
